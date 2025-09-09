import React from 'react';
import './Gauge.css';

type GaugeMode = 'half' | 'threeQuarter' | 'full';
type GaugeVariant = 'arc' | 'bar';

interface GaugeProps {
  value: number; // 0-100
  size?: number; // px
  strokeWidth?: number; // px
  mode?: GaugeMode;
  color?: string; // stroke color
  textColor?: string; // center text color
  label?: string; // optional label under value
  variant?: GaugeVariant; // arc or horizontal bar
}

const angles: Record<GaugeMode, { start: number; end: number }> = {
  // Half circle with flat side at bottom (opening faces down), arc on top
  // Using -90 offset in polarToCartesian, 270->left, 450->right across the top
  half: { start: 270, end: 450 },
  threeQuarter: { start: 135, end: 405 },
  full: { start: 0, end: 360 },
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  size = 72,
  strokeWidth = 8,
  mode = 'half',
  color = '#52c41a',
  textColor = '#ffffff',
  label,
  variant = 'bar',
}) => {
  const v = Math.max(0, Math.min(100, value));
  if (variant === 'arc') {
    const { start, end } = angles[mode];
    const sweep = end - start;
    const filled = start + (sweep * v) / 100;
    const halfStroke = strokeWidth / 2;
    const cx = size / 2;
    const cy = size / 2;
    const radius = cx - halfStroke - 1;
    const bgPath = describeArc(cx, cy, radius, start, end);
    const fgPath = describeArc(cx, cy, radius, start, filled);
    return (
      <div className="gauge" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={bgPath} stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
          <path d={fgPath} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        </svg>
        <div className="gauge-center" style={{ color: textColor }}>
          <div className="gauge-value">{v}%</div>
          {label && <div className="gauge-label">{label}</div>}
        </div>
      </div>
    );
  }

  // horizontal bar
  return (
    <div className="gauge gauge-bar" style={{ width: size, height: strokeWidth }}>
      <div className="gauge-track" style={{ height: strokeWidth }} />
      <div className="gauge-fill" style={{ width: `${v}%`, background: color, height: strokeWidth }} />
      <div className="gauge-center" style={{ color: textColor }}>
        <div className="gauge-value">{v}%</div>
        {label && <div className="gauge-label">{label}</div>}
      </div>
    </div>
  );
};

export default Gauge;
