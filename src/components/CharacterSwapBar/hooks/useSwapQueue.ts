import { useMemo, useState } from "react";
import { SwapBarPlayerProps } from "../types/SwapBarTypes";
import { getCharacterDefaultIconPath } from "../../../lib/characterIcons";

export const useSwapQueue = (currentMatch: any) => {
  const [hasHadCharacterSwaps, setHasHadCharacterSwaps] = useState(false);
  const [hasRoundStarted, setHasRoundStarted] = useState(false);

  const swapQueue = useMemo<SwapBarPlayerProps[]>(() => {
    const items: SwapBarPlayerProps[] = [];
    const now = Date.now();
    const DISPLAY_DURATION = 5000; // 5 seconds
    
    // Track if we have real swaps or just initial character selections
    let hasRealSwaps = false;
    let hasInitialSelections = false;
    
    for (const player of Object.values(currentMatch.players) as any[]) {
      if (!player.characterSwaps || player.characterSwaps.length === 0) continue;
      
      // Count how many players have a character selected
      if (player.characterName) {
        hasInitialSelections = true;
      }
      
      for (const swap of player.characterSwaps) {
        // Basic check to avoid including no-op swaps
        if (!swap.oldCharacterName || !swap.newCharacterName) continue;
        if (swap.oldCharacterName === swap.newCharacterName) continue;
        
        // Skip swaps that are already expired (older than 5 seconds)
        if (swap.timestamp && now - swap.timestamp > DISPLAY_DURATION) {
          continue;
        }

        // If old character name exists and isn't a placeholder, it's a real swap not just initial selection
        if (swap.oldCharacterName && swap.oldCharacterName !== "Unknown") {
          hasRealSwaps = true;
        }

        // Get character icons from our utility (DEFAULT table icons)
        const oldAvatarURL = getCharacterDefaultIconPath(swap.oldCharacterName);
        const newAvatarURL = getCharacterDefaultIconPath(swap.newCharacterName);

        items.push({
          uid: player.uid,
          name: player.name,
          oldCharacterName: swap.oldCharacterName,
          newCharacterName: swap.newCharacterName,
          swapTimestamp: swap.timestamp,
          oldAvatarURL,
          newAvatarURL,
          team: player.team,
        });
      }
    }
    
    // Update our state based on what we found
    if (hasRealSwaps && !hasHadCharacterSwaps) {
      setHasHadCharacterSwaps(true);
    }
    
    if (hasInitialSelections && !hasRoundStarted) {
      setHasRoundStarted(true);
    }
    
    return items;
  }, [currentMatch.players, hasHadCharacterSwaps, hasRoundStarted]);

  const shouldShowMatchInfo = useMemo(() => {
    // If we've already had character swaps, don't show match info
    if (hasHadCharacterSwaps) return false;
    
    // If round hasn't started yet, show match info
    if (!hasRoundStarted) return true;
    
    return false;
  }, [hasHadCharacterSwaps, hasRoundStarted]);

  return {
    swapQueue,
    shouldShowMatchInfo,
    hasHadCharacterSwaps,
    hasRoundStarted
  };
};