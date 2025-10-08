import React, { useEffect, useRef } from "react";
import { SwapBarContainerProps } from "./types/SwapBarTypes";
import "./styles/CharacterSwapBar.css";

export const SwapBarContainer: React.FC<SwapBarContainerProps> = ({
  children,
  isHidden = false,
  className = "",
  contentHeight = null,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const resizeTimer = useRef<number | null>(null);
  const lastSizeRef = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Resize observer to detect content height changes
    const SAFETY_PIXELS = 8; // add a few extra pixels to avoid OS scrollbars from rounding/borders
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const newW = Math.ceil(cr.width) + SAFETY_PIXELS;
        const newH = Math.ceil(cr.height) + SAFETY_PIXELS;

        // Debounce and avoid tiny changes
        if (lastSizeRef.current && Math.abs((lastSizeRef.current.h || 0) - newH) < 3 && Math.abs((lastSizeRef.current.w || 0) - newW) < 3) {
          continue;
        }

        if (resizeTimer.current) {
          clearTimeout(resizeTimer.current as unknown as number);
        }
        resizeTimer.current = window.setTimeout(() => {
          window.overwolf?.windows?.getCurrentWindow((result: any) => {
            if (result?.success && result.window && result.window.id) {
              try {
                // Use Overwolf API to resize the declared window to fit content.
                // We intentionally request a slightly larger size (SAFETY_PIXELS)
                // to avoid fractional-pixel clipping and OS scrollbar appearance.
                window.overwolf.windows.changeSize(result.window.id, newW, newH, (r: any) => {
                  // store last known size
                  lastSizeRef.current = { w: newW, h: newH };
                });
              } catch (e) {
                // ignore errors in environments without Overwolf
                lastSizeRef.current = { w: newW, h: newH };
              }
            }
            resizeTimer.current = null;
          });
        }, 120);
      }
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
      if (resizeTimer.current) {
        clearTimeout(resizeTimer.current as unknown as number);
      }
    };
  }, []);

  const style = { ...(contentHeight != null ? { height: `${contentHeight}px` } : {}), overflow: 'hidden' as const };

  return (
    <div ref={ref} className={`swap-bar-container ${isHidden ? 'is-hidden' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
};