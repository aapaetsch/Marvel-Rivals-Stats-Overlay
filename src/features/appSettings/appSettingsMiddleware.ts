import { Middleware } from '@reduxjs/toolkit';
import { saveAppSettings } from './appSettingsStorage';
import { RootReducer } from 'app/shared/rootReducer';

// Middleware to save settings to storage when they change
export const appSettingsMiddleware: Middleware<{}, RootReducer> = store => next => action => {
  const result = next(action);
  
  // Check if the action is related to updating app settings
  // Type assertion to allow checking action.type
  const actionType = (action as { type: string }).type;
  
  if (
    actionType === 'appSettings/updateSettings' || 
    actionType === 'appSettings/updateSetting' || 
    actionType === 'appSettings/resetSettings' ||
    actionType === 'appSettings/setSettings'
  ) {
    // Get the updated settings from the store
    const state = store.getState();
    const settings = state.appSettingsReducer.settings;
    
    // Add a small delay to batch rapid changes together
    setTimeout(() => {
      // Save the settings to storage (async operation)
      saveAppSettings(settings)
        .then(message => {
          console.log('Settings saved successfully:', message);
        })
        .catch(error => {
          console.error('Failed to save settings:', error);
        });
    }, 200);
  }
  
  return result;
};
