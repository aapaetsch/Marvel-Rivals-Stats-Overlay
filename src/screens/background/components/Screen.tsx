import {
  REQUIRED_FEATURES,
  WINDOW_NAMES,
  RETRY_TIMES,
  DISPLAY_OVERWOLF_HOOKS_LOGS,
} from "app/shared/constants";
import { useGameEventProvider, useWindow } from "overwolf-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MARVELRIVALS_CLASS_ID, getHearthstoneGame } from "lib/games";
import store from "app/shared/store";
import { log } from "lib/log";
import { throttle } from "lib/utils";

// Import matchStats actions
import { processInfoUpdate, processEvents } from "../stores/matchStatsSlice";

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

  // Throttle event dispatches to avoid overwhelming the Redux store with duplicate data
  const throttledInfoDispatch = useMemo(() => {
    // Store the last dispatched info to compare for duplicates
    let lastInfo: string = '';
    let lastInfoTime: number = 0;
    
    return (info: any) => {
      const now = Date.now();
      // Convert current info to string for comparison
      const infoString = JSON.stringify(info);
      
      // Only dispatch if info is different or more than 1 second has passed
      if (infoString !== lastInfo || now - lastInfoTime >= 1000) {
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

  const eventsDispatch = useMemo(() => {
    // Store the last dispatched events to compare for duplicates
    let lastEvents: string = '';
    let lastEventsTime: number = 0;
    
    return (events: any) => {
      const now = Date.now();
      // Convert current events to string for comparison
      const eventsString = JSON.stringify(events);
      
      // Only dispatch if events are different or more than 1 second has passed
      if (eventsString !== lastEvents || now - lastEventsTime >= 1000) {
        lastEvents = eventsString;
        lastEventsTime = now;
        store.dispatch(
          processEvents({
            events,
            timestamp: now,
          })
        );
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
      //if the desktop or ingame window is not ready we don't want to start the app
      if (!desktop || !ingame || !finalhitsbar) return;
      log(reason, "src/screens/background/components/Screen.tsx", "startApp");
      const hearthstone = await getHearthstoneGame();
      if (hearthstone) {
        await Promise.all([start(), ingame?.restore(), finalhitsbar?.restore(), changeswapbar.restore(), desktop?.minimize()]);
        // Position windows after restoring them
        setTimeout(positionOverlayWindows, 1000);
      } else {
        await Promise.all([stop(), ingame?.restore(), finalhitsbar?.restore(), changeswapbar.restore(), desktop?.restore()]);
      }
    },
    [desktop, ingame, finalhitsbar, changeswapbar, start, stop, positionOverlayWindows]
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

  useEffect(() => {
    startApp("on initial load");
    const gameInfoUpdatedCallback = async (event: any) => {
      if (event.runningChanged && event.gameInfo?.classId === MARVELRIVALS_CLASS_ID) {
        console.log("loading application.....");
        startApp("onGameInfoUpdated");
        if (event.gameInfo.isRunning) {
          window.setTimeout(() => {setFeatures()}, 2000);
          // Position windows after game starts
          window.setTimeout(() => {positionOverlayWindows()}, 3000);
        }
      }
    }
    overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdatedCallback);

    overwolf.games.getRunningGameInfo(function (res) {
      if (res.isRunning) {
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
  }, [setFeatures, startApp, positionOverlayWindows]);

  return null;
};

export default BackgroundWindow;
