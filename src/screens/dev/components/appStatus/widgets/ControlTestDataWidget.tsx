import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Typography, Space } from 'antd';
import Tag from 'components/Tag';
import { TagType } from 'components/Tag/TagTypes';
import { RootReducer } from 'app/shared/rootReducer';
import { updateSettings } from 'features/appSettings/appSettingsSlice';

const { Title, Text } = Typography;

const ControlTestDataWidget: React.FC = () => {
  const dispatch = useDispatch();
  const { useMatchHistoryTestData, useMatchTableTestData } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);

  const toggleHistory = useCallback((checked: boolean) => {
    dispatch(updateSettings({ useMatchHistoryTestData: checked }));
  }, [dispatch]);

  const toggleTable = useCallback((checked: boolean) => {
    dispatch(updateSettings({ useMatchTableTestData: checked }));
  }, [dispatch]);

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Title level={4} style={{ margin: 0 }}>Control Test Data</Title>
      </div>
      <div className="status-card-body">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary">Toggle use of test fixtures for testing UI flows.</Text>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong>Match History</Text>
            <Space align="center" size="middle">
              <Switch checked={useMatchHistoryTestData} onChange={toggleHistory} aria-label="Use match history test data" />
              <Tag type={useMatchHistoryTestData ? TagType.Primary : TagType.Success} noIcon>
                {useMatchHistoryTestData ? 'Test Data' : 'Live'}
              </Tag>
            </Space>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong>Match Table</Text>
            <Space align="center" size="middle">
              <Switch checked={useMatchTableTestData} onChange={toggleTable} aria-label="Use match table test data" />
              <Tag type={useMatchTableTestData ? TagType.Primary : TagType.Success} noIcon>
                {useMatchTableTestData ? 'Test Data' : 'Live'}
              </Tag>
            </Space>
          </div>

        </Space>
      </div>
    </div>
  );
};

export default ControlTestDataWidget;
