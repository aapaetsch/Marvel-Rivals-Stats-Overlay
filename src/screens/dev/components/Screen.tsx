import React, { useEffect } from 'react';
import 'antd/dist/reset.css';
import { Tabs } from 'antd';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import LogReplayer from './LogReplayer';
import DevStoreViewer from 'screens/desktop/components/DevStoreViewer';
import DevWindowHeader from './DevWindowHeader';
// DevControls removed; controls moved to App Status
import 'screens/desktop/components/styles/themes.css';
import './styles/DevScreen.css';
import AppStatus from './appStatus/AppStatus';

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
          { key: 'replay', label: 'Log Replayer', children: <LogReplayer /> },
          { key: 'redux', label: 'Redux Viewer', children: <DevStoreViewer /> }
        ]}
      />
    </div>
  );
};

export default DevScreen;
