import React from 'react';
import { Typography } from 'antd';
import CardViewCoverOverride from './appStatus/CardViewCoverOverride';
import SwapBarTestWidget from './appStatus/widgets/SwapBarTestWidget';
import PlayerStatsTestWidget from './appStatus/widgets/PlayerStatsTestWidget';
import './appStatus/styles/AppStatus.css';

const { Title } = Typography;

const OverridesTab: React.FC = () => {
  return (
    <div className="overrides-root dev-window" style={{ padding: 8 }}>
      <div className="left-col grid grid-cols-12 gap-3">
        {/* Left column: Match-related controls stacked vertically */}
        <div className="app-status-grid-item col-span-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="status-card">
              <div className="status-card-header" style={{ padding: '6px 8px' }}>
                <Title level={5} style={{ margin: 0, fontSize: 14 }}>Match Override Controls</Title>
              </div>
              <div className="status-card-body" style={{ padding: 8 }}>
                <CardViewCoverOverride />
              </div>
            </div>

            <div className="status-card">
              <div className="status-card-header" style={{ padding: '6px 8px' }}>
                <Title level={5} style={{ margin: 0, fontSize: 14 }}>Player Stats Overlay Controls</Title>
              </div>
              <div className="status-card-body" style={{ padding: 8 }}>
                <PlayerStatsTestWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Swap bar controls */}
        <div className="app-status-grid-item col-span-6">
          <div className="status-card">
            <div className="status-card-header" style={{ padding: '6px 8px' }}>
              <Title level={5} style={{ margin: 0, fontSize: 14 }}>Character Swap Bar Override Controls</Title>
            </div>
            <div className="status-card-body" style={{ padding: 8 }}>
              <SwapBarTestWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverridesTab;
