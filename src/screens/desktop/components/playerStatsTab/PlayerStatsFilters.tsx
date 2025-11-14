import React from 'react';
import { Radio, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { PlayerStatsFilterType, TimeRangeFilterType, PlayerRating } from '../../types/playerStatsTypes';
import styles from './PlayerStatsTab.module.css';

interface PlayerStatsFiltersProps {
  activeFilter: PlayerStatsFilterType;
  timeRange: TimeRangeFilterType;
  ratings: PlayerRating;
  onFilterChange: (filter: PlayerStatsFilterType) => void;
  onTimeRangeChange: (range: TimeRangeFilterType) => void;
}

const { Option } = Select;

const PlayerStatsFilters: React.FC<PlayerStatsFiltersProps> = ({
  activeFilter,
  timeRange,
  ratings,
  onFilterChange,
  onTimeRangeChange,
}) => {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <FilterOutlined className={styles.filterIcon} />
        <span className={styles.filterLabel}>Game Mode:</span>
        <Radio.Group
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          buttonStyle="solid"
          className={styles.radioGroup}
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="ranked">Ranked</Radio.Button>
          <Radio.Button value="casual">Casual</Radio.Button>
        </Radio.Group>
      </div>

      <div className={styles.filterGroup}>
        <FilterOutlined className={styles.filterIcon} />
        <span className={styles.filterLabel}>Time Range:</span>
        <Select
          value={timeRange}
          onChange={onTimeRangeChange}
          className={styles.timeRangeSelect}
          dropdownClassName={styles.timeRangeDropdown}
        >
          <Option value="all">All Time</Option>
          <Option value="month">Past Month</Option>
          <Option value="week">Past Week</Option>
          <Option value="season">Current Season</Option>
        </Select>
      </div>
      
      {/* Display player rating info */}
      <div className={styles.ratingInfo}>
        <div className={styles.rankDisplay}>
          <img 
            src={ratings.rankIcon} 
            alt="Rank" 
            className={styles.rankIconImg}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/rank icons/img_rank_dan_01.png';
            }}
          />
          <div className={styles.rankDetails}>
            <div className={styles.currentRating}>Current: {ratings.current}</div>
            <div className={styles.highestRating}>Highest: {ratings.highest}</div>
            <div className={styles.danLevel}>Dan Level: {ratings.danLevel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsFilters;