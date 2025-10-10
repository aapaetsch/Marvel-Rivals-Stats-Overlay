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

    // Deduplication sets to avoid showing the same swap twice
    // 1) by uid+old+new (strict)
    const seenKeys = new Set<string>();
    // 2) by name+old+new (cross-uid safety if backend duplicates player records)
    const seenNameKeys = new Set<string>();
    
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

        // Build a stable key for this swap so we can deduplicate.
        // Important: do NOT include timestamp here — we want only one instance
        // of the same (player -> old -> new) combination to be shown at a time,
        // even if multiple events with different timestamps arrive.
        const keyParts = [
          String(player.uid),
          String((swap.oldCharacterName || '').toLowerCase()),
          String((swap.newCharacterName || '').toLowerCase()),
        ];
        const key = keyParts.join(":");
        const nameKey = [String(player.name || "").toLowerCase(), keyParts[1], keyParts[2]].join(":");
        if (seenKeys.has(key) || seenNameKeys.has(nameKey)) {
          // Already processed identical swap for this render, skip it
          continue;
        }
        seenKeys.add(key);
        seenNameKeys.add(nameKey);

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
          team: Number(player.team),
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
    // Developer override: if a dev flag is set on the current match, show match info
    // (This allows dev widgets to force the match-info preview.)
    if ((currentMatch as any)?.devForceShowMatchInfo) return true;

    // If we've already had character swaps, don't show match info
    if (hasHadCharacterSwaps) return false;

    // If round hasn't started yet, show match info
    if (!hasRoundStarted) return true;

    return false;
  }, [currentMatch, hasHadCharacterSwaps, hasRoundStarted]);

  return {
    swapQueue,
    shouldShowMatchInfo,
    hasHadCharacterSwaps,
    hasRoundStarted
  };
};
