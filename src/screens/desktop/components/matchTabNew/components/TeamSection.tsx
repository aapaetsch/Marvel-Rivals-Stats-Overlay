import React from 'react';
import { TeamData, PlayerCardData } from '../types/MatchCardTypes';
import PlayerCard from './PlayerCard';

interface TeamSectionProps {
  team: TeamData;
  flippedCards: { [cardId: string]: boolean };
  onCardFlip: (cardId: string) => void;
  allPlayers?: PlayerCardData[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ team, flippedCards, onCardFlip, allPlayers = [] }) => {
  const getTeamLabel = () => {
    return team.isPlayerTeam ? 'Your Team' : 'Enemy Team';
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={`team-section ${getTeamClass()}`}>
      <div className="team-header">
        <div className="team-info">
          <h3 className="team-label">{getTeamLabel()}</h3>
        </div>
        <div className="team-stats-summary">
          <div className="team-stat">
            <span className="team-stat-value">{teamStats.kills}</span>
            <span className="team-stat-label">K</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-value">{teamStats.deaths}</span>
            <span className="team-stat-label">D</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-value">{teamStats.assists}</span>
            <span className="team-stat-label">A</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-value">{teamStats.finalHits}</span>
            <span className="team-stat-label">FB</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-value">{formatNumber(teamStats.damage)}</span>
            <span className="team-stat-label">DMG</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-value">{formatNumber(teamStats.blocked)}</span>
            <span className="team-stat-label">BLK</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-value">{formatNumber(teamStats.healing)}</span>
            <span className="team-stat-label">HEAL</span>
          </div>
        </div>
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