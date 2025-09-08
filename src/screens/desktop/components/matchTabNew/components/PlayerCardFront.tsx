import React from 'react';
import { PlayerCardData } from '../types/MatchCardTypes';
import CharacterAvatar from './CharacterAvatar';
import KDADisplay from './KDADisplay';

interface PlayerCardFrontProps {
  player: PlayerCardData;
}

const PlayerCardFront: React.FC<PlayerCardFrontProps> = ({ player }) => {
  return (
    <div className="player-card-front">
      <div className="card-header">
        <div className="player-name-back" title={player.name}>
          {player.name}
        </div>
      </div>

      <div className="card-avatar">
        <CharacterAvatar 
          characterName={player.characterName}
          playerName={player.name}
          size={32}
          className="back-avatar"
        />
      </div>

      <div className="card-character">
        <div className="character-name-back" title={player.characterName}>
          {player.characterName}
        </div>
      </div>

      <div className="card-kda">
        <KDADisplay 
          kills={player.kills}
          deaths={player.deaths}
          assists={player.assists}
          finalHits={player.finalHits}
        />
      </div>

    </div>
  );
};

export default PlayerCardFront;
