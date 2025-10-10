import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { Typography } from 'antd';
import './styles/PayloadsTab.css';

const { Title } = Typography;

const MAX_ITEMS = 200;

const PayloadsTab: React.FC = () => {
  const { events, infos } = useSelector((s: RootReducer) => s.backgroundReducer);

  // show most recent first, but cap to MAX_ITEMS to avoid large renders
  const recentEvents = useMemo(() => {
    const list = (events || []).slice(-MAX_ITEMS);
    return list.slice().reverse();
  }, [events]);

  const recentInfos = useMemo(() => {
    const list = (infos || []).slice(-MAX_ITEMS);
    return list.slice().reverse();
  }, [infos]);

  return (
    <div className="payloads-root dev-window" style={{ padding: 12 }}>
      <Title level={4} style={{ marginTop: 0 }}>Background Payloads</Title>
      <div className="payloads-container">
        <div className="payload-panel payload-events">
          <div className="payload-panel-header">Events ({recentEvents.length})</div>
          <div className="payload-panel-body">
            {recentEvents.length === 0 ? (
              <div className="payload-empty">No events captured yet</div>
            ) : (
              recentEvents.map((ev: any, i: number) => (
                <div key={i} className="payload-item">
                  <pre>{JSON.stringify(ev, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="payload-panel payload-infos">
          <div className="payload-panel-header">Infos ({recentInfos.length})</div>
          <div className="payload-panel-body">
            {recentInfos.length === 0 ? (
              <div className="payload-empty">No infos captured yet</div>
            ) : (
              recentInfos.map((info: any, i: number) => (
                <div key={i} className="payload-item">
                  <pre>{JSON.stringify(info, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayloadsTab;
