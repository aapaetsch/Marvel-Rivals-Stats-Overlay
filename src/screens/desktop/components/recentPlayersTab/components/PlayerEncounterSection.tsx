import React from 'react';
import { Typography, Avatar } from 'antd';
import Gauge from '../../../../../components/Gauge/Gauge';
import { CharacterClass } from 'lib/characterClassIcons';
import { getClassImagePath } from 'lib/characterClassIcons';
import { getCharacterDefaultIconPath } from 'lib/characterIcons';
import { UserOutlined } from '@ant-design/icons';
import { RecentPlayerTeam } from '../RecentPlayerTypes';

const { Text } = Typography;

interface StatsMapItem { count: number; wins: number; losses: number }

interface PlayerEncounterSectionProps {
  variant: RecentPlayerTeam;
  title: string;
  count: number;
  expanded: boolean;
  collapsed: boolean;
  winRate: number;
  wins: number;
  losses: number;
  roleAgg: Record<CharacterClass, { wins: number; losses: number }>;
  statsMap: Record<string, StatsMapItem>;
  renderCharacterIcons: React.ReactNode | null;
  censor?: boolean;
  onClickHeader?: () => void;
}

const PlayerEncounterSection: React.FC<PlayerEncounterSectionProps> = ({
  variant,
  title,
  count,
  expanded,
  collapsed,
  winRate,
  wins,
  losses,
  roleAgg,
  statsMap,
  renderCharacterIcons,
  censor = false,
  onClickHeader,
}) => {
  const gaugeColor = variant === RecentPlayerTeam.Opponent ? '#ff4d4f' : '#52c41a';
  const colClass = `rpc-col ${variant === RecentPlayerTeam.Ally ? 'ally' : (variant === RecentPlayerTeam.Opponent ? 'opponent' : null)} ${expanded && !collapsed ? 'expanded' : ''}`;

  const roleRows = (Object.values(CharacterClass) as CharacterClass[]).map((cls) => {
    const r = roleAgg[cls] || { wins: 0, losses: 0 };
    const t = (r.wins || 0) + (r.losses || 0);
    const pct = t > 0 ? Math.round((r.wins / t) * 100) : 0;
    return (
      <div className="role-row" key={`${variant}-role-${cls}`}>
        <Avatar shape="square" size={20} src={getClassImagePath(cls)} className="character-icon-small" />
        <span className="role-pct">{pct}%</span>
        <span className="role-name">{cls}</span>
        <span className="role-wl-text">{r.wins}W-{r.losses}L</span>
      </div>
    );
  });

  const breakdownRows = Object.entries(statsMap || {})
    .sort((a, b) => (b[1]?.count || 0) - (a[1]?.count || 0))
    .map(([name, s]) => {
      const total = (s?.wins || 0) + (s?.losses || 0);
      const pct = total > 0 ? Math.round((s.wins / total) * 100) : 0;
      const iconPath = censor ? undefined : getCharacterDefaultIconPath(name) || undefined;
      return (
        <div key={`${variant}-${name}`} className="breakdown-row">
          <Avatar shape="square" size={20} src={iconPath} className="character-icon-small" icon={censor ? <UserOutlined /> : undefined} />
          <span className="breakdown-pct">{pct}%</span>
          <span className="breakdown-name">{censor ? 'Hidden' : name}</span>
          <span className="breakdown-wl">{s.wins}W-{s.losses}L</span>
        </div>
      );
    });

  return (
    <div className={colClass} onClick={onClickHeader}>
      <div className="col-header">
        <Text className="col-title">{title}</Text>
        <span className="count-badge">{count}</span>
      </div>
      {collapsed && (
        <div className="col-collapsed-summary">
          <span className="summary-pct">{winRate}%</span>
          <span className="summary-wl">{wins}W - {losses}L</span>
        </div>
      )}
      {expanded ? (
        <div className="expanded-content">
          <div className="role-wl">{roleRows}</div>
          <div className="gauge-col">
            <Gauge value={winRate} color={gaugeColor} textColor="#ffffff" variant="arc" mode="half" size={88} strokeWidth={8} />
            <div className="wl closer">
              <Text className="stat-sub">{wins}W - {losses}L</Text>
            </div>
          </div>
        </div>
      ) : (!collapsed ? (
        <div className="col-stats">
          <Gauge value={winRate} color={gaugeColor} textColor="#ffffff" variant="arc" mode="half" size={88} strokeWidth={8} />
          <div className="wl closer">
            <Text className="stat-sub">{wins}W - {losses}L</Text>
          </div>
        </div>
      ) : null)}
      {!collapsed && (
        <div className="col-characters">{renderCharacterIcons}</div>
      )}
      {!collapsed && expanded && (
        <div className="col-breakdown">{breakdownRows}</div>
      )}
    </div>
  );
};

export default PlayerEncounterSection;

