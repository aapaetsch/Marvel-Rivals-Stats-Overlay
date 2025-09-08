import React from "react";
import { SwapBarContainerProps } from "./types/SwapBarTypes";
import "./styles/CharacterSwapBar.css";

export const SwapBarContainer: React.FC<SwapBarContainerProps> = ({
  children,
  mapImageUrl,
  isHidden = false,
  className = "",
}) => {
  return (
    <div className={`swap-bar-container ${isHidden ? 'is-hidden' : ''} ${className}`}>
      {/* Add the map image as background */}
      {mapImageUrl && (
        <div 
          className="swap-bar-container__background"
          style={{ backgroundImage: `url(${mapImageUrl})` }}
        />
      )}
      {children}
    </div>
  );
};