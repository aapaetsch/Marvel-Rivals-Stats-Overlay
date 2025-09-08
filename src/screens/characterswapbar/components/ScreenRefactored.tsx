import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootReducer } from "../../../app/shared/rootReducer";
import { WINDOW_NAMES } from "../../../app/shared/constants";
import { getGameMapImg } from "../../../lib/mapIcons";
import DragHandle from "../../shared/DragHandle";
import { 
  SwapBar, 
  SwapBarContainer, 
  useSwapQueue, 
  useActiveSwaps,
  SwapBarProps 
} from "../../../components/CharacterSwapBar";

const { CHARSWAPBAR } = WINDOW_NAMES;

const Screen: React.FC = () => {
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const { showPlayerSwapNotification, allySwapColor, enemySwapColor } = useSelector(
    (state: RootReducer) => state.appSettingsReducer.settings
  );

  // Check if a match is in progress
  const isMatchInProgress = useMemo(() => {
    return currentMatch.timestamps.matchStart !== null && currentMatch.timestamps.matchEnd === null;
  }, [currentMatch.timestamps.matchStart, currentMatch.timestamps.matchEnd]);

  // Use custom hooks for swap management
  const { swapQueue, shouldShowMatchInfo } = useSwapQueue(currentMatch);
  const activeSwaps = useActiveSwaps(swapQueue, 5000); // 5 second display duration

  // Find the team of the local player
  const localPlayerTeam = useMemo(() => {
    const localPlayer = Object.values(currentMatch.players).find((player: any) => player.isLocal);
    return (localPlayer as any)?.team || 1; // Default to team 1 if not found
  }, [currentMatch.players]);

  // Get the map image URL based on the current map
  const mapImageUrl = useMemo(() => {
    if (!currentMatch.map && !currentMatch.gameMode) {
      return null;
    }
    const mapImageName = getGameMapImg(currentMatch.map, currentMatch.gameMode);
    return mapImageName ? `/mapIcons/${mapImageName}` : null;
  }, [currentMatch.map, currentMatch.gameMode]);

  // Prepare swap bar props
  const swapBarProps: SwapBarProps & {
    localPlayerTeam: number;
    allySwapColor: string;
    enemySwapColor: string;
  } = {
    characters: activeSwaps,
    show: (activeSwaps.length > 0 || shouldShowMatchInfo) && showPlayerSwapNotification,
    showMatchInfo: shouldShowMatchInfo,
    matchInfo: {
      map: currentMatch.map,
      gameType: currentMatch.gameType,
      gameMode: currentMatch.gameMode
    },
    localPlayerTeam,
    allySwapColor,
    enemySwapColor
  };

  return (
    <SwapBarContainer
      mapImageUrl={mapImageUrl}
      isHidden={!showPlayerSwapNotification}
    >
      <DragHandle windowName={WINDOW_NAMES.CHARSWAPBAR} />
      <SwapBar {...swapBarProps} />
    </SwapBarContainer>
  );
};

export default Screen;