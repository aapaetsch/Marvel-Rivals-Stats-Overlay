import React from 'react';
import { Card, Descriptions } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import { MatchOutcome } from '../../../background/types/matchStatsTypes';
import '../styles/MatchInfoCard.css';

const MatchInfoCard: React.FC = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Check if data is available
  const hasMatchData = currentMatch && (currentMatch.matchId || Object.keys(currentMatch.players).length > 0);
  
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString();
  };
  
  if (!hasMatchData) {
    return (
      <Card className="match-info-card empty-card">
        <p className="no-data-message">
          {t("components.desktop.match-info.no-data")}
        </p>
      </Card>
    );
  }
  
  return (
    <Card 
      className="match-info-card"
      title={t("components.desktop.match-info.title")}
    >
      <Descriptions 
        bordered
        size="small"
        column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label={t("components.desktop.match-info.id")}>
          {currentMatch.matchId || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label={t("components.desktop.match-info.map")}>
          {currentMatch.map || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label={t("components.desktop.match-info.game-type")}>
          {currentMatch.gameType || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label={t("components.desktop.match-info.game-mode")}>
          {currentMatch.gameMode || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label={t("components.desktop.match-info.outcome")}>
          {currentMatch.outcome !== MatchOutcome.Unknown ? currentMatch.outcome : t("components.desktop.match-info.inProgress")}
        </Descriptions.Item>
        
        <Descriptions.Item label={t("components.desktop.match-info.time")}>
          {formatTimestamp(currentMatch.timestamps.matchStart)}&nbsp;-&nbsp;{formatTimestamp(currentMatch.timestamps.matchEnd)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default MatchInfoCard;
