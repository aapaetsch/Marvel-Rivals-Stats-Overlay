import React from 'react';
import { Form, InputNumber, Switch, Card, Typography, Space, Divider, Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { updateSettings } from '../../../../features/appSettings/appSettingsSlice';
import { clearOldPlayers, trimToMaxPlayers } from '../../../background/stores/recentPlayersSlice';
import { InfoCircleOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface RecentPlayersSettingsProps {
  form: any;
}

const RecentPlayersSettings: React.FC<RecentPlayersSettingsProps> = ({ form }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { 
    maxRecentPlayers, 
    maxFavoriteRecentPlayers, 
    autoCleanupRecentPlayers, 
    recentPlayersCleanupDays 
  } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  
  const { players } = useSelector((state: RootReducer) => state.recentPlayersReducer);
  
  // Calculate current stats
  const totalPlayers = Object.keys(players).length;
  const favoritedPlayers = Object.values(players).filter(p => p.isFavorited).length;
  
  const handleManualCleanup = () => {
    dispatch(clearOldPlayers({ maxAgeDays: recentPlayersCleanupDays }));
  };
  
  const handleTrimPlayers = () => {
    dispatch(trimToMaxPlayers({ maxPlayers: maxRecentPlayers }));
  };
  
  return (
    <div className="recent-players-settings">
      <Title level={4}>{t('components.desktop.settings.recent-players', 'Recent Players Settings')}</Title>
      
      {/* Current Stats */}
      <Card className="stats-card" size="small">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Text strong>{t('components.desktop.settings.current-stats', 'Current Statistics')}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{t('components.desktop.settings.total-players', 'Total Players')}:</Text>
            <Text>{totalPlayers}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{t('components.desktop.settings.favorited-players', 'Favorited Players')}:</Text>
            <Text>{favoritedPlayers} / {maxFavoriteRecentPlayers}</Text>
          </div>
        </Space>
      </Card>
      
      <Divider />
      
      {/* Storage Settings */}
      <div className="settings-section">
        <Title level={5}>{t('components.desktop.settings.storage-limits', 'Storage Limits')}</Title>
        
        <Form.Item
          name="maxRecentPlayers"
          label={
            <Space>
              {t('components.desktop.settings.max-recent-players', 'Maximum Recent Players')}
              <Tooltip title={t('components.desktop.settings.max-recent-players-tooltip', 'Maximum number of recent players to store. Favorites are always kept.')}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <InputNumber
            min={50}
            max={500}
            step={10}
            value={maxRecentPlayers}
            onChange={(value) => dispatch(updateSettings({ maxRecentPlayers: value || 100 }))}
            addonAfter="players"
            style={{ width: '200px' }}
          />
        </Form.Item>
        
        <Form.Item
          name="maxFavoriteRecentPlayers"
          label={
            <Space>
              {t('components.desktop.settings.max-favorite-players', 'Maximum Favorite Players')}
              <Tooltip title={t('components.desktop.settings.max-favorite-players-tooltip', 'Maximum number of players you can mark as favorites.')}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <InputNumber
            min={5}
            max={25}
            step={1}
            value={maxFavoriteRecentPlayers}
            onChange={(value) => dispatch(updateSettings({ maxFavoriteRecentPlayers: value || 15 }))}
            addonAfter="players"
            style={{ width: '200px' }}
          />
        </Form.Item>
      </div>
      
      <Divider />
      
      {/* Cleanup Settings */}
      <div className="settings-section">
        <Title level={5}>{t('components.desktop.settings.cleanup-settings', 'Automatic Cleanup')}</Title>
        
        <Form.Item
          name="autoCleanupRecentPlayers"
          label={t('components.desktop.settings.auto-cleanup', 'Enable Automatic Cleanup')}
          valuePropName="checked"
        >
          <Switch
            checked={autoCleanupRecentPlayers}
            onChange={(checked) => dispatch(updateSettings({ autoCleanupRecentPlayers: checked }))}
          />
        </Form.Item>
        
        {autoCleanupRecentPlayers && (
          <Form.Item
            name="recentPlayersCleanupDays"
            label={
              <Space>
                {t('components.desktop.settings.cleanup-after-days', 'Remove players after')}
                <Tooltip title={t('components.desktop.settings.cleanup-after-days-tooltip', 'Players not seen for this many days will be removed (favorites are always kept).')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber
              min={7}
              max={365}
              step={1}
              value={recentPlayersCleanupDays}
              onChange={(value) => dispatch(updateSettings({ recentPlayersCleanupDays: value || 30 }))}
              addonAfter="days"
              style={{ width: '200px' }}
            />
          </Form.Item>
        )}
      </div>
      
      <Divider />
      
      {/* Manual Actions */}
      <div className="settings-section">
        <Title level={5}>{t('components.desktop.settings.manual-actions', 'Manual Actions')}</Title>
        
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleManualCleanup}
              type="default"
            >
              {t('components.desktop.settings.cleanup-old-players', 'Remove Old Players')}
            </Button>
            <Text type="secondary" style={{ marginLeft: '8px' }}>
              {t('components.desktop.settings.cleanup-old-players-desc', `Remove players not seen for ${recentPlayersCleanupDays} days`)}
            </Text>
          </div>
          
          <div>
            <Button
              icon={<ClearOutlined />}
              onClick={handleTrimPlayers}
              type="default"
            >
              {t('components.desktop.settings.trim-to-limit', 'Trim to Limit')}
            </Button>
            <Text type="secondary" style={{ marginLeft: '8px' }}>
              {t('components.desktop.settings.trim-to-limit-desc', `Keep only the ${maxRecentPlayers} most recent players + favorites`)}
            </Text>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default RecentPlayersSettings;