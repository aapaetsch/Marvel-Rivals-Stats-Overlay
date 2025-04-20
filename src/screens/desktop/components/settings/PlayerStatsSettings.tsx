import React, { useEffect, useState } from 'react';
import { Segmented, Form } from 'antd'; // Added Form import
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import CardSettingsRowToggle from './CardSettingsRowToggle';
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
  
  // Watch all the form fields we need to determine the toggle states
  const showOwnPlayerCard = Form.useWatch('showOwnPlayerCard', form);
  const showTeammate1 = Form.useWatch('showTeammate1', form);
  const showTeammate2 = Form.useWatch('showTeammate2', form);
  const showTeammate3 = Form.useWatch('showTeammate3', form);
  const showTeammate4 = Form.useWatch('showTeammate4', form);
  const showTeammate5 = Form.useWatch('showTeammate5', form);
  
  const compactOwnPlayerCard = Form.useWatch('compactOwnPlayerCard', form);
  const compactTeammate1 = Form.useWatch('compactTeammate1', form);
  const compactTeammate2 = Form.useWatch('compactTeammate2', form);
  const compactTeammate3 = Form.useWatch('compactTeammate3', form);
  const compactTeammate4 = Form.useWatch('compactTeammate4', form);
  const compactTeammate5 = Form.useWatch('compactTeammate5', form);
  
  // Calculate the initial visibility value based on current toggle states
  const initialVisibilityValue = (): string => {
    const allHidden = !showOwnPlayerCard && 
      !showTeammate1 && 
      !showTeammate2 && 
      !showTeammate3 && 
      !showTeammate4 && 
      !showTeammate5;
    return allHidden ? 'hide' : 'show';
  };
  
  // Calculate the initial compact value based on current toggle states
  const initialCompactValue = (): string => {
    const allCompact = compactOwnPlayerCard && 
      compactTeammate1 && 
      compactTeammate2 && 
      compactTeammate3 && 
      compactTeammate4 && 
      compactTeammate5;
    return allCompact ? 'compact' : 'expanded';
  };
    // State for the segmented controls with calculated initial values
  const [visibilityValue, setVisibilityValue] = useState<string>(initialVisibilityValue());
  const [compactValue, setCompactValue] = useState<string>(initialCompactValue());

  // Update segmented controls whenever any relevant form field changes
  useEffect(() => {
    // Check if all player cards are hidden
    const allHidden = !showOwnPlayerCard && 
      !showTeammate1 && 
      !showTeammate2 && 
      !showTeammate3 && 
      !showTeammate4 && 
      !showTeammate5;
      
    // Update the visibility segmented control
    setVisibilityValue(allHidden ? 'hide' : 'show');
  }, [
    showOwnPlayerCard,
    showTeammate1,
    showTeammate2,
    showTeammate3,
    showTeammate4,
    showTeammate5
  ]);
  
  // Update compact segmented control whenever any compact setting changes
  useEffect(() => {
    // Check if all player cards are compact
    const allCompact = compactOwnPlayerCard && 
      compactTeammate1 && 
      compactTeammate2 && 
      compactTeammate3 && 
      compactTeammate4 && 
      compactTeammate5;
    
    // Update the compact segmented control
    setCompactValue(allCompact ? 'compact' : 'expanded');
  }, [
    compactOwnPlayerCard,
    compactTeammate1,
    compactTeammate2,
    compactTeammate3,
    compactTeammate4,
    compactTeammate5
  ]);
  
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
    setVisibilityValue(value);
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
    setCompactValue(value);
  };

  return (
    <>
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
              value={visibilityValue}
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
                { label: t("components.desktop.settings.expanded", "Expanded"), value: 'expanded' },
                { label: t("components.desktop.settings.compact", "Compact"), value: 'compact' },
              ]}
              onChange={handleApplyAllCompact}
              value={compactValue}
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
