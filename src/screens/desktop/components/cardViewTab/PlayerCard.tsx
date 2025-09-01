import React, { useState } from 'react';
import { PlayerStats } from '../../../background/types/matchStatsTypes';
import './PlayerCard.css';

interface PlayerCardProps {
  player: PlayerStats;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Calculate K/D ratio
  const calculateKDRatio = () => {
    if (player.deaths === 0) {
      return player.kills > 0 ? "Perfect" : "0.0";
    }
    return (player.kills / player.deaths).toFixed(1);
  };

  // Calculate KDA ratio
  const calculateKDARatio = () => {
    const kills = player.kills || 0;
    const deaths = player.deaths || 0;
    const assists = player.assists || 0;
    
    if (deaths === 0) {
      return kills + assists > 0 ? "Perfect" : "0.0";
    }
    return ((kills + assists) / deaths).toFixed(1);
  };

  // Handle card click to flip
  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  // Get character icon placeholder (will need actual icons later)
  const getCharacterIcon = () => {
    // For now, use a placeholder - this could be enhanced with actual character icons
    return `/heroheadshots/${player.characterName?.toLowerCase()}.png`;
  };

  return (
    <div className={`player-card ${isFlipped ? 'flipped' : ''}`} onClick={handleCardClick}>
      <div className="card-inner">
        {/* Front side of the card */}
        <div className="card-front">
          <div className="player-name">{player.name}</div>
          
          <div className="character-info">
            <div className="character-icon">
              <img 
                src={getCharacterIcon()} 
                alt={player.characterName}
                onError={(e) => {
                  // Fallback if character icon doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Fallback character initial */}
              <div className="character-fallback">
                {player.characterName?.charAt(0) || '?'}
              </div>
            </div>
            <div className="character-name">{player.characterName}</div>
          </div>

          <div className="kda-stats">
            <div className="stat-row">
              <span className="stat-label">K</span>
              <span className="stat-value">{player.kills || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">D</span>
              <span className="stat-value">{player.deaths || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">A</span>
              <span className="stat-value">{player.assists || 0}</span>
            </div>
          </div>

          <div className="ratio-stats">
            <div className="ratio-row">
              <span className="ratio-label">K/D</span>
              <span className="ratio-value">{calculateKDRatio()}</span>
            </div>
            <div className="ratio-row">
              <span className="ratio-label">KDA</span>
              <span className="ratio-value kda-highlight">{calculateKDARatio()}</span>
            </div>
          </div>
        </div>

        {/* Back side of the card */}
        <div className="card-back">
          <div className="player-name">{player.name}</div>
          
          <div className="additional-stats">
            <div className="stat-item">
              <span className="stat-label">Final Hits</span>
              <span className="stat-value">{player.finalHits || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Damage Dealt</span>
              <span className="stat-value">{(player.damageDealt || 0).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Damage Blocked</span>
              <span className="stat-value">{(player.damageBlocked || 0).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Healing</span>
              <span className="stat-value">{(player.totalHeal || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="percentage-stats">
            <div className="percentage-item">
              <span className="percentage-label">Team Damage</span>
              <span className="percentage-value">{player.pctTeamDamage?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="percentage-item">
              <span className="percentage-label">Team Blocked</span>
              <span className="percentage-value">{player.pctTeamBlocked?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="percentage-item">
              <span className="percentage-label">Team Healing</span>
              <span className="percentage-value">{player.pctTeamHealing?.toFixed(1) || '0.0'}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;