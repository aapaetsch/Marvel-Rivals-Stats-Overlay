import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import { RootReducer } from 'app/shared/rootReducer';
import { PlayerStats } from 'screens/background/types/matchStatsTypes';

const { Title } = Typography;

type Totals = {
  finalHits: number;
  totalDamage: number;
  totalBlocked: number;
  totalHealing: number;
};

const TeamStatsWidget: React.FC = () => {
  const match = useSelector((s: RootReducer) => s.matchStatsReducer.currentMatch);

  const perTeam = useMemo(() => {
    const totals: Record<number, Totals> = {};
    const players = Object.values(match.players || {}) as PlayerStats[];
    for (const p of players) {
      if (!totals[p.team]) {
        totals[p.team] = { finalHits: 0, totalDamage: 0, totalBlocked: 0, totalHealing: 0 };
      }
      totals[p.team].finalHits += p.finalHits || 0;
      totals[p.team].totalDamage += p.damageDealt || 0;
      totals[p.team].totalBlocked += p.damageBlocked || 0;
      totals[p.team].totalHealing += p.totalHeal || 0;
    }
    return totals;
  }, [match]);

  const teamIds = Object.keys(perTeam).map(k => Number(k)).sort((a,b)=>a-b);

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Title level={4} style={{ margin: 0 }}>Team Stats</Title>
      </div>
      <div className="status-card-body">
        <div className="team-stats-grid">
          {teamIds.length === 0 && (
            <div className="team-stat">No team data</div>
          )}
          {teamIds.map(id => (
            <div className="team-stat" key={id}>
              <div className="team-stat-title">Team {id}</div>
              <div className="team-stat-row"><span>Final Hits</span><span>{perTeam[id].finalHits}</span></div>
              <div className="team-stat-row"><span>Damage</span><span>{perTeam[id].totalDamage}</span></div>
              <div className="team-stat-row"><span>Blocked</span><span>{perTeam[id].totalBlocked}</span></div>
              <div className="team-stat-row"><span>Healing</span><span>{perTeam[id].totalHealing}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamStatsWidget;

