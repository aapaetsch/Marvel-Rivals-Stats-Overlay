import React from "react";

export const SwapIcon: React.FC<{ playerTag?: string } > = ({ playerTag }) => {
  return (
    <div className="swap-bar__swap-icon">
      <svg
        className="swap-bar__swap-icon-svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 16V4L3 8M17 8V20L21 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {playerTag ? (
        <div className="swap-bar__swap-name" title={playerTag}>{playerTag}</div>
      ) : null}
    </div>
  );
};
