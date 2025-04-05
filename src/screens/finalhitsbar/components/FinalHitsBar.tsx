import React, { useMemo } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { FinalHitsBarProps, FinalHitsPlayerProps } from '../types/finalHitsBarTypes';
import { getCharacterIconPath } from 'lib/characterIcons';
import "./styles/FinalHitsBar.css";

const FinalHitsPlayer = (props: FinalHitsPlayerProps) => {
  const finalHitsOnPlayer = props.finalHitsOnPlayer ?? 0;
  const finalHitsOnYou = props.finalHitsOnYou ?? 0;
  const characterIconPath = props.avatarUrl || (props.characterName ? getCharacterIconPath(props.characterName) : null);
  
  return (
    <div className="final-hits-player" data-uid={props.uid}>
      <div className="final-hits-on-wrapper">
        <div className="final-hits-on-player">
          {/* number of final hits on */}
          <span>{finalHitsOnPlayer}</span>
          <div className="final-hits-background"></div>
        </div>
      </div>
      <div className="final-hits-player-avatar">
        {/* Character avatar */}
        {characterIconPath ? (
          <img 
            src={characterIconPath} 
            alt={props.characterName || props.name} 
            className="character-avatar"
          />
        ) : (
          <Avatar size={64} shape={"square"} icon={<UserOutlined />} />
        )}
        <span className="player-name is-hidden" title={props.name}>{props.name}</span>
      </div>
      <div className="final-hits-on-wrapper">
        <div className="final-hits-on-user">  
          {/* Final hits on you */}
          <span>{finalHitsOnYou}</span>
          <div className="final-hits-background"></div>
        </div>
      </div>
    </div>
  );
}

const FinalHitsBar = (props: FinalHitsBarProps) => {
  return (
    <div className="final-hits-bar">
    {props.players != null ? props.players.map((player) => (
        <FinalHitsPlayer key={player.uid} {...player} />
      ))
      : (
        <div className="final-hits-bar__no-players">
          <span>No players found</span>
        </div>
      )
    }  
    </div>
  );
}

const Screen = () => {
  // 1) Grab the match data from your matchStats slice
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Check if a match is in progress
  const isMatchInProgress = useMemo(() => {
    return currentMatch.timestamps.matchStart !== null && currentMatch.timestamps.matchEnd === null;
  }, [currentMatch.timestamps.matchStart, currentMatch.timestamps.matchEnd]);
  
  // 2) The local player:
  //    For example, find the one with isLocal = true
  const localPlayer = useMemo(() => {
    return Object.values(currentMatch.players).find((p) => p.isLocal);
  }, [currentMatch.players]);

  // 3) Build the array of final-hits data for each other player
  const finalHitsPlayers: FinalHitsPlayerProps[] = useMemo(() => {
    if (!localPlayer) return [];

    // Convert the players object to an array, ignoring the local player itself
    return Object.values(currentMatch.players)
      .filter((p) => !p.isLocal && !p.isTeammate)
      .map((p) => {
        const finalHitsOnPlayer = localPlayer.killedPlayers[p.uid] ?? 0;
        const finalHitsOnYou = p.killedPlayers[localPlayer.uid] ?? 0;

        return {
          uid: p.uid,
          name: p.name,
          characterName: p.characterName,
          avatarUrl: null, // or wherever you store the avatar
          finalHitsOnPlayer, 
          finalHitsOnYou,
        };
      });
  }, [currentMatch.players, localPlayer]);

  // 4) If you want a dummy list when there are no players:
  const pdummy: FinalHitsPlayerProps[] = [
    { uid: '1', name: 'Player 1', characterName: 'Iron Man', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '2', name: 'Player 2', characterName: 'Spider-Man', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '3', name: 'Player 3', characterName: 'Doctor Strange', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '4', name: 'Player 4', characterName: 'Black Panther', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '5', name: 'Player 5', characterName: 'Storm', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
  ];
  

  return (
    <div className={`final-hits-bar-screen ${isMatchInProgress ? '' : 'is-hidden'}`}>
      <FinalHitsBar players={finalHitsPlayers.length ? finalHitsPlayers : pdummy} />
    </div>
  );
}

export default Screen;