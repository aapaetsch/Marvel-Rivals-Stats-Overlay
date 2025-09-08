import React from "react";
import { Avatar } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { SwapBarCharacterProps } from "./types/SwapBarTypes";

export const SwapBarPlayer: React.FC<SwapBarCharacterProps> = ({
  name,
  charName,
  avatarURLStr
}) => {
  return (
    <div className="swap-bar__player">
      <div className="swap-bar__player-name">{name}</div>
      <div className="swap-bar__player-avatar">
        {avatarURLStr ? (
          <img src={avatarURLStr} alt={charName} />
        ) : (
          <Avatar 
            size={32} 
            icon={<UserOutlined />}
            className="character-avatar-placeholder"
            shape="square"
          />
        )}
      </div>
    </div>
  );
};