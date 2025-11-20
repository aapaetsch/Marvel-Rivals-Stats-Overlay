import React from 'react';
import { PlayerCardData } from '../types/MatchCardTypes';
import CharacterAvatar from './CharacterAvatar';
import KDADisplay from './KDADisplay';
import { isDev } from 'lib/utils';

interface PlayerCardBackProps {
  player: PlayerCardData;
  allPlayers?: PlayerCardData[]; // To get opponent names
}

const PlayerCardBack: React.FC<PlayerCardBackProps> = ({ player, allPlayers = [] }) => {
  const renderFinalHitsBreakdown = () => {
    const killedPlayers = player.killedPlayers || {};
    const killedBy = player.killedBy || {};

    const opponentUids = Array.from(new Set([
      ...Object.keys(killedPlayers),
      ...Object.keys(killedBy)
    ]));

    if (opponentUids.length === 0) {
      return (
        <div className="no-final-hits">
          {/* TODO: Localize */}
          <p>No final hits data</p>
        </div>
      );
    }

    const rows = opponentUids.map(uid => {
      const opp = allPlayers.find(p => p.uid === uid);
      // TODO: Localize "Player" fallback and "UNKNOWN" character
      return {
        uid,
        name: opp?.name || `Player ${uid.slice(-4)}`,
        characterName: opp?.characterName || 'UNKNOWN',
        deathsTo: killedBy[uid] || 0,
        finalHitsOn: killedPlayers[uid] || 0,
      };
    })
    // Sort by deaths descending as requested
    .sort((a, b) => b.deathsTo - a.deathsTo);

    return (
      <div className="final-hits-breakdown">
        <div className="final-hits-list">
          {rows.map(row => (
            <div key={row.uid} className="final-hit-row">
              <span className="row-deaths" title="Deaths">{row.deathsTo}</span>
              <div className="row-center">
                <CharacterAvatar 
                  characterName={row.characterName}
                  playerName={row.name}
                  size={22}
                  className="row-avatar"
                />
                <span className="row-name" title={row.name}>{row.name}</span>
              </div>
              <span className="row-finalhits" title="Final Hits">{row.finalHitsOn}</span>
            </div>
          ))}
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
      <div className="card-kda">
        <KDADisplay
          kills={player.kills}
          deaths={player.deaths}
          assists={player.assists}
          finalHits={player.finalHits}
          hideRatioSection={true}
        />
      </div>
      <div className="card-back-content">
        {renderFinalHitsBreakdown()}
      </div>
      {/* Dev-only: show character UID at the bottom of the back face */}
      {isDev && (
        <div className="card-uid" title={`characterId: ${player.characterId}`}>
          {player.characterId}
        </div>
      )}
    </div>
  );
};

export default PlayerCardBack;
