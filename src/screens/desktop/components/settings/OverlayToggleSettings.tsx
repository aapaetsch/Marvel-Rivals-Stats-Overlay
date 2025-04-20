import React from 'react';
import { Form, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import CardSettingsRowToggle from './CardSettingsRowToggle';
import '../styles/Settings.css';

interface OverlayToggleSettingsProps {
  form: any; // Form instance passed from parent
  isPositioningMode: boolean; // Whether positioning mode is active
  onEditPositions: (enable: boolean) => void; // Function to toggle positioning mode
  onSavePositions: () => void; // Function to save positions
}

/**
 * Component for Overlay Toggles in settings
 */
const OverlayToggleSettings: React.FC<OverlayToggleSettingsProps> = ({ form, isPositioningMode, onEditPositions, onSavePositions }) => {
  const { t } = useTranslation();

  return (
    <div className="settings-columns">        
      <div className="settings-column">
        <div className="settings-column-title">
          {t("components.desktop.settings.overlay-visibility", "Overlay Visibility")}
        </div>
        <CardSettingsRowToggle
          label={t("components.desktop.settings.player-stats-overlay", "Show Player Stats Overlay")} // Renamed label
          formName="showTeamStats" // Keep formName as it likely maps to the state key
          dynamicLabel={false}
        />
        <CardSettingsRowToggle
          label={t("components.desktop.settings.player-swap", "Player Swap Notifications")}
          formName="showPlayerSwapNotification"
          dynamicLabel={false}
        />
        <CardSettingsRowToggle
          label={t("components.desktop.settings.final-hits", "Final Hits Overlay")}
          formName="showFinalHitsOverlay"
          dynamicLabel={false}
        />
      </div>
  </div>
  );
};

export default OverlayToggleSettings;
