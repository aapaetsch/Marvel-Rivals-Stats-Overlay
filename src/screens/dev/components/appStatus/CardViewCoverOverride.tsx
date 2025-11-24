import React from 'react';
import { Segmented, Space, Typography, Divider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import { Switch } from 'antd';
import Tag from 'components/Tag';
import { TagType } from 'components/Tag/TagTypes';
import { isMatchLive, hasAnyMatchData, ForceShowCover } from 'lib/matchStatusUtils';

const { Text } = Typography;

const CardViewCoverOverride: React.FC = () => {
  const dispatch = useDispatch();
  const { forceShowCardViewCover, useMatchHistoryTestData, useMatchTableTestData } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
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

  <Divider style={{ margin: '6px 0' }} />

      {/* Current Match Status inline and placed directly under the cover controls */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 0 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Current Match Status:</Text>
        <Text style={{ fontSize: 11 }}>
          Live Match: <Text code>{isLive ? 'Yes' : 'No'}</Text>
        </Text>
        <Text style={{ fontSize: 11 }}>
          Has Data: <Text code>{hasData ? 'Yes' : 'No'}</Text>
        </Text>
        <Text style={{ fontSize: 11 }}>
          Cover Shown: <Text code>{(forceShowCardViewCover === ForceShowCover.Show) || (forceShowCardViewCover === ForceShowCover.Auto && !isLive) ? 'Yes' : 'No'}</Text>
        </Text>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Control Test Data toggles moved here */}
  <Divider style={{ margin: '4px 0' }} />

  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Match History toggle: label + tag (left), switch (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Text strong>Match History</Text>
            <Tag type={useMatchHistoryTestData ? TagType.Primary : TagType.Success} noIcon>
              {useMatchHistoryTestData ? 'Test Data' : 'Live'}
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Switch
              checked={useMatchHistoryTestData}
              onChange={(c) => dispatch(updateSettings({ useMatchHistoryTestData: c }))}
              aria-label="Use match history test data"
            />
          </div>
        </div>

        {/* Match Table toggle: label + tag (left), switch (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Text strong>Match Table</Text>
            <Tag type={useMatchTableTestData ? TagType.Primary : TagType.Success} noIcon>
              {useMatchTableTestData ? 'Test Data' : 'Live'}
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Switch
              checked={useMatchTableTestData}
              onChange={(c) => dispatch(updateSettings({ useMatchTableTestData: c }))}
              aria-label="Use match table test data"
            />
          </div>
        </div>
      </div>

      
    </Space>
  );
};

export default CardViewCoverOverride;
