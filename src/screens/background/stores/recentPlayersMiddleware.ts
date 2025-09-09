import { Middleware } from '@reduxjs/toolkit';
import { saveRecentPlayersData } from './recentPlayersStorage';
import { RootReducer } from 'app/shared/rootReducer';

// Middleware to save recent players data to storage when they change
let saveTimer: any = null;

export const recentPlayersMiddleware: Middleware<{}, RootReducer> = store => next => action => {
  const result = next(action);
  
  // Check if the action is related to updating recent players
  // Type assertion to allow checking action.type
  const actionType = (action as { type: string }).type;
  
  if (
    actionType === 'recentPlayers/addRecentPlayer' || 
    actionType === 'recentPlayers/addRecentPlayersFromMatch' || 
    actionType === 'recentPlayers/togglePlayerFavorite' ||
    actionType === 'recentPlayers/removePlayer' ||
    actionType === 'recentPlayers/trimToMaxPlayers' ||
    actionType === 'recentPlayers/clearOldPlayers' ||
    actionType === 'recentPlayers/setRecentPlayersData'
  ) {
    // Get the updated recent players data from the store
    const state = store.getState();
    const recentPlayersData = state.recentPlayersReducer;
    
    // Debounce saves to avoid overlapping writes
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(() => {
      // Save the data to storage (async operation)
      saveRecentPlayersData(recentPlayersData)
        .then(message => {
          console.log('Recent players data saved successfully:', message);
        })
        .catch(error => {
          console.error('Failed to save recent players data:', error);
        });
    }, 250);
  }
  
  return result;
};
