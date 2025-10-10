import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import "./styles/swapbar.css";
import { WINDOW_NAMES } from "app/shared/constants";
import { getGameMapImg } from "lib/mapIcons";
import DragHandle from "../../shared/DragHandle";
import { 
  SwapBar, 
  SwapBarContainer, 
  useSwapQueue, 
  useActiveSwaps
} from "../../../components/CharacterSwapBar";

const Screen: React.FC = () => {
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const { showPlayerSwapNotification, allySwapColor, enemySwapColor, playerSwapNotificationDuration } = useSelector(
    (state: RootReducer) => state.appSettingsReducer.settings
  );

  // Use custom hooks for swap management
  const { swapQueue, shouldShowMatchInfo } = useSwapQueue(currentMatch);
  // Determine display duration: dev override on currentMatch wins; otherwise app setting in seconds
  const displayDurationMs = (currentMatch.devSwapDisplayDuration != null && currentMatch.devSwapDisplayDuration >= 0)
    ? currentMatch.devSwapDisplayDuration
    : ((playerSwapNotificationDuration || 5) * 1000);
  const activeSwaps = useActiveSwaps(swapQueue, displayDurationMs);

  // Apply developer override for max visible swaps if set on the current match
  const DEV_MAX = (typeof currentMatch.devMaxVisibleSwaps === 'number' && currentMatch.devMaxVisibleSwaps >= 0)
    ? currentMatch.devMaxVisibleSwaps
    : null;
  const DEFAULT_MAX_VISIBLE = 6;
  const effectiveMax = DEV_MAX != null ? DEV_MAX : DEFAULT_MAX_VISIBLE;
  const visibleSwaps = activeSwaps.slice(0, effectiveMax);

  // Layout sizing rules
  const FULL_ROW_HEIGHT = 44; // px for a full-size row
  // Read actual CSS margin-bottom for swap rows when possible so the calculation matches styles
  const ROW_GAP = ((): number => {
    if (typeof document === 'undefined') return 8;
    const el = document.querySelector('.swap-bar__player-row');
    if (!el) return 8;
    const mb = getComputedStyle(el).marginBottom || '8px';
    const parsed = parseFloat(mb.replace('px', ''));
    return Number.isFinite(parsed) ? Math.round(parsed) : 8;
  })();
  const MAX_ROWS_VISIBLE_HEIGHT = 4; // container maximum in rows (now 4 full rows)
  const SAFETY_PADDING = 4; // additional pixels to avoid fractional clipping at the bottom

  const visibleCount = visibleSwaps.length;
  // Compute containerHeight: if no visible swaps, leave container auto-sized (null)
  let containerHeight: number | null = null;
  let rowHeight: number | null = null;
  if (visibleCount > 0) {
    // Include extra margins: cap total height to MAX_ROWS_VISIBLE_HEIGHT rows plus 6 row margins
    const totalAvailable = MAX_ROWS_VISIBLE_HEIGHT * FULL_ROW_HEIGHT + 6 * ROW_GAP;
    if (visibleCount <= MAX_ROWS_VISIBLE_HEIGHT) {
      rowHeight = FULL_ROW_HEIGHT;
      // include bottom gap + a small safety padding to avoid fractional clipping
      containerHeight = visibleCount * FULL_ROW_HEIGHT + visibleCount * ROW_GAP + SAFETY_PADDING;
    } else {
      // shrink rows so visibleCount rows fit into totalAvailable (including bottom gaps)
      // subtract SAFETY_PADDING from the available space for rows so the final container can include the padding
      rowHeight = Math.max(20, Math.floor((totalAvailable - visibleCount * ROW_GAP - SAFETY_PADDING) / visibleCount));
      containerHeight = totalAvailable + SAFETY_PADDING;
    }
  }

  // Find the team of the local player
  const localPlayerTeam = useMemo(() => {
    const localPlayer = Object.values(currentMatch.players).find((player: any) => player.isLocal);
    const team = (localPlayer as any)?.team;
    const num = Number(team);
    return Number.isFinite(num) && num > 0 ? num : 1; // Default to team 1 if not found
  }, [currentMatch.players]);

  // Get the map image URL based on the current map
  const mapImageUrl = useMemo(() => {
    if (!currentMatch.map && !currentMatch.gameMode) {
      return null;
    }
    const mapImageName = getGameMapImg(currentMatch.map, currentMatch.gameMode);
    return mapImageName ? `/mapIcons/${mapImageName}` : null;
  }, [currentMatch.map, currentMatch.gameMode]);

  return (
    <SwapBarContainer
      mapImageUrl={mapImageUrl}
      isHidden={!showPlayerSwapNotification}
      contentHeight={containerHeight}
    >
      <DragHandle windowName={WINDOW_NAMES.CHARSWAPBAR} />
      <SwapBar
        characters={visibleSwaps}
        show={(activeSwaps.length > 0 || shouldShowMatchInfo) && showPlayerSwapNotification}
        showMatchInfo={shouldShowMatchInfo}
        matchInfo={{
          map: currentMatch.map,
          gameType: currentMatch.gameType,
          gameMode: currentMatch.gameMode
        }}
        mapImageUrl={mapImageUrl}
        localPlayerTeam={localPlayerTeam}
        allySwapColor={allySwapColor || '#1890FF'}
        enemySwapColor={enemySwapColor || '#FF4D4F'}
        rowHeight={rowHeight}
      />
    </SwapBarContainer>
  );
};

export default Screen;
