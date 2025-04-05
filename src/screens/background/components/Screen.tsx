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
import { positionWindowRelativeToGame } from "lib/overwolf-essentials";

// Import matchStats actions
import { processInfoUpdate, processEvents } from "../stores/matchStatsSlice";

const { DESKTOP, INGAME, FINALHITSBAR, CHARSWAPBAR } = WINDOW_NAMES;

const g_interestedInFeatures = ["game_info", "match_info", "gep_internal"];

// Window positioning constants
const WINDOW_POSITIONS = {
  CHAR_SWAP: { position: 'topCenter' as const, offsetX: 0, offsetY: 180 },
  FINAL_HITS: { position: 'topRight' as const, offsetX: 20, offsetY: 100 },
  INGAME_OVERLAY: { position: 'left' as const, offsetX: 25, offsetY: 0 }
};

const BackgroundWindow = () => {
  const [desktop] = useWindow(DESKTOP, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [ingame] = useWindow(INGAME, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [finalhitsbar] = useWindow(FINALHITSBAR, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [changeswapbar] = useWindow(CHARSWAPBAR, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [gameResolutionChanged, setGameResolutionChanged] = useState(false);

  // Throttle event dispatches to avoid overwhelming the Redux store
  const throttledInfoDispatch = useMemo(() => 
    (info: any) => 
      store.dispatch(
        processInfoUpdate({
          info,
          timestamp: Date.now(),
        })
      ), []);

  const eventsDispatch = useMemo(() => 
    (events: any) => 
      store.dispatch(
        processEvents({
          events,
          timestamp: Date.now(),
        })
      ), []);

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

    // Position in-game player stats on the left side
    positionWindowRelativeToGame(
      ingame.id,
      WINDOW_POSITIONS.INGAME_OVERLAY.position,
      WINDOW_POSITIONS.INGAME_OVERLAY.offsetX,
      WINDOW_POSITIONS.INGAME_OVERLAY.offsetY
    );

    // Position final hits bar on the top right
    positionWindowRelativeToGame(
      finalhitsbar.id,
      WINDOW_POSITIONS.FINAL_HITS.position,
      WINDOW_POSITIONS.FINAL_HITS.offsetX,
      WINDOW_POSITIONS.FINAL_HITS.offsetY
    );

    // Position character swap bar in the center
    positionWindowRelativeToGame(
      changeswapbar.id,
      WINDOW_POSITIONS.CHAR_SWAP.position,
      WINDOW_POSITIONS.CHAR_SWAP.offsetX,
      WINDOW_POSITIONS.CHAR_SWAP.offsetY
    );

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
