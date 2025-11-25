import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { logger } from "lib/log";
import { isDev } from "lib/utils";
import { setApiKey, getPlayerByUsername, initializeApiService } from "lib/marvelRivalsApi";
import { getPlayerStats } from "lib/recentPlayersService";
import { recordElo } from "lib/eloTrackingService";
import {
  MatchOutcome,
  MatchStatsState,
  MatchStoreState,
  PlayerStats,
  TeamStats,
  MatchSnapshot
} from "../types/matchStatsTypes";

// Import the PlayerData and RecentPlayerData types from the API service
import { PlayerData as ApiPlayerData, RecentPlayerData } from "lib/marvelRivalsApi";

// Create a thunk that will be used to complete the match and trigger the middleware
export const completeMatchThunk = createAsyncThunk(
  'matchStats/completeMatchThunk',
  async (_, { dispatch, getState }) => {
    // The middleware will handle the rest
    // No need to return anything here as the middleware will dispatch further actions
    return;
  }
);

// initializeApiService();

const initialMatchStatsState: MatchStatsState = {
  matchId: null,
  map: null,
  gameType: null,
  gameMode: null,
  outcome: MatchOutcome.Unknown,
  players: {},
  teamStats: {},
  timestamps: {
    matchStart: null,
    matchEnd: null,
  },
  rounds: [],
  devSwapDisplayDuration: null,
  devMaxVisibleSwaps: null,
};

const initialState: MatchStoreState = {
  currentMatch: initialMatchStatsState,
  matchHistory: [],
  clearMatchTimeout: null,
  characterSessions: {},
  completedSessions: [],
};

// Build a deep snapshot of the current match suitable for per-round storage
const buildRoundSnapshot = (match: MatchStatsState): MatchSnapshot => {
  const playersCopy: Record<string, PlayerStats> = {};
  for (const [uid, p] of Object.entries(match.players)) {
    playersCopy[uid] = {
      ...p,
      killedPlayers: { ...(p.killedPlayers || {}) },
      killedBy: { ...(p.killedBy || {}) },
      characterSwaps: Array.isArray(p.characterSwaps) ? [...p.characterSwaps] : [],
    } as PlayerStats;
  }

  // Compute team totals from the copied players
  const teamTotals: Record<number, TeamStats> = {};
  for (const player of Object.values(playersCopy)) {
    const t = teamTotals[player.team] || {
      finalHits: 0,
      totalDamage: 0,
      totalBlocked: 0,
      totalHealing: 0,
    };
    t.finalHits += player.finalHits || 0;
    t.totalDamage += player.damageDealt || 0;
    t.totalBlocked += player.damageBlocked || 0;
    t.totalHealing += player.totalHeal || 0;
    teamTotals[player.team] = t;
  }

  // Compute percentages on the copied players (do not mutate original state)
  for (const player of Object.values(playersCopy)) {
    const team = teamTotals[player.team] || { finalHits: 0, totalDamage: 0, totalBlocked: 0, totalHealing: 0 };
    player.pctTeamDamage = team.totalDamage > 0 ? +(((player.damageDealt || 0) / team.totalDamage) * 100).toFixed(1) : 0;
    player.pctTeamBlocked = team.totalBlocked > 0 ? +(((player.damageBlocked || 0) / team.totalBlocked) * 100).toFixed(1) : 0;
    player.pctTeamHealing = team.totalHealing > 0 ? +(((player.totalHeal || 0) / team.totalHealing) * 100).toFixed(1) : 0;
  }

  const snapshot: MatchSnapshot = {
    matchId: match.matchId,
    map: match.map,
    gameType: match.gameType,
    gameMode: match.gameMode,
    outcome: match.outcome,
    players: playersCopy,
    teamStats: teamTotals,
    timestamps: { ...match.timestamps },
  };
  return snapshot;
};

// Heuristic: determine if there was activity worth snapshotting in the current round
const hasRoundActivity = (match: MatchStatsState): boolean => {
  return Object.values(match.players).some((p) =>
    (p.kills || 0) > 0 || (p.deaths || 0) > 0 || (p.assists || 0) > 0 ||
    (p.finalHits || 0) > 0 || (p.damageDealt || 0) > 0 || (p.damageBlocked || 0) > 0 || (p.totalHeal || 0) > 0
  );
};

/**
 * Process character session tracking when a player's character changes
 * Completes the previous session and starts a new one
 */
