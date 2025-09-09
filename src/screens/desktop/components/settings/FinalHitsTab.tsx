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

interface FinalHitsTabProps {
  form: FormInstance<any>;
}

/**
 * Component for Final Hits tab settings
 */
const FinalHitsTab: React.FC<FinalHitsTabProps> = ({ form }) => {
  const { t } = useTranslation();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  // Use positioning mode state from the Redux store
  const positioningModeOverlay = appSettings.positioningModeWindows?.[WINDOW_NAMES.FINALHITSBAR] 
    ? WINDOW_NAMES.FINALHITSBAR 
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
            label={t("components.desktop.settings.final-hits-opacity", "Final Hits Opacity")}
            formName="finalHitsOpacity"
            min={20}
            max={100}
            marks={{ 20: '20%', 50: '50%', 80: '80%', 100: '100%' }}
            stackedLabel={true}
          />
          <CardSettingsRowColorPicker
            label={t("components.desktop.settings.your-final-hits-color", "Your Final Hits Color")}
            formName="yourFinalHitsColor"
            tooltip={t("components.desktop.settings.your-final-hits-color-tooltip", "Color for your final hits in the display")}
            initialValue="#1890FF"
          />
          <CardSettingsRowColorPicker
            label={t("components.desktop.settings.opponent-final-hits-color", "Opponent Final Hits Color")}
            formName="opponentFinalHitsColor"
            tooltip={t("components.desktop.settings.opponent-final-hits-color-tooltip", "Color for opponent final hits in the display")}
            initialValue="#FF4D4F"
          />
          <CardSettingsRowColorPicker
            label={t("components.desktop.settings.final-hits-background-color", "Background Color")}
            formName="finalHitsBackgroundColor"
            tooltip={t("components.desktop.settings.final-hits-background-color-tooltip", "Background color for the final hits display")}
            initialValue="#000000"
          />
        </div>
        <div className="settings-column">
          <OverlayPositionEditor 
            overlayKey="finalHitsBar" 
            form={form}
            isPositioningMode={positioningModeOverlay === WINDOW_NAMES.FINALHITSBAR}
            onEditPositions={handleEditOverlayPositions}
            onSavePositions={handleSaveOverlayPositions}
          />
        </div>
      </div>
    </div>
  );
};

export default FinalHitsTab;
