import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ForceShowCover } from '../../lib/matchStatusUtils';
// Define the types for app settings

export enum Themes {
  Dark = 'dark',
  Light = 'light',
  MinimalisticBlack = 'minimalistic-black',
  // backward-compatible aliases used in some components
  DARK = 'dark',
  LIGHT = 'light',
  MINIMALISTIC_BLACK = 'minimalistic-black',
};

export enum OverlayThemes {
  Default = 'default',
};

export interface GeneralSettings {
  language: string;
  theme: Themes;
  startWithWindows: boolean;
  notifications: boolean;
  showStoreViewer: boolean;
  showDevWindow: boolean;
  useMatchHistoryTestData: boolean;
  useMatchTableTestData: boolean;
  // Recent players storage/cleanup settings
  maxRecentPlayers: number;
  maxFavoriteRecentPlayers: number;
  autoCleanupRecentPlayers: boolean;
  recentPlayersCleanupDays: number;
  // Tracks whether specific declared windows are currently in positioning/drag mode
  positioningModeWindows: { [windowName: string]: boolean };
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
  ultFullyChargedBorderColor: string; // Ult fully charged border color property
  playerStatsBackgroundColor: string; // Background color property
  overlayTheme: OverlayThemes; // Theme options
  // Window resource management flags (control whether auxiliary windows are enabled)
  enablePlayerStatsWindow: boolean;
  enableFinalHitsWindow: boolean;
  enableCharSwapWindow: boolean;
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
  // Ultra compact teammate card options (smaller footprint)
  ultraCompactOwnPlayerCard: boolean;
  ultraCompactTeammate1: boolean;
  ultraCompactTeammate2: boolean;
  ultraCompactTeammate3: boolean;
  ultraCompactTeammate4: boolean;
  ultraCompactTeammate5: boolean;
  playerSwapNotificationDuration: number;
  allySwapColor: string;
  enemySwapColor: string;
  swapScreenBackgroundColor: string;
  showFinalHitsOverlay: boolean;
  finalHitsOpacity: number;
  yourFinalHitsColor: string;
  opponentFinalHitsColor: string;
  finalHitsBackgroundColor: string;
  // Card View Cover Control
  // Dev override for card view cover visibility. Values:
  // 'auto'  -> normal behavior (show when no live match)
  // 'show'  -> force show cover
  // 'hide'  -> force hide cover
  forceShowCardViewCover: ForceShowCover;
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
    theme: Themes.MinimalisticBlack,
    startWithWindows: true,
    notifications: true,
    showStoreViewer: false,
    showDevWindow: false,
    useMatchHistoryTestData: false,
    useMatchTableTestData: false,
    // Recent players defaults
    maxRecentPlayers: 1000,
    maxFavoriteRecentPlayers: 100,
    autoCleanupRecentPlayers: false,
    recentPlayersCleanupDays: 30,
  // Window positioning mode tracking (which declared windows are in 'positioning'/'drag' mode)
  positioningModeWindows: {},
    showTeamStats: true,
    showKillFeed: true,
    opacity: 80,
    position: 'top-left', // Player Stats Overlay
    showPlayerStats: true,
    playerStatsOpacity: 100,
    playerStatsBackgroundColor: '#000000', // Default background color
    overlayTheme: OverlayThemes.Default, // Default theme
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
    // Window resource management defaults
    enablePlayerStatsWindow: true,
    enableFinalHitsWindow: true,
    enableCharSwapWindow: true,
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
    ultraCompactOwnPlayerCard: false,
    ultraCompactTeammate1: false,
    ultraCompactTeammate2: false,
    ultraCompactTeammate3: false,
    ultraCompactTeammate4: false,
    ultraCompactTeammate5: false,
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
    teammateBorderColor: "",
    ultFullyChargedBorderColor: "#FFD700", // Default gold for fully charged ult
  // Card View Cover Control (tri-state)
  // Use ForceShowCover enum for clarity
  forceShowCardViewCover: ForceShowCover.Auto,
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
  setSettings,
  setLoaded,
  resetSettings,
} = appSettingsSlice.actions;

export default appSettingsSlice.reducer;
