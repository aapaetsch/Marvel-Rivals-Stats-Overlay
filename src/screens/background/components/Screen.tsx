import {
  REQUIRED_FEATURES,
  WINDOW_NAMES,
  RETRY_TIMES,
  DISPLAY_OVERWOLF_HOOKS_LOGS,
} from "app/shared/constants";
import { useGameEventProvider, useWindow } from "overwolf-hooks";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { MARVELRIVALS_CLASS_ID, getMarvelGame } from "lib/games";
import store from "app/shared/store";
import { log } from "lib/log";
import { throttle } from "lib/utils";
import { initPlayerDataService } from "lib/playerDataService"; // Import the player data service
import windowManager from "lib/windowManager"; // Import the window manager

// Import matchStats actions
import { 
  processInfoUpdate, 
  processEvents, 
  setMatchClearTimeout, 
  clearMatchTimeoutAction,
  completeMatchThunk
} from "../stores/matchStatsSlice";

const { DESKTOP, INGAME, FINALHITSBAR, CHARSWAPBAR } = WINDOW_NAMES;

const g_interestedInFeatures = ["game_info", "match_info", "gep_internal"];

// Removed old WINDOW_POSITIONS constant as positions are now managed in settings
// const WINDOW_POSITIONS = { ... };

const BackgroundWindow = () => {
  const [desktop] = useWindow(DESKTOP, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [ingame] = useWindow(INGAME, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [finalhitsbar] = useWindow(FINALHITSBAR, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [changeswapbar] = useWindow(CHARSWAPBAR, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [gameResolutionChanged, setGameResolutionChanged] = useState(false);
  const [gameState, setGameState] = useState<"running" | "not-running">("not-running");
  const lastCompletedMatchIdRef = useRef<string | null>(null);

  // Throttle event dispatches to avoid overwhelming the Redux store with duplicate data
  const throttledInfoDispatch = useMemo(() => {
    // Store the last dispatched info to compare for duplicates
    let lastInfo: string = '';
    let lastInfoTime: number = 0;
    
    return (info: any) => {
      const now = Date.now();
      // Convert current info to string for comparison
      const infoString = JSON.stringify(info);
      
      // Check if this contains match outcome or other critical match info
      const isCriticalMatchInfo = info?.info?.match_info?.match_outcome || 
                                  info?.info?.match_info?.match_id ||
                                  info?.info?.match_info?.map ||
                                  info?.info?.match_info?.game_mode;
      
      // Use shorter throttle time for critical match info (500ms vs 1000ms)
      const throttleTime = isCriticalMatchInfo ? 500 : 1000;
      
      // Only dispatch if info is different or enough time has passed
      if (infoString !== lastInfo || now - lastInfoTime >= throttleTime) {
        lastInfo = infoString;
        lastInfoTime = now;
        store.dispatch(
          processInfoUpdate({
            info,
            timestamp: now,
          })
        );
      }
    };
  }, []);

  // Add a new useEffect to handle the match end timeout
  useEffect(() => {
    // Create a subscription to state changes to detect match end
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const { currentMatch } = state.matchStatsReducer;
      
      // Check if a match just ended (matchEnd is set but we don't have an active timeout yet)
      if (
        currentMatch.timestamps.matchEnd !== null && 
        state.matchStatsReducer.clearMatchTimeout === null &&
        // Guard to ensure we only process each match once
        (currentMatch.matchId || "__noid__") !== (lastCompletedMatchIdRef.current || "__noid__")
      ) {
        // Mark this match as processed
        lastCompletedMatchIdRef.current = currentMatch.matchId || "__noid__";
        // Dispatch the completeMatchThunk to trigger saving recent player data
        store.dispatch(completeMatchThunk());
        
        // Create a timeout to clear match stats after 30 seconds (reduced from 1 minute)
        const timeoutId = window.setTimeout(() => {
          store.dispatch(clearMatchTimeoutAction());
          console.log("Match stats cleared after 30-second timeout");
        }, 30000); // Reduced from 60000ms to 30000ms
        
        // Store the timeout ID in the state so we can cancel it if needed
        store.dispatch(setMatchClearTimeout(timeoutId));
        console.log("Set up 30-second timeout to clear match stats", timeoutId);
      }
    });
    
    // Clean up the subscription when component unmounts
    return () => unsubscribe();
  }, []);

  // Initialize the Marvel Rivals API player data service
  useEffect(() => {
    // Initialize the player data service with store.dispatch
    log("Initializing Marvel Rivals API player data service", "Screen.tsx", "playerDataServiceInit");
    initPlayerDataService(store.dispatch);
  }, []);

  const eventsDispatch = useMemo(() => {
    // Store the last dispatched events to compare for duplicates
    let lastEvents: string = '';
    let lastEventsTime: number = 0;
    
    return (events: any) => {
      const now = Date.now();
      // Convert current events to string for comparison
      const eventsString = JSON.stringify(events);
      
      // Check if any of these events is a critical match event (start/end)
      let isCriticalEvent = false;
      if (events) {
        const eventsArray = Array.isArray(events) ? events : 
                            (events.events ? (Array.isArray(events.events) ? events.events : [events.events]) : 
                            (events.name ? [events] : []));
        
        for (const event of eventsArray) {
          const eventName = event.name || (event.data && event.data.name);
          if (eventName === 'match_start' || eventName === 'match_end' || eventName === 'round_start' || eventName === 'round_end' || eventName === 'kill_feed') {
            isCriticalEvent = true;
            break;
          }
        }
      }
      
      // For critical events, use minimal throttling (250ms), for others use 1 second
      const throttleTime = isCriticalEvent ? 250 : 1000;
      
      // Only dispatch if events are different or enough time has passed
      if (eventsString !== lastEvents || now - lastEventsTime >= throttleTime) {
        lastEvents = eventsString;
        lastEventsTime = now;
        
        // Process the events first
        store.dispatch(
          processEvents({
            events,
            timestamp: now,
          })
        );
        
        // We now rely on the store subscription below to dispatch
        // completeMatchThunk exactly once and set the clear timeout.
        // This avoids duplicate dispatches and race conditions here.
      }
    };
  }, []);

  // Pass Overwolf events to matchStats slice
  const { start, stop } = useGameEventProvider(
    {
      onInfoUpdates: throttledInfoDispatch,
      onNewEvents: eventsDispatch,
    },
    REQUIRED_FEATURES,
    RETRY_TIMES,
    DISPLAY_OVERWOLF_HOOKS_LOGS
  );

  // Position all overlay windows based on game window
  const positionOverlayWindows = useCallback(() => {
    if (!ingame?.id || !finalhitsbar?.id || !changeswapbar?.id) {
      console.log("Not all windows are available yet");
      return;
    }
    
    // Get current app settings and match state
    const state = store.getState();
    const appSettings = state.appSettingsReducer.settings;
    const currentMatch = state.matchStatsReducer.currentMatch;
    const currentGameMode = currentMatch.gameMode; // Get current game mode

    // Helper function to get the correct position based on game mode
    const getPositionForMode = (overlayKey: 'playerStats' | 'finalHitsBar' | 'charSwapBar') => {
      const positions = appSettings.customPositions?.[overlayKey];
      const defaultPos = { x: 0, y: 0 }; // A very basic default

      if (!positions) {
        console.warn(`Custom positions structure for ${overlayKey} not found, using basic default {0,0}.`);
        return defaultPos;
      }

      // Use game mode specific position if available and valid
      const modePosition = currentGameMode ? positions[currentGameMode as keyof typeof positions] : undefined;

      if (modePosition && typeof modePosition.x === 'number' && typeof modePosition.y === 'number') {
         // console.log(`Using position for mode '${currentGameMode}' for ${overlayKey}:`, modePosition);
         return modePosition;
      }

      // Fallback to base position if mode-specific is not available or invalid
      if (positions._base && typeof positions._base.x === 'number' && typeof positions._base.y === 'number') {
        // console.log(`Falling back to base position for ${overlayKey}:`, positions._base);
        return positions._base;
      }

      // Final fallback if even base position is missing/invalid
      console.warn(`Base position for ${overlayKey} not found or invalid, using basic default {0,0}.`);
      return defaultPos;
    };

    // Position in-game player stats (using 'playerStats' key)
    const playerStatsPos = getPositionForMode('playerStats');
    overwolf.windows.changePosition(ingame.id, playerStatsPos.x, playerStatsPos.y);

    // Position final hits bar
    const finalHitsPos = getPositionForMode('finalHitsBar');
    overwolf.windows.changePosition(finalhitsbar.id, finalHitsPos.x, finalHitsPos.y);

    // Position character swap bar
    const charSwapPos = getPositionForMode('charSwapBar');
    overwolf.windows.changePosition(changeswapbar.id, charSwapPos.x, charSwapPos.y);

  }, [ingame?.id, finalhitsbar?.id, changeswapbar?.id]);

  const startApp = useCallback(
    async (reason: string) => {
      //if the desktop window is not ready we don't want to start the app
      if (!desktop) return;
      log(reason, "src/screens/background/components/Screen.tsx", "startApp");
      const marvelRivals = await getMarvelGame();
      if (marvelRivals) {
        // Start the game event provider but don't restore windows directly
        await start();
        
        // Minimize desktop window
        await desktop?.minimize();
        
        // Let the window manager handle which windows to open based on settings
        await windowManager.updateWindowsBasedOnSettings();
        
        // Position windows after restoring them
        setTimeout(positionOverlayWindows, 1000);
      } else {
        // Stop event provider
        await stop();
        
        // Show desktop window when game is closed
        await desktop?.restore();
      }
    },
    [desktop, start, stop, positionOverlayWindows]
  );

  const setFeatures = useCallback(() => {
    overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function(info) {
      // @ts-ignore
      if (info.status === "error")
      {
        //console.log("Could not set required features: " + info.reason);
        //console.log("Trying in 2 seconds");
        window.setTimeout(setFeatures, 2000);
        return;
      }
  
      console.log("Set required features:");
      console.log(JSON.stringify(info));
    });
  }, []);
  
  // Add handleGameLaunch method 
  const handleGameLaunch = useCallback(() => {
    log("Marvel Rivals launched, initializing game features", "Screen.tsx", "handleGameLaunch");
    
    // Set required features for game events
    setFeatures();
    
    // Start the event provider
    start();
    
    // Let the window manager handle which windows to open based on settings
    windowManager.updateWindowsBasedOnSettings().then(() => {
      // Position windows with a small delay to ensure game is fully loaded
      setTimeout(() => {
        positionOverlayWindows();
        log("Positioned overlay windows after game launch", "Screen.tsx", "handleGameLaunch");
      }, 3000);
    });
    
  }, [setFeatures, start, positionOverlayWindows]);

  // Listen for game resolution changes
  useEffect(() => {
    const handleGameInfoUpdated = (gameInfoResult: overwolf.games.GameInfoUpdatedEvent) => {
      // If game resolution changed, reposition the overlay windows
      if (gameInfoResult.resolutionChanged) {
        console.log("Game resolution changed, repositioning overlays");
        setGameResolutionChanged(true);
      }
    };
    
    overwolf.games.onGameInfoUpdated.addListener(handleGameInfoUpdated);
    
    return () => {
      overwolf.games.onGameInfoUpdated.removeListener(handleGameInfoUpdated);
    };
  }, []);

  // React to game resolution changes
  useEffect(() => {
    if (gameResolutionChanged) {
      // Wait a moment for the game to stabilize its new resolution
      setTimeout(() => {
        positionOverlayWindows();
        setGameResolutionChanged(false);
      }, 1000);
    }
  }, [gameResolutionChanged, positionOverlayWindows]);

  // Monitor settings changes and update window states accordingly
  useEffect(() => {
    let prevSettings = store.getState().appSettingsReducer.settings;
    
    const unsubscribe = store.subscribe(() => {
      const currentSettings = store.getState().appSettingsReducer.settings;
      
      // Check if any window-related settings changed
      const windowSettingsChanged = 
        prevSettings.enablePlayerStatsWindow !== currentSettings.enablePlayerStatsWindow ||
        prevSettings.enableFinalHitsWindow !== currentSettings.enableFinalHitsWindow ||
        prevSettings.enableCharSwapWindow !== currentSettings.enableCharSwapWindow ||
        prevSettings.showDevWindow !== currentSettings.showDevWindow;
      
      if (windowSettingsChanged) {
        log(
          "Window resource settings changed, updating window states", 
          "Screen.tsx", 
          "settingsMonitor"
        );
        
        // Update window states based on new settings
        windowManager.updateWindowsBasedOnSettings();
        
        // Update previous settings reference
        prevSettings = currentSettings;
      }
    });
    
    // Initial window state setup
    windowManager.updateWindowsBasedOnSettings();
    
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const setupEventListeners = async () => {
      const marvelRivals = await getMarvelGame();
      setGameState(marvelRivals?.isRunning ? "running" : "not-running");
      
      // Initialize the player data service with store.dispatch
      initPlayerDataService(store.dispatch);

      if (marvelRivals?.isRunning) {
        handleGameLaunch();
      }
    };

    // Call setupEventListeners to check if game is running on component mount
    setupEventListeners();
    
    startApp("on initial load");
    const gameInfoUpdatedCallback = async (event: any) => {
      if (event.runningChanged && event.gameInfo?.classId === MARVELRIVALS_CLASS_ID) {
        console.log("loading application.....");
        startApp("onGameInfoUpdated");
        if (event.gameInfo.isRunning) {
          window.setTimeout(() => {setFeatures()}, 2000);
          
          // Update window states based on settings
          window.setTimeout(async () => {
            await windowManager.updateWindowsBasedOnSettings();
            // Position windows after game starts and windows are updated
            positionOverlayWindows();
          }, 3000);
        }
      }
    }
    overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdatedCallback);

    overwolf.games.getRunningGameInfo(function (res) {
      if (res?.isRunning) {
        window.setTimeout(() => {setFeatures()}, 2000);
        // Position windows if game is already running
        window.setTimeout(() => {positionOverlayWindows()}, 3000);
      }
      console.log("getRunningGameInfo", res);
    });

    const applaunchCallback = () => {
      startApp("onAppLaunchTriggered");
    };
    overwolf.extensions.onAppLaunchTriggered.addListener(applaunchCallback);
    return () => {
      overwolf.games.onGameInfoUpdated.removeListener(gameInfoUpdatedCallback);
      overwolf.extensions.onAppLaunchTriggered.removeListener(applaunchCallback);
    };
  }, [setFeatures, startApp, positionOverlayWindows, handleGameLaunch]);

  return null;
};

export default BackgroundWindow;
