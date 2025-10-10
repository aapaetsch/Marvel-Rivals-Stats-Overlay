import { useState, useEffect, useRef } from "react";
import { SwapBarPlayerProps } from "../types/SwapBarTypes";

export const useActiveSwaps = (swapQueue: SwapBarPlayerProps[], displayDuration: number = 5000) => {
  const [activeSwaps, setActiveSwaps] = useState<SwapBarPlayerProps[]>([]);
  const timeoutRefsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  // Helper function to create a unique key for each swap
  const createSwapKey = (swap: SwapBarPlayerProps) => {
    // Deduplicate by logical identity only (ignore timestamp)
    const uid = String(swap.uid);
    const oldName = String(swap.oldCharacterName || "").toLowerCase();
    const newName = String(swap.newCharacterName || "").toLowerCase();
    return `${uid}:${oldName}:${newName}`;
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
    // First, ensure no expired swaps in the current activeSwaps and collapse duplicates if any slipped in
    const now = Date.now();
    const filtered = activeSwaps.filter(
      swap => !swap.swapTimestamp || now - swap.swapTimestamp <= displayDuration
    );
    // Collapse any duplicates by logical key, keeping the newest timestamp
    const byKey = new Map<string, SwapBarPlayerProps>();
    for (const s of filtered) {
      const k = createSwapKey(s);
      const prev = byKey.get(k);
      if (!prev || (s.swapTimestamp ?? 0) > (prev.swapTimestamp ?? 0)) {
        byKey.set(k, s);
      }
    }
    const cleanedActiveSwaps = Array.from(byKey.values());

    if (cleanedActiveSwaps.length !== activeSwaps.length) {
      setActiveSwaps(cleanedActiveSwaps);
    }

    // For each new swap found in swapQueue, if it's not already in activeSwaps, add it
    const newSwaps: SwapBarPlayerProps[] = [];

    // For each incoming swap, either enqueue as new or refresh existing
    swapQueue.forEach((incoming) => {
      // Skip if timestamp is missing or already expired
      if (incoming.swapTimestamp && now - incoming.swapTimestamp > displayDuration) {
        return;
      }

      const inKey = createSwapKey(incoming);
      const existingIndex = cleanedActiveSwaps.findIndex((ex) => createSwapKey(ex) === inKey);
      if (existingIndex === -1) {
        // Not active yet: enqueue as new
        newSwaps.push(incoming);
      } else {
        // Already active: if incoming is newer, refresh timestamp and its timeout
        const existing = cleanedActiveSwaps[existingIndex];
        const incomingTs = incoming.swapTimestamp ?? existing.swapTimestamp ?? now;
        const existingTs = existing.swapTimestamp ?? 0;
        if (incomingTs > existingTs) {
          // Update active list with newer timestamp
          const updated = { ...existing, swapTimestamp: incomingTs };
          setActiveSwaps((prev) => {
            const copy = [...prev];
            const idx = copy.findIndex((p) => createSwapKey(p) === inKey);
            if (idx !== -1) copy[idx] = updated;
            return copy;
          });
          // Reset timeout for this key based on new timestamp
          const swapKey = inKey;
          if (timeoutRefsRef.current[swapKey]) {
            clearTimeout(timeoutRefsRef.current[swapKey]);
          }
          const remainingTime = Math.max(0, displayDuration - (now - incomingTs));
          timeoutRefsRef.current[swapKey] = setTimeout(() => {
            setActiveSwaps((prev) => prev.filter((item) => createSwapKey(item) !== swapKey));
            delete timeoutRefsRef.current[swapKey];
          }, remainingTime);
        }
      }
    });

    if (newSwaps.length > 0) {
      // Add to activeSwaps, collapsing to unique keys and keeping the latest timestamp
      setActiveSwaps((prev) => {
        const map = new Map<string, SwapBarPlayerProps>();
        // seed with existing
        prev.forEach((p) => map.set(createSwapKey(p), p));
        // merge new (prefer newer timestamp)
        newSwaps.forEach((n) => {
          const k = createSwapKey(n);
          const ex = map.get(k);
          if (!ex || (n.swapTimestamp ?? 0) > (ex.swapTimestamp ?? 0)) {
            map.set(k, n);
          }
        });
        return Array.from(map.values());
      });

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
