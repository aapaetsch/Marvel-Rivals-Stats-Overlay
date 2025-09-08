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
  const isAlly = character.team === localPlayerTeam;
  const teamClass = isAlly ? "ally" : "enemy";
  const rowBorderColor = isAlly ? allySwapColor : enemySwapColor;
  const rowBgColor = isAlly ? allySwapColor : enemySwapColor;

  return (
    <div 
      className={`swap-bar__player-row team-${character.team} ${teamClass}`} 
      style={{ borderColor: rowBorderColor }}
    >
      {character.oldCharacterName && <SwapBarPlayer {...leftProps} />}
      <SwapIcon />
      {character.newCharacterName && <SwapBarPlayer {...rightProps} />}
      <div 
        className="swap-bar__player-background" 
        style={{ backgroundColor: rowBgColor }}
      />
    </div>
  );
};