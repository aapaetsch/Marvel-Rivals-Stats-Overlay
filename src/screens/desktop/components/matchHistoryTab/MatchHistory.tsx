import React, { useState, useEffect, useRef } from 'react';
import { List, Avatar, Row, Col, Card, Typography, Tag, Badge, Space, Collapse, Empty, Divider } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCharacterIconPath, CharacterName } from 'lib/characterIcons';
import { icons } from 'components';
import { MatchStatsState, MatchOutcome, PlayerStats } from '../../../background/types/matchStatsTypes';
import MatchHistoryFilters from './MatchHistoryFilters';
import MatchDetailView from './MatchDetailView';
import '../styles/MatchHistory.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface MatchHistoryItemProps {
  match: MatchStatsState;
  onClick: () => void;
  expanded: boolean;
}

const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({ match, onClick, expanded }) => {
  const { t } = useTranslation();
  
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
  const characterIcon = localPlayer?.characterName ? getCharacterIconPath(localPlayer.characterName) : null;
  
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
          <Tag color={match.outcome === 'Victory' ? 'green' : match.outcome === 'Defeat' ? 'red' : 'blue'}>
            +25
          </Tag>
        </Col>
        
        <Col span={4} className="match-outcome">
          <Badge 
            status={match.outcome === 'Victory' ? 'success' : match.outcome === 'Defeat' ? 'error' : 'processing'} 
            text={<Text className={`outcome-text ${match.outcome?.toLowerCase()}`}>{match.outcome || 'Unknown'}</Text>}
          />
        </Col>
      </Row>

      <Row className="match-history-item-stats">
        <Col span={3} className="stat-item">
          <div className="stat-icon icon-header">
            <span className="icon-wrapper">{icons.finalHits}</span>
          </div>
          <Text className="stat-value">{localPlayer?.finalHits || 0}</Text>
        </Col>
        
        <Col span={3} className="stat-item">
          <div className="stat-icon icon-header">
            <span className="icon-wrapper">{icons.kill}</span>
          </div>
          <Text className="stat-value">{kills}</Text>
        </Col>
        
        <Col span={3} className="stat-item">
          <div className="stat-icon icon-header">
            <span className="icon-wrapper">{icons.death}</span>
          </div>
          <Text className="stat-value">{deaths}</Text>
        </Col>
        
        <Col span={3} className="stat-item">
          <div className="stat-icon icon-header">
            <span className="icon-wrapper">{icons.assist}</span>
          </div>
          <Text className="stat-value">{assists}</Text>
        </Col>
        
        <Col span={6} className="stat-item">
          <Text className="stat-label">KDR:</Text>
          <Text className="stat-value">{kdr}</Text>
        </Col>
        
        <Col span={6} className="stat-item">
          <Text className="stat-label">KDA:</Text>
          <Text className="stat-value">{kda}</Text>
        </Col>
      </Row>
      
      {expanded && (
        <div className="match-details-container">
          <MatchDetailView matchData={match} />
        </div>
      )}
    </div>
  );
};

const MatchHistory: React.FC = () => {
  const { t } = useTranslation();
  const { matchHistory } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
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
    let results = [...matchHistory];
    
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
  }, [matchHistory, filters]);
  
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
              <Empty 
                description={t('components.desktop.match-history.no-matches', 'No matches found')} 
                className="empty-match-list"
              />
            )}
          </Card>
        </Col>
        
        <Col span={8} className="sidebar-container">
          <Card 
            title={<Title level={4}>{t('components.desktop.match-history.filters', 'Filters')}</Title>}
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