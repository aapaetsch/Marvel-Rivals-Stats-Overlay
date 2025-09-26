import React from 'react';
import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { Collapse } from 'antd';
import MatchInfoCard from './MatchInfoCard';
import MatchTable from './MatchTable';
import LiveMatchCover from '../matchTabNew/components/LiveMatchCover';
import { shouldShowCardViewCover, hasAnyMatchData } from 'lib/matchStatusUtils';
import '../styles/MatchInfo.css';

const { Panel } = Collapse;

// MatchInfo component to display current match information
const MatchInfo = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const { forceShowCardViewCover } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);

  // Check if data is available
  const hasMatchData = hasAnyMatchData(currentMatch);
  // Determine whether to show the cover using tri-state override
  const showCover = shouldShowCardViewCover(currentMatch, forceShowCardViewCover);

  // When the cover is visible, hide overflow-y on the global main scroller to prevent page scroll
  React.useEffect(() => {
    const scroller = document.querySelector('.desktop__main-scroller') as HTMLElement | null;
    if (!scroller) return;
    const prevOverflowY = scroller.style.overflowY;
    if (showCover) {
      scroller.style.overflowY = 'hidden';
    } else {
      scroller.style.overflowY = prevOverflowY || '';
    }
    return () => {
      if (scroller) scroller.style.overflowY = prevOverflowY || '';
    };
  }, [showCover]);
  
  return (
    <div className={`match-info-container${showCover ? ' no-scroll' : ''}`} style={{ position: 'relative' }}>
      {/* Full-page cover that overlays the entire Match Info area (players + info) */}
      {showCover && (
          <LiveMatchCover
            hasAnyMatchData={hasMatchData}
            onRefresh={() => window.location.reload()}
          />
      )}
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