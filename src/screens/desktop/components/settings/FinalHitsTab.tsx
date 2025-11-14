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

interface FinalHitsTabProps {
  form: FormInstance<any>;
  onEditPositions?: (enable: boolean, overlayWindowName?: string) => void;
  onSavePositions?: (overlayWindowName?: string) => void;
}

/**
 * Component for Final Hits tab settings with window resource management
 */
const FinalHitsTab: React.FC<FinalHitsTabProps> = ({ form, onEditPositions, onSavePositions }) => {
  const { t } = useTranslation();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  const dispatch = useDispatch();
  
  // Final Hits tab default values
  const finalHitsDefaults = {
    showFinalHitsOverlay: true,
    finalHitsOpacity: 80,
    enableFinalHitsWindow: true,
    // Reset positions to default
    customPositions: {
      ...appSettings.customPositions,
      finalHitsBar: {
        _base: { x: 1000, y: 50 },
        Domination: { x: 1000, y: 50 },
        Convoy: { x: 1000, y: 50 },
        'Doom Match': { x: 1000, y: 50 },
        Conquest: { x: 1000, y: 50 },
      }
    }
  };

  const handleResetToDefaults = () => {
    dispatch(updateSettings(finalHitsDefaults));
    form.setFieldsValue(finalHitsDefaults);
  };
  
  // Use positioning mode state from the Redux store
  const positioningModeOverlay = appSettings.positioningModeWindows?.[WINDOW_NAMES.FINALHITSBAR] 
    ? WINDOW_NAMES.FINALHITSBAR 
    : null;
  
  // Use the passed handlers or default to console.log
  const handleEditOverlayPositions = onEditPositions || ((enable: boolean, overlayWindowName?: string) => {
    console.log('Edit positions:', enable, overlayWindowName);
  });
  
  const handleSaveOverlayPositions = onSavePositions || ((overlayWindowName?: string) => {
    console.log('Save positions:', overlayWindowName);
  });

  const isFinalHitsEnabled = appSettings.enableFinalHitsWindow !== false;

  return (
    <div className="settings-tab-content">
      {/* Compact Window Resource Management */}
      <div className="compact-resource-management">
        <CardSettingsRowToggle
          label="Enable Final Hits Window"
          formName="enableFinalHitsWindow"
        />
        
        {/* Reset to Default Button */}
        <Space style={{ marginTop: '12px' }}>
          <Button 
            type="default" 
            icon={<ReloadOutlined />}
            onClick={handleResetToDefaults}
            size="small"
          >
            {t('components.desktop.settings.reset-to-default', 'Reset to Default')}
          </Button>
        </Space>
      </div>
      
      {!isFinalHitsEnabled && (
        <Alert
          message="Final Hits Window Disabled"
          description="Enable the toggle above to access these settings."
          type="warning"
          showIcon
          className="tab-disabled-alert"
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* Final Hits Settings (only shown when enabled) */}
      {isFinalHitsEnabled && (
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
              label={t("components.desktop.settings.your-final-hits-color", "Your final hits color")}
              formName="yourFinalHitsColor"
              initialValue="#1890FF"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.opponent-final-hits-color", "Opponent final hits color")}
              formName="opponentFinalHitsColor"
              initialValue="#FF4D4F"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.final-hits-background-color", "Final hits background color")}
              formName="finalHitsBackgroundColor"
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
      )}
    </div>
  );
};

export default FinalHitsTab;