const processCharacterSession = (
  state: MatchStoreState,
  uid: string,
  newCharacterName: string,
  currentKills: number,
  currentDeaths: number,
  currentAssists: number,
  isAlly: boolean,
  timestamp: number
): void => {
  // If there's an existing session for this player, complete it
  const existingSession = state.characterSessions[uid];
  if (existingSession && existingSession.characterName && existingSession.characterName !== newCharacterName) {
    const timeSpentMs = timestamp - existingSession.startTime;
    const killsDelta = Math.max(0, currentKills - existingSession.startKills);
    const deathsDelta = Math.max(0, currentDeaths - existingSession.startDeaths);
    const assistsDelta = Math.max(0, currentAssists - existingSession.startAssists);
    
    // Only add to completed sessions if there was meaningful time spent
    if (timeSpentMs > 1000) { // At least 1 second
      state.completedSessions.push({
        uid,
        characterName: existingSession.characterName,
        timeSpentMs,
        kills: killsDelta,
        deaths: deathsDelta,
        assists: assistsDelta,
        timestamp: existingSession.startTime,
        isAlly: existingSession.isAlly,
      });
      
      logger.logMatchStats(
        {
          event: "character_session_completed",
          uid,
          characterName: existingSession.characterName,
          timeSpentMs,
          kills: killsDelta,
          deaths: deathsDelta,
          assists: assistsDelta,
          isAlly: existingSession.isAlly,
        },
        "matchStatsSlice.ts",
        "processCharacterSession"
      );
    }
  }
  
  // Start new session (only if character name is non-empty)
  if (newCharacterName) {
    state.characterSessions[uid] = {
      uid,
      characterName: newCharacterName,
      startTime: timestamp,
      startKills: currentKills,
      startDeaths: currentDeaths,
      startAssists: currentAssists,
      isAlly,
    };
  }
};

const completeMatchHandler = (state: MatchStoreState) => {
  const match = state.currentMatch;

  // Log match completion event
  logger.logInfo(
    {
      event: "complete_match",
      matchId: match.matchId,
      map: match.map,
      gameMode: match.gameMode,
      gameType: match.gameType,
      outcome: match.outcome,
      duration: match.timestamps.matchStart && match.timestamps.matchEnd
        ? match.timestamps.matchEnd - match.timestamps.matchStart
        : null,
      timestamp: Date.now()
    },
    "matchStatsSlice.ts",
    "completeMatch"
  );

  // Compute team stats
  for (const player of Object.values(match.players) as PlayerStats[]) {
    const team = match.teamStats[player.team] || {
      finalHits: 0,
      totalDamage: 0,
      totalBlocked: 0,
      totalHealing: 0,
    };

    team.finalHits += player.finalHits;
    team.totalDamage += player.damageDealt;
    team.totalBlocked += player.damageBlocked;
    team.totalHealing += player.totalHeal;

    match.teamStats[player.team] = team;
  }

  // Calculate each player's percentage contribution
  for (const player of Object.values(match.players) as PlayerStats[]) {
    const team = match.teamStats[player.team];
    player.pctTeamDamage =
      team.totalDamage > 0
        ? +((player.damageDealt / team.totalDamage) * 100).toFixed(1)
        : 0;
    player.pctTeamBlocked =
      team.totalBlocked > 0
        ? +((player.damageBlocked / team.totalBlocked) * 100).toFixed(1)
        : 0;
    player.pctTeamHealing =
      team.totalHealing > 0
        ? +((player.totalHeal / team.totalHealing) * 100).toFixed(1)
        : 0;
  }

  // Log final match stats
  logger.logMatchStats(
    {
      event: "final_match_stats",
      matchId: match.matchId,
      map: match.map,
      gameMode: match.gameMode,
      gameType: match.gameType,
      outcome: match.outcome,
      players: Object.values(match.players).map(player => ({
        uid: player.uid,
        name: player.name,
        team: player.team,
        character: player.characterName,
        isLocal: player.isLocal,
        isTeammate: player.isTeammate,
        stats: {
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          finalHits: player.finalHits,
          damageDealt: player.damageDealt,
          damageBlocked: player.damageBlocked,
          totalHeal: player.totalHeal,
          pctTeamDamage: player.pctTeamDamage,
          pctTeamBlocked: player.pctTeamBlocked,
          pctTeamHealing: player.pctTeamHealing,
        },
      })),
      teamStats: match.teamStats,
      timestamp: Date.now()
    },
    "matchStatsSlice.ts",
    "completeMatch"
  );
  // Preserve final match data in history
  const matchToSave = JSON.parse(JSON.stringify(state.currentMatch));
  state.matchHistory.push(matchToSave);
  
  // Log that we've saved match to history
  logger.logInfo(
    {
      event: "match_saved_to_history",
      matchId: matchToSave.matchId,
      historyLength: state.matchHistory.length,
      timestamp: Date.now()
    },
    "matchStatsSlice.ts",
    "completeMatchHandler"
  );
  
  // Instead of immediately resetting, we'll set a timeout to clear after 1 minute
  // The actual timeout is created in the reducer and stored in the state
  // We don't reset state.currentMatch here anymore
};

