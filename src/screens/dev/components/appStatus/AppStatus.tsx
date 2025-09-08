import React from 'react';
import GameStatusWidget from './widgets/GameStatusWidget';
import MatchSummaryWidget from './widgets/MatchSummaryWidget';
import LocalPlayerWidget from './widgets/LocalPlayerWidget';
import TeamStatsWidget from './widgets/TeamStatsWidget';
import AlliesWidget from './widgets/AlliesWidget';
import OpponentsWidget from './widgets/OpponentsWidget';
import EventHealthWidget from './widgets/EventHealthWidget';
import './styles/AppStatus.css';

const AppStatus: React.FC = () => {
  return (
    <div className="app-status-root dev-window">
      <div className="app-status-2col">
        <div className="left-col">
          <div className="app-status-grid-item"><GameStatusWidget /></div>
          <div className="app-status-grid-item"><EventHealthWidget /></div>
        </div>
        <div className="right-col">
          <div className="app-status-grid-item"><MatchSummaryWidget /></div>
          <div className="app-status-grid-item"><LocalPlayerWidget /></div>
          <div className="app-status-grid-item wide"><TeamStatsWidget /></div>
          <div className="app-status-grid-item"><AlliesWidget /></div>
          <div className="app-status-grid-item"><OpponentsWidget /></div>
        </div>
        
      </div>
    </div>
  );
};

export default AppStatus;
