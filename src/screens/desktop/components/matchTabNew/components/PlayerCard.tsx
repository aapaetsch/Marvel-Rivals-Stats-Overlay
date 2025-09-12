import React from 'react';
import { PlayerCardData } from '../types/MatchCardTypes';
import PlayerCardFront from './PlayerCardFront';
import PlayerCardBack from './PlayerCardBack';

interface PlayerCardProps {
  player: PlayerCardData;
  isFlipped: boolean;
  onFlip: () => void;
  allPlayers?: PlayerCardData[];
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isFlipped, onFlip, allPlayers = [] }) => {
  const getTeamClass = () => {
    if (player.isTeammate) {
      return 'team-friendly';
    }
    return 'team-enemy';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlip();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };
  // TODO: Localize aria-label
  return (
    <div 
      className={`player-card ${getTeamClass()}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`${player.name} stats card. Click to ${isFlipped ? 'show main stats' : 'show final hits breakdown'}`}
    >
      <div className={`card-flip-container ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-face card-face-front">
          <PlayerCardFront player={player} />
        </div>
        <div className="card-face card-face-back">
          <PlayerCardBack player={player} allPlayers={allPlayers} />
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;