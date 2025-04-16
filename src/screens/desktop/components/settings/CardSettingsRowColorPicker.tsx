import React from 'react';
import { Form, ColorPicker } from 'antd';
import { useTranslation } from 'react-i18next';
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
 */
const CardSettingsRowColorPicker: React.FC<CardSettingsRowColorPickerProps> = ({
  label,
  formName,
  dynamicLabel = true,
  tooltip,
  initialValue = '#000000'
}) => {
  const { t } = useTranslation();

  // Format color string to show as label
  const formatColorLabel = (colorValue: string) => {
    return colorValue.toUpperCase();
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
      </div>
      <div className="card-settings-control">
        <Form.Item name={formName} noStyle>
          <ColorPicker size="small" />
        </Form.Item>
      </div>
    </div>
  );
};

export default CardSettingsRowColorPicker;
