import React from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Button } from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import '../styles/LiveMatchCover.css';

interface LiveMatchCoverProps {
  hasAnyMatchData: boolean; // Whether there's any match data available (to distinguish no match vs ended match)
  onRefresh?: () => void; // Optional refresh callback
}

const LiveMatchCover: React.FC<LiveMatchCoverProps> = ({ hasAnyMatchData, onRefresh }) => {
  const { t } = useTranslation();
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (el && typeof el.focus === 'function') {
      el.focus({ preventScroll: true } as FocusOptions);
    }
    return () => {
      if (el && typeof el.blur === 'function') el.blur();
    };
  }, []);

  const handleBlock = (e: React.WheelEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const keysToBlock = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (keysToBlock.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const title = hasAnyMatchData
    ? t('components.desktop.match-tab-new.cover-ended-title', 'Match Ended')
    : t('components.desktop.match-tab-new.cover-no-match-title', 'No Live Match');

  const description = hasAnyMatchData
    ? t('components.desktop.match-tab-new.cover-ended-desc', 'The match has ended. Cards will show the final match data until you return to the lobby.')
    : t('components.desktop.match-tab-new.cover-no-match-desc', 'Start a Marvel Rivals match to see live player statistics and team data in card view.');

  const icon = hasAnyMatchData
    ? <ReloadOutlined style={{ fontSize: 64, color: 'var(--primary-color-medium)' }} />
    : <PlayCircleOutlined style={{ fontSize: 64, color: 'var(--primary-color-medium)' }} />;

  return (
    <div
      className="card-view-cover"
      ref={rootRef}
      tabIndex={0}
      onWheel={handleBlock}
      onTouchMove={handleBlock}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div className="card-view-cover-content">
        <Empty
          image={icon}
          imageStyle={{
            height: 80,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          description={
            <div className="cover-text">
              <h3 className="cover-title">{title}</h3>
              <p className="cover-description">{description}</p>
            </div>
          }
        >
          {onRefresh && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              className="refresh-button"
            >
              {t('components.desktop.match-tab-new.refresh', 'Refresh')}
            </Button>
          )}
        </Empty>
      </div>
      {/* {hasAnyMatchData && (
        <div className="cover-notice">
          <p>{t('components.desktop.match-tab-new.cover-notice', 'Cards below show the final match statistics')}</p>
        </div>
      )} */}
    </div>
  );
};

export default LiveMatchCover;
