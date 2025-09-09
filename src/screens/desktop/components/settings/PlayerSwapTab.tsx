import React from 'react';
import { FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'app/shared/store';
import { WINDOW_NAMES } from 'app/shared/constants';
import CardSettingsRowSlider from './CardSettingsRowSlider';
import CardSettingsRowColorPicker from './CardSettingsRowColorPicker';
import OverlayPositionEditor from './OverlayPositionEditor';
import '../styles/Settings.css';

interface PlayerSwapTabProps {
  form: FormInstance<any>;
}

/**
 * Component for Player Swap tab settings
 */
const PlayerSwapTab: React.FC<PlayerSwapTabProps> = ({ form }) => {
  const { t } = useTranslation();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  // Use positioning mode state from the Redux store
  const positioningModeOverlay = appSettings.positioningModeWindows?.[WINDOW_NAMES.CHARSWAPBAR] 
    ? WINDOW_NAMES.CHARSWAPBAR 
    : null;
  
  // Forward these functions to the parent component
  const handleEditOverlayPositions = (enable: boolean, overlayWindowName?: string) => {
    // This is just a stub - real implementation will be in the parent
    console.log('Edit positions:', enable, overlayWindowName);
  };
  
  const handleSaveOverlayPositions = (overlayWindowName?: string) => {
    // This is just a stub - real implementation will be in the parent
    console.log('Save positions:', overlayWindowName);
  };

  return (
    <div className="settings-tab-content">
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
            label={t("components.desktop.settings.ally-swap-color", "Ally Swap Color")}
            formName="allySwapColor"
            tooltip={t("components.desktop.settings.ally-swap-color-tooltip", "Highlight color when an ally swaps character")}
            initialValue="#1890FF"
          />
          <CardSettingsRowColorPicker
            label={t("components.desktop.settings.enemy-swap-color", "Enemy Swap Color")}
            formName="enemySwapColor"
            tooltip={t("components.desktop.settings.enemy-swap-color-tooltip", "Highlight color when an enemy swaps character")}
            initialValue="#FF4D4F"
          />
          <CardSettingsRowColorPicker
            label={t("components.desktop.settings.swap-screen-background-color", "Background Color")}
            formName="swapScreenBackgroundColor"
            tooltip={t("components.desktop.settings.swap-screen-background-tooltip", "Background color for the character swap notification")}
            initialValue="#000000"
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
    </div>
  );
};

export default PlayerSwapTab;
