import React from 'react';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import { PlayerStats } from '../../../background/types/matchStatsTypes';
import PlayerCard from './PlayerCard';
import './CardView.css';

// Mock data for testing the card layout
const createMockPlayer = (name: string, character: string, team: number, isTeammate: boolean, stats: any): PlayerStats => ({
  uid: `mock-${name}`,
  name,
  characterName: character,
  characterId: character.toLowerCase(),
  team,
  isTeammate,
  isLocal: name === 'You',
  isAlive: true,
  kills: stats.kills || 0,
  finalHits: stats.finalHits || 0,
  deaths: stats.deaths || 0,
  assists: stats.assists || 0,
  ultCharge: isTeammate ? (stats.ultCharge || 75) : null,
  damageDealt: stats.damageDealt || 0,
  damageBlocked: stats.damageBlocked || 0,
  totalHeal: stats.totalHeal || 0,
  pctTeamDamage: stats.pctTeamDamage || 0,
  pctTeamBlocked: stats.pctTeamBlocked || 0,
  pctTeamHealing: stats.pctTeamHealing || 0,
  lastUpdated: Date.now(),
  killedPlayers: {},
  killedBy: {},
  characterSwaps: []
});

const mockTeammates = [
  createMockPlayer('You', 'Spider-Man', 1, true, { kills: 12, deaths: 3, assists: 8, damageDealt: 15420, pctTeamDamage: 25.3 }),
  createMockPlayer('IronFist42', 'Iron Fist', 1, true, { kills: 8, deaths: 5, assists: 12, damageDealt: 12800, pctTeamDamage: 21.1 }),
  createMockPlayer('StormQueen', 'Storm', 1, true, { kills: 6, deaths: 4, assists: 15, damageDealt: 9200, totalHeal: 8500, pctTeamHealing: 35.2 }),
  createMockPlayer('WebSlinger', 'Venom', 1, true, { kills: 10, deaths: 6, assists: 7, damageDealt: 11200, pctTeamDamage: 18.5 }),
  createMockPlayer('MarvelFan', 'Wolverine', 1, true, { kills: 9, deaths: 2, assists: 9, damageDealt: 13600, pctTeamDamage: 22.4 }),
  createMockPlayer('HeroTime', 'Captain America', 1, true, { kills: 4, deaths: 4, assists: 18, damageBlocked: 5200, pctTeamBlocked: 45.8 })
];

const mockOpponents = [
  createMockPlayer('DoomMaster', 'Doctor Doom', 2, false, { kills: 15, deaths: 2, assists: 6, damageDealt: 18500, pctTeamDamage: 28.7 }),
  createMockPlayer('ThanosPower', 'Thanos', 2, false, { kills: 11, deaths: 4, assists: 8, damageDealt: 14200, pctTeamDamage: 22.0 }),
  createMockPlayer('GreenGoblin', 'Green Goblin', 2, false, { kills: 8, deaths: 7, assists: 12, damageDealt: 10800, pctTeamDamage: 16.8 }),
  createMockPlayer('Magneto99', 'Magneto', 2, false, { kills: 7, deaths: 8, assists: 10, damageDealt: 9600, pctTeamDamage: 14.9 }),
  createMockPlayer('VenomBite', 'Carnage', 2, false, { kills: 9, deaths: 5, assists: 7, damageDealt: 11400, pctTeamDamage: 17.7 }),
  createMockPlayer('RedSkull', 'Red Skull', 2, false, { kills: 3, deaths: 6, assists: 14, totalHeal: 6200, pctTeamHealing: 42.1 })
];

// CardView component to display match stats as vertical cards
const CardView = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Get players and separate them into teammates and opponents
  const players = Object.values(currentMatch.players);
  const teammates = players.filter(player => player.isTeammate);
  const opponents = players.filter(player => !player.isTeammate);
  
  // Check if data is available
  const hasMatchData = currentMatch && (currentMatch.matchId || players.length > 0);
  
  // Use mock data if no real data is available (for testing)
  const finalTeammates = hasMatchData && teammates.length > 0 ? teammates : mockTeammates;
  const finalOpponents = hasMatchData && opponents.length > 0 ? opponents : mockOpponents;
  const showMockData = !hasMatchData || (teammates.length === 0 && opponents.length === 0);

  return (
    <div className="card-view-container">
      {showMockData && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: 'rgba(255, 193, 7, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          color: '#ffc107'
        }}>
          <strong>Demo Mode:</strong> Showing mock data for demonstration
        </div>
      )}
      
      <div className="card-view-grid">
        {/* Teammates Row */}
        <div className="team-row teammates-row">
          <h3 className="team-header">
            {t("components.desktop.card-view.teammates", "Teammates")} ({finalTeammates.length})
          </h3>
          <div className="cards-grid">
            {finalTeammates.map((player) => (
              <PlayerCard key={player.uid} player={player} />
            ))}
          </div>
        </div>
        
        {/* Opponents Row */}
        <div className="team-row opponents-row">
          <h3 className="team-header">
            {t("components.desktop.card-view.opponents", "Opponents")} ({finalOpponents.length})
          </h3>
          <div className="cards-grid">
            {finalOpponents.map((player) => (
              <PlayerCard key={player.uid} player={player} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardView;