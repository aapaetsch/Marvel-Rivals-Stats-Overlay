// filepath: c:\Users\aapae\Documents\Overwolf Projects\rivalsreactoverlay\src\screens\desktop\components\settings\OverlayPositionEditor.fixed.tsx
import React, { useState } from 'react';
import { Form, Button, InputNumber, Switch, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { WINDOW_NAMES } from 'app/shared/constants';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import '../styles/Settings.css';

interface OverlayPositionEditorProps {
  overlayKey: 'playerStats' | 'finalHitsBar' | 'charSwapBar';
  form: any; // Form instance passed from parent
  isPositioningMode: boolean;
  onEditPositions: (enable: boolean, overlayKey?: string) => void;
  onSavePositions: (overlayKey?: string) => void;
}

const gameModes = ['Domination', 'Convoy', 'Doom Match', 'Conquest'];

const OverlayPositionEditor: React.FC<OverlayPositionEditorProps> = ({
  overlayKey,
  form,
  isPositioningMode,
  onEditPositions,
  onSavePositions,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Track which game modes have custom positions enabled
  const [customEnabledModes, setCustomEnabledModes] = useState<Record<string, boolean>>({});
  
  // Map overlayKey to the actual window name if needed for drag functionality
  const windowName = overlayKey === 'playerStats' ? WINDOW_NAMES.INGAME : 
                     overlayKey === 'finalHitsBar' ? WINDOW_NAMES.FINALHITSBAR : 
                     WINDOW_NAMES.CHARSWAPBAR;

  const handlePositionChange = (key: string, axis: 'x' | 'y', value: number | null) => {
    const numValue = value === null ? 0 : value; // Handle null case from InputNumber
    const currentValues = form.getFieldsValue();
    
    const updatedPositions = {
      ...currentValues.customPositions,
      [overlayKey]: {
        ...currentValues.customPositions[overlayKey],
        [key]: {
          ...(currentValues.customPositions[overlayKey]?.[key] || {}),
          [axis]: numValue,
        },
      },
    };
    
    // Update form values
    form.setFieldsValue({ customPositions: updatedPositions });
    
    // Directly update Redux to ensure immediate effect
    dispatch(updateSettings({ customPositions: updatedPositions }));
  };
  
  // Toggle custom position for a specific game mode
  const toggleCustomMode = (mode: string, enabled: boolean) => {
    setCustomEnabledModes(prev => ({
      ...prev,
      [mode]: enabled
    }));
    
    // If disabling, reset to default position
    if (!enabled) {
      resetToDefault(mode);
    }
  };
  
  // Reset a game mode position to the _base position
  const resetToDefault = (mode: string) => {
    const currentValues = form.getFieldsValue();
    const basePosition = currentValues.customPositions[overlayKey]._base || { x: 0, y: 0 };
    
    const updatedPositions = {
      ...currentValues.customPositions,
      [overlayKey]: {
        ...currentValues.customPositions[overlayKey],
        [mode]: { ...basePosition },
      },
    };
    
    form.setFieldsValue({ customPositions: updatedPositions });
    
    // Also update Redux directly
    dispatch(updateSettings({ customPositions: updatedPositions }));
  };

  return (
    <div className="overlay-position-editor">
      <div className="settings-column-title">
        {t('components.desktop.settings.overlay-positioning', 'Overlay Positioning')}
      </div>
      {/* Default Position Section */}
      <div className="card-settings-row position-row is-flex-direction-column"> 
        <div className="is-flex is-flex-direction-row is-full-width mb-2">
          <div className="card-settings-label">
            {t('components.desktop.settings.default-position', 'Default Position')}
          </div>
          <div className="card-settings-toggles">
            <Form.Item
              name={['customPositions', overlayKey, '_base', 'x']}
              noStyle>
              <InputNumber 
                addonBefore={<span style={{ color: 'var(--primary-color-text)' }}>X</span>}
                style={{ width: '100%' }} 
                className="coordinate-input-wrapper"
                maxLength={4}
                onChange={(value: number | null) => handlePositionChange('_base', 'x', value)}
              />
            </Form.Item>
            <Form.Item
              name={['customPositions', overlayKey, '_base', 'y']}
              noStyle>
              <InputNumber 
                addonBefore={<span style={{ color: 'var(--primary-color-text)' }}>Y</span>}
                style={{ width: '100%' }} 
                className="coordinate-input-wrapper"
                maxLength={4}
                onChange={(value: number | null) => handlePositionChange('_base', 'y', value)}
              />
            </Form.Item>
          </div>        
        </div>        
        <div className="is-flex is-justify-content-flex-end mb-2 is-full-width">            
          <Space>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                // Call the original handler which will update the Redux state
                onEditPositions(!isPositioningMode, windowName);
                
                // Auto-save position when disabling drag mode
                if (isPositioningMode) {
                  onSavePositions(windowName);
                }
              }}
              className="edit-position-button"
            >
              {isPositioningMode 
                ? t('components.desktop.settings.disable-drag-mode', 'Disable Drag Mode') 
                : t('components.desktop.settings.enable-drag-move', 'Enable Drag to Move')}
            </Button>
          </Space>
        </div>
      </div>
      <div className="sub-title">
        {t('components.desktop.settings.position-by-gamemode', 'Position by Game Mode')}
      </div>
      {/* Game Mode Specific Positions */}
      {gameModes.map((mode) => (
        <div key={mode} className="game-mode-position-container">
          {/* Game Mode Toggle Row */}          
          <div className="card-settings-row is-wrap">
            <div 
              className="toggle-settings-label" 
              onClick={() => toggleCustomMode(mode, !customEnabledModes[mode])}
              style={{ cursor: 'pointer' }}
            >
              {mode}
            </div>
            <div className="card-settings-toggle">
              <Switch 
                checked={!!customEnabledModes[mode]}
                onChange={(checked) => toggleCustomMode(mode, checked)}
              />
            </div>              
            {customEnabledModes[mode] && (
              <div className="toggle-settings-content">
                <Form.Item
                  name={['customPositions', overlayKey, mode, 'x']}
                  noStyle>
                  <InputNumber 
                    addonBefore={<span style={{ color: 'var(--primary-color-text)' }}>X</span>}
                    size="small"
                    className="coordinate-input-wrapper"
                    maxLength={4}
                    onChange={(value: number | null) => handlePositionChange(mode, 'x', value)}
                  />
                </Form.Item>
                <Form.Item
                  name={['customPositions', overlayKey, mode, 'y']}
                  noStyle>
                  <InputNumber 
                    addonBefore={<span style={{ color: 'var(--primary-color-text)' }}>Y</span>}
                    className="coordinate-input-wrapper"
                    size="small"
                    maxLength={4}
                    onChange={(value: number | null) => handlePositionChange(mode, 'y', value)}
                  />
                </Form.Item>
                <div style={{ marginLeft: '8px' }}>
                  <Button
                    size="small"
                    type="default"
                    ghost
                    onClick={() => resetToDefault(mode)}
                  >
                    {t('components.desktop.settings.set-to-default', 'Set to Default')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverlayPositionEditor;
