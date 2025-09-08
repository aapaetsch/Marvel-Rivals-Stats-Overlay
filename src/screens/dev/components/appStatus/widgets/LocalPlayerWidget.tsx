import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Descriptions, Progress } from 'antd';
import { RootReducer } from 'app/shared/rootReducer';
import { PlayerStats } from 'screens/background/types/matchStatsTypes';

const { Title, Text } = Typography;

const LocalPlayerWidget: React.FC = () => {
  const match = useSelector((s: RootReducer) => s.matchStatsReducer.currentMatch);

  const local = useMemo(() => {
    const players = Object.values(match.players || {}) as PlayerStats[];
    return players.find(p => p.isLocal) || null;
  }, [match]);

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Title level={4} style={{ margin: 0 }}>Local Player</Title>
      </div>
      <div className="status-card-body">
        {!local && <Text type="secondary">Local player not detected</Text>}
        {local && (
          <>
            <Descriptions size="small" column={1} labelStyle={{ width: 130 }}>
              <Descriptions.Item label="Name">{local.name}</Descriptions.Item>
              <Descriptions.Item label="Character">{local.characterName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Team">{local.team}</Descriptions.Item>
              <Descriptions.Item label="K / D / A">{local.kills} / {local.deaths} / {local.assists}</Descriptions.Item>
              <Descriptions.Item label="Final Hits">{local.finalHits}</Descriptions.Item>
              <Descriptions.Item label="Damage Dealt">{local.damageDealt}</Descriptions.Item>
              <Descriptions.Item label="Blocked">{local.damageBlocked}</Descriptions.Item>
              <Descriptions.Item label="Healing">{local.totalHeal}</Descriptions.Item>
              <Descriptions.Item label="Ult Charge">
                {typeof local.ultCharge === 'number' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Progress percent={Math.round(local.ultCharge)} size="small" style={{ minWidth: 120 }} />
                    <Text>{Math.round(local.ultCharge)}%</Text>
                  </div>
                ) : '—'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </div>
    </div>
  );
};

export default LocalPlayerWidget;

