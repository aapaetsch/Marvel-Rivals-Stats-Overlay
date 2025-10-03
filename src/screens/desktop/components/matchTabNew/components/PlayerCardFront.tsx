import React from 'react';
import { PlayerCardData } from '../types/MatchCardTypes';
import CharacterAvatar from './CharacterAvatar';
import KDADisplay from './KDADisplay';

interface PlayerCardFrontProps {
  player: PlayerCardData;
}

const PlayerCardFront: React.FC<PlayerCardFrontProps> = ({ player }) => {
  // TODO: Fetch actual character usage data from player's match history
  // This should aggregate character counts across recent matches for this player
  // For now, we show the current character as the most used
  const mostUsedCharacters = [
    { characterName: player.characterName, count: 1 },
    // Placeholders for additional most-used characters
    // These will be populated when we have historical data
  ];

  return (
    <div className="player-card-front">
      <div className="card-back-header">
        <CharacterAvatar
          characterName={player.characterName}
          playerName={player.name}
          size={32}
          className="back-avatar"
        />
        <div className="player-back-info">
          <div className="player-name-back">{player.name}</div>
          <div className="character-name-back">{player.characterName}</div>
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

      {/* Most Used Characters Section (moved to the bottom of the front face) */}
      <div className="most-used-characters">
        <div className="most-used-label">Most Used</div>
        <div className="most-used-grid">
          {/* Top row: 3 characters (larger) */}
          <div className="most-used-row-top">
            {mostUsedCharacters.slice(0, 3).map((char, idx) => (
              <div key={idx} className="most-used-avatar-slot">
                <CharacterAvatar
                  characterName={char.characterName}
                  playerName={player.name}
                  size={32} // larger size for top 3
                  className="most-used-avatar"
                />
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, 3 - mostUsedCharacters.slice(0, 3).length) }).map((_, idx) => (
              <div key={`empty-top-${idx}`} className="most-used-avatar-slot empty">
                <CharacterAvatar
                  characterName={''}
                  playerName={''}
                  size={32}
                  className={"most-used-avatar placeholder"}
                />
              </div>
            ))}
          </div>
          {/* Bottom row: 4 characters (smaller) */}
          <div className="most-used-row-bottom">
            {mostUsedCharacters.slice(3, 7).map((char, idx) => (
              <div key={idx} className="most-used-avatar-slot">
                <CharacterAvatar
                  characterName={char.characterName}
                  playerName={player.name}
                  size={24} // smaller size for next 4
                  className="most-used-avatar"
                />
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, 4 - mostUsedCharacters.slice(3, 7).length) }).map((_, idx) => (
              <div key={`empty-bottom-${idx}`} className="most-used-avatar-slot empty">
                <CharacterAvatar
                  characterName={''}
                  playerName={''}
                  size={24}
                  className={"most-used-avatar placeholder"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCardFront;