const matchStatsSlice = createSlice({
  name: "matchStats",
  initialState,
  reducers: {
    resetCurrentMatch(state) {
      logger.logInfo("Manually resetting current match", "matchStatsSlice.ts", "resetCurrentMatch");
      
      // Clear any pending timeout
      if (state.clearMatchTimeout !== null) {
        clearTimeout(state.clearMatchTimeout);
        state.clearMatchTimeout = null;
      }
      
      // Create completely fresh match state
      state.currentMatch = {
        matchId: null,
        map: null,
        gameType: null,
        gameMode: null,
        outcome: MatchOutcome.Unknown,
        players: {},
        teamStats: {},
        timestamps: {
          matchStart: null,
          matchEnd: null,
        },
        rounds: [],
      };
      
      // Reset character session tracking
      state.characterSessions = {};
      state.completedSessions = [];
    },

    processInfoUpdate(state, action: PayloadAction<any>) {
      const info = action.payload.info.info?.match_info || {};
      const timestamp = action.payload.timestamp || Date.now();
      
      // Log the info update to the info log file
      logger.logInfo(action.payload, "matchStatsSlice.ts", "processInfoUpdate");

      // Basic match info
      if (info.match_id) state.currentMatch.matchId = info.match_id;
      if (info.map) state.currentMatch.map = info.map;
      if (info.game_mode) state.currentMatch.gameMode = info.game_mode;
      if (info.game_type) state.currentMatch.gameType = info.game_type;
      if (info.match_outcome) state.currentMatch.outcome = info.match_outcome;      
      
      // Roster updates
      for (const [key, value] of Object.entries(info)) {

        if (key.startsWith("roster_")) {
          const data = JSON.parse(value as string);
          const uid = data.uid;
          const existing = state.currentMatch.players[uid] || {};

          if (timestamp > existing?.lastUpdated || !existing || existing?.lastUpdated == null) {
            // Track character session if character name is changing or this is first seen
            const oldCharacterName = existing.characterName;
            const newCharacterName = data.character_name;
            const currentKills = data.kills ?? existing.kills ?? 0;
            const currentDeaths = data.deaths ?? existing.deaths ?? 0;
            const currentAssists = data.assists ?? existing.assists ?? 0;
            
            // Process character session if we have a non-empty character name
            if (newCharacterName && (oldCharacterName !== newCharacterName)) {
              processCharacterSession(
                state,
                uid,
                newCharacterName,
                currentKills,
                currentDeaths,
                currentAssists,
                data.is_teammate,
                timestamp
              );
            }
            
            // Record ELO for local player at match start (once per match)
            if (
              data.is_local &&
              typeof data.elo_score === "number" &&
              !isNaN(data.elo_score) &&
              state.currentMatch.gameMode &&
              !state.hasRecordedEloForMatch
            ) {
              try {
                recordElo(data.elo_score, state.currentMatch.gameMode, state.currentMatch.matchId);
                state.hasRecordedEloForMatch = true;
                logger.logInfo(
                  {
                    event: "elo_recorded_for_match",
                    elo: data.elo_score,
                    gameMode: state.currentMatch.gameMode,
                    matchId: state.currentMatch.matchId,
                  },
                  "matchStatsSlice.ts",
                  "processInfoUpdate"
                );
              } catch (error) {
                logger.logError(
                  error as Error,
                  "matchStatsSlice.ts",
                  "processInfoUpdate_recordElo"
                );
              }
            }
            
            // Merge new roster data with any existing player state
            state.currentMatch.players[uid] = {
              ...existing,
              uid,
              name: data.name,
              characterName: data.character_name,
              characterId: data.character_id,
              team: data.team,
              isTeammate: data.is_teammate,
              isLocal: data.is_local,
              isAlive: data.is_alive,

              // KDA stats come from the roster, so just store them here
              kills: currentKills,
              deaths: currentDeaths,
              assists: currentAssists,

              // Only for teammates
              ultCharge: data.is_teammate ? data.ult_charge ?? 0 : null,

              // ELO tracking (most recent from match_info roster events)
              elo_score: data.elo_score,

              // Additional stats
              damageDealt: existing.damageDealt ?? 0,
              damageBlocked: existing.damageBlocked ?? 0,
              totalHeal: existing.totalHeal ?? 0,

              // Per-player contribution percentages
              pctTeamDamage: existing.pctTeamDamage ?? 0,
              pctTeamBlocked: existing.pctTeamBlocked ?? 0,
              pctTeamHealing: existing.pctTeamHealing ?? 0,

              // Keep track of who each player killed and who killed them
              killedPlayers: existing.killedPlayers || {},
              killedBy: existing.killedBy || {},
              finalHits: existing.finalHits ?? 0,
              characterSwaps: existing.characterSwaps ?? [],              
              lastUpdated: timestamp,
            };              
            
            // For newly detected players, check if we have recent data or fetch from API
            // if (isNewPlayer && data.name) {
            //   // Fetch player stats asynchronously
            //   // We can't await in a reducer, so we'll dispatch in a "fire and forget" manner
            //   getPlayerStats({ username: data.name })
            //     .then((apiData) => {
            //       if (apiData) {
            //         const source = 'lastUpdated' in apiData ? "cache" : "api";
            //         logger.logInfo(
            //           {
            //             event: "player_api_data_fetched",
            //             player: data.name,
            //             uid: data.uid,
            //             source: source,
            //             api_data: apiData
            //           },
            //           "matchStatsSlice.ts",
            //           "fetchPlayerApiData"
            //         );
                    
            //         console.log(`Received API data for player: ${data.name}`, apiData);
            //       }
            //     })
            //     .catch(err => {
            //       console.error(`Failed to fetch API data for player: ${data.name}`, err);
            //     });
            // }
          }
          if (existing.characterName && existing.characterName !== data.character_name) {
            // The player has switched characters
            const swap = {
              oldCharacterName: existing.characterName,
              newCharacterName: data.character_name,
              timestamp: Date.now(),
            };
            
            // Log character swaps to the match stats log
            logger.logMatchStats(
              { 
                event: "character_swap", 
                player: existing.name,
                uid: existing.uid,
                ...swap
              }, 
              "matchStatsSlice.ts", 
              "processInfoUpdate"
            );
            
            // Ensure we push into the up-to-date object stored in state
            const target = state.currentMatch.players[uid];
            if (!target.characterSwaps) {
              target.characterSwaps = [];
            }
            target.characterSwaps.push(swap);
          }
          // Then update the current characterName:
          existing.characterName = data.character_name;          
          console.log("Player roster updated:", state.currentMatch.players[uid]);
        }

        // Local player's extended stats (damage/healing)
        if (key === "player_stats") {
          const localPlayer = Object.values(state.currentMatch.players).find(
            (p) => p.isLocal
          );
          if (localPlayer && typeof value === "object" && value !== null) {
            const stats = value as Record<string, any>;
            
            // Keep track of previous values for logging
            const prevStats = {
              damageDealt: localPlayer.damageDealt,
              damageBlocked: localPlayer.damageBlocked,
              totalHeal: localPlayer.totalHeal
            };
            
            // Update local player stats
            localPlayer.damageDealt = stats.damage_dealt ?? 0;
            localPlayer.damageBlocked = stats.damage_block ?? 0;
            localPlayer.totalHeal = stats.total_heal ?? 0;
            
            // Log local player stat updates to the match stats log if there are changes
            if (prevStats.damageDealt !== localPlayer.damageDealt ||
                prevStats.damageBlocked !== localPlayer.damageBlocked ||
                prevStats.totalHeal !== localPlayer.totalHeal) {
              
              logger.logMatchStats(
                {
                  event: "player_stats_update",
                  player: localPlayer.name,
                  uid: localPlayer.uid,
                  currentStats: {
                    damageDealt: localPlayer.damageDealt,
                    damageBlocked: localPlayer.damageBlocked,
                    totalHeal: localPlayer.totalHeal
                  },
                  previousStats: prevStats,
                  delta: {
                    damageDealt: localPlayer.damageDealt - prevStats.damageDealt,
                    damageBlocked: localPlayer.damageBlocked - prevStats.damageBlocked,
                    totalHeal: localPlayer.totalHeal - prevStats.totalHeal
                  }
                },
                "matchStatsSlice.ts",
                "processInfoUpdate"
              );
            }
            
            console.log("Local player stats updated:", localPlayer);
          }
        }
      }
    },

    processEvents(state, action: PayloadAction<any>) {
      // Fix for "n is not iterable" error
      // Safely extract events ensuring we always have an array to iterate over
      let eventsToProcess = [];
      
      if (action.payload) {
        if (action.payload.events) {
          // Handle both array and non-array events property
          if (Array.isArray(action.payload.events)) {
            eventsToProcess = action.payload.events;
          } else if (action.payload.events.events && Array.isArray(action.payload.events.events)) {
            // Handle nested events array
            eventsToProcess = action.payload.events.events;
          } else {
            // Handle single event object
            eventsToProcess = [action.payload.events];
          }
        } else {
          // If no events property but payload exists, treat it as a single event
          eventsToProcess = [action.payload];
        }
      }
      
      // Log all events to the events log file
      logger.logEvents(action.payload, "matchStatsSlice.ts", "processEvents");
      console.log("Processing events:", eventsToProcess, action);

      for (const event of eventsToProcess) {
        // Handle cases where the event might be wrapped in another object
        const eventData = event.name ? event : (event.data ? event.data : event);
        const eventName = eventData.name || 'unknown';
        const eventContent = eventData.data || eventData;
        
        switch (eventName) {
          case "kill_feed": 
            try {
              const data = typeof eventContent === 'string' ? JSON.parse(eventContent) : eventContent;
              
              // Store the last few kill IDs to prevent duplicates (using a simple approach)
              if (!state.lastKillEvents) {
                state.lastKillEvents = [];
              }
              
              // Check if this exact kill event was processed very recently
              // Use a small window to avoid skipping legitimate rapid consecutive kills (e.g., double-kills)
              // If the event provides its own timestamp, prefer that for deduplication accuracy.
              const DUPLICATE_KILL_WINDOW_MS = 100; // tuned down from 500ms to allow quick real kills
              const eventTimestamp = (data && (data.timestamp || data.time)) ? Number(data.timestamp || data.time) : Date.now();

              const recentKill = state.lastKillEvents.find(
                (event: { attacker: string; victim: string; timestamp: number }) =>
                  event.attacker === data.attacker &&
                  event.victim === data.victim &&
                  (Date.now() - event.timestamp) < DUPLICATE_KILL_WINDOW_MS
              );

              if (recentKill) {
                console.log("Duplicate kill_feed event detected (within short window), skipping:", data);
                break;
              }

              // Add this event to the recent events list
              state.lastKillEvents.push({
                attacker: data.attacker,
                victim: data.victim,
                timestamp: eventTimestamp
              });
              
              // Keep only the last 10 events to prevent memory bloat
              if (state.lastKillEvents.length > 10) {
                state.lastKillEvents = state.lastKillEvents.slice(-10);
              }
              
              // Helper function to find player by name or character name (for AI players)
              const findPlayer = (nameToFind: string) => {
                return Object.values(state.currentMatch.players).find((p) => {
                  // First try exact name match (for human players)
                  if (p.name === nameToFind) return true;
                  
                  // For AI players, try matching character name with/without difficulty suffix
                  if (p.characterName) {
                    // Remove difficulty suffixes like "-Easy", "-Normal", "-Hard"
                    const cleanName = nameToFind.replace(/-(?:Easy|Normal|Hard)$/, '');
                    if (p.characterName === cleanName) return true;
                  }
                  
                  return false;
                });
              };
              
              const attacker = findPlayer(data.attacker);
              const victim = findPlayer(data.victim);
              console.log("Kill feed event:", data);
              console.log("Found attacker:", attacker ? `${attacker.name} (${attacker.characterName})` : 'NOT FOUND');
              console.log("Found victim:", victim ? `${victim.name} (${victim.characterName})` : 'NOT FOUND');
            
              // finalHits, plus tracking "who killed who"
              if (attacker && victim) {
                // Skip same-team events (common for revives or friendly interactions)
                // to avoid counting revives as final hits.
                if (attacker.team === victim.team) {
                  console.log("kill_feed event ignored because attacker and victim are on same team (likely revive):", data);
                  break;
                }

                // Track final hits for cross-team kills
                attacker.finalHits += 1;

                // Increment how many times the attacker has killed the victim
                if (!attacker.killedPlayers[victim.uid]) {
                  attacker.killedPlayers[victim.uid] = 0;
                }
                attacker.killedPlayers[victim.uid]++;

                // Conversely, increment how many times the victim was killed by attacker
                if (!victim.killedBy[attacker.uid]) {
                  victim.killedBy[attacker.uid] = 0;
                }
                victim.killedBy[attacker.uid]++;

                // Log the kill event to match stats
                logger.logMatchStats(
                  {
                    event: "kill",
                    attacker: {
                      name: attacker.name,
                      uid: attacker.uid,
                      team: attacker.team,
                      character: attacker.characterName
                    },
                    victim: {
                      name: victim.name,
                      uid: victim.uid,
                      team: victim.team,
                      character: victim.characterName
                    },
                    timestamp: Date.now()
                  },
                  "matchStatsSlice.ts",
                  "processEvents"
                );
              }
            } catch (error) {
              console.error("Failed to process kill_feed event:", error);
            }
            break;
            
          case "match_start":
            // If there's a pending timeout to clear match stats, clear it as new match is starting
            if (state.clearMatchTimeout !== null) {
              clearTimeout(state.clearMatchTimeout);
              state.clearMatchTimeout = null;
            }
            
            // Reset match stats for a new match, but preserve any
            // already-known match info (map, gameType, gameMode, matchId)
            // that may have arrived slightly before the match_start event.
            // This avoids losing these fields if Overwolf sends them earlier.
            state.currentMatch = {
              matchId: null,
              map: state.currentMatch.map || null,
              gameType: state.currentMatch.gameType || null,
              gameMode: state.currentMatch.gameMode || null,
              outcome: MatchOutcome.Unknown,
              players: {},
              teamStats: {},
              timestamps: {
                matchStart: Date.now(),
                matchEnd: null,
              },
              rounds: [],
            };
            
            // Reset character session tracking
            state.characterSessions = {};
            state.completedSessions = [];
            
            // Reset flag to track if we've recorded ELO for this match
            state.hasRecordedEloForMatch = false;
            
            logger.logInfo(
              {
                event: "match_start",
                message: "Fresh match state created (preserved map/mode/type if known)",
                timestamp: state.currentMatch.timestamps.matchStart
              },
              "matchStatsSlice.ts",
              "processEvents"
            );
            break;

          case "round_start":
            // If the match hasn't officially started yet (no matchStart timestamp), set it now
            // This ensures the UI treats the match as live even if match_start was delayed
            if (state.currentMatch.timestamps.matchStart === null) {
              state.currentMatch.timestamps.matchStart = Date.now();
              // Ensure matchEnd is null when we set matchStart
              state.currentMatch.timestamps.matchEnd = null;
            }
            // On round start, snapshot previous round stats if there was any activity
            try {
              if (hasRoundActivity(state.currentMatch)) {
                const snapshot = buildRoundSnapshot(state.currentMatch);
                state.currentMatch.rounds.push(snapshot);
                logger.logMatchStats(
                  {
                    event: "round_snapshot_captured",
                    roundsCount: state.currentMatch.rounds.length,
                    timestamp: Date.now()
                  },
                  "matchStatsSlice.ts",
                  "processEvents"
                );
              }
            } catch (e) {
              logger.logError(e as Error, "matchStatsSlice.ts", "round_start_snapshot");
            }
            // Do not reset stats automatically on round start; manual reset if desired.
            logger.logInfo(
              {
                event: "round_start",
                message: "Round started - stats persist across rounds",
                matchId: state.currentMatch.matchId,
                timestamp: Date.now()
              },
              "matchStatsSlice.ts",
              "processEvents"
            );
            break;
              
          case "match_end":
            // Capture final round snapshot before computing final match
            try {
              if (hasRoundActivity(state.currentMatch)) {
                const snapshot = buildRoundSnapshot(state.currentMatch);
                state.currentMatch.rounds.push(snapshot);
                logger.logMatchStats(
                  {
                    event: "final_round_snapshot_captured",
                    roundsCount: state.currentMatch.rounds.length,
                    timestamp: Date.now()
                  },
                  "matchStatsSlice.ts",
                  "processEvents"
                );
              }
            } catch (e) {
              logger.logError(e as Error, "matchStatsSlice.ts", "match_end_snapshot");
            }
            
            const matchEndTime = Date.now();
            state.currentMatch.timestamps.matchEnd = matchEndTime;
            
            // Finalize all active character sessions
            for (const [uid, session] of Object.entries(state.characterSessions)) {
              if (session && session.characterName) {
                const player = state.currentMatch.players[uid];
                if (player) {
                  const timeSpentMs = matchEndTime - session.startTime;
                  const killsDelta = Math.max(0, player.kills - session.startKills);
                  const deathsDelta = Math.max(0, player.deaths - session.startDeaths);
                  const assistsDelta = Math.max(0, player.assists - session.startAssists);
                  
                  // Only add if meaningful time spent
                  if (timeSpentMs > 1000) {
                    state.completedSessions.push({
                      uid,
                      characterName: session.characterName,
                      timeSpentMs,
                      kills: killsDelta,
                      deaths: deathsDelta,
                      assists: assistsDelta,
                      timestamp: session.startTime,
                      isAlly: session.isAlly,
                    });
                  }
                }
              }
            }
            
            logger.logInfo(
              {
                event: "match_end",
                matchId: state.currentMatch.matchId,
                map: state.currentMatch.map,
                gameMode: state.currentMatch.gameMode,
                gameType: state.currentMatch.gameType,
                outcome: state.currentMatch.outcome,
                duration: state.currentMatch.timestamps.matchStart 
                  ? state.currentMatch.timestamps.matchEnd - state.currentMatch.timestamps.matchStart
                  : null,
                completedSessions: state.completedSessions.length,
                timestamp: state.currentMatch.timestamps.matchEnd
              },
              "matchStatsSlice.ts",
              "processEvents"
            );
            
            // We still need to calculate final stats and add to history
            // The completeMatchThunk will be dispatched from the background component
            completeMatchHandler(state);
            break;

          default:
            // Log any other game events we receive
            logger.logEvents(
              {
                event_name: eventName,
                event_data: eventContent,
                timestamp: Date.now()
              },
              "matchStatsSlice.ts",
              "processEvents"
            );
            break;
        }
      }    
    },
    
    completeMatch: completeMatchHandler,
    
    // New action to set the timeout for clearing match stats
    setMatchClearTimeout(state, action: PayloadAction<number>) {
      // Clear any existing timeout first
      if (state.clearMatchTimeout !== null) {
        clearTimeout(state.clearMatchTimeout);
      }
      state.clearMatchTimeout = action.payload;
    },
    
    // New action to clear the timeout and reset match stats
    clearMatchTimeoutAction(state) {
      if (state.clearMatchTimeout !== null) {
        clearTimeout(state.clearMatchTimeout);
        state.clearMatchTimeout = null;
      }
      
      // Create completely fresh match state
      state.currentMatch = {
        matchId: null,
        map: null,
        gameType: null,
        gameMode: null,
        outcome: MatchOutcome.Unknown,
        players: {},
        teamStats: {},
        timestamps: {
          matchStart: null,
          matchEnd: null,
        },
        rounds: [],
      };
      
      // Reset character session tracking
      state.characterSessions = {};
      state.completedSessions = [];
      
      logger.logInfo(
        {
          event: "match_stats_cleared_by_timeout",
          timestamp: Date.now()
        },
        "matchStatsSlice.ts",
        "clearMatchTimeoutAction"
      );
    },
    
    // Force immediate reset - useful for debugging or manual reset
    forceResetMatch(state) {
      // Clear any pending timeout
      if (state.clearMatchTimeout !== null) {
        clearTimeout(state.clearMatchTimeout);
        state.clearMatchTimeout = null;
      }
      
      // Create completely fresh match state
      state.currentMatch = {
        matchId: null,
        map: null,
        gameType: null,
        gameMode: null,
        outcome: MatchOutcome.Unknown,
        players: {},
        teamStats: {},
        timestamps: {
          matchStart: null,
          matchEnd: null,
        },
        rounds: [],
      };
      
      // Reset character session tracking
      state.characterSessions = {};
      state.completedSessions = [];
      
      logger.logInfo(
        {
          event: "match_stats_force_reset",
          timestamp: Date.now()
        },
        "matchStatsSlice.ts",
        "forceResetMatch"
      );
    },

    // Reset round stats while preserving match info - useful for manual round reset
    resetRoundStats(state) {
      // Reset player stats for new round while preserving match info and player roster
      Object.values(state.currentMatch.players).forEach((player) => {
        // Reset round-specific stats but keep player identity and character info
        player.kills = 0;
        player.deaths = 0;
        player.assists = 0;
        player.finalHits = 0;
        player.damageDealt = 0;
        player.damageBlocked = 0;
        player.totalHeal = 0;
        player.pctTeamDamage = 0;
        player.pctTeamBlocked = 0;
        player.pctTeamHealing = 0;
        player.killedPlayers = {};
        player.killedBy = {};
        // Keep character swaps and other persistent data
      });
      
      // Reset team stats
      state.currentMatch.teamStats = {};
      
      logger.logInfo(
        {
          event: "round_stats_manual_reset",
          message: "Round stats manually reset",
          matchId: state.currentMatch.matchId,
          playersReset: Object.keys(state.currentMatch.players).length,
          timestamp: Date.now()
        },
        "matchStatsSlice.ts",
        "resetRoundStats"
      );
    },
    
    // Manually capture a per-round snapshot of current stats
    captureRoundSnapshot(state) {
      try {
        if (hasRoundActivity(state.currentMatch)) {
          const snapshot = buildRoundSnapshot(state.currentMatch);
          state.currentMatch.rounds.push(snapshot);
          logger.logMatchStats(
            {
              event: "round_snapshot_captured_manual",
              roundsCount: state.currentMatch.rounds.length,
              timestamp: Date.now()
            },
            "matchStatsSlice.ts",
            "captureRoundSnapshot"
          );
        }
      } catch (e) {
        logger.logError(e as Error, "matchStatsSlice.ts", "captureRoundSnapshot");
      }
    },
    
    // Developer helper: inject a character swap for testing
    devAddCharacterSwap(state, action: PayloadAction<{ uid: string; name: string; oldCharacterName: string; newCharacterName: string; team: number; timestamp?: number }>) {
      const { uid, name, oldCharacterName, newCharacterName, team, timestamp } = action.payload;
      const ts = timestamp ?? Date.now();
      const existing = state.currentMatch.players[uid] || null;
      if (!existing) {
        // Create a minimal player record so swapQueue picks it up
        state.currentMatch.players[uid] = {
          uid,
          name,
          characterName: newCharacterName,
          characterId: newCharacterName ? `dev_${newCharacterName}` : null,
          team,
          isTeammate: team === 1,
          isLocal: false,
          kills: 0,
          deaths: 0,
          assists: 0,
          finalHits: 0,
          damageDealt: 0,
          damageBlocked: 0,
          totalHeal: 0,
          killedPlayers: {},
          killedBy: {},
          characterSwaps: [],
          lastUpdated: ts,
        } as any;
      }
      const target = state.currentMatch.players[uid];
      if (!target.characterSwaps) target.characterSwaps = [];
      target.characterSwaps.push({ oldCharacterName, newCharacterName, timestamp: ts });
    },
    
    // Developer helper: clear all developer-injected swaps
    devClearCharacterSwaps(state) {
      for (const uid of Object.keys(state.currentMatch.players)) {
        const p = state.currentMatch.players[uid];
        if (p && p.characterSwaps && p.characterSwaps.length > 0) {
          p.characterSwaps = [];
        }
      }
    },
    
    // Developer helper: set match info (map/mode/type) for preview
    devSetMatchInfo(state, action: PayloadAction<{ map?: string | null; gameMode?: string | null; gameType?: string | null }>) {
      const { map = null, gameMode = null, gameType = null } = action.payload;
      state.currentMatch.map = map;
      state.currentMatch.gameMode = gameMode;
      state.currentMatch.gameType = gameType;
      // If we're setting a map or mode for developer preview, allow forcing the match-info
      state.currentMatch.devForceShowMatchInfo = !!(map || gameMode || gameType);
    },
    // Developer helper: clear any dev-forced match info
    devClearMatchInfo(state) {
      if (state.currentMatch) {
        state.currentMatch.devForceShowMatchInfo = false;
      }
    },
    // Developer helper: set swap display duration (milliseconds)
    devSetSwapDisplayDuration(state, action: PayloadAction<number | null>) {
      if (state.currentMatch) {
        state.currentMatch.devSwapDisplayDuration = action.payload;
      }
    },
    // Developer helper: clear swap display duration override
    devClearSwapDisplayDuration(state) {
      if (state.currentMatch) {
        state.currentMatch.devSwapDisplayDuration = null;
      }
    },
    // Developer helper: set max number of visible swaps
    devSetMaxVisibleSwaps(state, action: PayloadAction<number | null>) {
      if (state.currentMatch) {
        state.currentMatch.devMaxVisibleSwaps = action.payload;
      }
    },
    // Developer helper: clear max visible swaps override
    devClearMaxVisibleSwaps(state) {
      if (state.currentMatch) {
        state.currentMatch.devMaxVisibleSwaps = null;
      }
    },
    // (deprecated) devForceShowSwapBar removed; prefer devSwapDisplayDuration
  },
});

export const {
  resetCurrentMatch,
  processInfoUpdate,
  processEvents,
  completeMatch,
  setMatchClearTimeout,
  clearMatchTimeoutAction,
  forceResetMatch,
  resetRoundStats,
  captureRoundSnapshot,
  // Developer test helpers
  devAddCharacterSwap,
  devClearCharacterSwaps,
  devSetMatchInfo,
  devClearMatchInfo,
  devSetSwapDisplayDuration,
  devClearSwapDisplayDuration,
  devSetMaxVisibleSwaps,
  devClearMaxVisibleSwaps,
} = matchStatsSlice.actions;

export default matchStatsSlice.reducer;
