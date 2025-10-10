import React from "react";
import { SwapBarProps } from "./types/SwapBarTypes";
import { SwapBarMatchInfo } from "./SwapBarMatchInfo";
import { SwapBarPlayerRow } from "./SwapBarPlayerRow";

export interface SwapBarComponentProps extends SwapBarProps {
  localPlayerTeam: number;
  allySwapColor: string;
  enemySwapColor: string;
}

export const SwapBar: React.FC<SwapBarComponentProps> = ({
  characters,
  show,
  matchInfo,
  showMatchInfo,
  localPlayerTeam,
  allySwapColor,
  enemySwapColor,
  mapImageUrl,
  rowHeight,
}) => {
  return (
    <div className={`swap-bar ${show ? "show" : ""}`}>
      <SwapBarMatchInfo 
        matchInfo={matchInfo!}
        show={showMatchInfo && !!matchInfo}
        mapImageUrl={mapImageUrl}
      />
      {characters?.map((character, index) => (
        <SwapBarPlayerRow
          key={`${character.uid}:${(character.oldCharacterName||'').toLowerCase()}:${(character.newCharacterName||'').toLowerCase()}:${index}`}
          character={character}
          localPlayerTeam={localPlayerTeam}
          allySwapColor={allySwapColor}
          enemySwapColor={enemySwapColor}
          rowHeight={rowHeight}
        />
      ))}
    </div>
  );
};
