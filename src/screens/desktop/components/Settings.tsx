import React from 'react';
import { Card, Collapse, Switch, Form, Select, Button, Input, Divider, Slider, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import './styles/Settings.css';

const { Panel } = Collapse;
const { Option } = Select;

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Sample settings state (in a real app, these would be stored in Redux or context)
  const [form] = Form.useForm();
  
  const handleFormSubmit = (values: any) => {
    console.log('Settings saved:', values);
    // Here you would dispatch actions to save settings
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
        defaultActiveKey={['1', '2', '3']} 
        className="settings-collapse"
      >
        <Panel 
          header={t("components.desktop.settings.general", "General Settings")} 
          key="1"
          className="settings-panel"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ 
              language: i18n.language,
              startWithWindows: true,
              notifications: true,
              theme: 'dark'
            }}
            onFinish={handleFormSubmit}
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
              <Radio.Group>
                <Radio value="dark">{t("components.desktop.settings.dark", "Dark")}</Radio>
                <Radio value="light">{t("components.desktop.settings.light", "Light")}</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Panel>
        
        <Panel 
          header={t("components.desktop.settings.overlay", "Overlay Settings")} 
          key="2"
          className="settings-panel"
        >
          <Form
            layout="vertical"
            initialValues={{ 
              showTeamStats: true,
              showKillFeed: true,
              opacity: 80,
              position: 'top-left'
            }}
            className="settings-form"
          >
            <Form.Item 
              name="showTeamStats" 
              label={t("components.desktop.settings.team-stats", "Show Team Stats")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item 
              name="showKillFeed" 
              label={t("components.desktop.settings.kill-feed", "Show Kill Feed")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item 
              name="opacity" 
              label={t("components.desktop.settings.opacity", "Overlay Opacity")}
            >
              <Slider
                min={20}
                max={100}
                marks={{
                  20: '20%',
                  50: '50%',
                  80: '80%',
                  100: '100%'
                }}
              />
            </Form.Item>
            
            <Form.Item 
              name="position" 
              label={t("components.desktop.settings.position", "Overlay Position")}
            >
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="top-left">
                  {t("components.desktop.settings.top-left", "Top Left")}
                </Radio.Button>
                <Radio.Button value="top-right">
                  {t("components.desktop.settings.top-right", "Top Right")}
                </Radio.Button>
                <Radio.Button value="bottom-left">
                  {t("components.desktop.settings.bottom-left", "Bottom Left")}
                </Radio.Button>
                <Radio.Button value="bottom-right">
                  {t("components.desktop.settings.bottom-right", "Bottom Right")}
                </Radio.Button>
              </Radio.Group>
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
        <Button type="primary" onClick={() => form.submit()}>
          {t("components.desktop.settings.save", "Save Settings")}
        </Button>
        <Button>
          {t("components.desktop.settings.reset", "Reset to Default")}
        </Button>
      </div>
    </div>
  );
};

export default Settings;