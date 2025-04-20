import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logger } from "lib/log";
import { isDev } from "lib/utils";
import {
  MatchOutcome,
  MatchStatsState,
  MatchStoreState,
  PlayerStats,  // Uncommented this line
  TeamStats
} from "../types/matchStatsTypes";

// Only try to initialize the logger with overwolf in production environment
// In development, the logger will work without initialization or use console
if (typeof overwolf !== 'undefined') {
  logger.init(overwolf).catch(err => console.error("Failed to initialize logger:", err));
} else if (isDev) {
  // In dev mode, just log to console without using overwolf
  console.log("Running in development mode, logger will use console only");
}

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
};

const initialState: MatchStoreState = {
  currentMatch: initialMatchStatsState,
  matchHistory: [],
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

  // Preserve final match data and reset
  state.matchHistory.push(JSON.parse(JSON.stringify(state.currentMatch)));
  state.currentMatch = { ...initialMatchStatsState };
};


const matchStatsSlice = createSlice({
  name: "matchStats",
  initialState,
  reducers: {
    resetCurrentMatch(state) {
      logger.logInfo("Resetting current match", "matchStatsSlice.ts", "resetCurrentMatch");
      state.currentMatch = { ...initialMatchStatsState };
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
              kills: data.kills ?? existing.kills ?? 0,
              deaths: data.deaths ?? existing.deaths ?? 0,
              assists: data.assists ?? existing.assists ?? 0,

              // Only for teammates
              ultCharge: data.is_teammate ? data.ult_charge ?? 0 : null,

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
            
            existing.characterSwaps.push(swap);
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
              const attacker = Object.values(state.currentMatch.players).find(
                (p) => p.name === data.attacker
              );
              const victim = Object.values(state.currentMatch.players).find(
                (p) => p.name === data.victim
              );
              console.log("Kill feed event:", data, attacker, victim);
            
              // finalHits, plus tracking "who killed who"
              if (attacker && victim) {
                // Track final hits for ALL players, not just teammates
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
            state.currentMatch.timestamps.matchStart = Date.now();
            logger.logInfo(
              {
                event: "match_start",
                matchId: state.currentMatch.matchId,
                map: state.currentMatch.map,
                gameMode: state.currentMatch.gameMode,
                gameType: state.currentMatch.gameType,
                timestamp: state.currentMatch.timestamps.matchStart
              },
              "matchStatsSlice.ts",
              "processEvents"
            );
            break;
            
          case "match_end":
            state.currentMatch.timestamps.matchEnd = Date.now();
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
                timestamp: state.currentMatch.timestamps.matchEnd
              },
              "matchStatsSlice.ts",
              "processEvents"
            );
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
    completeMatch: completeMatchHandler

    
  },
});

export const {
  resetCurrentMatch,
  processInfoUpdate,
  processEvents,
  completeMatch
} = matchStatsSlice.actions;

export default matchStatsSlice.reducer;
