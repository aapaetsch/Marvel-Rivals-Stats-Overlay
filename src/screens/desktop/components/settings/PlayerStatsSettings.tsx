import React, { useEffect, useState } from 'react';
import { Segmented, Form } from 'antd';
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
  // Ultra compact watchers
  const ultraCompactOwnPlayerCard = Form.useWatch('ultraCompactOwnPlayerCard', form);
  const ultraCompactTeammate1 = Form.useWatch('ultraCompactTeammate1', form);
  const ultraCompactTeammate2 = Form.useWatch('ultraCompactTeammate2', form);
  const ultraCompactTeammate3 = Form.useWatch('ultraCompactTeammate3', form);
  const ultraCompactTeammate4 = Form.useWatch('ultraCompactTeammate4', form);
  const ultraCompactTeammate5 = Form.useWatch('ultraCompactTeammate5', form);
  
  // Calculate the initial visibility value based on current toggle states (show | hide | mixed)
  const initialVisibilityValue = (): 'show' | 'hide' | 'mixed' => {
    const flags = [
      !!showOwnPlayerCard,
      !!showTeammate1,
      !!showTeammate2,
      !!showTeammate3,
      !!showTeammate4,
      !!showTeammate5,
    ];
    const allTrue = flags.every(Boolean);
    const allFalse = flags.every((f) => !f);
    if (allTrue) return 'show';
    if (allFalse) return 'hide';
    return 'mixed';
  };
  
  // Calculate the initial compact value based on current toggle states
    // State for the segmented controls with calculated initial values
  const [visibilityValue, setVisibilityValue] = useState<string>(initialVisibilityValue());
  // 3-way apply-all (expanded | compact | ultra)
  const computeApplyAllLayout = (): 'expanded' | 'compact' | 'ultra' | 'mixed' => {
    const rowVals: Array<'expanded' | 'compact' | 'ultra'> = [
      ultraCompactOwnPlayerCard ? 'ultra' : (compactOwnPlayerCard ? 'compact' : 'expanded'),
      ultraCompactTeammate1 ? 'ultra' : (compactTeammate1 ? 'compact' : 'expanded'),
      ultraCompactTeammate2 ? 'ultra' : (compactTeammate2 ? 'compact' : 'expanded'),
      ultraCompactTeammate3 ? 'ultra' : (compactTeammate3 ? 'compact' : 'expanded'),
      ultraCompactTeammate4 ? 'ultra' : (compactTeammate4 ? 'compact' : 'expanded'),
      ultraCompactTeammate5 ? 'ultra' : (compactTeammate5 ? 'compact' : 'expanded'),
    ];
    const first = rowVals[0];
    const allSame = rowVals.every((v) => v === first);
    return allSame ? first : 'mixed';
  };
  const [applyAllLayout, setApplyAllLayout] = useState<'expanded' | 'compact' | 'ultra' | 'mixed'>(computeApplyAllLayout());

  // Update segmented controls whenever any relevant form field changes
  useEffect(() => {
    const flags = [
      !!showOwnPlayerCard,
      !!showTeammate1,
      !!showTeammate2,
      !!showTeammate3,
      !!showTeammate4,
      !!showTeammate5,
    ];
    const allTrue = flags.every(Boolean);
    const allFalse = flags.every((f) => !f);
    setVisibilityValue(allTrue ? 'show' : allFalse ? 'hide' : 'mixed');
  }, [
    showOwnPlayerCard,
    showTeammate1,
    showTeammate2,
    showTeammate3,
    showTeammate4,
    showTeammate5
  ]);
  
  // No separate compact segmented anymore
  // Keep the 3-way apply-all control in sync
  useEffect(() => {
    const rowVals: Array<'expanded' | 'compact' | 'ultra'> = [
      ultraCompactOwnPlayerCard ? 'ultra' : (compactOwnPlayerCard ? 'compact' : 'expanded'),
      ultraCompactTeammate1 ? 'ultra' : (compactTeammate1 ? 'compact' : 'expanded'),
      ultraCompactTeammate2 ? 'ultra' : (compactTeammate2 ? 'compact' : 'expanded'),
      ultraCompactTeammate3 ? 'ultra' : (compactTeammate3 ? 'compact' : 'expanded'),
      ultraCompactTeammate4 ? 'ultra' : (compactTeammate4 ? 'compact' : 'expanded'),
      ultraCompactTeammate5 ? 'ultra' : (compactTeammate5 ? 'compact' : 'expanded'),
    ];
    const first = rowVals[0];
    const allSame = rowVals.every((v) => v === first);
    setApplyAllLayout(allSame ? first : 'mixed');
  }, [
    compactOwnPlayerCard, compactTeammate1, compactTeammate2, compactTeammate3, compactTeammate4, compactTeammate5,
    ultraCompactOwnPlayerCard, ultraCompactTeammate1, ultraCompactTeammate2, ultraCompactTeammate3, ultraCompactTeammate4, ultraCompactTeammate5
  ]);
  
  // Handler for "Apply to All" visibility toggle
  const handleApplyAllVisibility = (value: 'show' | 'hide' | 'mixed') => {
    if (value === 'mixed') return; // not selectable
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
  
  // Apply to all (3-way)
  const handleApplyAllLayout = (value: 'expanded' | 'compact' | 'ultra' | 'mixed') => {
    if (value === 'mixed') return; // not selectable
    const currentValues = form.getFieldsValue();
    const setCompact = value === 'compact';
    const setUltra = value === 'ultra';
    const newValues = {
      ...currentValues,
      // own
      compactOwnPlayerCard: setCompact,
      ultraCompactOwnPlayerCard: setUltra,
      // teammates
      compactTeammate1: setCompact,
      ultraCompactTeammate1: setUltra,
      compactTeammate2: setCompact,
      ultraCompactTeammate2: setUltra,
      compactTeammate3: setCompact,
      ultraCompactTeammate3: setUltra,
      compactTeammate4: setCompact,
      ultraCompactTeammate4: setUltra,
      compactTeammate5: setCompact,
      ultraCompactTeammate5: setUltra,
    };
    form.setFieldsValue(newValues);
    dispatch(updateSettings(newValues));
    // Immediate UI feedback
    setApplyAllLayout(value);
    const uniform = value as 'expanded' | 'compact' | 'ultra';
    setRowLayoutState({
      own: uniform,
      1: uniform,
      2: uniform,
      3: uniform,
      4: uniform,
      5: uniform,
    } as any);
  };

  // Per-row layout setter
  type CardKey = 'own' | 1 | 2 | 3 | 4 | 5;
  const setRowLayout = (key: CardKey, layout: 'expanded' | 'compact' | 'ultra') => {
    const currentValues = form.getFieldsValue();
    const setCompact = layout === 'compact';
    const setUltra = layout === 'ultra';
    const field = (name: string) => {
      switch (key) {
        case 'own': return name.replace('Teammate', 'OwnPlayerCard');
        case 1: return name + '1';
        case 2: return name + '2';
        case 3: return name + '3';
        case 4: return name + '4';
        case 5: return name + '5';
      }
    };
    const newValues = {
      ...currentValues,
      [field('compactTeammate')!]: setCompact,
      [field('ultraCompactTeammate')!]: setUltra,
    };
    form.setFieldsValue(newValues);
    dispatch(updateSettings(newValues));
    // Update local UI state immediately for snappy switch feedback
    setRowLayoutState((prev) => ({
      ...prev,
      [key]: layout,
    }) as any);
    // Apply-to-all should reflect divergence immediately
    setApplyAllLayout('mixed');
  };

  const computeRowLayout = () => ({
    own: ultraCompactOwnPlayerCard ? 'ultra' : (compactOwnPlayerCard ? 'compact' : 'expanded'),
    1: ultraCompactTeammate1 ? 'ultra' : (compactTeammate1 ? 'compact' : 'expanded'),
    2: ultraCompactTeammate2 ? 'ultra' : (compactTeammate2 ? 'compact' : 'expanded'),
    3: ultraCompactTeammate3 ? 'ultra' : (compactTeammate3 ? 'compact' : 'expanded'),
    4: ultraCompactTeammate4 ? 'ultra' : (compactTeammate4 ? 'compact' : 'expanded'),
    5: ultraCompactTeammate5 ? 'ultra' : (compactTeammate5 ? 'compact' : 'expanded'),
  } as const);
  const [rowLayout, setRowLayoutState] = useState(computeRowLayout());
  useEffect(() => {
    setRowLayoutState({
      own: ultraCompactOwnPlayerCard ? 'ultra' : (compactOwnPlayerCard ? 'compact' : 'expanded'),
      1: ultraCompactTeammate1 ? 'ultra' : (compactTeammate1 ? 'compact' : 'expanded'),
      2: ultraCompactTeammate2 ? 'ultra' : (compactTeammate2 ? 'compact' : 'expanded'),
      3: ultraCompactTeammate3 ? 'ultra' : (compactTeammate3 ? 'compact' : 'expanded'),
      4: ultraCompactTeammate4 ? 'ultra' : (compactTeammate4 ? 'compact' : 'expanded'),
      5: ultraCompactTeammate5 ? 'ultra' : (compactTeammate5 ? 'compact' : 'expanded'),
    } as any);
  }, [
    compactOwnPlayerCard, ultraCompactOwnPlayerCard,
    compactTeammate1, ultraCompactTeammate1,
    compactTeammate2, ultraCompactTeammate2,
    compactTeammate3, ultraCompactTeammate3,
    compactTeammate4, ultraCompactTeammate4,
    compactTeammate5, ultraCompactTeammate5
  ]);

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
                { label: t("components.desktop.settings.mixed", "Mixed"), value: 'mixed', disabled: true },
              ]}
              onChange={(val) => handleApplyAllVisibility(val as 'show' | 'hide' | 'mixed')}
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
            {t("components.desktop.settings.card-layout", "Card Layout")}
          </div>
          <div className="apply-all-toggle">
            <span>{t("components.desktop.settings.apply-all-layout", "Apply to All")}</span>
            <Segmented
              options={[
                { label: t("components.desktop.settings.expanded", "Expanded"), value: 'expanded' },
                { label: t("components.desktop.settings.compact", "Compact"), value: 'compact' },
                { label: t("components.desktop.settings.ultra", "Ultra"), value: 'ultra' },
                { label: t("components.desktop.settings.mixed", "Mixed"), value: 'mixed', disabled: true },
              ]}
              value={applyAllLayout}
              onChange={handleApplyAllLayout as any}
            />
          </div>

          {/* Per-row 3-way segmented controls */}
          <div className="settings-row-triple">
            <span>{t("components.desktop.settings.your-player-card", "Your Player Card")}</span>
            <Segmented
              options={[
                { label: t("components.desktop.settings.expanded", "Expanded"), value: 'expanded' },
                { label: t("components.desktop.settings.compact", "Compact"), value: 'compact' },
                { label: t("components.desktop.settings.ultra", "Ultra"), value: 'ultra' },
              ]}
              value={rowLayout.own}
              onChange={(val) => setRowLayout('own', val as 'expanded' | 'compact' | 'ultra')}
            />
          </div>

          {[1,2,3,4,5].map((i) => (
            <div key={i} className="settings-row-triple">
              <span>{t(`components.desktop.settings.teammate-${i}`, `Teammate ${i}`)}</span>
              <Segmented
                options={[
                  { label: t("components.desktop.settings.expanded", "Expanded"), value: 'expanded' },
                  { label: t("components.desktop.settings.compact", "Compact"), value: 'compact' },
                  { label: t("components.desktop.settings.ultra", "Ultra"), value: 'ultra' },
                ]}
                value={rowLayout[i as 1|2|3|4|5] as 'expanded' | 'compact' | 'ultra'}
                onChange={(val) => setRowLayout(i as any, val as 'expanded' | 'compact' | 'ultra')}
              />
            </div>
          ))}
        </div>
        <div style={{ height: '60px' }}></div> {/* Extra space for scrolling */}
      </div>
    </>
  );
};

export default PlayerStatsSettings;
