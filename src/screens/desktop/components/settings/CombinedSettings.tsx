import React from 'react';
import { Tabs, FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import { GeneralSettingsComponent } from './Settings';
import OverlaySettingsComponent from './OverlaySettings';
import '../styles/Settings.css';

const { TabPane } = Tabs;

interface CombinedSettingsProps {
  form: FormInstance<any>;
}

const CombinedSettings: React.FC<CombinedSettingsProps> = ({ form }) => {
  const { t } = useTranslation();
  
  return (
    <Tabs defaultActiveKey="general" className="settings-tabs settings-tabs-sticky">
      <TabPane 
        tab={t('components.desktop.settings.general', 'General')} 
        key="general"
      >
        <GeneralSettingsComponent form={form} />
      </TabPane>
      
      <TabPane 
        tab={t('components.desktop.settings.overlay-settings', 'Overlay')} 
        key="overlay"
      >
        <OverlaySettingsComponent form={form} />
      </TabPane>
    </Tabs>
  );
};

export default CombinedSettings;
