import React from 'react';

interface TeamStatsSummaryProps {
  kills?: number;
  deaths?: number;
  assists?: number;
  finalHits?: number;
  className?: string;
}

const TeamStatsSummary: React.FC<TeamStatsSummaryProps> = ({ kills, deaths, assists, finalHits, className = '' }) => {
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

  return (
    <div className={`team-stats-summary ${className}`.trim()}>
      {rendered.map(item => (
        <div className="team-stat" key={item.key}>
          <span className="team-stat-value">{item.value}</span>
          <span className="team-stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TeamStatsSummary;
