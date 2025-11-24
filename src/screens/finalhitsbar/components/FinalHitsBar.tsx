import React, { useMemo } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { FinalHitsBarProps, FinalHitsPlayerProps } from '../types/finalHitsBarTypes';
import { getCharacterDefaultIconPath } from 'lib/characterIcons';
import DragHandle from '../../shared/DragHandle';
import { WINDOW_NAMES } from 'app/shared/constants';
import { FinalHitsAdOverlay } from './FinalHitsAdOverlay';
import "./styles/FinalHitsBar.css";

const FinalHitsPlayer = (props: FinalHitsPlayerProps) => {
  const finalHitsOnPlayer = props.finalHitsOnPlayer ?? 0;
  const finalHitsOnYou = props.finalHitsOnYou ?? 0;
  // Display blank instead of '0' so slots appear empty until a final hit is registered
  const displayFinalHitsOnPlayer = finalHitsOnPlayer > 0 ? finalHitsOnPlayer : '0';
  const displayFinalHitsOnYou = finalHitsOnYou > 0 ? finalHitsOnYou : '0';
  const characterIconPath = props.avatarUrl || (props.characterName ? getCharacterDefaultIconPath(props.characterName) : null);
  // Only show the avatar once a final hit exists (either direction). Until then
  // render an empty placeholder to keep layout consistent.
  const hasFinalHit = finalHitsOnPlayer > 0 || finalHitsOnYou > 0;
  
  // Get custom colors from settings
  const { yourFinalHitsColor, opponentFinalHitsColor } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  // Apply custom colors for final hits counts
  const yourHitsStyle = useMemo(() => ({
    borderColor: yourFinalHitsColor || '#1890FF',
  }), [yourFinalHitsColor]);

  const yourHitsBackgroundStyle = useMemo(() => ({
    backgroundColor: yourFinalHitsColor || '#1890FF',
  }), [yourFinalHitsColor]);

  const opponentHitsStyle = useMemo(() => ({
    borderColor: opponentFinalHitsColor || '#FF4D4F',
  }), [opponentFinalHitsColor]);

  const opponentHitsBackgroundStyle = useMemo(() => ({
    backgroundColor: opponentFinalHitsColor || '#FF4D4F',
  }), [opponentFinalHitsColor]);
  
  return (
    <div className="final-hits-player" data-uid={props.uid}>
      <div className="final-hits-on-wrapper">
        <div className="final-hits-on-player" style={yourHitsStyle}>
          <span>{displayFinalHitsOnPlayer}</span>
          <div className="final-hits-background" style={yourHitsBackgroundStyle}></div>
        </div>
      </div>
      <div className="final-hits-player-avatar">
        {hasFinalHit ? (
          // Show the real character/avatar once a final hit has been registered
          characterIconPath ? (
            <img 
              src={characterIconPath} 
              alt={props.characterName || props.name} 
              className="character-avatar"
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <Avatar size={48} shape={"square"} icon={<UserOutlined />} />
          )
        ) : (
          // Empty placeholder to preserve layout while there's no final hit
          <div className="character-avatar-empty" style={{ width: 48, height: 48 }} />
        )}
        <span className="player-name is-hidden" title={props.name}>{props.name}</span>
      </div>
      <div className="final-hits-on-wrapper">
        <div className="final-hits-on-user" style={opponentHitsStyle}>  
          <span>{displayFinalHitsOnYou}</span>
          <div className="final-hits-background" style={opponentHitsBackgroundStyle}></div>
        </div>
      </div>
    </div>
  );
}

export const FinalHitsBar = (props: FinalHitsBarProps) => {
  const playersToRender = useMemo(() => {
    if (!props.players || props.players.length === 0) return [] as FinalHitsPlayerProps[];

    // Annotate with original index and whether the slot has any final hits
    const annotated = props.players.map((p, idx) => ({
      p,
      idx,
      hasFinal: (p.finalHitsOnPlayer ?? 0) > 0 || (p.finalHitsOnYou ?? 0) > 0,
    }));

    // Sort: filled slots (hasFinal=true) first (left), placeholders last (right).
    // Use original index as tiebreaker to preserve stable ordering within groups.
    annotated.sort((a, b) => {
      if (a.hasFinal === b.hasFinal) return a.idx - b.idx;
      return a.hasFinal ? -1 : 1;
    });

    return annotated.map(a => a.p);
  }, [props.players]);

  return (
    <div className="final-hits-bar">
      {playersToRender.length > 0 ? (
        playersToRender.map((player) => (
          <FinalHitsPlayer key={player.uid} {...player} />
        ))
      ) : (
        <div className="final-hits-bar__no-players">
          <span>No players found</span>
        </div>
      )}
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

    // Convert the players object to an array, ignoring the local player itself and teammates
    const opponents = Object.values(currentMatch.players)
      .filter((p) => !p.isLocal && !p.isTeammate);

    // Return slots for all opponents (even if they have zero final-hits) so the UI
    // always displays a consistent set of slots. Counts will be 0 initially.
    return opponents.map((p) => {
      // Get the kill counts in both directions
      const finalHitsOnPlayer = localPlayer.killedPlayers[p.uid] ?? 0;
      const finalHitsOnYou = p.killedPlayers[localPlayer.uid] ?? 0;

      return {
        uid: p.uid,
        name: p.name,
        characterName: p.characterName,
        avatarUrl: null,
        finalHitsOnPlayer,
        finalHitsOnYou,
      };
    });
  }, [currentMatch.players, localPlayer]);

  // 4) If you want a dummy list when there are no players:
  const pdummy: FinalHitsPlayerProps[] = [
    { uid: '1', name: 'Player 1', characterName: 'CLOAK & DAGGER', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '2', name: 'Player 2', characterName: 'JEFF THE LAND SHARK', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '3', name: 'Player 3', characterName: 'JEFF THE LAND SHARK', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '4', name: 'Player 4', characterName: 'JEFF THE LAND SHARK', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '5', name: 'Player 5', characterName: 'JEFF THE LAND SHARK', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
    { uid: '6', name: 'Player 6', characterName: 'JEFF THE LAND SHARK', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 },
  ];
  // Get app settings to check if this overlay should be shown and apply styling
  const { 
    showFinalHitsOverlay, 
    finalHitsOpacity, 
    finalHitsBackgroundColor 
  } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
    // Apply opacity and background color from settings
  // Using useMemo to ensure the style objects are recreated when settings change
  const finalHitsScreenStyle = useMemo(() => ({
    opacity: finalHitsOpacity / 100
  }), [finalHitsOpacity]);

  // Create style for the background element if a background color is set
  const backgroundStyle = useMemo(() => ({
    backgroundColor: finalHitsBackgroundColor || 'transparent'
  }), [finalHitsBackgroundColor]);
  
  // If no active match or the user has disabled this overlay, don't render anything
  if (!isMatchInProgress || !showFinalHitsOverlay) return null;

  return (
    <div className={`final-hits-bar-screen`} style={finalHitsScreenStyle}>
      <div className="final-hits-bar-background" style={backgroundStyle}></div>
      <FinalHitsAdOverlay adWidth={780} adHeight={90} />
      <DragHandle windowName={WINDOW_NAMES.FINALHITSBAR} />
      <FinalHitsBar players={finalHitsPlayers.length ? finalHitsPlayers : pdummy}/>
    </div>
  );
}


export default Screen;
