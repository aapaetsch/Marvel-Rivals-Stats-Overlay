import React from 'react';
import { PlayerCardData } from '../types/MatchCardTypes';
import CharacterAvatar from './CharacterAvatar';

interface PlayerCardBackProps {
  player: PlayerCardData;
  allPlayers?: PlayerCardData[]; // To get opponent names
}

const PlayerCardBack: React.FC<PlayerCardBackProps> = ({ player, allPlayers = [] }) => {
  const renderFinalHitsBreakdown = () => {
    const killedPlayers = Object.entries(player.killedPlayers || {});
    const killedBy = Object.entries(player.killedBy || {});

    const totalGiven = killedPlayers.reduce((sum, [, count]) => sum + count, 0);
    const totalReceived = killedBy.reduce((sum, [, count]) => sum + count, 0);

    // Get top interactions (max 2 each to save space)
    const topKilled = killedPlayers
      .sort(([,a], [,b]) => b - a);
    const topKilledBy = killedBy
      .sort(([,a], [,b]) => b - a);

    // Get opponent player names for display
    const getPlayerName = (uid: string) => {
      const foundPlayer = allPlayers.find(p => p.uid === uid);
      return foundPlayer ? foundPlayer.name : `Player ${uid.slice(-4)}`;
    };

    if (totalGiven === 0 && totalReceived === 0) {
      return (
        <div className="no-final-hits">
          <p>No final hits data</p>
        </div>
      );
    }

    return (
      <div className="final-hits-breakdown">
        <div className="final-hits-compact">
          {totalGiven > 0 && (
            <div className="final-hits-section">
              {topKilled.length > 0 && (
                <div className="top-interactions">
                  {topKilled.map(([playerUid, count]) => (
                    <div key={`killed-${playerUid}`} className="interaction-line given">
                      <span className="player-name-short">{getPlayerName(playerUid)}</span>
                      <span className="interaction-count">{count}</span>
                    </div>
                  ))}
                  {/* {killedPlayers.length > 2 && (
                    <div className="more-indicator">+{killedPlayers.length - 2} more</div>
                  )} */}
                </div>
              )}
            </div>
          )}

          {totalReceived > 0 && (
            <div className="final-hits-section">
              {topKilledBy.length > 0 && (
                <div className="top-interactions">
                  {topKilledBy.map(([playerUid, count]) => (
                    <div key={`killedby-${playerUid}`} className="interaction-line received">
                      <span className="player-name-short">{getPlayerName(playerUid)}</span>
                      <span className="interaction-count">{count}</span>
                    </div>
                  ))}
                  {killedBy.length > 2 && (
                    <div className="more-indicator">+{killedBy.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="player-card-back">
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
      {/* Summary row: Final Hits and Deaths */}
      <div className="final-hits-summary-row">
        <div className="fh-grid">
          <div className="fh-item">
            <div className="fh-label">Final Hits</div>
            <div className="fh-value">{player.finalHits}</div>
          </div>
          <div className="fh-item">
            <div className="fh-label">Deaths</div>
            <div className="fh-value">{player.deaths}</div>
          </div>
        </div>
      </div>
      <div className="card-back-content">
        {renderFinalHitsBreakdown()}
      </div>
    </div>
  );
};

export default PlayerCardBack;
