// filepath: c:\Users\aapae\Documents\Overwolf Projects\rivalsreactoverlay\src\screens\desktop\components\settings\CardSettingsRowColorPicker.fixed.tsx
import React from 'react';
import { Form, ColorPicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import { Color } from 'antd/es/color-picker';

interface CardSettingsRowColorPickerProps {
  label: string;
  formName: string;
  dynamicLabel?: boolean;
  tooltip?: string;
  initialValue?: string;
}

/**
 * A component for displaying a color picker setting in a card-like format
 * with automatic Redux updates when the color changes
 */
const CardSettingsRowColorPicker: React.FC<CardSettingsRowColorPickerProps> = ({
  label,
  formName,
  dynamicLabel = true,
  tooltip,
  initialValue = '#000000'
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Format color value to show as label
  const formatColorLabel = (colorValue: string | Color) => {
    // Check if colorValue is an object (Color instance) or a string
    if (typeof colorValue === 'object' && colorValue !== null) {
      // If it's a Color object, convert to hex string
      return colorValue.toHexString().toUpperCase();
    }
    
    // If it's already a string, just uppercase it
    return typeof colorValue === 'string' ? colorValue.toUpperCase() : '#000000';
  };
  // Handle color change complete (when color picker modal is closed/confirmed)
  // This ensures we only save the final selected color, not intermediate changes
  const handleColorChangeComplete = (color: Color) => {
    const hexColor = color.toHexString();
    
    // Update Redux directly with the new color value
    const updateObj: any = {};
    updateObj[formName] = hexColor;
    dispatch(updateSettings(updateObj));
  };

  return (
    <div className="card-settings-row">
      <div className="card-settings-label">
        {dynamicLabel ? (
          <Form.Item 
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues[formName] !== currentValues[formName]
            }
          >
            {({ getFieldValue }) => {
              const currentValue = getFieldValue(formName) || initialValue;
              return (
                <div>
                  {label}
                  {tooltip && <span className="settings-tooltip">{tooltip}</span>}
                  <span className="color-value-label"> ({formatColorLabel(currentValue)})</span>
                </div>
              );
            }}
          </Form.Item>
        ) : (
          <div>
            {label}
            {tooltip && <span className="settings-tooltip">{tooltip}</span>}
          </div>
        )}
      </div>      <div className="card-settings-control">
        <Form.Item name={formName} noStyle>
          <ColorPicker 
            size="middle" 
            className="settings-color-picker-trigger" 
            onChangeComplete={handleColorChangeComplete}
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default CardSettingsRowColorPicker;
