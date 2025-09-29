import React, { useEffect, useRef, useState } from 'react';
import '../styles/MorphChevron.css';

interface MorphChevronProps {
  expanded: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const DURATION = 250; // ms

const MorphChevron: React.FC<MorphChevronProps> = ({ expanded, onClick, className = '' }) => {
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'expanding' | 'collapsing'>('collapsing');

  // Geometry in SVG user coordinates (viewBox 0 0 100 35)
  const centerX = 50;
  const centerY = 25; // center of chevron (kept slightly lower for visual balance)

  // Reduce steepness by this many degrees (positive = make less steep)
  const REDUCE_DEGREES = 3;

  // Reduce the angle by computing new outer X positions based on the max vertical travel
  // Move the outer x positions closer to/further from center so the angle changes by REDUCE_DEGREES.
  const collapsedY = 13; // outer ends when collapsed (higher up)
  const expandedY = 37; // outer ends when expanded (lower)

  // Use the maximum vertical travel magnitude to compute the angle change robustly
  const maxDy = Math.max(Math.abs(collapsedY - centerY), Math.abs(expandedY - centerY));

  // The original horizontal offset before adjustment (previously 10)
  const originalDx = 17;
  const currentAngle = Math.atan2(maxDy, originalDx); // radians
  const desiredAngle = currentAngle - (REDUCE_DEGREES * Math.PI) / 180; // radians
  // Guard against invalid angle (shouldn't happen for small reductions)
  const desiredDx = Math.max(1, maxDy / Math.tan(Math.max(0.01, desiredAngle)));
  // Add 1 unit to the arm length as requested

  const leftX = centerX - desiredDx;
  const rightX = centerX + desiredDx;

  // current animated y positions for ends
  const leftYRef = useRef<number>(collapsedY);
  const rightYRef = useRef<number>(collapsedY);
  const [, tick] = useState(0); // force rerender while animating

  // animation frame id & cancel flag
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Easing helper
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  useEffect(() => {
    // Trigger invert animation whenever expanded changes
    setDirection(expanded ? 'expanding' : 'collapsing');

    // Prepare animation
    const fromY = expanded ? collapsedY : expandedY; // previous state
    const toY = expanded ? expandedY : collapsedY; // target state

    // start values
    leftYRef.current = fromY;
    rightYRef.current = fromY;

    setAnimating(true);
    startTimeRef.current = null;

    // animation loop
    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const rawT = Math.min(1, elapsed / DURATION);
      const t = easeInOutCubic(rawT);

      // interpolate y values (only vertical movement of endpoints)
      const currentY = fromY + (toY - fromY) * t;
      leftYRef.current = currentY;
      rightYRef.current = currentY;

      // rerender
      tick((c) => c + 1);

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // done
        setAnimating(false);
        rafRef.current = null;
        startTimeRef.current = null;
      }
    };

    // kick off
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [expanded]);

  const classes = [
    'morph-chevron',
    expanded ? 'expanded' : '',
    animating ? 'animating' : '',
    direction,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Keyboard activation so Enter/Space trigger the click like a native button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent);
    }
  };

  // Read the current y positions for rendering
  const leftY = leftYRef.current;
  const rightY = rightYRef.current;

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={expanded ? 'Collapse' : 'Expand'}
      tabIndex={0}
    >
      <svg className="chevron-single" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 35" aria-hidden="true">
        {/* Left arm: outer point moves only vertically between collapsedY and expandedY, center stays fixed */}
        <line
          className="chevron-arm chevron-arm-left"
          x1={leftX}
          y1={leftY}
          x2={centerX}
          y2={centerY}
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
        />

        {/* Right arm */}
        <line
          className="chevron-arm chevron-arm-right"
          x1={rightX}
          y1={rightY}
          x2={centerX}
          y2={centerY}
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default MorphChevron;
