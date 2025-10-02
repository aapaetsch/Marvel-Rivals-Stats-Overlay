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

  const chevronAngleOffset = 3;
  const centerX = 50;
  const centerY = 25;
  const collapsedY = 13;
  const expandedY = 37;
  const maxDy = Math.max(Math.abs(collapsedY - centerY), Math.abs(expandedY - centerY));
  
  const originalDx = 17;
  const currentAngle = Math.atan2(maxDy, originalDx); // radians
  const desiredAngle = currentAngle - (chevronAngleOffset * Math.PI) / 180; // radians
  const desiredDx = Math.max(1, maxDy / Math.tan(Math.max(0.01, desiredAngle)));

  const leftX = centerX - desiredDx;
  const rightX = centerX + desiredDx;

  const leftYRef = useRef<number>(collapsedY);
  const rightYRef = useRef<number>(collapsedY);
  const [, tick] = useState(0); // force rerender while animating

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Easing helper
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  useEffect(() => {
    // Trigger invert animation whenever expanded changes
    setDirection(expanded ? 'expanding' : 'collapsing');

    const fromY = expanded ? collapsedY : expandedY;
    const toY = expanded ? expandedY : collapsedY;
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

      // (only vertical movement of endpoints)
      const currentY = fromY + (toY - fromY) * t;
      leftYRef.current = currentY;
      rightYRef.current = currentY;

      // rerender
      tick((c) => c + 1);

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setAnimating(false);
        rafRef.current = null;
        startTimeRef.current = null;
      }
    };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent);
    }
  };

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