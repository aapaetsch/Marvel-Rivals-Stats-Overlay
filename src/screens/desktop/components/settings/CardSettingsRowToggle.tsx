// filepath: c:\Users\aapae\Documents\Overwolf Projects\rivalsreactoverlay\src\screens\desktop\components\settings\CardSettingsRowToggle.fixed.tsx
import React from 'react';
import { Form, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateSettings } from 'features/appSettings/appSettingsSlice';

interface CardSettingsRowToggleProps {
  /**
   * The label to display for this setting
   */
  label: string;
  
  /**
   * The form field name to bind to
   */
  formName: string;
  
  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;
  
  /**
   * Optional callback function when the switch value changes
   */
  onChange?: (checked: boolean) => void;
  
  /**
   * Whether to show a dynamic label (Show/Hide)
   */
  dynamicLabel?: boolean;
  
  /**
   * Optional tooltip text to show when hovering over the setting
   */
  tooltip?: string;
}

/**
 * A reusable component for creating toggle settings rows
 * with direct updates to Redux when toggled
 */
const CardSettingsRowToggle: React.FC<CardSettingsRowToggleProps> = ({
  label,
  formName,
  disabled = false,
  onChange,
  dynamicLabel = true,
  tooltip
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formInstance = Form.useFormInstance();
  const fieldValue = Form.useWatch(formName, formInstance);
  
  const handleRowClick = () => {
    if (disabled) return;
    
    // Toggle the value
    const newValue = !fieldValue;
    
    // Update the form
    formInstance.setFieldValue(formName, newValue);
    
    // Update Redux directly
    const updateObj: any = {};
    updateObj[formName] = newValue;
    dispatch(updateSettings(updateObj));
    
    // Call the onChange handler if provided
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const getLabelText = () => {
    if (!dynamicLabel) return label;
    
    const prefix = fieldValue ? 
      t("components.desktop.settings.show", "Show") : 
      t("components.desktop.settings.hide", "Hide");
    
    return `${prefix} ${label}`;
  };
  
  return (
    <div className="card-settings-row" onClick={handleRowClick}>
      <span className="card-settings-label is-indented">
        {getLabelText()}
        {tooltip && <span className="settings-tooltip">{tooltip}</span>}
      </span>
      <div className="card-settings-toggles">
        <Form.Item 
          name={formName} 
          noStyle
          valuePropName="checked"
          getValueFromEvent={(checked) => checked}
        >
          <Switch 
            disabled={disabled}
            onChange={(checked) => {
              // Update the form first (this will trigger Form.useWatch updates)
              formInstance.setFieldValue(formName, checked);
              
              // Update Redux directly
              const updateObj: any = {};
              updateObj[formName] = checked;
              dispatch(updateSettings(updateObj));
              
              // Call the provided onChange handler if it exists
              if (onChange) {
                onChange(checked);
              }
            }}
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default CardSettingsRowToggle;
