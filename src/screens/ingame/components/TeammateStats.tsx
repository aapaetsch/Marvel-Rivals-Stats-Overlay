import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { PlayerStatsProps, TeamateOptionsArrays, TeamStatProps } from "../types/teamateStatsTypes";
import { getCharacterDefaultIconPath } from "lib/characterIcons";
import { icons } from 'components';
import "./styles/playerStats.css";
import { useSelector } from 'react-redux';
import { RootState } from 'app/shared/store';

/**
 * Precise perimeter-progress border using SVG stroke.
 * - Starts at RIGHT CENTER and goes CLOCKWISE
 * - Uses non-scaling stroke so thickness stays constant in px
 * - Works for any card size/aspect ratio
 */
const UltBorderOverlay: React.FC<{
  pct: number;              // 0..100
  color: string;            // stroke color
  muted?: string;           // background ring color
  thickness?: number;       // px
  radiusPx?: number;        // corner radius in px
  opacity?: number;         // 0..1
}> = ({
  pct,
  color,
  muted = "rgba(255,255,255,0.15)",
  thickness = 3,
  radiusPx = 12,
  opacity = 1
}) => {
  const p = Math.max(0, Math.min(100, pct));
  const pathRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [total, setTotal] = useState(1);
  const [svgSize, setSvgSize] = useState({ width: 100, height: 100 });

  // Convert the requested corner radius (px) into viewBox units separately for X and Y
  // so we handle non-uniform scaling (preserveAspectRatio="none"). Also compute an
  // inset so the non-scaling stroke doesn't get clipped by the viewBox edges.
  const { rXVU, rYVU, insetVU } = useMemo(() => {
    const w = Math.max(1, svgSize.width);
    const h = Math.max(1, svgSize.height);
    const rX = Math.max(0, Math.min(50, (radiusPx / w) * 100));
    const rY = Math.max(0, Math.min(50, (radiusPx / h) * 100));
    // convert half of stroke thickness (px) to viewBox units along each axis and take a safe inset
    const insetX = (thickness / 2 / w) * 100;
    const insetY = (thickness / 2 / h) * 100;
    const inset = Math.max(1, Math.max(insetX, insetY));
    return { rXVU: rX, rYVU: rY, insetVU: inset };
  }, [radiusPx, svgSize.width, svgSize.height, thickness]);

  const d = useMemo(() => {
    // Rectangle from 0..100 with an inset to keep stroke inside bounds
    // Because stroke doesn't scale, keep the path slightly inset so rounded caps aren't clipped
    const left = insetVU, right = 100 - insetVU, top = insetVU, bot = 100 - insetVU;
    const rX = Math.max(0, Math.min(50, rXVU));
    const rY = Math.max(0, Math.min(50, rYVU));

    // Start at RIGHT CENTER
    const midY = (top + bot) / 2;

    // Construct a rounded rect path using elliptical arcs (rx ry) so X/Y scaling is respected.
    return [
      `M ${right} ${midY}`,
      `L ${right} ${bot - rY}`,
      `A ${rX} ${rY} 0 0 1 ${right - rX} ${bot}`,
      `L ${left + rX} ${bot}`,
      `A ${rX} ${rY} 0 0 1 ${left} ${bot - rY}`,
      `L ${left} ${top + rY}`,
      `A ${rX} ${rY} 0 0 1 ${left + rX} ${top}`,
      `L ${right - rX} ${top}`,
      `A ${rX} ${rY} 0 0 1 ${right} ${top + rY}`,
      `L ${right} ${midY}`,
      `Z`,
    ].join(" ");
  }, [rXVU, rYVU, insetVU]);

  useLayoutEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setTotal(len > 0 ? len : 1);
    }
  }, [d]);

  // Measure the SVG size so we can convert px radius → viewBox units accurately.
  useLayoutEffect(() => {
    const measure = () => {
      if (svgRef.current) {
        const r = svgRef.current.getBoundingClientRect();
        setSvgSize({ width: r.width || 100, height: r.height || 100 });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Use a two-value dash array so the dash+gap equals the full path length
  // and avoid fractional rounding gaps. Ensure exact 0 offset at 100%.
  const dashArray = `${total} ${total}`;
  const dashOffset = p >= 100 ? 0 : total * (1 - p / 100);

  return (
    <svg
      ref={svgRef}
      className="ultimate-border"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity
      }}
    >
      {/* Muted full ring behind */}
      <path
        d={d}
        fill="none"
        stroke={muted}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Progress ring */}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// Teammate Card component
const TeammateCard = ({ player, index }: { player: PlayerStatsProps; index: number }) => {
  const characterIconPath = player.characterName ? getCharacterDefaultIconPath(player.characterName) : null;
  // Get settings from Redux store
  const { 
    showTeammate1, showTeammate2, showTeammate3, showTeammate4, showTeammate5, 
    showOwnPlayerCard, compactOwnPlayerCard, compactTeammate1, compactTeammate2, 
    compactTeammate3, compactTeammate4, compactTeammate5,
    ultraCompactOwnPlayerCard, ultraCompactTeammate1, ultraCompactTeammate2,
    ultraCompactTeammate3, ultraCompactTeammate4, ultraCompactTeammate5,
    playerStatsOpacity, playerStatsBackgroundColor, playerStatsFontColor, teammateBorderColor, ultFullyChargedBorderColor 
  } = useSelector((state: RootState) => state.appSettingsReducer.settings);

  const teamateArrays: TeamateOptionsArrays = {
    show: [showOwnPlayerCard, showTeammate1, showTeammate2, showTeammate3, showTeammate4, showTeammate5],
    compact: [compactOwnPlayerCard, compactTeammate1, compactTeammate2, compactTeammate3, compactTeammate4, compactTeammate5],
    ultra: [ultraCompactOwnPlayerCard, ultraCompactTeammate1, ultraCompactTeammate2, ultraCompactTeammate3, ultraCompactTeammate4, ultraCompactTeammate5],
  };
  
  // Calculate the settings array index
  // For the user's own card: use index 0
  // For teammates: slotIndex maps to array index (slotIndex + 1)
  //   - slotIndex 0 → array index 1 (teammate1)
  //   - slotIndex 1 → array index 2 (teammate2), etc.
  const getSettingsIndex = () => {
    if (player.isUser) return 0;
    const slot = player.slotIndex ?? index;
    return slot + 1; // Offset by 1 because array[0] is for own player
  };
  
  const settingsIndex = getSettingsIndex();
  
  const isTeammateVisible = () => {
    if (settingsIndex < 0 || settingsIndex > 5) return false;
    return !teamateArrays.show[settingsIndex];
  };

  const isTeamateCollapsed = () => {
    if (settingsIndex < 0 || settingsIndex > 5) return false;
    return teamateArrays.compact[settingsIndex];
  };

  const isTeammateUltra = () => {
    if (settingsIndex < 0 || settingsIndex > 5) return false;
    return teamateArrays.ultra[settingsIndex];
  };

  // Ultimate charge percentage
  const ultPercentage = player.ultCharge || 0;

  // KDA, KD helpers
  const calculateKDA = () => {
    const kills = player.kills || 0;
    const deaths = player.deaths || 0;
    const assists = player.assists || 0;
    if (deaths === 0) return kills + assists > 0 ? "∞" : "0.0";
    return ((kills + assists) / deaths).toFixed(1);
  };

  const calculateKD = () => {
    const kills = player.kills || 0;
    const deaths = player.deaths || 0;
    if (deaths === 0) return kills > 0 ? "∞" : "0";
    return (kills / deaths).toFixed(1);
  };

  // Opacity for whole card
  const opacityValue = playerStatsOpacity / 100;

  const cardStyle = { opacity: opacityValue };
  const contentStyle = { backgroundColor: playerStatsBackgroundColor || 'rgba(0, 0, 0, 0.8)' };
  const fontStyle = { color: playerStatsFontColor || '#FFFFFF' };

  // Border visual settings
  const borderColor = ultPercentage >= 99 ? (ultFullyChargedBorderColor || '#FFD700') : (teammateBorderColor || 'var(--victory-color)');
  const borderOpacity = ultPercentage > 0 ? 0.95 : 0.3;

  return (
    <div
      className={`teammate-card ${isTeamateCollapsed() ? 'is-closed' : ''} ${isTeammateVisible() ? 'is-hidden' : ''} ${isTeammateUltra() ? 'ultra' : ''}`}
      style={{ ...cardStyle, position: "relative" }}
    >
      {/* Ultimate charge border overlay (SVG stroke) */}
      <UltBorderOverlay
        pct={ultPercentage}
        color={borderColor}
        muted="rgba(255,255,255,0.12)"
        thickness={3}
        radiusPx={12}
        opacity={borderOpacity}
      />

      {/* Content container */}
      <div className="teammate-card-content" style={contentStyle}>
        {/* Player name at top */}
        <div className="teammate-name" style={fontStyle}>
          {player.playerName}
          {player.isUser && <span className="local-player-indicator">⭐</span>}
        </div>

        {/* Main content area */}
        {isTeammateUltra() ? (
          <div className="teammate-ultra">
            <div className="ultra-row ultra-char-ult">
              <div className="ultra-character-name">{(player.characterName || '******')}</div>
              <div className="ultimate-percentage"><span>{ultPercentage}%</span></div>
            </div>
            <div className="ultra-row ultra-stats">
              <span className="stat-icon" style={fontStyle}>{icons.kill}</span>
              <span className="stat-value" style={fontStyle}>{player.kills || 0}</span>
              <span className="ultra-sep" />
              <span className="stat-icon" style={fontStyle}>{icons.death}</span>
              <span className="stat-value" style={fontStyle}>{player.deaths || 0}</span>
              <span className="ultra-sep" />
              <span className="stat-icon" style={fontStyle}>{icons.assist}</span>
              <span className="stat-value" style={fontStyle}>{player.assists || 0}</span>
              <span className="ultra-sep" />
              <span className="stat-icon" style={fontStyle}>{icons.finalHits}</span>
              <span className="stat-value" style={fontStyle}>{player.finalHits || 0}</span>
            </div>
            <div className="ultra-row ultra-stats secondary">
              <span className="stat-icon">{icons.kd}</span>
              <span className="stat-value" style={{marginRight: '0.5rem'}}>{calculateKD()}</span>
              <span className="ultra-sep" />
              <span className="stat-icon">{icons.kda}</span>
              <span className="stat-value kda">{calculateKDA()}</span>
            </div>
          </div>
        ) : (
          <div className="teammate-stats-container">
            {/* Left side: Avatar */}
            <div className="teammate-avatar">
              {characterIconPath ? (
                <img 
                  src={characterIconPath} 
                  alt={player.characterName || "Character"} 
                  className="character-icon"
                  style={{ height: "48px", width: "48px" }}
                />
              ) : (
                <Avatar size={48} shape="square" icon={<UserOutlined />} />
              )}
              <div className="ultimate-percentage">
                <span style={fontStyle}>{ultPercentage}%</span>
              </div>
            </div>

            {/* Right side: Stats */}
            <div>
              {isTeamateCollapsed() ? (
                <div className="teammate-stats-grid">
                  <div className="teammate-stats-col">
                    <div className="stat-row">
                      <div className="stat-icon" style={fontStyle}>{icons.kill}</div>
                      <div className="stat-value" style={fontStyle}>{player.kills || 0}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-icon" style={fontStyle}>{icons.death}</div>
                      <div className="stat-value" style={fontStyle}>{player.deaths || 0}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-icon" style={fontStyle}>{icons.assist}</div>
                      <div className="stat-value" style={fontStyle}>{player.assists || 0}</div>
                    </div>
                  </div>
                  <div className="teammate-stats-col">
                    <div className="stat-row">
                      <div className="stat-icon" style={fontStyle}>{icons.finalHits}</div>
                      <div className="stat-value" style={fontStyle}>{player.finalHits || 0}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-icon">{icons.kd}</div>
                      <div className="stat-value" style={fontStyle}>
                        {calculateKD()}
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-icon">{icons.kda}</div>
                      <div className="stat-value" style={{...fontStyle, color: 'var(--victory-color)'}}>{calculateKDA()}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="teammate-stats">
                  <div className="stat-row">
                    <div className="stat-icon" style={fontStyle}>{icons.kill}</div>
                    <div className="stat-value" style={fontStyle}>{player.kills || 0}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-icon" style={fontStyle}>{icons.death}</div>
                    <div className="stat-value" style={fontStyle}>{player.deaths || 0}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-icon" style={fontStyle}>{icons.assist}</div>
                    <div className="stat-value" style={fontStyle}>{player.assists || 0}</div>
                  </div>
                </div>
              )}
            </div>

            {!isTeamateCollapsed() && (
              <div className="ultimate-percentage-expanded">
                <span style={fontStyle}>{ultPercentage}%</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom footer */}
        {!isTeamateCollapsed() && !isTeammateUltra() && (
          <div className="teammate-footer">
            <div className="final-hits" style={fontStyle}>Final: {player.finalHits || 0}</div>
            <div className="kd-ratio" style={fontStyle}>K/D: {(player.deaths ?? 0) > 0 ? ((player.kills ?? 0) / (player.deaths ?? 0)).toFixed(1) : (player.kills ?? 0)}</div>
            <div className="kda-ratio" style={{...fontStyle, color: 'var(--victory-color)'}}>KDA: {calculateKDA()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const TeammateStats = (props: TeamStatProps) => {
  const { players } = props;

  // Players should already be sorted with user first (from Screen.tsx)
  // No need to re-sort here since Screen.tsx handles the ordering
  return (
    <div className="teammates-container">
      <div className="teammates-grid">
        {players.map((player, index) => (
          <TeammateCard 
            key={player.rosterId || `player_${index}`} 
            player={player}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default TeammateStats;
