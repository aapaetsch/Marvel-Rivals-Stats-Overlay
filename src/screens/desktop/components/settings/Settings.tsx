import React from 'react';
import { Collapse, Switch, FormInstance, Form, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import '../styles/Settings.css';
import { Themes, updateSettings } from 'features/appSettings/appSettingsSlice';
import WindowResourceSettings from './WindowResourceSettings';
import RecentPlayersSettings from './RecentPlayersSettings';

const { Panel } = Collapse;
const { Option } = Select;

// General Settings Component
interface GeneralSettingsProps {
  form?: FormInstance<any>; // Optional since it might be used standalone or with a parent form
}

export const GeneralSettingsComponent: React.FC<GeneralSettingsProps> = ({ form: parentForm }) => {
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
      // Add overlay visibility settings
      // showTeamStats: appSettings.showTeamStats,
      // showPlayerSwapNotification: appSettings.showPlayerSwapNotification,
      // showFinalHitsOverlay: appSettings.showFinalHitsOverlay,
      // Window resource management settings
      // enablePlayerStatsWindow: appSettings.enablePlayerStatsWindow,
      // enableFinalHitsWindow: appSettings.enableFinalHitsWindow,
      // enableCharSwapWindow: appSettings.enableCharSwapWindow
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
    <div className="settings-container">      
      <Collapse 
        defaultActiveKey={['1', '2']} 
        className="settings-collapse"
      >        
        <Panel 
          header={t("components.desktop.settings.general-settings", "General Settings")} 
          key="1"
          className="settings-panel"
        >
          <Form form={form} className="settings-form">
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
        </Panel>

        <Panel 
          header={t("components.desktop.settings.recent-players-settings", "Recent Players")} 
          key="2"
          className="settings-panel"
        >
          <RecentPlayersSettings form={form} />
        </Panel>

        {/* <Panel 
          header={t("components.desktop.settings.window-resource-management", "Window Resource Management")} 
          key="2"
          className="settings-panel"
        >
          <WindowResourceSettings form={form} />
        </Panel> */}
        {/* <Panel 
          header={t("components.desktop.settings.overlay-visibility", "Overlay Visibility")} 
          key="3"
          className="settings-panel"
        >
          <Form form={form} className="settings-form">
            <div className="settings-column">
              <Form.Item
                name="showTeamStats"
                label={t("components.desktop.settings.player-stats-overlay", "Show Player Stats Overlay")}
                valuePropName="checked"
              >
                <Switch onChange={(checked) => dispatch(updateSettings({ showTeamStats: checked }))} />
              </Form.Item>
              
              <Form.Item
                name="showPlayerSwapNotification"
                label={t("components.desktop.settings.player-swap", "Player Swap Notifications")}
                valuePropName="checked"
              >
                <Switch onChange={(checked) => dispatch(updateSettings({ showPlayerSwapNotification: checked }))} />
              </Form.Item>
              
              <Form.Item
                name="showFinalHitsOverlay"
                label={t("components.desktop.settings.final-hits", "Final Hits Overlay")}
                valuePropName="checked"
              >
                <Switch onChange={(checked) => dispatch(updateSettings({ showFinalHitsOverlay: checked }))} />
              </Form.Item>
            </div>
          </Form>
        </Panel> */}
        {/* <Panel 
          header={t("components.desktop.set", "About")} 
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
        </Panel> */}
      </Collapse>
    </div>
  );
};
