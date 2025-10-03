import React from 'react';
import { Tag } from 'antd';

interface TeamStatsSummaryProps {
  kills?: number;
  deaths?: number;
  assists?: number;
  finalHits?: number;
  className?: string;
  isPlayerTeam?: boolean;
}

const TeamStatsSummary: React.FC<TeamStatsSummaryProps> = ({ kills, deaths, assists, finalHits, className = '', isPlayerTeam = true }) => {
  // Use blue for player team, volcano (orange-red) for enemy team
  const statColor = isPlayerTeam ? 'blue' : 'volcano';
  const ratioColor = isPlayerTeam ? 'geekblue' : 'orange';

  // TODO: Localize labels
  const items: Array<{ key: string; value: number | undefined; label: string }> = [
    { key: 'kills', value: kills, label: 'K' },
    { key: 'deaths', value: deaths, label: 'D' },
    { key: 'assists', value: assists, label: 'A' },
    { key: 'finalHits', value: finalHits, label: 'FH' },
  ];

  // Only render items that have a numeric value (allow 0)
  const rendered = items.filter(i => typeof i.value === 'number');

  if (rendered.length === 0) return null;

  // Compute team ratios safely
  const killsNum = Number(kills ?? 0);
  const deathsNum = Number(deaths ?? 0);
  const assistsNum = Number(assists ?? 0);
  const finalHitsNum = Number(finalHits ?? 0);

  const computeRatio = (num: number, denom: number) => {
    if (denom <= 0) return '—';
    return (num / denom).toFixed(2);
  };

  const kd = computeRatio(killsNum, deathsNum);
  const kda = deathsNum <= 0 ? (killsNum + assistsNum).toFixed(2) : ((killsNum + assistsNum) / deathsNum).toFixed(2);
  const fhd = computeRatio(finalHitsNum, deathsNum);

  return (
    <div className={`team-stats-summary ${className}`.trim()}>
      {rendered.map(item => (
        <Tag key={item.key} color={statColor} className="team-stat-tag">
          <span className="team-stat-label">{item.label}</span>
          <span className="team-stat-value">{item.value}</span>
        </Tag>
      ))}

      {/* Ratio tags */}
      <Tag color={ratioColor} className="team-ratio-tag" key="kd">KD: {kd}</Tag>
      <Tag color={ratioColor} className="team-ratio-tag" key="kda">KDA: {kda}</Tag>
      <Tag color={ratioColor} className="team-ratio-tag" key="fhd">FHD: {fhd}</Tag>
    </div>
  );
}

export default TeamStatsSummary;
