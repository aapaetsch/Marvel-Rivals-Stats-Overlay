import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Typography, Space } from 'antd';
import Tag from 'components/Tag';
import { TagType } from 'components/Tag/TagTypes';
import { RootReducer } from 'app/shared/rootReducer';
import { updateSettings } from 'features/appSettings/appSettingsSlice';

const { Title, Text } = Typography;

const MatchHistoryDataWidget: React.FC = () => {
  const dispatch = useDispatch();
  const useTestData = useSelector((state: RootReducer) => state.appSettingsReducer.settings.useMatchHistoryTestData);

  const handleToggle = useCallback((checked: boolean) => {
    dispatch(updateSettings({ useMatchHistoryTestData: checked }));
  }, [dispatch]);

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Title level={4} style={{ margin: 0 }}>Match History Data</Title>
      </div>
      <div className="status-card-body">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary">
            Toggle between test fixtures and live match history data for desktop screens.
          </Text>
          <Space align="center" size="middle">
            <Switch
              checked={useTestData}
              onChange={handleToggle}
              aria-label="Use match history test data"
            />
            <Tag type={useTestData ? TagType.Primary : TagType.Success} noIcon>
              {useTestData ? 'Test data active' : 'Live data active'}
            </Tag>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default MatchHistoryDataWidget;
