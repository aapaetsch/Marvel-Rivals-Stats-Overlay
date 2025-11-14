import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Tabs, Row, Col, Space } from 'antd';
import { RootState } from '../../../../app/shared/store';
import { PlayerStatsFilterType, TimeRangeFilterType } from '../../types/playerStatsTypes';
import { setActiveFilter, setTimeRange } from '../../../../stores/playerStatsSlice';
import PlayerStatsFilters from '../playerStatsTab/PlayerStatsFilters';
import RankedHistoryChart from '../playerStatsTab/RankedHistoryChart';
// import HeroStatsList from './HeroStatsList';
// import CumulativeStats from './CumulativeStats';

import styles from './PlayerStatsTab.module.css';

const { TabPane } = Tabs;

const PlayerStatsTab: React.FC = () => {
  const dispatch = useDispatch();
  const { data, activeFilter, timeRange, isLoading, error } = useSelector(
    (state: RootState) => state.playerStatsReducer
  );
  const [activeTab, setActiveTab] = React.useState<string>('heroes');

  // Add a useEffect to log the state when component renders
  React.useEffect(() => {
    console.log("PlayerStatsTab state:", { data, activeFilter, timeRange, isLoading, error });
  }, [data, activeFilter, timeRange, isLoading, error]);

  const handleFilterChange = (filter: PlayerStatsFilterType) => {
    dispatch(setActiveFilter(filter));
  };

  const handleTimeRangeChange = (range: TimeRangeFilterType) => {
    dispatch(setTimeRange(range));
  };

  if (isLoading) {
    return <div>Loading player stats...</div>;
  }

  if (error) {
    return <div>Error loading player stats: {error}</div>;
  }

  if (!data) {
    return <div>No player stats available</div>;
  }

  return (
    <div className={styles.playerStatsContainer}>
      <Row gutter={[16, 16]}>
        {/* Filters and Ratings */}
        <Col span={24}>
          <Card className={styles.statsCard}>
            <PlayerStatsFilters
              activeFilter={activeFilter}
              timeRange={timeRange}
              ratings={data.rating}
              onFilterChange={handleFilterChange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </Card>
        </Col>

        {/* Ranked History Chart */}
        <Col span={24}>
          <Card className={styles.statsCard} title="Ranked Career">
            <RankedHistoryChart
              rankedHistory={data.rankedHistory}
              activeFilter={activeFilter}
              timeRange={timeRange}
            />
          </Card>
        </Col>

        {/* Hero Stats and Cumulative Stats */}
        <Col span={24}>
          <Card className={styles.statsCard}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Hero Stats" key="heroes">
                {/* <HeroStatsList heroStats={data.heroStats} /> */}
                <div className={styles.comingSoonContainer}>
                  <p>Hero stats coming soon!</p>
                </div>
              </TabPane>
              <TabPane tab="Cumulative Stats" key="cumulative">
                {/* <CumulativeStats stats={data.cumulativeStats} /> */}
                <div className={styles.comingSoonContainer}>
                  <p>Cumulative stats coming soon!</p>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlayerStatsTab;