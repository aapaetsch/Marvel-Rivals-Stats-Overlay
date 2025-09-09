import React from 'react';
import { FormInstance, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import CardSettingsRowToggle from './CardSettingsRowToggle';
import '../styles/Settings.css';

interface WindowResourceSettingsProps {
  form: FormInstance<any>;
}

/**
 * Component for Window Resource Management Settings
 * Controls which windows are open (using resources) or closed (saving resources)
 */
const WindowResourceSettings: React.FC<WindowResourceSettingsProps> = ({ form }) => {
  const { t } = useTranslation();
  return (
    <div className="settings-form">      
      <div className="settings-description">
        {t("components.desktop.settings.window-resource-description", "Enable or disable windows to save system resources. Disabled windows will be completely closed.")}
      </div>
      <Form form={form} layout="vertical">      
        <CardSettingsRowToggle
          label={t("components.desktop.settings.enable-player-stats-window", "Player Stats Window")}
          formName="enablePlayerStatsWindow"
        />
        <CardSettingsRowToggle
          label={t("components.desktop.settings.enable-final-hits-window", "Final Hits Window")}
          formName="enableFinalHitsWindow"
        />
        <CardSettingsRowToggle
          label={t("components.desktop.settings.enable-char-swap-window", "Character Swap Window")}
          formName="enableCharSwapWindow"
        />
      </Form>
    </div>
  );
};

export default WindowResourceSettings;
