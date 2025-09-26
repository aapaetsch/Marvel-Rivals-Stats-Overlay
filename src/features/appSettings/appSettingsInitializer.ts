import { Store } from '@reduxjs/toolkit';
import { loadAppSettings } from './appSettingsStorage';
import { setSettings, setLoaded } from './appSettingsSlice';

/**
 * Initializes app settings by loading them from storage
 * @param store The Redux store
 */
export const initializeAppSettings = async (store: Store): Promise<void> => {
  try {
    // Dispatch that settings are being loaded
    store.dispatch(setLoaded(false));
    
    // Load settings from storage
    const settings = await loadAppSettings();
    
    if (settings) {
      // If settings were loaded successfully, update the store
      store.dispatch(setSettings(settings));
      console.log('Settings loaded from storage successfully');
    } else {
      console.log('No saved settings found, using defaults');
    }
    
    // Mark settings as loaded (even if we're using defaults)
    store.dispatch(setLoaded(true));
  } catch (error) {
    console.error('Failed to initialize app settings:', error);
    // Mark settings as loaded even if there was an error (we'll use defaults)
    store.dispatch(setLoaded(true));
  }
};
