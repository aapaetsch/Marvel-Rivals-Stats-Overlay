import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logger } from "lib/log";

// Type definitions
export interface RecentPlayer {
  uid: string;
  name: string;
  lastSeen: number; // timestamp
  teamsWithCount: number;
  teamsAgainstCount: number;
  characterNames: string[]; // Most recent characters used by this player
}

export interface RecentPlayersState {
  players: Record<string, RecentPlayer>;
}

// Initial state
const initialState: RecentPlayersState = {
  players: {},
};

// Create slice
const recentPlayersSlice = createSlice({
  name: "recentPlayers",
  initialState,
  reducers: {
    // Add a single player
    addRecentPlayer(state, action: PayloadAction<{
      uid: string;
      name: string;
      characterName: string;
      isTeammate: boolean;
    }>) {
      const { uid, name, characterName, isTeammate } = action.payload;
      const now = Date.now();
      
      // If player already exists, update their record
      if (state.players[uid]) {
        const player = state.players[uid];
        player.lastSeen = now;
        player.name = name; // Update name in case it changed (e.g., from streamer mode)
        
        // Update team counts
        if (isTeammate) {
          player.teamsWithCount += 1;
        } else {
          player.teamsAgainstCount += 1;
        }
        
        // Update character list (add if not already in list)
        if (!player.characterNames.includes(characterName)) {
          // Keep only last 5 characters
          if (player.characterNames.length >= 5) {
            player.characterNames.pop();
          }
          player.characterNames.unshift(characterName);
        }
      } 
      // Otherwise create a new record
      else {
        state.players[uid] = {
          uid,
          name,
          lastSeen: now,
          teamsWithCount: isTeammate ? 1 : 0,
          teamsAgainstCount: isTeammate ? 0 : 1,
          characterNames: characterName ? [characterName] : [],
        };
      }
      
      // Log to console for debugging
      logger.logInfo(
        {
          event: "add_recent_player",
          player: state.players[uid],
          timestamp: now
        },
        "recentPlayersSlice.ts",
        "addRecentPlayer"
      );
    },
    
    // Add multiple players from a match
    addRecentPlayersFromMatch(state, action: PayloadAction<{
      players: Array<{
        uid: string;
        name: string;
        characterName: string;
        isTeammate: boolean;
      }>;
    }>) {
      const { players } = action.payload;
      
      // Process each player
      players.forEach(player => {
        const { uid, name, characterName, isTeammate } = player;
        const now = Date.now();
        
        if (state.players[uid]) {
          const existingPlayer = state.players[uid];
          existingPlayer.lastSeen = now;
          existingPlayer.name = name;
          
          if (isTeammate) {
            existingPlayer.teamsWithCount += 1;
          } else {
            existingPlayer.teamsAgainstCount += 1;
          }
          
          if (!existingPlayer.characterNames.includes(characterName)) {
            if (existingPlayer.characterNames.length >= 5) {
              existingPlayer.characterNames.pop();
            }
            existingPlayer.characterNames.unshift(characterName);
          }
        } else {
          state.players[uid] = {
            uid,
            name,
            lastSeen: now,
            teamsWithCount: isTeammate ? 1 : 0,
            teamsAgainstCount: isTeammate ? 0 : 1,
            characterNames: characterName ? [characterName] : [],
          };
        }
      });
      
      logger.logInfo(
        {
          event: "add_recent_players_from_match",
          count: players.length,
          timestamp: Date.now()
        },
        "recentPlayersSlice.ts",
        "addRecentPlayersFromMatch"
      );
    },
    
    // Clear recent players older than a certain time
    clearOldPlayers(state, action: PayloadAction<{ maxAgeDays: number }>) {
      const { maxAgeDays } = action.payload;
      const now = Date.now();
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
      
      const oldPlayerIds = Object.keys(state.players).filter(
        uid => now - state.players[uid].lastSeen > maxAgeMs
      );
      
      oldPlayerIds.forEach(uid => {
        delete state.players[uid];
      });
      
      logger.logInfo(
        {
          event: "clear_old_players",
          removed_count: oldPlayerIds.length,
          max_age_days: maxAgeDays,
          timestamp: now
        },
        "recentPlayersSlice.ts",
        "clearOldPlayers"
      );
    }
  },
});

export const {
  addRecentPlayer,
  addRecentPlayersFromMatch,
  clearOldPlayers,
} = recentPlayersSlice.actions;

export default recentPlayersSlice.reducer;