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

  const defaultMatchInfo = {
    matchId: "N/A",
    map: "Unknown",
    gameType: "Unknown",
    gameMode: "Unknown",
    outcome: t("components.desktop.match-info.inProgress"),
    timestamps: { matchStart: null, matchEnd: null },
  };

  const matchData = hasMatchData ? currentMatch : defaultMatchInfo;
  
  return (
    <Card className="match-info-card">
      <Descriptions 
        bordered
        size="small"
        column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label={t("components.desktop.match-info.game-type")}>
          {matchData.gameType}
        </Descriptions.Item>
        <Descriptions.Item label={t("components.desktop.match-info.game-mode")}>
          {matchData.gameMode}
        </Descriptions.Item>
        <Descriptions.Item label={t("components.desktop.match-info.map")}>
          {matchData.map}
        </Descriptions.Item>
        <Descriptions.Item label={t("components.desktop.match-info.outcome")}>
          {matchData.outcome}
        </Descriptions.Item>
        <Descriptions.Item label={t("components.desktop.match-info.time")}>
          {formatTimestamp(matchData.timestamps.matchStart)}&nbsp;-&nbsp;{formatTimestamp(matchData.timestamps.matchEnd)}
        </Descriptions.Item>
        <Descriptions.Item label={t("components.desktop.match-info.duration")}>
          {matchData.timestamps.matchEnd ? Math.floor((matchData.timestamps.matchEnd - (matchData.timestamps?.matchStart ?? 0)) / 60) : "N/A"} minutes
        </Descriptions.Item>
        <Descriptions.Item label={t("components.desktop.match-info.id")}>
          {matchData.matchId}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default MatchInfoCard;
