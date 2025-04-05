import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import "./styles/swapbar.css";
import { WINDOW_NAMES } from "app/shared/constants";
import { getCharacterIconPath } from "lib/characterIcons";

// Example interfaces (adjust as needed).
// You can also import them from your own swapbartypes.ts if you prefer.
interface SwapBarCharProps {
  name: string;
  charName: string;
  avatarURLStr: string | null;
}

export interface SwapBarPlayerProps {
  uid: string;
  name: string;
  oldCharacterName: string;
  newCharacterName: string;
  oldAvatarURL: string | null;
  newAvatarURL: string | null;
  team: number;
  swapTimestamp?: number; // Optional, if you want to track when the swap happened
}

export interface SwapBarProps {
  characters: SwapBarPlayerProps[];
  show: boolean;
  matchInfo?: {
    map: string | null;
    gameType: string | null;
    gameMode: string | null;
  };
  showMatchInfo: boolean;
}

const { CHARSWAPBAR } = WINDOW_NAMES;

// Renders a single player's “swapped from or to” character
const SwapBarPlayer: React.FC<SwapBarCharProps> = (props) => {
  return (
    <div className="swap-bar__player">
      <div className="swap-bar__player-name">{props.name}</div>
      <div className="swap-bar__player-avatar">
        <img src={props.avatarURLStr ?? ""} alt={props.charName} />
      </div>
    </div>
  );
};

