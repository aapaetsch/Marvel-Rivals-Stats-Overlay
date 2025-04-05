import React from 'react';
import { Row, Col, Tabs, Typography, Card, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { MatchStatsState, PlayerStats } from '../../../background/types/matchStatsTypes';
import MatchTableComponent, { PlayerDataItem } from '../shared/MatchTableComponent';
import '../styles/MatchDetailView.css';

const { TabPane } = Tabs;

interface MatchDetailViewProps {
  matchData: MatchStatsState;
}

const MatchDetailView: React.FC<MatchDetailViewProps> = ({ matchData }) => {
  const { t } = useTranslation();
  
  // Format timestamp
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };
  
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
  
  return (
    <div className="match-detail-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="match-info-card">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic 
                  title={t('components.desktop.match-detail.match-id', 'Match ID')}
                  value={matchData.matchId || 'N/A'}
                  className="match-stat"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title={t('components.desktop.match-detail.match-time', 'Match Time')}
                  value={`${formatTime(matchData.timestamps?.matchStart)} - ${formatTime(matchData.timestamps?.matchEnd)}`}
                  className="match-stat"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title={t('components.desktop.match-detail.map', 'Map')}
                  value={matchData.map || 'Unknown'}
                  className="match-stat"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title={t('components.desktop.match-detail.outcome', 'Outcome')}
                  value={matchData.outcome || 'Unknown'}
                  valueStyle={{ 
                    color: matchData.outcome === 'Victory' 
                      ? '#3f8600' 
                      : matchData.outcome === 'Defeat' 
                        ? '#cf1322' 
                        : '#1890ff'
                  }}
                  className="match-stat"
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={24}>
          <Tabs defaultActiveKey="1">
            <TabPane 
              tab={t('components.desktop.match-detail.teammates', 'Teammates')}
              key="1"
            >
              <MatchTableComponent 
                players={teammates}
                showTeams={false}
                showAvatar={true}
                translationPrefix="match-detail"
                compact={true}
                showSortControls={false}
              />
            </TabPane>
            <TabPane 
              tab={t('components.desktop.match-detail.opponents', 'Opponents')}
              key="2"
            >
              <MatchTableComponent 
                players={opponents}
                showTeams={false}
                showAvatar={true}
                translationPrefix="match-detail"
                compact={true}
                showSortControls={false}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default MatchDetailView;