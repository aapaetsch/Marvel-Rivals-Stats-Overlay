import React from 'react';
import { TeamData, PlayerCardData } from '../types/MatchCardTypes';
import PlayerCard from './PlayerCard';
import TeamStatsSummary from './TeamStatsSummary';

interface TeamSectionProps {
  team: TeamData;
  flippedCards: { [cardId: string]: boolean };
  onCardFlip: (cardId: string) => void;
  allPlayers?: PlayerCardData[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ team, flippedCards, onCardFlip, allPlayers = [] }) => {
  const getTeamLabel = () => {
    // TODO: localize "Player Team" and "Enemy Team"
    return team.isPlayerTeam ? 'Player Team' : 'Enemy Team';
  };

  const getTeamClass = () => {
    return team.isPlayerTeam ? 'team-section-friendly' : 'team-section-enemy';
  };

  // Calculate team totals
  const teamStats = team.players.reduce((totals, player) => ({
    kills: totals.kills + player.kills,
    deaths: totals.deaths + player.deaths,
    assists: totals.assists + player.assists,
    finalHits: totals.finalHits + player.finalHits,
    damage: totals.damage + player.damageDealt,
    blocked: totals.blocked + player.damageBlocked,
    healing: totals.healing + player.totalHeal
  }), {
    kills: 0,
    deaths: 0,
    assists: 0,
    finalHits: 0,
    damage: 0,
    blocked: 0,
    healing: 0
  });

  // Note: large number format not needed after removing dmg/blk/heal summary
  return (
    <div className={`team-section ${getTeamClass()}`}>
      <div className="team-header">
        <div className="team-info">
          <h3 className="team-label">
            {getTeamLabel()}
            {/* TODO: Localize Winner */}
            {team.isWinner ? <span className="team-tag winner">Winner</span> : null}
          </h3>
        </div>
        <TeamStatsSummary
          kills={teamStats.kills}
          deaths={teamStats.deaths}
          assists={teamStats.assists}
          finalHits={teamStats.finalHits}
        />
      </div>
      <div className="team-cards">
        {team.players.map((player) => (
          <PlayerCard
            key={player.uid}
            player={player}
            isFlipped={flippedCards[player.uid] || false}
            onFlip={() => onCardFlip(player.uid)}
            allPlayers={allPlayers}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
