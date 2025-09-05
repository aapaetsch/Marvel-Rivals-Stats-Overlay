import React from 'react';
import { StatRowProps } from '../types/MatchCardTypes';

const StatRow: React.FC<StatRowProps> = ({ label, value, className = '' }) => {
  return (
    <div className={`stat-row ${className}`}>
      <span className="stat-label">{label}:</span>
      <span className="stat-value">{value}</span>
    </div>
  );
};

export default StatRow;