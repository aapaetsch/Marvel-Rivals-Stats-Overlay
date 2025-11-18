import { configureStore, Middleware } from "@reduxjs/toolkit";
import { completeMatchThunk } from "../../screens/background/stores/matchStatsSlice";
import { addRecentPlayersFromMatch } from "../../screens/background/stores/recentPlayersSlice";
import rootReducer, { RootReducer } from "./rootReducer";
import { isDev } from "lib/utils";
import { appSettingsMiddleware } from "../../features/appSettings/appSettingsMiddleware";
import { recentPlayersMiddleware } from "../../screens/background/stores/recentPlayersMiddleware";

// Create a properly typed middleware to handle match completion and recent players
const matchCompletionMiddleware: Middleware<{}, RootReducer> = 
  store => next => (action) => {
    // Run the action first to get the normal result
    const result = next(action);
    
    // Check if this is the completeMatchThunk action
    // @ts-ignore
    if (action.type === 'matchStats/completeMatchThunk/pending') {
      // Get the current state
      const state = store.getState();
      const currentMatch = state.matchStatsReducer.currentMatch;
      const completedSessions = state.matchStatsReducer.completedSessions || [];
      
      // Group completed sessions by player UID
      const sessionsByPlayer: Record<string, Array<{
        characterName: string;
        timeSpentMs: number;
        kills: number;
        deaths: number;
        assists: number;
        timestamp: number;
        isAlly: boolean;
      }>> = {};
      
      for (const session of completedSessions) {
        if (!sessionsByPlayer[session.uid]) {
          sessionsByPlayer[session.uid] = [];
        }
        sessionsByPlayer[session.uid].push({
          characterName: session.characterName,
          timeSpentMs: session.timeSpentMs,
          kills: session.kills,
          deaths: session.deaths,
          assists: session.assists,
          timestamp: session.timestamp,
          isAlly: session.isAlly,
        });
      }
      
      // Create player records for the recent players list with character history
      const players = Object.values(currentMatch.players).map(player => {
        const characterHistory = sessionsByPlayer[player.uid] || [];
        
        // Add matchId to each character history entry
        const enrichedHistory = characterHistory.map(entry => ({
          ...entry,
          matchId: currentMatch.matchId,
        }));
        
        return {
          uid: player.uid,
          name: player.name,
          characterName: player.characterName,
          isTeammate: player.isTeammate,
          characterHistory: enrichedHistory,
        };
      });
      
      console.log("Dispatching addRecentPlayersFromMatch with players:", players);
      console.log("Total character sessions:", completedSessions.length);
      
      // Dispatch the action to update recent players
      store.dispatch(addRecentPlayersFromMatch({ 
        players, 
        matchOutcome: currentMatch.outcome,
        matchId: currentMatch.matchId,
      }));
      
      console.log("Recent players updated with match data and character history");
    }
    
    return result;
  };

// Create the Redux store using the combined rootReducer
const reduxStore = configureStore({
  reducer: rootReducer, // Use the combined rootReducer directly
  devTools: isDev,
  middleware: getDefaultMiddleware => 
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(matchCompletionMiddleware, appSettingsMiddleware, recentPlayersMiddleware),
});

declare global {
  interface Window {
    reduxStore: typeof reduxStore;
  }
}

// Add the store to the window for global access
window.reduxStore = reduxStore;

// Get the store from the main window in production, or use the local store in development
const { reduxStore: store } = isDev
  ? { reduxStore }
  : overwolf.windows.getMainWindow();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof reduxStore.getState>;
export default store;

