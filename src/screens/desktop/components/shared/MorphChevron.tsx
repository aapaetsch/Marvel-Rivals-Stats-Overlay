import React from 'react';
import '../styles/MorphChevron.css';

interface MorphChevronProps {
  expanded: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const MorphChevron: React.FC<MorphChevronProps> = ({ 
  expanded, 
  onClick,
  className = ''
}) => {
  // Use a single chevron with a static class for expanded state
  return (
    <div 
      className={`morph-chevron ${expanded ? 'expanded' : ''} ${className}`} 
      onClick={onClick}
    >
      <svg 
        className="chevron-single" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 35"
      >
        <path d="M5 5l45 25 45-25" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
      </svg>
    </div>
  );
};

export default MorphChevron;
