import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the types for app settings

export interface GeneralSettings {
  language: string;
  theme: 'dark' | 'light' | 'minimalistic-black';
  startWithWindows: boolean;
  notifications: boolean;
  showStoreViewer: boolean;
}

export interface OverlaySettings {
  showTeamStats: boolean;
  showKillFeed: boolean;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showPlayerStats: boolean;
  playerStatsOpacity: number;
  playerStatsFontColor: string; // Font color property
  teammateBorderColor: string; // Teammate border color property
  playerStatsBackgroundColor: string; // Background color property
  overlayTheme: 'default' | 'minimal-black' | 'neon-blue' | 'jungle-green'; // Theme options
  // Custom overlay positions with game mode specifics
  customPositions: {
    [overlayKey in 'playerStats' | 'finalHitsBar' | 'charSwapBar']: {
      _base: { x: number, y: number }; // Position set by drag-and-drop
      Domination?: { x: number, y: number };
      Convoy?: { x: number, y: number };
      'Doom Match'?: { x: number, y: number }; // Use quotes for keys with spaces
      Conquest?: { x: number, y: number };
    }
  };
  lockOverlayPositions: boolean;
  showOwnPlayerCard: boolean;
  compactOwnPlayerCard: boolean;
  showTeammate1: boolean;
  compactTeammate1: boolean;
  showTeammate2: boolean;
  compactTeammate2: boolean;
  showTeammate3: boolean;
  compactTeammate3: boolean;
  showTeammate4: boolean;
  compactTeammate4: boolean;
  showTeammate5: boolean;
  compactTeammate5: boolean;  showPlayerSwapNotification: boolean;
  playerSwapNotificationDuration: number;
  allySwapColor: string;
  enemySwapColor: string;
  swapScreenBackgroundColor: string;
  showFinalHitsOverlay: boolean;
  finalHitsOpacity: number;
  yourFinalHitsColor: string;
  opponentFinalHitsColor: string;
  finalHitsBackgroundColor: string;
}
export interface AppSettings extends GeneralSettings, OverlaySettings {
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
    showStoreViewer: false,
    showTeamStats: true,
    showKillFeed: true,
    opacity: 80,
    position: 'top-left', // Player Stats Overlay
    showPlayerStats: true,
    playerStatsOpacity: 100,
    playerStatsBackgroundColor: '#000000', // Default background color
    overlayTheme: 'default', // Default theme
    // Default custom overlay positions including game modes
    customPositions: {
      playerStats: {
        _base: { x: 15, y: -175 },
        Domination: { x: 15, y: -175 },
        Convoy: { x: 15, y: -175 },
        'Doom Match': { x: 15, y: -175 },
        Conquest: { x: 15, y: -175 },
      },
      finalHitsBar: {
        _base: { x: 1000, y: 50 },
        Domination: { x: 1000, y: 50 },
        Convoy: { x: 1000, y: 50 },
        'Doom Match': { x: 1000, y: 50 },
        Conquest: { x: 1000, y: 50 },
      },
      charSwapBar: {
        _base: { x: 0, y: 300 },
        Domination: { x: 0, y: 300 },
        Convoy: { x: 0, y: 300 },
        'Doom Match': { x: 0, y: 300 },
        Conquest: { x: 0, y: 300 },
      }
    },
    lockOverlayPositions: false,
    showOwnPlayerCard: true,
    compactOwnPlayerCard: false,
    showTeammate1: true,
    compactTeammate1: false,
    showTeammate2: true,
    compactTeammate2: false,
    showTeammate3: true,
    compactTeammate3: false,
    showTeammate4: true,
    compactTeammate4: false,
    showTeammate5: true,
    compactTeammate5: false,
    // Player Swap Notification
    showPlayerSwapNotification: true,
    playerSwapNotificationDuration: 5,
    // Final Hits Overlay
    showFinalHitsOverlay: true,
    finalHitsOpacity: 80,
    allySwapColor: "",
    enemySwapColor: "",
    swapScreenBackgroundColor: "",
    yourFinalHitsColor: "",
    opponentFinalHitsColor: "",
    finalHitsBackgroundColor: "",
    playerStatsFontColor: "",
    teammateBorderColor: ""
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
    
    // Set full settings state from storage
    setSettings(state, action: PayloadAction<AppSettings>) {
      state.settings = action.payload;
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