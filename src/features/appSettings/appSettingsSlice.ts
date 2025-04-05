import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the types for app settings
export interface AppSettings {
  language: string;
  theme: 'dark' | 'light';
  startWithWindows: boolean;
  notifications: boolean;
  // Overlay settings
  showTeamStats: boolean;
  showKillFeed: boolean;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface AppSettingsState {
  settings: AppSettings;
  loaded: boolean;
}

// Default settings
const initialState: AppSettingsState = {
  settings: {
    language: 'en',
    theme: 'dark',
    startWithWindows: true,
    notifications: true,
    showTeamStats: true,
    showKillFeed: true,
    opacity: 80,
    position: 'top-left',
  },
  loaded: false,
};

// Create the slice
const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    // Update a single setting
    updateSetting<K extends keyof AppSettings>(
      state: any,
      action: PayloadAction<{ key: K; value: AppSettings[K] }>
    ) {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    
    // Update multiple settings at once
    updateSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Mark settings as loaded from storage
    setLoaded(state, action: PayloadAction<boolean>) {
      state.loaded = action.payload;
    },
    
    // Reset to defaults
    resetSettings(state) {
      state.settings = initialState.settings;
    },
  },
});

export const {
  updateSetting,
  updateSettings,
  setLoaded,
  resetSettings,
} = appSettingsSlice.actions;

export default appSettingsSlice.reducer;