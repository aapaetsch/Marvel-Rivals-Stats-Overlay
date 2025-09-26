import React from 'react';
import { Segmented, Space, Typography, Divider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import { isMatchLive, hasAnyMatchData } from 'lib/matchStatusUtils';
import ForceShowCover from 'features/appSettings/forceShowCover';

const { Text } = Typography;

const CardViewCoverOverride: React.FC = () => {
  const dispatch = useDispatch();
  const { forceShowCardViewCover } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);

  const isLive = isMatchLive(currentMatch);
  const hasData = hasAnyMatchData(currentMatch);

  const handleSetCardViewCover = (val: string | number) => {
    const v = String(val) as ForceShowCover;
    dispatch(updateSettings({ forceShowCardViewCover: v }));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong>Card View Cover</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Auto = normal behavior, Show = force visible, Hide = force hidden
          </Text>
        </div>
        <Segmented
          className="themed-segmented"
          options={[
            { label: 'Auto', value: ForceShowCover.Auto },
            { label: 'Show', value: ForceShowCover.Show },
            { label: 'Hide', value: ForceShowCover.Hide },
          ]}
          value={forceShowCardViewCover}
          onChange={handleSetCardViewCover}
        />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div>
        <Text strong style={{ fontSize: 12 }}>Current Match Status:</Text>
        <div style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 11 }}>
            Live Match: <Text code>{isLive ? 'Yes' : 'No'}</Text>
          </Text>
          <br />
          <Text style={{ fontSize: 11 }}>
            Has Data: <Text code>{hasData ? 'Yes' : 'No'}</Text>
          </Text>
          <br />
          <Text style={{ fontSize: 11 }}>
            Cover Shown: <Text code>{(forceShowCardViewCover === ForceShowCover.Show) || (forceShowCardViewCover === ForceShowCover.Auto && !isLive) ? 'Yes' : 'No'}</Text>
          </Text>
        </div>
      </div>
    </Space>
  );
};

export default CardViewCoverOverride;
