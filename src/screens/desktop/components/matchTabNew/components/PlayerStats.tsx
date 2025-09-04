import React from 'react';
import { PlayerStatsProps } from '../types/MatchCardTypes';
import StatRow from './StatRow';

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, showExtended = false }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="player-stats">
      <div className="damage-stats">
        <StatRow 
          label="Damage" 
          value={formatNumber(player.damageDealt)} 
          className="damage-primary"
        />
        <StatRow 
          label="Blocked" 
          value={formatNumber(player.damageBlocked)} 
          className="damage-blocked"
        />
        <StatRow 
          label="Healing" 
          value={formatNumber(player.totalHeal)} 
          className="healing"
        />
      </div>

      {showExtended && (
        <div className="extended-stats">
          <StatRow 
            label="Final Hits" 
            value={player.finalHits} 
            className="final-hits"
          />
        </div>
      )}
    </div>
  );
};

export default PlayerStats;