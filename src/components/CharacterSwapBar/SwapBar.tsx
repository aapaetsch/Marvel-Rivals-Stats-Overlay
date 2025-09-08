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
  enemySwapColor
}) => {
  return (
    <div className={`swap-bar ${show ? "show" : ""}`}>
      <SwapBarMatchInfo 
        matchInfo={matchInfo!}
        show={showMatchInfo && !!matchInfo}
      />
      {characters?.map((character, index) => (
        <SwapBarPlayerRow
          key={index}
          character={character}
          localPlayerTeam={localPlayerTeam}
          allySwapColor={allySwapColor}
          enemySwapColor={enemySwapColor}
        />
      ))}
    </div>
  );
};