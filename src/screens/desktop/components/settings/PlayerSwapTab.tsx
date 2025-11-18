import React from 'react';
import { FormInstance, Alert, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/shared/store';
import { WINDOW_NAMES } from 'app/shared/constants';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import CardSettingsRowSlider from './CardSettingsRowSlider';
import CardSettingsRowColorPicker from './CardSettingsRowColorPicker';
import OverlayPositionEditor from './OverlayPositionEditor';
import CardSettingsRowToggle from './CardSettingsRowToggle';
import { ReloadOutlined } from '@ant-design/icons';
import '../styles/Settings.css';

interface PlayerSwapTabProps {
  form: FormInstance<any>;
  onEditPositions?: (enable: boolean, overlayWindowName?: string) => void;
  onSavePositions?: (overlayWindowName?: string) => void;
}

/**
 * Component for Player Swap tab settings with window resource management
 */
const PlayerSwapTab: React.FC<PlayerSwapTabProps> = ({ form, onEditPositions, onSavePositions }) => {
  const { t } = useTranslation();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  const dispatch = useDispatch();
  
  // Player Swap tab default values
  const playerSwapDefaults = {
    showPlayerSwapNotification: true,
    playerSwapNotificationDuration: 5,
    enableCharSwapWindow: true,
    // Reset positions to default
    customPositions: {
      ...appSettings.customPositions,
      charSwapBar: {
        _base: { x: 0, y: 300 },
        Domination: { x: 0, y: 300 },
        Convoy: { x: 0, y: 300 },
        'Doom Match': { x: 0, y: 300 },
        Conquest: { x: 0, y: 300 },
      }
    }
  };
  
  // Use positioning mode state from the Redux store
  const positioningModeOverlay = appSettings.positioningModeWindows?.[WINDOW_NAMES.CHARSWAPBAR] 
    ? WINDOW_NAMES.CHARSWAPBAR 
    : null;
  
  // Use the passed handlers or default to console.log
  const handleEditOverlayPositions = onEditPositions || ((enable: boolean, overlayWindowName?: string) => {
    console.log('Edit positions:', enable, overlayWindowName);
  });
  
  const handleSaveOverlayPositions = onSavePositions || ((overlayWindowName?: string) => {
    console.log('Save positions:', overlayWindowName);
  });

  const isPlayerSwapEnabled = appSettings.enableCharSwapWindow !== false;

  return (
    <div className="settings-tab-content">
      {/* Compact Window Resource Management */}
      <div className="compact-resource-management">
        <CardSettingsRowToggle
          label="Enable Character Swap Window"
          formName="enableCharSwapWindow"
        />
      </div>
      
      {!isPlayerSwapEnabled && (
        <Alert
          message="Player Swap Window Disabled"
          description="Enable the toggle above to access these settings."
          type="warning"
          showIcon
          className="tab-disabled-alert"
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* Player Swap Settings (only shown when enabled) */}
      {isPlayerSwapEnabled && (
        <div className="settings-columns">
          <div className="settings-column">
            <div className="settings-column-title">
              {t("components.desktop.settings.appearance", "Appearance Settings")}
            </div>
            <CardSettingsRowSlider
              label={t("components.desktop.settings.player-swap-duration", "Notification Duration (seconds)")}
              formName="playerSwapNotificationDuration"
              min={1}
              max={10}
              marks={{ 1: '1s', 5: '5s', 10: '10s' }}
              stackedLabel={true}
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.ally-swap-color", "Ally swap notification color")}
              formName="allySwapColor"
              initialValue="#1890FF"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.enemy-swap-color", "Enemy swap notification color")}
              formName="enemySwapColor"
              initialValue="#FF4D4F"
            />
          </div>
          <div className="settings-column">
            <OverlayPositionEditor 
              overlayKey="charSwapBar" 
              form={form}
              isPositioningMode={positioningModeOverlay === WINDOW_NAMES.CHARSWAPBAR}
              onEditPositions={handleEditOverlayPositions}
              onSavePositions={handleSaveOverlayPositions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSwapTab;
