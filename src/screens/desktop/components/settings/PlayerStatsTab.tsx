import React from 'react';
import { FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'app/shared/store';
import { WINDOW_NAMES } from 'app/shared/constants';
import PlayerStatsSettings from './PlayerStatsSettings';
import PlayerStatsAppearanceSettings from './PlayerStatsAppearanceSettings';
import OverlayPositionEditor from './OverlayPositionEditor';
import '../styles/Settings.css';

interface PlayerStatsTabProps {
  form: FormInstance<any>;
}

/**
 * Component for Player Stats tab settings
 */
const PlayerStatsTab: React.FC<PlayerStatsTabProps> = ({ form }) => {
  const { t } = useTranslation();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  // Use positioning mode state from the Redux store
  const positioningModeOverlay = appSettings.positioningModeWindows?.[WINDOW_NAMES.INGAME] 
    ? WINDOW_NAMES.INGAME 
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
    </div>
  );
};

export default PlayerStatsTab;
