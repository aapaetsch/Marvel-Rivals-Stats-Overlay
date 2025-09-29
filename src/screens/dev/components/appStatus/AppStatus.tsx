import React, { useEffect, useRef, useState } from 'react';
import { Typography } from 'antd';
import GameStatusWidget from './widgets/GameStatusWidget';
import MatchSummaryWidget from './widgets/MatchSummaryWidget';
import LocalPlayerWidget from './widgets/LocalPlayerWidget';
import TeamStatsWidget from './widgets/TeamStatsWidget';
import AlliesWidget from './widgets/AlliesWidget';
import OpponentsWidget from './widgets/OpponentsWidget';
import EventHealthWidget from './widgets/EventHealthWidget';
import MatchHistoryDataWidget from './widgets/MatchHistoryDataWidget';
import './styles/AppStatus.css';
import CardViewCoverOverride from './CardViewCoverOverride';

const { Title } = Typography;

const AppStatus: React.FC = () => {
  const eventRef = useRef<HTMLDivElement | null>(null);
  const [eventHeight, setEventHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = eventRef.current;
    if (!el) return;
    const measure = () => setEventHeight(Math.ceil(el.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="app-status-root dev-window">
      <div className="left-col grid grid-cols-12 gap-3">
        {/* Keep refs to measure EventHealth height and pass to GameStatus */}
        <div className="app-status-grid-item col-span-6">
          <GameStatusWidget matchHeight={eventHeight} />
        </div>
        <div ref={eventRef} className="app-status-grid-item col-span-6">
          <EventHealthWidget />
        </div>

        {/* Second row */}
        <div className="app-status-grid-item col-span-4"><LocalPlayerWidget /></div>
        <div className="app-status-grid-item col-span-4"><AlliesWidget /></div>
        <div className="app-status-grid-item col-span-4"><OpponentsWidget /></div>

        {/* Third row */}
        <div className="app-status-grid-item col-span-3 row-span-2"><MatchSummaryWidget /></div>
        <div className="app-status-grid-item col-span-9"><TeamStatsWidget /></div>

        {/* Fourth row */}
        <div className="app-status-grid-item col-span-9">
          <div className="status-card">
            <div className="status-card-header">
              <Title level={4} style={{ margin: 0 }}>Card View Cover Override</Title>
            </div>
            <div className="status-card-body">
              <CardViewCoverOverride />
            </div>
          </div>
        </div>
        {/* Fifth row */}
        <div className="app-status-grid-item col-span-3">
          <MatchHistoryDataWidget />
        </div>
      </div>
    </div>
  );
};

export default AppStatus;

