import React from 'react';
import { Form, FormInstance } from 'antd';
import ModernTabbedSettings from './components/settings/ModernTabbedSettings';
import './components/styles/Settings.css';
import './components/styles/ModernTabbedSettings.css';

/**
 * Modern Settings Screen - A cleaner, more modern settings interface
 */
interface ModernSettingsScreenProps {
  form: FormInstance<any>;
}

const ModernSettingsScreen: React.FC<ModernSettingsScreenProps> = ({ form }) => {
  return (
    <div className="modern-settings-screen">
      <div className="settings-container">
        <Form form={form} component={false}>
          <ModernTabbedSettings form={form} />
        </Form>
      </div>
    </div>
  );
};

export default ModernSettingsScreen;