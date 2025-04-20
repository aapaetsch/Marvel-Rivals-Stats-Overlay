import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import { PlayerStatsProps, TeamStatProps } from "../types/teamateStatsTypes";
import { Collapse } from "antd";
import "./styles/Screen.css";
import TeammateStats from "../components/TeammateStats";
import DragHandle from "../../shared/DragHandle";
import { WINDOW_NAMES } from "app/shared/constants";

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
      { rosterId: 'roster_1', playerName: 'Player 1', characterName: 'CLOAK & DAGGER', ...baseTeamateProps, ultCharge:5, isUser: true },
      { rosterId: 'roster_2', playerName: 'Player 2', characterName: 'JEFF THE LAND SHARK', ...baseTeamateProps, ultCharge:20 }, 
      { rosterId: 'roster_3', playerName: 'Player 3', characterName: 'JEFF THE LAND SHARK', ...baseTeamateProps, ultCharge:30 }, 
      { rosterId: 'roster_4', playerName: 'Player 4', characterName: 'JEFF THE LAND SHARK', ...baseTeamateProps, ultCharge:35 }, 
      { rosterId: 'roster_5', playerName: 'Player 5', characterName: 'JEFF THE LAND SHARK', ...baseTeamateProps, ultCharge:45 }, 
      { rosterId: 'roster_6', playerName: 'Player 6', characterName: 'JEFF THE LAND SHARK', ...baseTeamateProps, ultCharge:75 }, 
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
  // Get app settings to check if this overlay should be shown
  const { showTeamStats } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  
  // Show the component if match is in progress, forceVisible is true AND settings allow it
  const isVisible = (isMatchInProgress || forceVisible) && showTeamStats;
  
  return (
    <div className={`ingame ${isVisible ? '' : 'is-hidden'}`}>
      <DragHandle windowName={WINDOW_NAMES.INGAME} />
      <div className="ingame__container">
        <TeammateStats {...teamStatsProps} />
      </div>
    </div>
  );
}

export default Screen;
