import React, { useState, useEffect, useMemo } from 'react';
import { List, Avatar, Row, Col, Card, Typography, Empty, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCharacterDefaultIconPath } from 'lib/characterIcons';
import Tag from 'components/Tag';
import { TagType } from 'components/Tag/TagTypes';
import { icons } from 'components';
import { MatchStatsState } from '../../../background/types/matchStatsTypes';
import MatchHistoryFilters from './MatchHistoryFilters';
import MatchDetailView from './MatchDetailView';
import { matchHistoryTestData } from './matchHistoryTestData';
import '../styles/MatchHistory.css';

const { Title, Text } = Typography;
interface MatchHistoryItemProps {
  match: MatchStatsState;
  onClick: () => void;
  expanded: boolean;
}

const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({ match, onClick, expanded }) => {
  
  // Format match duration
  const formatDuration = (start: number | undefined | null, end: number | undefined | null) => {
    if (!start || !end) return 'N/A';
    const duration = Math.floor((end - start) / 1000); // Duration in seconds
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  // Find local player in the match
  const localPlayer = match.players ? Object.values(match.players).find((player: any) => player.isLocal) : null;
  
  // Calculate KDA and KDR
  const kills = localPlayer?.kills || 0;
  const deaths = localPlayer?.deaths || 0;
  const assists = localPlayer?.assists || 0;
  const kdr = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toString();
  const kda = ((kills + assists) / (deaths || 1)).toFixed(2);
  
  // Get character icon for the local player
  const characterIcon = localPlayer?.characterName ? getCharacterDefaultIconPath(localPlayer.characterName) : null;
  
  // Render the performance chart component
  const renderPerformanceChart = () => {
    const damageDealt = localPlayer?.damageDealt || 0;
    const damageBlocked = localPlayer?.damageBlocked || 0;
    const totalHeal = localPlayer?.totalHeal || 0;
    
    const maxValue = Math.max(damageDealt, damageBlocked, totalHeal);
    const scale = maxValue > 0 ? 100 / maxValue : 0;
    
    return (
      <div className="performance-chart">
        <div className="chart-bar">
          <div className="bar-label">DMG</div>
          <div className="bar-container">
            <div 
              className="bar damage" 
              style={{ width: `${damageDealt * scale}%` }}
              title={`Damage: ${damageDealt.toLocaleString()}`}
            ></div>
          </div>
        </div>
        <div className="chart-bar">
          <div className="bar-label">BLK</div>
          <div className="bar-container">
            <div 
              className="bar block" 
              style={{ width: `${damageBlocked * scale}%` }}
              title={`Blocked: ${damageBlocked.toLocaleString()}`}
            ></div>
          </div>
        </div>
        <div className="chart-bar">
          <div className="bar-label">HEAL</div>
          <div className="bar-container">
            <div 
              className="bar heal" 
              style={{ width: `${totalHeal * scale}%` }}
              title={`Healing: ${totalHeal.toLocaleString()}`}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render team composition for the match
  const renderTeamComposition = () => {
    const teammates = Object.values(match.players || {})
      .filter(p => p.isTeammate)
      .map(p => ({
        name: p.name,
        character: p.characterName,
        icon: getCharacterDefaultIconPath(p.characterName)
      }));
      
    const opponents = Object.values(match.players || {})
      .filter(p => !p.isTeammate)
      .map(p => ({
        name: p.name,
        character: p.characterName,
        icon: getCharacterDefaultIconPath(p.characterName)
      }));
      
    return (
      <div className="team-composition">
        <div className="team allies">
          {teammates.map((player, idx) => (
            <Tooltip key={idx} title={`${player.name} (${player.character})`}>
              <Avatar
                size={40}
                shape="square"
                src={player.icon}
                className={`team-avatar team-avatar--ally`}
              />
            </Tooltip>
          ))}
        </div>
        <div className="team-separator">VS</div>
        <div className="team opponents">
          {opponents.map((player, idx) => (
            <Tooltip key={idx} title={`${player.name} (${player.character})`}>
              <Avatar
                size={40}
                shape="square"
                src={player.icon}
                className={`team-avatar team-avatar--opponent`}
              />
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`match-history-item ${expanded ? 'expanded' : ''}`} onClick={onClick}>
      <Row className="match-history-item-header">
        <Col span={4} className="map-info">
          <div className="map-image-container">
            <img 
              src={`/mapIcons/${match.map?.replace(/\s+/g, '_')}.png`} 
              alt={match.map || 'Unknown Map'} 
              className="map-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/mapIcons/default_map.png';
              }}
            />
            <div className="map-name-overlay">{match.map || 'Unknown Map'}</div>
          </div>
        </Col>
        
        <Col span={3} className="character-info">
          {characterIcon ? (
            <Avatar size={48} src={characterIcon} className="character-avatar" />
          ) : (
            <Avatar size={48} className="character-avatar">?</Avatar>
          )}
          <Text className="character-name">{localPlayer?.characterName || 'Unknown'}</Text>
        </Col>
        
        <Col span={5} className="match-info">
          <div className="info-stack">
            <Text className="game-type">{match.gameType || 'Unknown Type'}</Text>
            <Text className="game-mode">{match.gameMode || 'Unknown Mode'}</Text>
            <Text className="match-time">{formatDuration(match.timestamps?.matchStart, match.timestamps?.matchEnd)}</Text>
          </div>
        </Col>
        
        <Col span={4} className="rank-info">
          <div className="rank-container">
            <img 
              src={`/rank icons/img_rank_dan_01.png`} 
              alt="Rank" 
              className="rank-icon"
            />
            <div className="rank-text">
              <Text className="rank-name">Bronze III</Text>
              <Text className="rank-score">1250</Text>
            </div>
          </div>
        </Col>
        
        <Col span={4} className="rank-change">
          {/* rank-change intentionally left blank (no +25 display) */}
        </Col>
        
        <Col span={4} className="match-outcome">
          <Tag
            size="small"
            type={match.outcome === 'Victory' ? TagType.Success : match.outcome === 'Defeat' ? TagType.Danger : TagType.Info}
            aria-label={`Match outcome: ${match.outcome || 'Unknown'}`}
            icon={match.outcome === 'Victory' ? icons.successTag : match.outcome === 'Defeat' ? icons.crossMark : undefined}
          >
            {match.outcome || 'Unknown'}
          </Tag>
        </Col>
      </Row>
      <Row className="match-history-item-stats">
        {/* Inline stats group: K / D / A / FH */}
        <Col span={3} className="stat-item">
          <div className="stat-label-text">Kills</div>
          <Text className="stat-value">{kills}</Text>
        </Col>

        <Col span={3} className="stat-item">
          <div className="stat-label-text">Deaths</div>
          <Text className="stat-value">{deaths}</Text>
        </Col>

        <Col span={3} className="stat-item">
          <div className="stat-label-text">Assists</div>
          <Text className="stat-value">{assists}</Text>
        </Col>

        <Col span={3} className="stat-item">
          <div className="stat-label-text">Final Hits</div>
          <Text className="stat-value">{localPlayer?.finalHits || 0}</Text>
        </Col>

        {/* KD/KDA stacked column on the right of the above stats */}
        <Col span={4} className="kd-column">
          <div className="kd-row">
            <span className="icon-wrapper icon-kd">{icons.kd}</span>
            <span className="kd-value">{kdr}</span>
          </div>
          <div className="kda-row">
            <span className="icon-wrapper icon-kda">{icons.kda}</span>
            <span className="kda-value">{kda}</span>
          </div>
        </Col>
      </Row>
      
      {/* Performance Chart - show only when expanded to hide DMG/BLK/HEAL on list items */}
      {false && (
        <Row>
          <Col span={24}>
            {renderPerformanceChart()}
          </Col>
        </Row>
      )}
      
      {/* Team Composition */}
      <Row>
        <Col span={24}>
          {renderTeamComposition()}
        </Col>
      </Row>
      
      {expanded && (
        <div className="match-details-container" onClick={(e) => e.stopPropagation()}>
          <MatchDetailView matchData={match} />
        </div>
      )}
    </div>
  );
};

const MatchHistory: React.FC = () => {
  const { t } = useTranslation();
  const { matchHistory } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const shouldUseTestData = useSelector((state: RootReducer) => state.appSettingsReducer.settings.useMatchHistoryTestData);
  const activeMatches = useMemo<MatchStatsState[]>(() => {
    if (shouldUseTestData) {
      return matchHistoryTestData;
    }
    return matchHistory || [];
  }, [shouldUseTestData, matchHistory]);
  
  // State for managing match list and UI
  const [filteredMatches, setFilteredMatches] = useState<MatchStatsState[]>([]);
  const [visibleMatches, setVisibleMatches] = useState<MatchStatsState[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  
  // For infinite scrolling
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  
  // Define the filter type
  interface MatchFilters {
    gameType: string;
    gameMode: string;
    dateRange: [any, any]; // Using any for now to handle DatePicker values
    hero: string;
  }
  
  // Initial filter values
  const [filters, setFilters] = useState<MatchFilters>({
    gameType: '',
    gameMode: '',
    dateRange: [null, null],
    hero: '',
  });
  
  // Apply filters to match history
  useEffect(() => {
    let results = [...activeMatches];
    
    // Apply filters
    if (filters.gameType) {
      results = results.filter(match => match.gameType === filters.gameType);
    }
    
    if (filters.gameMode) {
      results = results.filter(match => match.gameMode === filters.gameMode);
    }
    
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = filters.dateRange[0].valueOf();
      const endDate = filters.dateRange[1].valueOf();
      results = results.filter(match => {
        const matchDate = match.timestamps?.matchStart;
        return matchDate != null && matchDate >= startDate && matchDate <= endDate;
      });
    }
    
    if (filters.hero) {
      results = results.filter(match => {
        const localPlayer = Object.values(match.players).find((player: any) => player.isLocal);
        return localPlayer?.characterName === filters.hero;
      });
    }
    
    setFilteredMatches(results);
    setVisibleMatches(results.slice(0, PAGE_SIZE));
    setHasMore(results.length > PAGE_SIZE);
  }, [activeMatches, filters]);
  
  // Load more matches for infinite scroll
  const loadMoreMatches = () => {
    if (loading) return;
    
    setLoading(true);
    setTimeout(() => {
      const currentLength = visibleMatches.length;
      const nextBatch = filteredMatches.slice(currentLength, currentLength + PAGE_SIZE);
      setVisibleMatches([...visibleMatches, ...nextBatch]);
      setHasMore(currentLength + nextBatch.length < filteredMatches.length);
      setLoading(false);
    }, 500); // Simulated loading delay
  };
  
  // Handle match item click to expand/collapse details
  const handleMatchClick = (matchId: string) => {
    setExpandedMatchId(prevId => prevId === matchId ? null : matchId);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="match-history-container">
      <Row gutter={16}>
        <Col span={16} className="match-list-container">
          <Card 
            title={<Title level={4}>{t('components.desktop.match-history.title', 'Match History')}</Title>}
            className="match-list-card"
          >
            {filteredMatches.length > 0 ? (
              <div
                id="scrollableDiv"
                className="scrollable-match-list"
              >
                <InfiniteScroll
                  dataLength={visibleMatches.length}
                  next={loadMoreMatches}
                  hasMore={hasMore}
                  loader={
                    <div className="loading-more">
                      {t('components.desktop.match-history.loading', 'Loading more matches...')}
                    </div>
                  }
                  endMessage={
                    <div className="end-message">
                      {t('components.desktop.match-history.end', 'No more matches to load')}
                    </div>
                  }
                  scrollableTarget="scrollableDiv"
                >
                  <List
                    itemLayout="vertical"
                    dataSource={visibleMatches}
                    renderItem={match => (
                      <List.Item className="match-list-item" key={match.matchId}>
                        <MatchHistoryItem 
                          match={match} 
                          onClick={() => match.matchId ? handleMatchClick(match.matchId) : undefined} 
                          expanded={expandedMatchId === match.matchId}
                        />
                      </List.Item>
                    )}
                  />
                </InfiniteScroll>
              </div>
            ) : (
              <div className="empty-match-list">
                <Empty 
                  description={t('components.desktop.match-history.no-matches', 'No matches found')} 
                />
              </div>
            )}
          </Card>
        </Col>
        
        <Col span={8} className="sidebar-container">
          <Card 
            title={<Title level={4}>{t('components.desktop.match-history.filtersLabel', 'Filters')}</Title>}
            className="filters-card"
          >
            <MatchHistoryFilters onFilterChange={handleFilterChange} />
          </Card>
          
          <Card 
            title={<Title level={4}>{t('components.desktop.match-history.ad', 'Advertisement')}</Title>}
            className="ad-card"
          >
            <div className="ad-placeholder">
              <Text>Ad Placeholder</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default MatchHistory;