// Renders the entire row of a swap: (Old Char) -> (New Char)
const SwapBar: React.FC<SwapBarProps> = (props) => {
  return (
    <div className={`swap-bar ${props.show ? "show" : ""}`}>
      {props.showMatchInfo && props.matchInfo && (
        <div className="swap-bar__match-info">
          <div className="swap-bar__match-info-content">
            <div className="swap-bar__match-location">
              {props.matchInfo.map || "Unknown Map"}
            </div>
            <div className="swap-bar__match-type">
              {props.matchInfo.gameMode || props.matchInfo.gameType || "Unknown Game Type"}
            </div>
          </div>
          <div className="swap-bar__player-background"></div>
        </div>
      )}
      {props.characters?.map((character, index) => {
        const leftProps: SwapBarCharProps = {
          name: character.name,
          charName: character.oldCharacterName ?? "",
          avatarURLStr: character.oldAvatarURL ?? "",
        };
        const rightProps: SwapBarCharProps = {
          name: character.name,
          charName: character.newCharacterName ?? "",
          avatarURLStr: character.newAvatarURL ?? "",
        };
        return (
          <React.Fragment key={index}>
            <div className={`swap-bar__player-row team-${character.team}`}>
              {character.oldCharacterName && <SwapBarPlayer {...leftProps} />}
              <div className="swap-bar__swap-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 16V4L3 8M17 8V20L21 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {character.newCharacterName && <SwapBarPlayer {...rightProps} />}
              <div className="swap-bar__player-background"></div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Screen: React.FC = () => {
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);

  // Check if a match is in progress
  const isMatchInProgress = useMemo(() => {
    return currentMatch.timestamps.matchStart !== null && currentMatch.timestamps.matchEnd === null;
  }, [currentMatch.timestamps.matchStart, currentMatch.timestamps.matchEnd]);

  // Track if we've had any character swaps (with valid characters)
  const [hasHadCharacterSwaps, setHasHadCharacterSwaps] = useState(false);
  
  // Track if the round has started (players have picked initial characters)
  const [hasRoundStarted, setHasRoundStarted] = useState(false);
  
  // Check if we should show match info (before round starts or any real character swaps)
  const shouldShowMatchInfo = useMemo(() => {
    // If we've already had character swaps, don't show match info
    if (hasHadCharacterSwaps) return false;
    
    // If round hasn't started yet, show match info
    if (!hasRoundStarted) return true;
    
    return false;
  }, [hasHadCharacterSwaps, hasRoundStarted]);

  // 1) Derive current swaps from Redux
  const swapQueue = useMemo<SwapBarPlayerProps[]>(() => {
    const items: SwapBarPlayerProps[] = [];
    const now = Date.now();
    const DISPLAY_DURATION = 5000; // 5 seconds
    
    // Track if we have real swaps or just initial character selections
    let hasRealSwaps = false;
    let hasInitialSelections = false;
    
    for (const player of Object.values(currentMatch.players)) {
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

        // Get character icons from our utility
        const oldAvatarURL = getCharacterIconPath(swap.oldCharacterName);
        const newAvatarURL = getCharacterIconPath(swap.newCharacterName);

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

  // 2) Maintain a local display queue that automatically removes items after 5s
  const [activeSwaps, setActiveSwaps] = useState<SwapBarPlayerProps[]>([]);
  const timeoutRefsRef = React.useRef<{[key: string]: NodeJS.Timeout}>({});
  const DISPLAY_DURATION = 5000; // 5 seconds

  // Helper function to create a unique key for each swap
  const createSwapKey = (swap: SwapBarPlayerProps) => {
    return `${swap.uid}-${swap.swapTimestamp}-${swap.oldCharacterName}-${swap.newCharacterName}`;
  };

  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      Object.values(timeoutRefsRef.current).forEach(clearTimeout);
      timeoutRefsRef.current = {};
    };
  }, []);

  // Periodically check for expired swaps (additional safety mechanism)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      setActiveSwaps(prevSwaps => 
        prevSwaps.filter(swap => 
          !swap.swapTimestamp || now - swap.swapTimestamp <= DISPLAY_DURATION
        )
      );
    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    // First, ensure no expired swaps in the current activeSwaps
    const now = Date.now();
    const cleanedActiveSwaps = activeSwaps.filter(
      swap => !swap.swapTimestamp || now - swap.swapTimestamp <= DISPLAY_DURATION
    );
    
    if (cleanedActiveSwaps.length !== activeSwaps.length) {
      setActiveSwaps(cleanedActiveSwaps);
    }

    // For each new swap found in swapQueue, if it's not already in activeSwaps, add it
    const newSwaps = swapQueue.filter((incoming) => {
      // Skip if timestamp is missing or already expired
      if (incoming.swapTimestamp && now - incoming.swapTimestamp > DISPLAY_DURATION) {
        return false;
      }
      
      return !cleanedActiveSwaps.some(
        (existing) => createSwapKey(existing) === createSwapKey(incoming)
      );
    });

    if (newSwaps.length > 0) {
      // Add to activeSwaps
      setActiveSwaps((prev) => [...prev, ...newSwaps]);

      // For each newly added swap, set a timeout to remove it
      newSwaps.forEach((swap) => {
        const swapKey = createSwapKey(swap);
        
        // Clear any existing timeout for this swap to prevent memory leaks
        if (timeoutRefsRef.current[swapKey]) {
          clearTimeout(timeoutRefsRef.current[swapKey]);
        }
        
        // Calculate remaining time for this swap (could be less than DISPLAY_DURATION if already partially expired)
        const remainingTime = swap.swapTimestamp 
          ? Math.max(0, DISPLAY_DURATION - (now - swap.swapTimestamp))
          : DISPLAY_DURATION;
        
        // Set new timeout and store the reference
        timeoutRefsRef.current[swapKey] = setTimeout(() => {
          setActiveSwaps((prev) =>
            prev.filter((item) => createSwapKey(item) !== swapKey)
          );
          // Clean up the timeout reference
          delete timeoutRefsRef.current[swapKey];
        }, remainingTime);
      });
    }
    // Only re-run when swapQueue changes
  }, [swapQueue, activeSwaps]);

  // 3) Pass local state to <SwapBar>. The bar shows items in activeSwaps, which vanish after 5s
  const barProps: SwapBarProps = {
    characters: activeSwaps,
    show: activeSwaps.length > 0 || shouldShowMatchInfo,
    showMatchInfo: shouldShowMatchInfo,
    matchInfo: {
      map: currentMatch.map,
      gameType: currentMatch.gameType,
      gameMode: currentMatch.gameMode
    }
  };

  return (
    <div className="swap-bar-container">
      <SwapBar {...barProps} />
    </div>
  );
};

export default Screen;
