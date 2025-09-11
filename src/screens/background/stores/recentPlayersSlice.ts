import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logger } from "lib/log";

// Type definitions
export interface RecentPlayer {
  uid: string;
  name: string;
  lastSeen: number; // timestamp
  teamsWithCount: number;
  teamsWithWins: number;
  teamsWithLosses: number;
  teamsAgainstCount: number;
  teamsAgainstWins: number;
  teamsAgainstLosses: number;
  charactersAsAlly: string[]; // Characters played as teammate
  charactersAsOpponent: string[]; // Characters played as opponent
  // Per-character W/L tracking
  allyCharacterStats?: Record<string, { count: number; wins: number; losses: number }>;
  opponentCharacterStats?: Record<string, { count: number; wins: number; losses: number }>;
  isFavorited: boolean;
  favoriteOrder: number; // For custom ordering of favorites (lower = higher priority)
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
      matchOutcome: string;
    }>) {
      const { uid, name, characterName, isTeammate, matchOutcome } = action.payload;
      const now = Date.now();
      const isVictory = matchOutcome === "Victory";
      const isDefeat = matchOutcome === "Defeat";
      
      // If player already exists, update their record
      if (state.players[uid]) {
        const player = state.players[uid];
        player.lastSeen = now;
        player.name = name; // Update name in case it changed (e.g., from streamer mode)
        // Ensure arrays/maps exist for older stored data
        player.charactersAsAlly = player.charactersAsAlly || [];
        player.charactersAsOpponent = player.charactersAsOpponent || [];
        player.allyCharacterStats = player.allyCharacterStats || {};
        player.opponentCharacterStats = player.opponentCharacterStats || {};
        
        // Update team counts and win/loss records
        if (isTeammate) {
          player.teamsWithCount += 1;
          
          // Update win/loss as teammate
          if (isVictory) {
            player.teamsWithWins += 1;
          } else if (isDefeat) {
            player.teamsWithLosses += 1;
          }
          
          // Update characters played as teammate
          if (characterName && !player.charactersAsAlly.includes(characterName)) {
            // Keep only last 5 characters
            if (player.charactersAsAlly.length >= 5) {
              player.charactersAsAlly.pop();
            }
            player.charactersAsAlly.unshift(characterName);
          }
          // Update per-character ally W/L stats
          if (characterName) {
            const s = player.allyCharacterStats![characterName] || { count: 0, wins: 0, losses: 0 };
            s.count += 1;
            if (isVictory) s.wins += 1; else if (isDefeat) s.losses += 1;
            player.allyCharacterStats![characterName] = s;
          }
        } else {
          player.teamsAgainstCount += 1;
          
          // Update win/loss as opponent (invert local player's outcome)
          if (isVictory) {
            player.teamsAgainstLosses += 1; // We won, they lost
          } else if (isDefeat) {
            player.teamsAgainstWins += 1; // We lost, they won
          }
          
          // Update characters played as opponent
          if (characterName && !player.charactersAsOpponent.includes(characterName)) {
            // Keep only last 5 characters
            if (player.charactersAsOpponent.length >= 5) {
              player.charactersAsOpponent.pop();
            }
            player.charactersAsOpponent.unshift(characterName);
          }
          // Update per-character opponent W/L stats (invert local outcome)
          if (characterName) {
            const s = player.opponentCharacterStats![characterName] || { count: 0, wins: 0, losses: 0 };
            s.count += 1;
            if (isVictory) s.losses += 1; else if (isDefeat) s.wins += 1;
            player.opponentCharacterStats![characterName] = s;
          }
        }

        // Sanity: enforce losses = count - wins to avoid drift
        player.teamsWithLosses = Math.max(0, player.teamsWithCount - player.teamsWithWins);
        player.teamsAgainstLosses = Math.max(0, player.teamsAgainstCount - player.teamsAgainstWins);
      } 
      // Otherwise create a new record
      else {
        state.players[uid] = {
          uid,
          name,
          lastSeen: now,
          teamsWithCount: isTeammate ? 1 : 0,
          teamsWithWins: isTeammate && isVictory ? 1 : 0,
          teamsWithLosses: isTeammate && isDefeat ? 1 : 0,
          teamsAgainstCount: isTeammate ? 0 : 1,
          teamsAgainstWins: !isTeammate && isDefeat ? 1 : 0, // We lost, they won
          teamsAgainstLosses: !isTeammate && isVictory ? 1 : 0, // We won, they lost
          charactersAsAlly: isTeammate && characterName ? [characterName] : [],
          charactersAsOpponent: !isTeammate && characterName ? [characterName] : [],
          allyCharacterStats: isTeammate && characterName ? { [characterName]: { count: 1, wins: isVictory ? 1 : 0, losses: isDefeat ? 1 : 0 } } : {},
          opponentCharacterStats: !isTeammate && characterName ? { [characterName]: { count: 1, wins: isDefeat ? 1 : 0, losses: isVictory ? 1 : 0 } } : {},
          isFavorited: false,
          favoriteOrder: 0,
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
      matchOutcome: string;
    }>) {
      const { players, matchOutcome } = action.payload;
      const isVictory = matchOutcome === "Victory";
      const isDefeat = matchOutcome === "Defeat";
      
      // Process each player
      players.forEach(player => {
        const { uid, name, characterName, isTeammate } = player;
        const now = Date.now();
        
        if (state.players[uid]) {
          const existingPlayer = state.players[uid];
          existingPlayer.lastSeen = now;
          existingPlayer.name = name;
          // Ensure arrays exist for older stored data
          existingPlayer.charactersAsAlly = existingPlayer.charactersAsAlly || [];
          existingPlayer.charactersAsOpponent = existingPlayer.charactersAsOpponent || [];
          existingPlayer.allyCharacterStats = existingPlayer.allyCharacterStats || {};
          existingPlayer.opponentCharacterStats = existingPlayer.opponentCharacterStats || {};
          
          // Update team counts and win/loss records
          if (isTeammate) {
            existingPlayer.teamsWithCount += 1;
            
            // Update win/loss as teammate
            if (isVictory) {
              existingPlayer.teamsWithWins += 1;
            } else if (isDefeat) {
              existingPlayer.teamsWithLosses += 1;
            }
            
            // Update characters played as teammate
            if (characterName && !existingPlayer.charactersAsAlly.includes(characterName)) {
              if (existingPlayer.charactersAsAlly.length >= 5) {
                existingPlayer.charactersAsAlly.pop();
              }
              existingPlayer.charactersAsAlly.unshift(characterName);
            }
            // Update per-character ally W/L stats
            if (characterName) {
              const s = existingPlayer.allyCharacterStats![characterName] || { count: 0, wins: 0, losses: 0 };
              s.count += 1;
              if (isVictory) s.wins += 1; else if (isDefeat) s.losses += 1;
              existingPlayer.allyCharacterStats![characterName] = s;
            }
          } else {
            existingPlayer.teamsAgainstCount += 1;
            
            // Update win/loss as opponent (invert local player's outcome)
            if (isVictory) {
              existingPlayer.teamsAgainstLosses += 1; // We won, they lost
            } else if (isDefeat) {
              existingPlayer.teamsAgainstWins += 1; // We lost, they won
            }
            
            // Update characters played as opponent
            if (characterName && !existingPlayer.charactersAsOpponent.includes(characterName)) {
              if (existingPlayer.charactersAsOpponent.length >= 5) {
                existingPlayer.charactersAsOpponent.pop();
              }
              existingPlayer.charactersAsOpponent.unshift(characterName);
            }
            // Update per-character opponent W/L stats (invert local outcome)
            if (characterName) {
              const s = existingPlayer.opponentCharacterStats![characterName] || { count: 0, wins: 0, losses: 0 };
              s.count += 1;
              if (isVictory) s.losses += 1; else if (isDefeat) s.wins += 1;
              existingPlayer.opponentCharacterStats![characterName] = s;
            }
          }

          // Sanity: enforce losses = count - wins to avoid drift
          existingPlayer.teamsWithLosses = Math.max(0, existingPlayer.teamsWithCount - existingPlayer.teamsWithWins);
          existingPlayer.teamsAgainstLosses = Math.max(0, existingPlayer.teamsAgainstCount - existingPlayer.teamsAgainstWins);
        } else {
          state.players[uid] = {
            uid,
            name,
            lastSeen: now,
            teamsWithCount: isTeammate ? 1 : 0,
            teamsWithWins: isTeammate && isVictory ? 1 : 0,
            teamsWithLosses: isTeammate && isDefeat ? 1 : 0,
            teamsAgainstCount: isTeammate ? 0 : 1,
            teamsAgainstWins: !isTeammate && isDefeat ? 1 : 0, // We lost, they won
            teamsAgainstLosses: !isTeammate && isVictory ? 1 : 0, // We won, they lost
            charactersAsAlly: isTeammate && characterName ? [characterName] : [],
            charactersAsOpponent: !isTeammate && characterName ? [characterName] : [],
            allyCharacterStats: isTeammate && characterName ? { [characterName]: { count: 1, wins: isVictory ? 1 : 0, losses: isDefeat ? 1 : 0 } } : {},
            opponentCharacterStats: !isTeammate && characterName ? { [characterName]: { count: 1, wins: isDefeat ? 1 : 0, losses: isVictory ? 1 : 0 } } : {},
            isFavorited: false,
            favoriteOrder: 0,
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
    
    // Toggle player favorite status
    togglePlayerFavorite(state, action: PayloadAction<{ uid: string; maxFavorites?: number }>) {
      const { uid, maxFavorites = 15 } = action.payload;
      const player = state.players[uid];
      
      if (player) {
        if (player.isFavorited) {
          // Unfavorite the player
          player.isFavorited = false;
          player.favoriteOrder = 0;
          
          logger.logInfo(
            {
              event: "player_unfavorited",
              player: player.name,
              uid: uid,
              timestamp: Date.now()
            },
            "recentPlayersSlice.ts",
            "togglePlayerFavorite"
          );
        } else {
          // Check if we can add more favorites
          const currentFavorites = Object.values(state.players).filter(p => p.isFavorited);
          if (currentFavorites.length < maxFavorites) {
            player.isFavorited = true;
            // Set favorite order to current timestamp for newest-first ordering
            player.favoriteOrder = Date.now();
            
            logger.logInfo(
              {
                event: "player_favorited",
                player: player.name,
                uid: uid,
                favoriteCount: currentFavorites.length + 1,
                timestamp: Date.now()
              },
              "recentPlayersSlice.ts",
              "togglePlayerFavorite"
            );
          } else {
            logger.logInfo(
              {
                event: "favorite_limit_reached",
                player: player.name,
                uid: uid,
                maxFavorites: maxFavorites,
                timestamp: Date.now()
              },
              "recentPlayersSlice.ts",
              "togglePlayerFavorite"
            );
          }
        }
      }
    },
    
    // Remove a specific player
    removePlayer(state, action: PayloadAction<{ uid: string }>) {
      const { uid } = action.payload;
      const player = state.players[uid];
      
      if (player) {
        logger.logInfo(
          {
            event: "player_removed",
            player: player.name,
            uid: uid,
            wasFavorited: player.isFavorited,
            timestamp: Date.now()
          },
          "recentPlayersSlice.ts",
          "removePlayer"
        );
        
        delete state.players[uid];
      }
    },
    
    // Trim players to max limit (keeping favorites)
    trimToMaxPlayers(state, action: PayloadAction<{ maxPlayers: number }>) {
      const { maxPlayers } = action.payload;
      const allPlayers = Object.values(state.players);
      
      if (allPlayers.length <= maxPlayers) {
        return; // No need to trim
      }
      
      // Separate favorites and non-favorites
      const favorites = allPlayers.filter(p => p.isFavorited);
      const nonFavorites = allPlayers.filter(p => !p.isFavorited);
      
      // Sort non-favorites by last seen (most recent first)
      nonFavorites.sort((a, b) => b.lastSeen - a.lastSeen);
      
      // Calculate how many non-favorites we can keep
      const maxNonFavorites = Math.max(0, maxPlayers - favorites.length);
      const playersToRemove = nonFavorites.slice(maxNonFavorites);
      
      // Remove the excess players
      playersToRemove.forEach(player => {
        delete state.players[player.uid];
      });
      
      logger.logInfo(
        {
          event: "players_trimmed",
          removed_count: playersToRemove.length,
          max_players: maxPlayers,
          favorites_count: favorites.length,
          timestamp: Date.now()
        },
        "recentPlayersSlice.ts",
        "trimToMaxPlayers"
      );
    },
    
    // Set recent players data (for loading from storage)
    setRecentPlayersData(state, action: PayloadAction<RecentPlayersState>) {
      // Load and sanitize older data to ensure required fields exist
      state.players = action.payload.players;
      Object.values(state.players).forEach((p) => {
        p.charactersAsAlly = p.charactersAsAlly || [];
        p.charactersAsOpponent = p.charactersAsOpponent || [];
        p.allyCharacterStats = p.allyCharacterStats || {};
        p.opponentCharacterStats = p.opponentCharacterStats || {};
        p.teamsWithCount = Number(p.teamsWithCount || 0);
        p.teamsWithWins = Number(p.teamsWithWins || 0);
        p.teamsWithLosses = Number(p.teamsWithLosses || 0);
        p.teamsAgainstCount = Number(p.teamsAgainstCount || 0);
        p.teamsAgainstWins = Number(p.teamsAgainstWins || 0);
        p.teamsAgainstLosses = Number(p.teamsAgainstLosses || 0);
        p.favoriteOrder = Number(p.favoriteOrder || 0);
        p.isFavorited = Boolean(p.isFavorited);
        // Coerce nested stats just in case
        for (const [k, v] of Object.entries(p.allyCharacterStats)) {
          p.allyCharacterStats[k] = {
            count: Number((v as any).count || 0),
            wins: Number((v as any).wins || 0),
            losses: Number((v as any).losses || 0),
          };
        }
        for (const [k, v] of Object.entries(p.opponentCharacterStats)) {
          p.opponentCharacterStats[k] = {
            count: Number((v as any).count || 0),
            wins: Number((v as any).wins || 0),
            losses: Number((v as any).losses || 0),
          };
        }
      });
      
      logger.logInfo(
        {
          event: "recent_players_data_loaded",
          player_count: Object.keys(action.payload.players).length,
          timestamp: Date.now()
        },
        "recentPlayersSlice.ts",
        "setRecentPlayersData"
      );
    },
    
    // Clear recent players older than a certain time
    clearOldPlayers(state, action: PayloadAction<{ maxAgeDays: number }>) {
      const { maxAgeDays } = action.payload;
      const now = Date.now();
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
      
      const oldPlayerIds = Object.keys(state.players).filter(
        uid => {
          const player = state.players[uid];
          // Don't remove favorited players even if they're old
          return !player.isFavorited && (now - player.lastSeen > maxAgeMs);
        }
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
  togglePlayerFavorite,
  removePlayer,
  trimToMaxPlayers,
  setRecentPlayersData,
  clearOldPlayers,
} = recentPlayersSlice.actions;

export default recentPlayersSlice.reducer;
