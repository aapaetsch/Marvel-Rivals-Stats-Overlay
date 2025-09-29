import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Descriptions } from 'antd';
import Tag from 'components/Tag';
import { TagType } from 'components/Tag/TagTypes';
import { RootReducer } from 'app/shared/rootReducer';
import { MatchOutcome, PlayerStats } from 'screens/background/types/matchStatsTypes';

const { Title, Text } = Typography;

const fmtDuration = (ms?: number | null) => {
  if (!ms || ms <= 0) return '—';
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const MatchSummaryWidget: React.FC = () => {
  const match = useSelector((s: RootReducer) => s.matchStatsReducer.currentMatch);

  const { playersCount, teams, durationMs } = useMemo(() => {
    const players = Object.values(match.players || {}) as PlayerStats[];
    const teamSet = new Set(players.map(p => p.team));
    const start = match.timestamps.matchStart ?? null;
    const end = match.timestamps.matchEnd ?? Date.now();
    const duration = start ? Math.max(0, (match.timestamps.matchEnd ? end : Date.now()) - start) : null;
    return {
      playersCount: players.length,
      teams: Array.from(teamSet).sort((a,b)=>a-b),
      durationMs: duration,
    };
  }, [match]);

  const outcomeColor = match.outcome === MatchOutcome.Victory
    ? 'green'
    : match.outcome === MatchOutcome.Defeat
      ? 'red'
      : match.outcome === MatchOutcome.Draw
        ? 'gold'
        : 'default';

  // Map legacy color strings to TagType so the tag is theme-aware
  const outcomeTagType = outcomeColor === 'green'
    ? TagType.Success
    : outcomeColor === 'red'
      ? TagType.Danger
      : outcomeColor === 'gold'
        ? TagType.Warning
        : TagType.Neutral;

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Title level={4} style={{ margin: 0 }}>Match Summary</Title>
      </div>
      <div className="status-card-body">
        <Descriptions size="small" column={1} labelStyle={{ width: 120 }}>
          <Descriptions.Item label="Match ID">{match.matchId || '—'}</Descriptions.Item>
          <Descriptions.Item label="Map">{match.map || '—'}</Descriptions.Item>
          <Descriptions.Item label="Mode">{match.gameMode || '—'}</Descriptions.Item>
          <Descriptions.Item label="Type">{match.gameType || '—'}</Descriptions.Item>
          <Descriptions.Item label="Outcome">
            <Tag type={outcomeTagType}>{match.outcome}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Players">{playersCount || 0}</Descriptions.Item>
          <Descriptions.Item label="Teams">{teams.join(', ') || '—'}</Descriptions.Item>
          <Descriptions.Item label="Duration">{fmtDuration(durationMs)}</Descriptions.Item>
        </Descriptions>
        {!match.timestamps.matchStart && (
          <Text type="secondary">No active match detected</Text>
        )}
      </div>
    </div>
  );
};

export default MatchSummaryWidget;

