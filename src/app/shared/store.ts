import { configureStore, Middleware, Action } from "@reduxjs/toolkit";
import { completeMatch } from "../../screens/background/stores/matchStatsSlice";
import { addRecentPlayersFromMatch } from "../../screens/background/stores/recentPlayersSlice";
import rootReducer, { RootReducer } from "./rootReducer";
import { isDev } from "lib/utils";

// Create a properly typed middleware to handle match completion and recent players
const matchCompletionMiddleware: Middleware<{}, RootReducer> = 
  store => next => (action) => {
    // Run the action first to get the normal result
    const result = next(action);
    
    // Check if this is a match completion thunk
    // @ts-ignore
    if (action.type === 'matchStats/completeMatchThunk') {
      // Get the current state
      const state = store.getState();
      const currentMatch = state.matchStatsReducer.currentMatch;
      
      // Create player records for the recent players list
      const players = Object.values(currentMatch.players).map(player => ({
        uid: player.uid,
        name: player.name,
        characterName: player.characterName,
        isTeammate: player.isTeammate,
      }));
      
      // Dispatch the regular completeMatch action
      store.dispatch(completeMatch());
      
      // Dispatch the action to update recent players
      store.dispatch(addRecentPlayersFromMatch({ players }));
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
    }).concat(matchCompletionMiddleware),
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
