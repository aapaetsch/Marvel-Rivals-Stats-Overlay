import React from "react";
import { SwapBarMatchInfoProps } from "./types/SwapBarTypes";

export const SwapBarMatchInfo: React.FC<SwapBarMatchInfoProps> = ({
  matchInfo,
  show,
  mapImageUrl
}) => {
  if (!show || !matchInfo) return null;

  const bgStyle = mapImageUrl ? { backgroundImage: `url(${mapImageUrl})` } : undefined;

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
      <div
        className={`swap-bar__player-background ${mapImageUrl ? 'map-background' : ''}`}
        style={bgStyle}
      />
    </div>
  );
};