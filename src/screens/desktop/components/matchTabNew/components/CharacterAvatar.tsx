import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getCharacterIconPath } from 'lib/characterIcons';

interface CharacterAvatarProps {
  characterName: string;
  playerName: string;
  size?: number;
  className?: string;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ 
  characterName, 
  playerName, 
  size = 40,
  className = ''
}) => {
  const characterIconPath = characterName ? getCharacterIconPath(characterName) : null;

  return (
    <div className={`character-avatar ${className}`}>
      {characterIconPath ? (
        <img 
          src={characterIconPath} 
          alt={characterName || "Character"} 
          className="character-icon"
          style={{ height: `${size}px`, width: `${size}px` }}
        />
      ) : (
        <Avatar 
          size={size} 
          shape="square" 
          icon={<UserOutlined />}
          className="character-avatar-fallback"
        />
      )}
    </div>
  );
};

export default CharacterAvatar;