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

  // Determine if this player is an ally (same team as local player) or enemy.
  // Prefer the explicit `isTeammate` hint when available to avoid race conditions
  // where the local player's team is not yet present in the roster data.
  const isAlly = typeof character.isTeammate === 'boolean'
    ? Boolean(character.isTeammate)
    : (Number(character.team) === Number(localPlayerTeam));
  const teamClass = isAlly ? "ally" : "enemy";
  // Defaults use CSS custom properties where possible so themes can override
  const DEFAULT_ALLY_BORDER = 'var(--swapbar-ally-border, #1890FF)';
  const DEFAULT_ENEMY_BORDER = 'var(--swapbar-enemy-border, #FF4D4F)';
  const DEFAULT_ALLY_BG = 'var(--swapbar-ally-bg, rgba(24,144,255,0.45))';
  const DEFAULT_ENEMY_BG = 'var(--swapbar-enemy-bg, rgba(255,77,79,0.45))';

  // Helper: convert hex color to rgba with provided alpha. Also tolerate CSS
  // variables and rgb/rgba strings by returning them unchanged.
  const hexToRgba = (hex: string, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const trimmed = hex.trim();
    // If the caller passed a CSS variable or an rgb/rgba string already, just return it
    if (trimmed.startsWith('var(') || trimmed.startsWith('rgba(') || trimmed.startsWith('rgb(')) {
      return trimmed;
    }
    const sanitized = trimmed.replace('#', '');
    // Support 3-digit shorthand (#abc)
    if (sanitized.length === 3) {
      const r = parseInt(sanitized[0] + sanitized[0], 16);
      const g = parseInt(sanitized[1] + sanitized[1], 16);
      const b = parseInt(sanitized[2] + sanitized[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Support 6-digit hex
    if (sanitized.length === 6) {
      const bigint = parseInt(sanitized, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Fallback: return original string
    return hex;
  };

  // Border: if a prop color is provided use it, otherwise fall back to the CSS var
  const rowBorderColor = isAlly
    ? (allySwapColor || DEFAULT_ALLY_BORDER)
    : (enemySwapColor || DEFAULT_ENEMY_BORDER);

  // Background: if a prop color is provided use an rgba version of it, otherwise
  // fall back to the CSS var that already contains an rgba value.
  const rowBgColor = isAlly
    ? (allySwapColor ? hexToRgba(allySwapColor, 0.45) : DEFAULT_ALLY_BG)
    : (enemySwapColor ? hexToRgba(enemySwapColor, 0.45) : DEFAULT_ENEMY_BG);

  // compute avatar size based on requested rowHeight (keep full avatar at ~44px)
  const FULL_ROW_HEIGHT = 44;
  const avatarSize = rowHeight && rowHeight > 0 ? Math.max(20, Math.round((rowHeight / FULL_ROW_HEIGHT) * FULL_ROW_HEIGHT)) : FULL_ROW_HEIGHT;

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
        style={{ backgroundColor: rowBgColor, opacity: 1 }}
      />
    </div>
  );
};
