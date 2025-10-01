import React from 'react';
import { Row, Col } from 'antd';
import { MatchStatsState, PlayerStats } from '../../../background/types/matchStatsTypes';
import MatchTableComponent, { PlayerDataItem } from '../shared/MatchTableComponent';
import '../styles/MatchDetailView.css';

interface MatchDetailViewProps {
  matchData: MatchStatsState;
}

const MatchDetailView: React.FC<MatchDetailViewProps> = ({ matchData }) => {
  
  // Prepare player data for tables
  const teammates: PlayerDataItem[] = Object.values(matchData.players || {})
    .filter((player: PlayerStats) => player.isTeammate)
    .map((player: PlayerStats) => ({
      key: player.uid,
      name: player.name,
      characterName: player.characterName,
      isLocal: player.isLocal,
      isTeammate: true,
      kills: player.kills || 0,
      deaths: player.deaths || 0,
      assists: player.assists || 0,
      finalHits: player.finalHits || 0,
      damageDealt: player.damageDealt || 0,
      totalHeal: player.totalHeal || 0,
      damageBlocked: player.damageBlocked || 0
    }));
    
  const opponents: PlayerDataItem[] = Object.values(matchData.players || {})
    .filter((player: PlayerStats) => !player.isTeammate)
    .map((player: PlayerStats) => ({
      key: player.uid,
      name: player.name,
      characterName: player.characterName,
      isLocal: false,
      isTeammate: false,
      kills: player.kills || 0,
      deaths: player.deaths || 0,
      assists: player.assists || 0,
      finalHits: player.finalHits || 0,
      damageDealt: player.damageDealt || 0,
      totalHeal: player.totalHeal || 0,
      damageBlocked: player.damageBlocked || 0
    }));
  
  // combined players in order: allies first, separator logic in MatchTableComponent will render a blank separator row
  const combinedPlayers: PlayerDataItem[] = [
    ...teammates,
    ...opponents
  ];

  return (
    <div className="match-detail-container">
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <div className="team-section">
            <MatchTableComponent
              players={combinedPlayers}
              showTeams={true}
              showAvatar={true}
              translationPrefix="match-detail"
              compact={true}
              showSortControls={false}
              className="players-table match-detail-table"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MatchDetailView;