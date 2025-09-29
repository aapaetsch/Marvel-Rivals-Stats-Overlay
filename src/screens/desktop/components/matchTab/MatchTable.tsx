import React from 'react';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import MatchTableComponent, { PlayerDataItem } from '../shared/MatchTableComponent';
import { matchTableTestPlayers } from 'screens/dev/testdata/matchTableTestData';

const MatchTable: React.FC = () => {
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Transform players data for the table
  const players: PlayerDataItem[] = Object.values(currentMatch.players || {}).map(player => ({
    key: player.uid,
    name: player.name,
    characterName: player.characterName,
    team: player.team,
    isLocal: player.isLocal,
    isTeammate: player.isTeammate,
    kills: player.kills || 0,
    deaths: player.deaths || 0,
    assists: player.assists || 0,
    finalHits: player.finalHits || 0,
    damageDealt: player.damageDealt || 0,
    totalHeal: player.totalHeal || 0,
    damageBlocked: player.damageBlocked || 0,
    // Include final hits data for the expandable rows
    killedPlayers: player.killedPlayers || {},
    killedBy: player.killedBy || {}
  }));

  // Generate dummy players using a lambda function
  const generateDummyPlayers = () => {
    // Create 6 teammates (isTeammate = true)
    const teammates = Array.from({ length: 6 }, (_, i) => ({
      key: `teammate${i}`,
      name: `Teammate ${i+1}`,
      characterName: `Character ${i+1}`,
      team: 1,
      isLocal: i === 0,
      isTeammate: true,
      kills: 0,
      deaths: 0,
      assists: 0,
      finalHits: 0,
      damageDealt: 0,
      totalHeal: 0,
      damageBlocked: 0
    }));

    // Create 6 opponents (isTeammate = false)
    const opponents = Array.from({ length: 6 }, (_, i) => ({
      key: `opponent${i}`,
      name: `Opponent ${i+1}`,
      characterName: `Character ${i+6}`,
      team: 2,
      isLocal: false,
      isTeammate: false,
      kills: 0,
      deaths: 0,
      assists: 0,
      finalHits: 0,
      damageDealt: 0,
      totalHeal: 0,
      damageBlocked: 0
    }));

    return [...teammates, ...opponents];
  };
  // If using test data globally, prefer that dataset; otherwise fallback to real players or generated dummies.
  const useTableTest = useSelector((state: RootReducer) => state.appSettingsReducer.settings.useMatchTableTestData);
  const tableData = useTableTest ? matchTableTestPlayers : (players.length > 0 ? players : generateDummyPlayers());
  
  return (
    <MatchTableComponent 
      players={tableData}
      showTeams={true}
      showAvatar={true}
      translationPrefix="match-info"
      compact={false}
      showSortControls={true}
    />
  );
};

export default MatchTable;