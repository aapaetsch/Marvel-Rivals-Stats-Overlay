import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import { RootReducer } from 'app/shared/rootReducer';
import { PlayerStats } from 'screens/background/types/matchStatsTypes';

const { Title } = Typography;

const Row: React.FC<{ p: PlayerStats }> = ({ p }) => (
  <div className="mini-row">
    <div className="mini-col name">{p.name}</div>
    <div className="mini-col char">{p.characterName || '—'}</div>
    <div className="mini-col kda">{p.kills}/{p.deaths}/{p.assists}</div>
    <div className="mini-col fh">FH {p.finalHits}</div>
    {typeof p.ultCharge === 'number' && <div className="mini-col ult">Ult {Math.round(p.ultCharge)}%</div>}
  </div>
);

const AlliesWidget: React.FC = () => {
  const match = useSelector((s: RootReducer) => s.matchStatsReducer.currentMatch);
  const allies = useMemo(() => (Object.values(match.players || {}) as PlayerStats[]).filter(p => p.isTeammate), [match]);

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Title level={4} style={{ margin: 0 }}>Allies</Title>
      </div>
      <div className="status-card-body">
        <div className="mini-table">
          {allies.length === 0 && <div className="mini-row">No data</div>}
          {allies.map(p => <Row key={p.uid} p={p} />)}
        </div>
      </div>
    </div>
  );
};

export default AlliesWidget;

