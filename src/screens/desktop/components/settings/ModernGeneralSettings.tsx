import React from 'react';
import { Switch, FormInstance, Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { updateSettings, Themes } from 'features/appSettings/appSettingsSlice';

const { Option } = Select;

// General Settings Component (Application Settings Only)
interface ModernGeneralSettingsProps {
  form?: FormInstance<any>;
}

/**
 * Modern General Settings component that includes only application settings
 * Window resource management is now handled in respective overlay tabs
 */
export const ModernGeneralSettingsComponent: React.FC<ModernGeneralSettingsProps> = ({ form: parentForm }) => {
  const { t, i18n } = useTranslation();
  const appSettings = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  const dispatch = useDispatch();
  const [localForm] = Form.useForm();
  const form = parentForm || localForm;
  
  // Set the form values from Redux when component mounts
  React.useEffect(() => {
    form.setFieldsValue({
      language: appSettings.language,
      theme: appSettings.theme,
      showDevWindow: appSettings.showDevWindow,
    });
  }, [appSettings, form]);
  
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
    // Also update the Redux store
    dispatch(updateSettings({ language: langCode }));
  };

  const handleThemeChange = (value: Themes) => {
    dispatch(updateSettings({ theme: value }));
  };

  const handleToggleDevWindow = (checked: boolean) => {
    dispatch(updateSettings({ showDevWindow: checked }));
  };

  return (
    <div className="modern-general-settings">
      {/* Application Settings Section */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">
          {t("components.desktop.settings.application-settings", "Application Settings")}
        </h4>
        <div className="settings-subsection-content">
          <Form form={form} className="settings-form" layout="vertical">
            <Form.Item 
              name="language" 
              label={t("components.desktop.settings.language", "Language")}
            >
              <Select 
                onChange={changeLanguage}
                className="settings-select"
                value={appSettings.language}
              >
                {languages.map(lang => (
                  <Option key={lang.value} value={lang.value}>{lang.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item 
              name="theme" 
              label={t("components.desktop.settings.theme", "Theme")}
            >
              <Select 
                className="settings-select"
                value={appSettings.theme}
                onChange={handleThemeChange}
              >
                <Option value={Themes.DARK}>{t("components.desktop.settings.dark", "Dark")}</Option>
                <Option value={Themes.LIGHT}>{t("components.desktop.settings.light", "Light")}</Option>
                <Option value={Themes.MINIMALISTIC_BLACK}>{t("components.desktop.settings.minimalistic-black", "Minimalistic Black")}</Option>
              </Select>
            </Form.Item>
            <Form.Item 
              name="showDevWindow" 
              label={t("components.desktop.settings.show-dev-window", "Show Dev Window")}
              valuePropName="checked"
            >
              <Switch onChange={handleToggleDevWindow} checked={appSettings.showDevWindow} />
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ModernGeneralSettingsComponent;