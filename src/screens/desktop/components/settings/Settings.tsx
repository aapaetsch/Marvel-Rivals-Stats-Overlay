import React, { useEffect } from 'react';
import { Collapse, Switch, Form, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/shared/store';
import { updateSettings, resetSettings, GeneralSettings } from 'features/appSettings/appSettingsSlice';
import { isDev } from 'lib/utils';
import OverlaySettingsComponent from './OverlaySettings';
import '../styles/Settings.css';

const { Panel } = Collapse;
const { Option } = Select;

// General Settings Component
export const GeneralSettingsComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  const [generalForm] = Form.useForm();
  
  useEffect(() => {
    generalForm.setFieldsValue({
      language: appSettings.language,
      startWithWindows: appSettings.startWithWindows,
      notifications: appSettings.notifications,
      theme: appSettings.theme,
      showStoreViewer: appSettings.showStoreViewer
    });
  }, [appSettings, generalForm]);
  
  const handleGeneralFormSubmit = (values: any) => {
    dispatch(updateSettings(values));
    if (values.language !== appSettings.language) {
      i18n.changeLanguage(values.language);
    }
  };

  const handleResetGeneral = () => {
    const defaultGeneralSettings: GeneralSettings = {
      language: 'en',
      theme: 'dark',
      startWithWindows: true,
      notifications: true,
      showStoreViewer: false,
    };
    generalForm.setFieldsValue(defaultGeneralSettings);
    dispatch(updateSettings(defaultGeneralSettings));
    i18n.changeLanguage('en');
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'ko', label: 'Korean' },
    { value: 'pl', label: 'Polski' },
    { value: 'tr', label: 'Türkçe' },
  ];
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="settings-container">
      <Collapse 
        defaultActiveKey={['1', '3']} 
        className="settings-collapse"
      >
        <Panel 
          header={t("components.desktop.settings.general", "General Settings")} 
          key="1"
          className="settings-panel"
        >
          <Form
            form={generalForm}
            layout="vertical"
            initialValues={{ 
              language: appSettings.language,
              startWithWindows: appSettings.startWithWindows,
              notifications: appSettings.notifications,
              theme: appSettings.theme
            }}
            onFinish={handleGeneralFormSubmit}
            className="settings-form"
          >
            <Form.Item 
              name="language" 
              label={t("components.desktop.settings.language", "Language")}
            >
              <Select 
                onChange={changeLanguage}
                className="settings-select"
              >
                {languages.map(lang => (
                  <Option key={lang.value} value={lang.value}>{lang.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item 
              name="startWithWindows" 
              label={t("components.desktop.settings.startup", "Start with Windows")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item 
              name="notifications" 
              label={t("components.desktop.settings.notifications", "Enable Notifications")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>              
            <Form.Item 
              name="theme" 
              label={t("components.desktop.settings.theme", "Application Theme")}
            >
              <Select>
                <Option value="dark">{t("components.desktop.settings.dark", "Dark")}</Option>
                <Option value="light">{t("components.desktop.settings.light", "Light")}</Option>
                <Option value="minimalistic-black">{t("components.desktop.settings.minimalistic-black", "Minimalistic Black")}</Option>
              </Select>
            </Form.Item>
            <Form.Item 
                name="showStoreViewer" 
                label="Show Redux Store Viewer"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
          </Form>
        </Panel>
        
        <Panel 
          header={t("components.desktop.settings.about", "About")} 
          key="3"
          className="settings-panel"
        >
          <div className="about-content">
            <h3>Rivals Overlay</h3>
            <p>Version 0.1.0</p>
            <p>A stats tracker and overlay for Marvel Rivals</p>
            <Divider />
            <div className="button-group">
              <Button type="primary">
                {t("components.desktop.settings.check-updates", "Check for Updates")}
              </Button>
              <Button>
                {t("components.desktop.settings.support", "Get Support")}
              </Button>
              <Button>
                {t("components.desktop.settings.feedback", "Send Feedback")}
              </Button>
            </div>
          </div>
        </Panel>
      </Collapse>
      
      <div className="settings-actions">
        <Button type="primary" onClick={() => generalForm.submit()}>
          {t("components.desktop.settings.save", "Save Settings")}
        </Button>
        <Button onClick={handleResetGeneral}>
          {t("components.desktop.settings.reset", "Reset to Default")}
        </Button>
      </div>
    </div>
  );
};

// Overlay Settings Component is now imported from './OverlaySettings'

// Main Settings component (for backward compatibility)
const Settings: React.FC<{ defaultActiveTab?: string }> = ({ defaultActiveTab = 'general' }) => {
  return defaultActiveTab === 'general' 
    ? <GeneralSettingsComponent /> 
    : <OverlaySettingsComponent />;
};

export default Settings;
