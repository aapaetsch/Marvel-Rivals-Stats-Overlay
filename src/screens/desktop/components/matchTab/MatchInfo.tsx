import React from 'react';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import { Card, Collapse } from 'antd';
import MatchInfoCard from './MatchInfoCard';
import MatchTable from './MatchTable';
import '../styles/MatchInfo.css';

const { Panel } = Collapse;

// MatchInfo component to display current match information
const MatchInfo = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Check if data is available
  const hasMatchData = currentMatch && (currentMatch.matchId || Object.keys(currentMatch.players).length > 0);
  
  return (
    <div className="match-info-container">
      <Collapse 
        defaultActiveKey={['1', '2']} 
        className="match-info-collapse"
      >
        <Panel 
          header={t("components.desktop.match-info.players", "Players")} 
          key="2"
          className="match-players-panel"
        >
          <MatchTable />
        </Panel>
        <Panel 
          header={t("components.desktop.match-info.title", "Match Information")} 
          key="1"
          className="match-info-panel"
        >
          <MatchInfoCard />
        </Panel>
      </Collapse>
    </div>
  );
};

export default MatchInfo;