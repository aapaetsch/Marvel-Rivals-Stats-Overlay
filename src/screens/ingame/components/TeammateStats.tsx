import { Avatar } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { PlayerStatsProps, TeamStatProps } from "../types/teamateStatsTypes";
import { getCharacterIconPath } from "lib/characterIcons";
import { icons } from 'components';
import "./styles/playerStats.css";
import { useState } from "react";
import YellowLightning from "./YellowLightning";
import { useSelector } from 'react-redux';
import { RootState } from 'app/shared/store';

// Teammate Card component
const TeammateCard = ({ player, index }: { player: PlayerStatsProps; index: number }) => {
  const characterIconPath = player.characterName ? getCharacterIconPath(player.characterName) : null;
  
  // Get settings from Redux store
  const { 
    showTeammate1, showTeammate2, showTeammate3, showTeammate4, showTeammate5, 
    showOwnPlayerCard, compactOwnPlayerCard, compactTeammate1, compactTeammate2, 
    compactTeammate3, compactTeammate4, compactTeammate5,
    playerStatsOpacity, playerStatsBackgroundColor 
  } = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  // Determine if this teammate card should be closed based on index
  const isTeammateVisible = () => {
    if (player.isUser) {
      return !showOwnPlayerCard;
    }
    switch (index) {
      case 1: return !showTeammate1;
      case 2: return !showTeammate2;
      case 3: return !showTeammate3;
      case 4: return !showTeammate4;
      case 5: return !showTeammate5;
      default: return false;
    }
  };

  const isTeamateCollapsed = () => {
    if (player.isUser) {
      return compactOwnPlayerCard;
    }
    switch (index) {
      case 1: return compactTeammate1;
      case 2: return compactTeammate2;
      case 3: return compactTeammate3;
      case 4: return compactTeammate4;
      case 5: return compactTeammate5;
      default: return false;
    }
  };
  
  // Calculate the ultimate charge border styles
  const ultPercentage = player.ultCharge || 0;
  const getBorderStyle = () => {
    return {
      clipPath: getUltChargeClipPath(ultPercentage),
      opacity: ultPercentage > 0 ? 0.8 : 0.3
    };
  };

  // Calculate KDA (Kills + Assists) / Deaths or just (Kills + Assists) if deaths is 0
  const calculateKDA = () => {
    const kills = player.kills || 0;
    const deaths = player.deaths || 0;
    const assists = player.assists || 0;
    
    if (deaths === 0) {
      return kills + assists > 0 ? "Perfect" : "0.0";
    }
    
    return ((kills + assists) / deaths).toFixed(1);
  };
  // Convert opacity percentage to decimal for CSS
  const opacityValue = playerStatsOpacity / 100;
  
  // Apply background color with opacity to the card background
  const cardStyle = {
    opacity: opacityValue,
  };
  
  // Apply background color to the card content
  const contentStyle = {
    backgroundColor: playerStatsBackgroundColor || 'rgba(0, 0, 0, 0.8)',
  };

  return (
    <div className={`teammate-card ${isTeamateCollapsed() ? 'is-closed' : ''} ${isTeammateVisible() ? 'is-hidden' : ''}`} style={cardStyle}>
      {/* Ultimate charge border overlay */}
      <div 
        className="ultimate-border" 
        style={getBorderStyle()}
      ></div>
        {/* Content container */}
      <div className="teammate-card-content" style={contentStyle}>
        {/* Player name at top */}
        <div className="teammate-name">
          {player.playerName}
          {player.isUser && <span className="local-player-indicator">⭐</span>}
        </div>
          {/* Main content area */}
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
              <span>{ultPercentage}%</span>
            </div>
          </div>
          
          {/* Right side: Stats */}
          <div>
            <div className="teammate-stats">
              <div className="stat-row">
                <div className="stat-icon">{icons.kill}</div>
                <div className="stat-value">{player.kills || 0}</div>
              </div>
              <div className="stat-row">
                <div className="stat-icon">{icons.death}</div>
                <div className="stat-value">{player.deaths || 0}</div>
              </div>
              <div className="stat-row">
                <div className="stat-icon">{icons.assist}</div>
                <div className="stat-value">{player.assists || 0}</div>
              </div>
            </div>
          </div>
          {!isTeamateCollapsed() && (
            <div className="ultimate-percentage-expanded">
              <span>{ultPercentage}%</span>
            </div>
          )}
        </div>
        {/* Bottom: Final hits and KDA */}
        <div className="teammate-footer">
          <div className="final-hits">Final: {player.finalHits || 0}</div>
          <div className="kd-ratio">K/D: {(player.deaths ?? 0) > 0 ? ((player.kills ?? 0) / (player.deaths ?? 0)).toFixed(1) : (player.kills ?? 0)}</div>
          <div className="kda-ratio">KDA: {calculateKDA()}</div>
        </div>
      </div>
    </div>
  );
};

// Utility function for the ultimate charge border
const getUltChargeClipPath = (percentage: number) => {
  // Clamp percentage between 0-100
  const p = Math.max(0, Math.min(100, percentage));
  
  // Calculate which quadrant we're in (0-3) and angle within that quadrant
  const quadrant = Math.floor(p / 25);
  const angleInQuadrant = ((p % 25) / 25) * 90; // 0-90 degrees
  
  // Calculate the base angle for the quadrant
  const baseAngles = [-90, 0, 90, 180];
  const angle = (baseAngles[quadrant] + angleInQuadrant) * Math.PI / 180;
  
  // Calculate the point coordinates
  const x = 50 + 50 * Math.cos(angle);
  const y = 50 + 50 * Math.sin(angle);
  
  // Build the polygon string
  let path = "polygon(100% 50%"; // Start at right center
  
  // Add corners based on quadrant
  if (quadrant >= 0) path += ", 100% 100%"; // Bottom right
  if (quadrant >= 1) path += ", 0% 100%";   // Bottom left
  if (quadrant >= 2) path += ", 0% 0%";     // Top left
  if (quadrant >= 3) path += ", 100% 0%";   // Top right
  
  // Add the calculated point
  path += `, ${x.toFixed(1)}% ${y.toFixed(1)}%)`;
  
  return path;
};

const TeammateStats = (props: TeamStatProps) => {
  const { players } = props;
  const [ultPinged, setUltPinged] = useState<Record<string, boolean>>({});

  // Sort players by rosterId and put user first
  const sortedPlayers = [...players]
    .sort((a, b) => {
      // Handle undefined rosterIds
      const rosterIdA = a.rosterId ?? '';
      const rosterIdB = b.rosterId ?? '';
      return rosterIdA.localeCompare(rosterIdB);
    });
  
  // Find the user player and move them to the front
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