import { useState, useEffect, useRef } from "react";
import { SwapBarPlayerProps } from "../types/SwapBarTypes";

export const useActiveSwaps = (swapQueue: SwapBarPlayerProps[], displayDuration: number = 5000) => {
  const [activeSwaps, setActiveSwaps] = useState<SwapBarPlayerProps[]>([]);
  const timeoutRefsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

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
          !swap.swapTimestamp || now - swap.swapTimestamp <= displayDuration
        )
      );
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [displayDuration]);

  useEffect(() => {
    // First, ensure no expired swaps in the current activeSwaps
    const now = Date.now();
    const cleanedActiveSwaps = activeSwaps.filter(
      swap => !swap.swapTimestamp || now - swap.swapTimestamp <= displayDuration
    );
    
    if (cleanedActiveSwaps.length !== activeSwaps.length) {
      setActiveSwaps(cleanedActiveSwaps);
    }

    // For each new swap found in swapQueue, if it's not already in activeSwaps, add it
    const newSwaps = swapQueue.filter((incoming) => {
      // Skip if timestamp is missing or already expired
      if (incoming.swapTimestamp && now - incoming.swapTimestamp > displayDuration) {
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
        
        // Calculate remaining time for this swap (could be less than displayDuration if already partially expired)
        const remainingTime = swap.swapTimestamp 
          ? Math.max(0, displayDuration - (now - swap.swapTimestamp))
          : displayDuration;
        
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
  }, [swapQueue, activeSwaps, displayDuration]);

  return activeSwaps;
};