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
  const [total, setTotal] = useState(1);

  // Use a normalized viewBox so we don't need to measure the element.
  // We'll express the rounded-rect radius in viewBox units by approximating px → %
  // Since stroke is non-scaling, the visual thickness stays constant.
  // We'll pick a radius in viewBox units that roughly matches a 12px corner on typical card sizes.
  // You can tweak rVU if you want more/less rounding.
  const rVU = 8; // viewBox radius (0..50 makes sense here)

  const d = useMemo(() => {
    // Rectangle from 0..100 with an inset to keep stroke inside bounds
    // Because stroke doesn't scale, keep the path slightly inset so rounded caps aren't clipped
    const inset = 1; // viewBox units
    const left = inset, right = 100 - inset, top = inset, bot = 100 - inset;
    const r = Math.max(0, Math.min(50, rVU));

    // Start at RIGHT CENTER
    const midY = (top + bot) / 2;

    // Clockwise: right -> bottom-right arc -> bottom -> bottom-left arc -> left -> top-left arc -> top -> top-right arc -> back to right center
    return [
      `M ${right} ${midY}`,
      `L ${right} ${bot - r}`,
      `A ${r} ${r} 0 0 1 ${right - r} ${bot}`,
      `L ${left + r} ${bot}`,
      `A ${r} ${r} 0 0 1 ${left} ${bot - r}`,
      `L ${left} ${top + r}`,
      `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
      `L ${right - r} ${top}`,
      `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
      `L ${right} ${midY}`,
    ].join(" ");
  }, [rVU]);

  useLayoutEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setTotal(len > 0 ? len : 1);
    }
  }, [d]);

  const dashArray = total;
  const dashOffset = total * (1 - p / 100);

  return (
    <svg
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
    playerStatsOpacity, playerStatsBackgroundColor, playerStatsFontColor, teammateBorderColor 
  } = useSelector((state: RootState) => state.appSettingsReducer.settings);

  const teamateArrays: TeamateOptionsArrays = {
    show: [showOwnPlayerCard, showTeammate1, showTeammate2, showTeammate3, showTeammate4, showTeammate5],
    compact: [compactOwnPlayerCard, compactTeammate1, compactTeammate2, compactTeammate3, compactTeammate4, compactTeammate5],
    ultra: [ultraCompactOwnPlayerCard, ultraCompactTeammate1, ultraCompactTeammate2, ultraCompactTeammate3, ultraCompactTeammate4, ultraCompactTeammate5],
  };
  
  const isTeammateVisible = () => {
    if (player.isUser) return !showOwnPlayerCard;
    if (index < 1 || index > 5) return false;
    return !teamateArrays.show[index];
  };

  const isTeamateCollapsed = () => {
    if (player.isUser) return compactOwnPlayerCard;
    if (index < 1 || index > 5) return false;
    return teamateArrays.compact[index];
  };

  const isTeammateUltra = () => {
    if (player.isUser) return ultraCompactOwnPlayerCard;
    if (index < 1 || index > 5) return false;
    return teamateArrays.ultra[index];
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
  const borderColor = ultPercentage >= 99 ? 'var(--victory-color)' : (teammateBorderColor || 'var(--victory-color)');
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

  // Sort players by rosterId and put user first
  const sortedPlayers = [...players]
    .sort((a, b) => {
      const rosterIdA = a.rosterId ?? '';
      const rosterIdB = b.rosterId ?? '';
      return rosterIdA.localeCompare(rosterIdB);
    });
  
  const userIndex = sortedPlayers.findIndex(player => player.isUser);
  if (userIndex > 0) {
    const userPlayer = sortedPlayers.splice(userIndex, 1)[0];
    sortedPlayers.unshift(userPlayer);
  }

  return (
    <div className="teammates-container">
      <div className="teammates-grid">
        {sortedPlayers.map((player, index) => (
          <TeammateCard 
            key={player.rosterId || index.toString()} 
            player={player}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default TeammateStats;
