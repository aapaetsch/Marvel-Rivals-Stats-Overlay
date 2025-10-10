import React, { useEffect, useRef, useState } from 'react';
import GameStatusWidget from './widgets/GameStatusWidget';
import MatchSummaryWidget from './widgets/MatchSummaryWidget';
import LocalPlayerWidget from './widgets/LocalPlayerWidget';
import TeamStatsWidget from './widgets/TeamStatsWidget';
import AlliesWidget from './widgets/AlliesWidget';
import OpponentsWidget from './widgets/OpponentsWidget';
import EventHealthWidget from './widgets/EventHealthWidget';
import './styles/AppStatus.css';

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

  {/* Spacer to consume the row where MatchSummaryWidget is still spanning so the next row has full 12 columns free */}
  <div className="app-status-grid-item col-span-9" aria-hidden style={{ height: 0, overflow: 'hidden' }} />

  {/* Fourth row: Match override controls and swapbar controls side-by-side */}
        {/* <div className="app-status-grid-item col-span-6">
          <div className="status-card">
            <div className="status-card-header">
              <Title level={4} style={{ margin: 0 }}>Match Override Controls</Title>
            </div>
            <div className="status-card-body">
              <CardViewCoverOverride />
            </div>
          </div>
        </div>
        <div className="app-status-grid-item col-span-6">
          <div className="status-card">
            <div className="status-card-header">
              <Title level={4} style={{ margin: 0 }}>Character Swap Bar Override Controls</Title>
            </div>
            <div className="status-card-body">
              <SwapBarTestWidget />
            </div>
          </div>
        </div> */}
        {/* Override controls moved to the Overrides tab to keep App Status focused */}
      </div>
    </div>
  );
};

export default AppStatus;

