import { Store } from '@reduxjs/toolkit';
import { loadRecentPlayersData } from './recentPlayersStorage';
import { setRecentPlayersData, trimToMaxPlayers, clearOldPlayers } from './recentPlayersSlice';
import { RootReducer } from 'app/shared/rootReducer';

/**
 * Initialize recent players data from storage
 * @param store Redux store instance
 */
export const initializeRecentPlayersData = async (store: Store<RootReducer>) => {
  try {
    // Load recent players data from storage
    const savedData = await loadRecentPlayersData();
    
    if (savedData) {
      // Set the loaded data
      store.dispatch(setRecentPlayersData(savedData));
      
      // Get current app settings to apply cleanup policies
      const state = store.getState();
      const settings = state.appSettingsReducer.settings;
      
      // Apply cleanup if enabled
      if (settings.autoCleanupRecentPlayers) {
        // Remove old players first
        store.dispatch(clearOldPlayers({ maxAgeDays: settings.recentPlayersCleanupDays }));
        
        // Then trim to max players limit
        store.dispatch(trimToMaxPlayers({ maxPlayers: settings.maxRecentPlayers }));
      }
      
      console.log('Recent players data initialized successfully');
    } else {
      console.log('No recent players data found, starting with empty state');
    }
  } catch (error) {
    console.error('Failed to initialize recent players data:', error);
  }
};