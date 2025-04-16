import React from 'react';
import { Form, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

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
}

/**
 * A reusable component for creating toggle settings rows
 */
const CardSettingsRowToggle: React.FC<CardSettingsRowToggleProps> = ({
  label,
  formName,
  disabled = false,
  onChange,
  dynamicLabel = true
}) => {  const { t } = useTranslation();
  const formInstance = Form.useFormInstance();
  const fieldValue = Form.useWatch(formName, formInstance);
  
  const handleRowClick = () => {
    if (disabled) return;
    
    // Toggle the value
    const newValue = !fieldValue;
    
    // Update the form
    formInstance.setFieldValue(formName, newValue);
    
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
      </span>
      <div className="card-settings-toggles">
        <Form.Item 
          name={formName} 
          noStyle
          valuePropName="checked"
        >
          <Switch 
            disabled={disabled}
            onChange={onChange}
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default CardSettingsRowToggle;
