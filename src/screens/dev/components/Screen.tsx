import React, { useEffect } from 'react';
import 'antd/dist/reset.css';
import { Tabs } from 'antd';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import LogReplayer from './LogReplayer';
import DevStoreViewer from 'screens/desktop/components/DevStoreViewer';
import DevWindowHeader from './DevWindowHeader';
import '../../../app/shared/themes.css';
import './styles/DevScreen.css';
import AppStatus from './appStatus/AppStatus';
import OverridesTab from './OverridesTab';
import PayloadsTab from './PayloadsTab';
import AdManagerTab from './AdManagerTab';

const DevScreen: React.FC = () => {
  const { theme } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);

  // Apply the selected theme to the body element for Dev window
  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-minimalistic-black');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <div className="dev-window-root">
      <DevWindowHeader />
      <Tabs
        defaultActiveKey="appstatus"
        destroyInactiveTabPane
        className="dev-tabs"
        items={[
          { key: 'appstatus', label: 'App Status', children: <AppStatus /> },
          { key: 'ads', label: 'Ad Manager', children: <AdManagerTab /> },
          { key: 'payloads', label: 'Payloads', children: <PayloadsTab /> },
          { key: 'overrides', label: 'Overrides', children: <OverridesTab /> },
          { key: 'replay', label: 'Log Replayer', children: <LogReplayer /> },
          { key: 'redux', label: 'Redux Viewer', children: <DevStoreViewer /> }
        ]}
      />
    </div>
  );
};

export default DevScreen;
