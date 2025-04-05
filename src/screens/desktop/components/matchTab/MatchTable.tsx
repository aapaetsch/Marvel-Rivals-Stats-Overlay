import React from 'react';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import MatchTableComponent, { PlayerDataItem } from '../shared/MatchTableComponent';

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
    damageBlocked: player.damageBlocked || 0
  }));
  
  return (
    <MatchTableComponent 
      players={players}
      showTeams={true}
      showAvatar={false}
      translationPrefix="match-info"
      compact={false}
      showSortControls={true}
    />
  );
};

export default MatchTable;