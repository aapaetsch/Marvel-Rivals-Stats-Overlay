import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Typography, Card, Space, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getRecentEloHistory, EloDataPoint } from 'lib/eloTrackingService';
import { getEloRankInfo } from 'lib/rankIcons';
import './MyStatsPage.css';

const { Title, Text } = Typography;

// Extended data point with index for table rendering
interface EloDataPointWithKey extends EloDataPoint {
  key: number;
}

/**
 * MyStatsPage - Displays ELO tracking data for the logged-in player
 * Shows separate tables for Competitive and Quick Match modes
 */
const MyStatsPage: React.FC = () => {
  const { t } = useTranslation();
  const [compData, setCompData] = useState<EloDataPointWithKey[]>([]);
  const [quickMatchData, setQuickMatchData] = useState<EloDataPointWithKey[]>([]);

  // Load ELO data on mount
  useEffect(() => {
    loadEloData();
  }, []);

  const loadEloData = () => {
    const comp = getRecentEloHistory('comp').map((item, index) => ({ ...item, key: index }));
    const quickMatch = getRecentEloHistory('quickMatch').map((item, index) => ({ ...item, key: index }));
    
    setCompData(comp);
    setQuickMatchData(quickMatch);
  };

  // Create columns with data dependency for change calculation
  const createColumns = (data: EloDataPointWithKey[]): ColumnsType<EloDataPointWithKey> => [
    {
      title: t('components.desktop.my_stats.match_number', 'Match #'),
      key: 'index',
      width: 100,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: t('components.desktop.my_stats.rank', 'Rank'),
      key: 'rank',
      width: 100,
      render: (_: any, record: EloDataPointWithKey) => {
        const rankInfo = getEloRankInfo(record.elo);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img 
              src={rankInfo.iconPath} 
              alt={rankInfo.rankName}
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <Text style={{ fontSize: '0.85rem' }}>
              {rankInfo.rankName} {rankInfo.step}
            </Text>
          </div>
        );
      },
    },
    {
      title: t('components.desktop.my_stats.elo_score', 'ELO Score'),
      dataIndex: 'elo',
      key: 'elo',
      width: 120,
      render: (elo: number) => (
        <Text strong style={{ fontSize: '1rem' }}>
          {Math.round(elo)}
        </Text>
      ),
    },
    {
      title: t('components.desktop.my_stats.date', 'Date'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => {
        const date = new Date(timestamp);
        return (
          <Text>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
        );
      },
    },
    {
      title: t('components.desktop.my_stats.change', 'Change'),
      key: 'change',
      width: 100,
      render: (_: any, record: EloDataPointWithKey, index: number) => {
        if (index === 0) {
          return <Text>-</Text>;
        }
        
        const previous = data[index - 1];
        const change = Math.round(record.elo - previous.elo);
        const color = change > 0 ? 'var(--success-color)' : change < 0 ? 'var(--error-color)' : 'var(--text-color)';
        const sign = change > 0 ? '+' : '';
        
        return (
          <Text strong style={{ color }}>
            {sign}{change}
          </Text>
        );
      },
    },
  ];

  return (
    <div className="my-stats-page">
      <div className="my-stats-header">
        <Title level={2}>{t('components.desktop.my_stats.title', 'My ELO Stats')}</Title>
        <Text type="secondary">
          {t('components.desktop.my_stats.subtitle', 'Track your ELO rating progress across different game modes')}
        </Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Competitive Mode Table */}
        <Card 
          title={
            <Title level={4} style={{ margin: 0 }}>
              {t('components.desktop.my_stats.competitive', 'Competitive')}
            </Title>
          }
          className="elo-table-card"
        >
          {compData.length > 0 ? (
            <Table
              columns={createColumns(compData)}
              dataSource={compData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => 
                  t('components.desktop.my_stats.total_matches', `Total: ${total} matches`, { count: total }),
              }}
              size="small"
            />
          ) : (
            <Empty
              description={t('components.desktop.my_stats.no_comp_data', 'No competitive matches recorded yet')}
            />
          )}
        </Card>

        {/* Quick Match Mode Table */}
        <Card 
          title={
            <Title level={4} style={{ margin: 0 }}>
              {t('components.desktop.my_stats.quick_match', 'Quick Match')}
            </Title>
          }
          className="elo-table-card"
        >
          {quickMatchData.length > 0 ? (
            <Table
              columns={createColumns(quickMatchData)}
              dataSource={quickMatchData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => 
                  t('components.desktop.my_stats.total_matches', `Total: ${total} matches`, { count: total }),
              }}
              size="small"
            />
          ) : (
            <Empty
              description={t('components.desktop.my_stats.no_quick_data', 'No quick matches recorded yet')}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default MyStatsPage;
