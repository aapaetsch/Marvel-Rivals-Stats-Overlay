import React from 'react';
import { FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import CardSettingsRowSlider from './CardSettingsRowSlider';
import CardSettingsRowColorPicker from './CardSettingsRowColorPicker';
import '../styles/Settings.css';

interface PlayerStatsAppearanceSettingsProps {
  form: FormInstance<any>; // Use FormInstance for better type safety
}

/**
 * Component for Player Stats Overlay Appearance settings
 */
const PlayerStatsAppearanceSettings: React.FC<PlayerStatsAppearanceSettingsProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <div className="settings-column appearance-column"> 
      <div className="settings-column-title">
        {t("components.desktop.settings.appearance", "Appearance Settings")}
      </div>
      <CardSettingsRowSlider
        label={t("components.desktop.settings.player-stats-opacity", "Player Stats Opacity")}
        formName="playerStatsOpacity"
        min={20}
        max={100}
        marks={{
          20: '20%',
          50: '50%',
          80: '80%',
          100: '100%'
        }}
        stackedLabel={true}
      />
      
      <CardSettingsRowColorPicker
        label={t("components.desktop.settings.player-stats-background-color", "Player stat cards background color")}
        formName="playerStatsBackgroundColor"
        initialValue="#000000"
      />
      
      <CardSettingsRowColorPicker
        label={t("components.desktop.settings.player-stats-font-color", "Font color for text on player stats cards")}
        formName="playerStatsFontColor"
        initialValue="#FFFFFF"
      />
      
      <CardSettingsRowColorPicker
        label={t("components.desktop.settings.teammate-border-color", "Ult charge border color")}
        formName="teammateBorderColor"
        initialValue="#1890FF"
      />
      
      <CardSettingsRowColorPicker
        label={t("components.desktop.settings.ult-fully-charged-border-color", "Ult fully charged border color")}
        formName="ultFullyChargedBorderColor"
        initialValue="#FFD700"
      />
    </div>
  );
};

export default PlayerStatsAppearanceSettings;
