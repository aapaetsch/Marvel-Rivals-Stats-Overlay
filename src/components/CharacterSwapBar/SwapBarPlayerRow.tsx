import React from "react";
import { SwapBarPlayerRowProps, SwapBarCharacterProps } from "./types/SwapBarTypes";
import { SwapBarPlayer } from "./SwapBarPlayer";
import { SwapIcon } from "./SwapIcon";
import { getCharacterDefaultIconPath } from "../../lib/characterIcons";

export const SwapBarPlayerRow: React.FC<SwapBarPlayerRowProps> = ({
  character,
  localPlayerTeam,
  allySwapColor,
  enemySwapColor
  ,rowHeight
}) => {
  const leftProps: SwapBarCharacterProps = {
    name: character.name,
    charName: character.oldCharacterName ?? "",
    avatarURLStr: character.oldAvatarURL || getCharacterDefaultIconPath(character.oldCharacterName) || null,
  };

  const rightProps: SwapBarCharacterProps = {
    name: character.name,
    charName: character.newCharacterName ?? "",
    avatarURLStr: character.newAvatarURL || getCharacterDefaultIconPath(character.newCharacterName) || null,
  };

  // Determine if this player is an ally (same team as local player) or enemy
  const isAlly = Number(character.team) === Number(localPlayerTeam);
  const teamClass = isAlly ? "ally" : "enemy";
  const DEFAULT_ALLY = '#1890FF';
  const DEFAULT_ENEMY = '#FF4D4F';

  const rowBorderColor = isAlly ? (allySwapColor || DEFAULT_ALLY) : (enemySwapColor || DEFAULT_ENEMY);
  const rowBgColor = isAlly ? (allySwapColor || DEFAULT_ALLY) : (enemySwapColor || DEFAULT_ENEMY);

  // Helper: convert hex color to rgba with provided alpha
  const hexToRgba = (hex: string, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // compute avatar size based on requested rowHeight (keep full avatar at ~44px)
  const FULL_ROW_HEIGHT = 44;
  const DEFAULT_AVATAR_SIZE = 44;
  const avatarSize = rowHeight && rowHeight > 0 ? Math.max(20, Math.round((rowHeight / FULL_ROW_HEIGHT) * DEFAULT_AVATAR_SIZE)) : DEFAULT_AVATAR_SIZE;

  return (
    <div 
      className={`swap-bar__player-row team-${character.team} ${teamClass}`} 
      style={{ borderColor: rowBorderColor, height: rowHeight ?? undefined }}
    >
  {character.oldCharacterName && <SwapBarPlayer {...leftProps} avatarSize={avatarSize} />}
      <SwapIcon playerTag={character.name} />
  {character.newCharacterName && <SwapBarPlayer {...rightProps} avatarSize={avatarSize} />}
      <div 
        className="swap-bar__player-background" 
        style={{ backgroundColor: hexToRgba(rowBgColor, 0.45), opacity: 1 }}
      />
    </div>
  );
};
