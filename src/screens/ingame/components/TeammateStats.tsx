import { Avatar } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { PlayerStatsProps, TeamStatProps } from "../types/teamateStatsTypes";
import { getCharacterIconPath } from "lib/characterIcons";
import { icons } from 'components';
import "./styles/playerStats.css";
import { useState } from "react";
import YellowLightning from "./YellowLightning";

// Teammate Card component
const TeammateCard = ({ player }: { player: PlayerStatsProps }) => {
  const characterIconPath = player.characterName ? getCharacterIconPath(player.characterName) : null;
  
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

  return (
    <div className="teammate-card">
      {/* Ultimate charge border overlay */}
      <div 
        className="ultimate-border" 
        style={getBorderStyle()}
      ></div>
      
      {/* Content container */}
      <div className="teammate-card-content">
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
              />
            ) : (
              <Avatar size={64} shape="square" icon={<UserOutlined />} />
            )}
          </div>
          
          {/* Right side: Stats */}
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
        
        {/* Bottom: Final hits and KDA */}
        <div className="teammate-footer">
          <div className="final-hits">Final: {player.finalBlows || 0}</div>
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

const TeamateStats = (props: TeamStatProps) => {
  const { players } = props;
  const [ultPinged, setUltPinged] = useState<Record<string, boolean>>({});

  return (
    <div className="teammates-container">
      <div className="teammates-grid">
        {players.map((player, index) => (
          <TeammateCard 
            key={player.rosterId || index.toString()} 
            player={player} 
          />
        ))}
      </div>
    </div>
  );
};

export default TeamateStats;