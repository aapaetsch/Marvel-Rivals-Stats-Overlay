import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import { PlayerStatsProps, TeamStatProps } from "../types/teamateStatsTypes";
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
        // Use a stable identifier for rosterId so React keys and
        // slot-based settings stay consistent when players leave/join.
        rosterId: p.uid ?? `roster_${idx}`,
        playerName: p.name,
        characterName: p.characterName,
        // Ensure numeric stats have safe defaults to avoid transient styling differences
        kills: p.kills ?? 0,
        finalHits: p.finalHits ?? 0,
        deaths: p.deaths ?? 0,
        assists: p.assists ?? 0,
        damageBlocked: p.damageBlocked ?? 0,
        isTeammate: p.isTeammate,
        isUser: p.isLocal,
        ultCharge: p.ultCharge ?? 0,
      }));
  }, [currentMatch.players]);

  const baseTeamateProps = { kills: 0, deaths: 0, assists: 0, finalHits: 0, damageBlocked: 0, ultCharge: 0, isTeammate: true, isUser: false};
  
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
  useEffect(() => {
    const handleResize = () => {
      /* no-op placeholder for future resize handling */
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Get app settings to check if this overlay should be shown
  const { showTeamStats, playerStatsOpacity } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);

  // Show the component only if a match is in progress and settings allow it
  const isVisible = isMatchInProgress && showTeamStats;
  
  // Apply opacity at the container level for consistent transparency
  const containerStyle = {
    opacity: playerStatsOpacity / 100
  };
  
  return (
    <div className={`ingame ${isVisible ? '' : 'is-hidden'}`}>
      <DragHandle windowName={WINDOW_NAMES.INGAME} />
      <div className="ingame__container" style={containerStyle}>
        <TeammateStats {...teamStatsProps} />
      </div>
    </div>
  );
}

export default Screen;
