import React from 'react';
import { TeamData, PlayerCardData } from '../types/MatchCardTypes';
import TeamSection from './TeamSection';

interface MatchCardGridProps {
  teams: TeamData[];
  flippedCards: { [cardId: string]: boolean };
  onCardFlip: (cardId: string) => void;
  allPlayers?: PlayerCardData[];
}

const MatchCardGrid: React.FC<MatchCardGridProps> = ({ teams, flippedCards, onCardFlip, allPlayers = [] }) => {
  return (
    <div className="match-card-grid">
      {teams.map((team) => (
        <TeamSection
          key={team.teamNumber}
          team={team}
          flippedCards={flippedCards}
          onCardFlip={onCardFlip}
          allPlayers={allPlayers}
        />
      ))}
    </div>
  );
};

export default MatchCardGrid;