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
        label={t("components.desktop.settings.player-stats-background-color", "Background Color")}
        formName="playerStatsBackgroundColor"
        tooltip={t("components.desktop.settings.background-color-tooltip", "Background color for player stat cards")}
        initialValue="#000000"
      />
      
      <CardSettingsRowColorPicker
        label={t("components.desktop.settings.player-stats-font-color", "Font Color")}
        formName="playerStatsFontColor"
        tooltip={t("components.desktop.settings.font-color-tooltip", "Text color for player stat cards")}
        initialValue="#FFFFFF"
      />
      
      <CardSettingsRowColorPicker
        label={t("components.desktop.settings.teammate-border-color", "Teammate Border Color")}
        formName="teammateBorderColor"
        tooltip={t("components.desktop.settings.border-color-tooltip", "Accent color for teammate card borders")}
        initialValue="#1890FF"
      />
    </div>
  );
};

export default PlayerStatsAppearanceSettings;
