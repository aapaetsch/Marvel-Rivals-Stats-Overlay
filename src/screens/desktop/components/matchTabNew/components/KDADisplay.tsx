import React from 'react';
import { KDADisplayProps } from '../types/MatchCardTypes';

const KDADisplay: React.FC<KDADisplayProps> = ({ 
  kills, 
  deaths, 
  assists, 
  finalHits = 0,
  compact = false,
  hideRatioSection = false 
}) => {
  const calculateKD = () => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : '0.0';
    return (kills / deaths).toFixed(1);
  };

  const calculateKDA = () => {
    if (deaths === 0) return (kills + assists) > 0 ? (kills + assists).toFixed(1) : '0.0';
    return ((kills + assists) / deaths).toFixed(1);
  };

  if (compact) {
    return (
      <div className="kda-display compact">
        <span className="kda-compact">{kills}/{deaths}/{assists}</span>
      </div>
    );
  }

  return (
    <div className="kda-display">
      <div className="kda-section">
        <div className="kda-grid">
          <div className="kda-item">
            <div className="kda-label">K</div>
            <div className="kda-value kda-kills">{kills}</div>
          </div>
          <div className="kda-item">
            <div className="kda-label">D</div>
            <div className="kda-value kda-deaths">{deaths}</div>
          </div>
          <div className="kda-item">
            <div className="kda-label">A</div>
            <div className="kda-value kda-assists">{assists}</div>
          </div>
          <div className="kda-item">
            <div className="kda-label">FH</div>
            <div className="kda-value kda-finalhits">{finalHits}</div>
          </div>
        </div>
      </div>
      {!hideRatioSection ? (
      <div className="kda-section">
        <div className="kda-ratios">
          <div className="ratio-item">
            <div className="ratio-label">KD</div>
            <div className="ratio-value">{calculateKD()}</div>
          </div>
          <div className="ratio-item">
            <div className="ratio-label">KDA</div>
            <div className="ratio-value">{calculateKDA()}</div>
          </div>
        </div>
      </div>
      ) : (<div className="is-hidden"></div>)
      }
    </div>
  );
};

export default KDADisplay;
