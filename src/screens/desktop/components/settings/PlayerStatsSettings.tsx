import React from 'react';
import { Form, Switch, Slider, ColorPicker, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import CardSettingsRowToggle from './CardSettingsRowToggle';
import CardSettingsRowSlider from './CardSettingsRowSlider';
import CardSettingsRowColorPicker from './CardSettingsRowColorPicker';
import '../styles/Settings.css';

interface PlayerStatsSettingsProps {
  form: any; // Form instance passed from parent
}

/**
 * Component for Player Stats Overlay settings
 */
const PlayerStatsSettings: React.FC<PlayerStatsSettingsProps> = ({ form }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Handler for "Apply to All" visibility toggle
  const handleApplyAllVisibility = (value: string) => {
    const checked = value === 'show';
    const currentValues = form.getFieldsValue();
    const newValues = {
      ...currentValues,
      showOwnPlayerCard: checked,
      showTeammate1: checked,
      showTeammate2: checked,
      showTeammate3: checked,
      showTeammate4: checked,
      showTeammate5: checked,
    };
    form.setFieldsValue(newValues);
    dispatch(updateSettings(newValues));
  };
  
  // Handler for "Apply to All" compact toggle
  const handleApplyAllCompact = (value: string) => {
    const checked = value === 'compact';
    const currentValues = form.getFieldsValue();
    const newValues = {
      ...currentValues,
      compactOwnPlayerCard: checked,
      compactTeammate1: checked,
      compactTeammate2: checked,
      compactTeammate3: checked,
      compactTeammate4: checked,
      compactTeammate5: checked,
    };
    form.setFieldsValue(newValues);
    dispatch(updateSettings(newValues));
  };

  return (
    <>
      <div className="settings-columns">        
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
      </div>
      
      {/* Visibility and Card Layout settings */}
      <div className="settings-columns">              
        <div className="settings-column">
          <div className="settings-column-title">
            {t("components.desktop.settings.visibility", "Visibility Settings")}
          </div>
          <div className="apply-all-toggle">
            <span>{t("components.desktop.settings.apply-all-visibility", "Apply to All")}</span>
            <Segmented
              options={[
                { label: t("components.desktop.settings.show", "Show"), value: 'show' },
                { label: t("components.desktop.settings.hide", "Hide"), value: 'hide' },
              ]}
              onChange={handleApplyAllVisibility}
            />
          </div>
          <CardSettingsRowToggle
            label={t("components.desktop.settings.your-player-card", "Your Player Card")}
            formName="showOwnPlayerCard"
          />
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-1", "Teammate 1")}
            formName="showTeammate1"
          />
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-2", "Teammate 2")}
            formName="showTeammate2"
          />
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-3", "Teammate 3")}
            formName="showTeammate3"
          />
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-4", "Teammate 4")}
            formName="showTeammate4"
          />
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-5", "Teammate 5")}
            formName="showTeammate5"
          />
        </div>
        <div className="settings-column">
          <div className="settings-column-title">
            {t("components.desktop.settings.use-compact-card", "Use Compact Card")}
          </div>
          <div className="apply-all-toggle">
            <span>{t("components.desktop.settings.apply-all-compact", "Apply to All")}</span>
            <Segmented
              options={[
                { label: t("components.desktop.settings.compact", "Compact"), value: 'compact' },
                { label: t("components.desktop.settings.expanded", "Expanded"), value: 'expanded' },
              ]}
              onChange={handleApplyAllCompact}
            />
          </div>
          <CardSettingsRowToggle
            label={t("components.desktop.settings.your-player-card", "Your Player Card")}
            formName="compactOwnPlayerCard"
            dynamicLabel={false}
          />
          
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-1", "Teammate 1")}
            formName="compactTeammate1"
            dynamicLabel={false}
          />
          
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-2", "Teammate 2")}
            formName="compactTeammate2"
            dynamicLabel={false}
          />
          
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-3", "Teammate 3")}
            formName="compactTeammate3"
            dynamicLabel={false}
          />
          
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-4", "Teammate 4")}
            formName="compactTeammate4"
            dynamicLabel={false}
          />
          
          <CardSettingsRowToggle
            label={t("components.desktop.settings.teammate-5", "Teammate 5")}
            formName="compactTeammate5"
            dynamicLabel={false}
          />
        </div>
      </div>
    </>
  );
};

export default PlayerStatsSettings;
