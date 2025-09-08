import React from "react";
import { SwapBarMatchInfoProps } from "./types/SwapBarTypes";

export const SwapBarMatchInfo: React.FC<SwapBarMatchInfoProps> = ({
  matchInfo,
  show
}) => {
  if (!show || !matchInfo) return null;

  return (
    <div className="swap-bar__match-info">
      <div className="swap-bar__match-info-content">
        <div className="swap-bar__match-location">
          {matchInfo.map || "Unknown Map"}
        </div>
        <div className="swap-bar__match-type">
          {matchInfo.gameMode || matchInfo.gameType || "Unknown Game Type"}
        </div>
      </div>
      <div className="swap-bar__player-background"></div>
    </div>
  );
};