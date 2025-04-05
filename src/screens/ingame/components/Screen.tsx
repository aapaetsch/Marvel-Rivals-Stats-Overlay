import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import { PlayerStatsProps, TeamStatProps } from "../types/teamateStatsTypes";
import { Collapse } from "antd";
import "./styles/Screen.css";
import TeammateStats from "./TeammateStats";

const Screen = () => {
  // 1) Instead of pulling from the background store, pull your match data
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);

  // Check if a match is in progress
  const isMatchInProgress = useMemo(() => {
    return currentMatch.timestamps.matchStart !== null && currentMatch.timestamps.matchEnd === null;
  }, [currentMatch.timestamps.matchStart, currentMatch.timestamps.matchEnd]);

  // 2) Build an array of teammate stats from currentMatch.players
  const teammates: PlayerStatsProps[] = useMemo(() => {
    // If you have a local player, you can find them to see what "team" is
    // or just rely on `isTeammate` directly.
    return Object.values(currentMatch.players)
      .filter(p => p.isTeammate)
      .map((p, idx) => ({
        rosterId: `roster_${idx}`,
        playerName: p.name,
        characterName: p.characterName,
        kills: p.kills,
        finalBlows: p.finalHits, // or however you store final hits
        deaths: p.deaths,
        assists: p.assists,
        damageBlocked: p.damageBlocked, // Add damage blocked here
        isTeammate: p.isTeammate,
        isUser: p.isLocal,
        ultCharge: p.ultCharge ?? 0,
      }));
  }, [currentMatch.players]);

  const baseTeamateProps = { kills: 0, deaths: 0, assists: 0, finalBlows: 0, damageBlocked: 0, ultCharge: 0, isTeammate: true, isUser: false};
  
  const teamStatsProps: TeamStatProps = {
    players: teammates != null && teammates.length > 0 ? teammates : [
      { rosterId: 'roster_1', playerName: 'Player 1', characterName: 'Character 1', ...baseTeamateProps, ultCharge:5 },
      { rosterId: 'roster_2', playerName: 'Player 2', characterName: 'Character 2', ...baseTeamateProps, ultCharge:20 }, 
      { rosterId: 'roster_3', playerName: 'Player 3', characterName: 'Character 3', ...baseTeamateProps, ultCharge:30 }, 
      { rosterId: 'roster_4', playerName: 'Player 4', characterName: 'Character 4', ...baseTeamateProps, ultCharge:35 }, 
      { rosterId: 'roster_5', playerName: 'Player 5', characterName: 'Character 5', ...baseTeamateProps, ultCharge:45 }, 
      { rosterId: 'roster_6', playerName: 'Player 6', characterName: 'Character 6', ...baseTeamateProps, ultCharge:75 }, 
    ]
}

  // 4) If you still want to handle window resizing for your container:
  const [windowHeight, setWindowHeight] = useState(window.outerHeight);
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const forceVisible = true;
  // Show the component if either match is in progress OR forceVisible is true
  const isVisible = isMatchInProgress || forceVisible;
  
  return (
    <div className={`ingame ${isVisible ? '' : 'is-hidden'}`}>
      <div className="ingame__container">
        <TeammateStats {...teamStatsProps} />
      </div>
    </div>
  );
}

export default Screen;
