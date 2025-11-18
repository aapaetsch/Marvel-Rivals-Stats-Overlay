import React from 'react';
import { FormInstance, Alert, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/shared/store';
import { WINDOW_NAMES } from 'app/shared/constants';
import { updateSettings, OverlayThemes } from 'features/appSettings/appSettingsSlice';
import PlayerStatsSettings from './PlayerStatsSettings';
import PlayerStatsAppearanceSettings from './PlayerStatsAppearanceSettings';
import OverlayPositionEditor from './OverlayPositionEditor';
import CardSettingsRowToggle from './CardSettingsRowToggle';
import { ReloadOutlined } from '@ant-design/icons';
import '../styles/Settings.css';

interface PlayerStatsTabProps {
  form: FormInstance<any>;
  onEditPositions?: (enable: boolean, overlayWindowName?: string) => void;
  onSavePositions?: (overlayWindowName?: string) => void;
}

/**
 * Component for Player Stats tab settings with window resource management
 */
const PlayerStatsTab: React.FC<PlayerStatsTabProps> = ({ form, onEditPositions, onSavePositions }) => {
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  // Player Stats tab default values
  const playerStatsDefaults = {
    showPlayerStats: true,
    playerStatsOpacity: 100,
    playerStatsBackgroundColor: '#000000',
    overlayTheme: OverlayThemes.Default,
    showOwnPlayerCard: true,
    compactOwnPlayerCard: false,
    ultraCompactOwnPlayerCard: false,
    showTeammate1: true,
    compactTeammate1: false,
    ultraCompactTeammate1: false,
    showTeammate2: true,
    compactTeammate2: false,
    ultraCompactTeammate2: false,
    showTeammate3: true,
    compactTeammate3: false,
    ultraCompactTeammate3: false,
    showTeammate4: true,
    compactTeammate4: false,
    ultraCompactTeammate4: false,
    showTeammate5: true,
    compactTeammate5: false,
    ultraCompactTeammate5: false,
    enablePlayerStatsWindow: true,
    // Reset positions to default
    customPositions: {
      ...appSettings.customPositions,
      playerStats: {
        _base: { x: 15, y: -175 },
        Domination: { x: 15, y: -175 },
        Convoy: { x: 15, y: -175 },
        'Doom Match': { x: 15, y: -175 },
        Conquest: { x: 15, y: -175 },
      }
    }
  };
  
  // Use positioning mode state from the Redux store
  const positioningModeOverlay = appSettings.positioningModeWindows?.[WINDOW_NAMES.INGAME] 
    ? WINDOW_NAMES.INGAME 
    : null;
  
  // Use the passed handlers or default to console.log
  const handleEditOverlayPositions = onEditPositions || ((enable: boolean, overlayWindowName?: string) => {
    console.log('Edit positions:', enable, overlayWindowName);
  });
  
  const handleSaveOverlayPositions = onSavePositions || ((overlayWindowName?: string) => {
    console.log('Save positions:', overlayWindowName);
  });

  const isPlayerStatsEnabled = appSettings.enablePlayerStatsWindow !== false;

  return (
    <div className="settings-tab-content">
      {/* Compact Window Resource Management */}
      <div className="compact-resource-management">
        <CardSettingsRowToggle
          label="Enable Player Stats Window"
          formName="enablePlayerStatsWindow"
        />
      </div>
      
      {!isPlayerStatsEnabled && (
        <Alert
          message="Player Stats Window Disabled"
          description="Enable the toggle above to access these settings."
          type="warning"
          showIcon
          className="tab-disabled-alert"
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* Player Stats Settings (only shown when enabled) */}
      {isPlayerStatsEnabled && (
        <>
          <div className="settings-columns">
            <div className="settings-column">
              <PlayerStatsAppearanceSettings form={form} />
            </div>
            <div className="settings-column">
              <OverlayPositionEditor 
                overlayKey="playerStats" 
                form={form}
                isPositioningMode={positioningModeOverlay === WINDOW_NAMES.INGAME}
                onEditPositions={handleEditOverlayPositions}
                onSavePositions={handleSaveOverlayPositions}
              />
            </div>
          </div>
          
          <PlayerStatsSettings form={form} />
        </>
      )}
    </div>
  );
};

export default PlayerStatsTab;
