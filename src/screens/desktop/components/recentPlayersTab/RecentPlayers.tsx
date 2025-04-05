import React, { useState, useEffect } from 'react';
import { List, Avatar, Row, Col, Card, Typography, Space, Button, Dropdown, Menu, Badge, Input, Tag } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import { SearchOutlined, FilterOutlined, ClockCircleOutlined, TeamOutlined, UserOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { getCharacterIconPath } from 'lib/characterIcons';
import type { RecentPlayer } from '../../../background/stores/recentPlayersSlice';
import { formatRelativeTime } from 'lib/utils';
import '../styles/RecentPlayers.css';

const { Title, Text } = Typography;

interface RecentPlayerItemProps {
  player: RecentPlayer;
}

const RecentPlayerItem: React.FC<RecentPlayerItemProps> = ({ player }) => {
  const { t } = useTranslation();
  const primaryCharacter = player.characterNames[0] || 'Unknown';
  const characterIcon = getCharacterIconPath(primaryCharacter);
  
  // Calculate total encounters and win percentage
  const totalEncounters = player.teamsWithCount + player.teamsAgainstCount;
  const teamsWithPercentage = totalEncounters > 0 
    ? Math.round((player.teamsWithCount / totalEncounters) * 100) 
    : 0;
  
  // Format the last seen time
  const lastSeenFormatted = formatRelativeTime(player.lastSeen);
  
  return (
    <List.Item className="recent-player-item">
      <Row className="player-row" gutter={16} align="middle">
        {/* Player Info */}
        <Col span={8} className="player-info">
          <div className="player-avatar">
            {characterIcon ? (
              <Avatar size={48} src={characterIcon} />
            ) : (
              <Avatar size={48} icon={<UserOutlined />} />
            )}
          </div>
          <div className="player-details">
            <Text className="player-name">{player.name}</Text>
            <Text className="character-name">{primaryCharacter}</Text>
          </div>
        </Col>
        
        {/* Encounter Stats */}
        <Col span={10} className="encounter-stats">
          <div className="stat-container">
            <div className="stat-item">
              <Badge count={totalEncounters} overflowCount={999} className="encounter-badge" />
              <Text className="stat-label">{t('components.desktop.recent-players.encounters', 'Encounters')}</Text>
            </div>
            <div className="stat-item">
              <Badge 
                count={player.teamsWithCount} 
                style={{ backgroundColor: '#52c41a' }} 
                overflowCount={999}
                className="teammate-badge"
              />
              <Text className="stat-label">{t('components.desktop.recent-players.teammate', 'Teammate')}</Text>
            </div>
            <div className="stat-item">
              <Badge 
                count={player.teamsAgainstCount} 
                style={{ backgroundColor: '#f5222d' }} 
                overflowCount={999}
                className="opponent-badge"
              />
              <Text className="stat-label">{t('components.desktop.recent-players.opponent', 'Opponent')}</Text>
            </div>
          </div>
        </Col>
        
        {/* Recent Characters */}
        <Col span={4} className="recent-characters">
          <div className="character-tags">
            {player.characterNames.slice(0, 3).map((charName, index) => (
              <Tag key={index} className="character-tag">
                {charName}
              </Tag>
            ))}
          </div>
        </Col>
        
        {/* Last Seen */}
        <Col span={2} className="last-seen">
          <Text className="last-seen-text">
            <ClockCircleOutlined className="time-icon" />
            {lastSeenFormatted}
          </Text>
        </Col>
      </Row>
    </List.Item>
  );
};

const RecentPlayers: React.FC = () => {
  const { t } = useTranslation();
  const { players } = useSelector((state: RootReducer) => state.recentPlayersReducer);
  
  // Local state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'teammates' | 'opponents'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'most' | 'name'>('recent');
  
  // Process players data
  const playersList = Object.values(players).map(player => player);
  
  // Apply filters and search
  const filteredPlayers = playersList.filter(player => {
    // Apply search filter
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply type filter
    if (filter === 'teammates' && player.teamsWithCount === 0) {
      return false;
    }
    if (filter === 'opponents' && player.teamsAgainstCount === 0) {
      return false;
    }
    
    return true;
  });
  
  // Apply sorting
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.lastSeen - a.lastSeen; // Most recent first
    }
    if (sortBy === 'most') {
      const aTotal = a.teamsWithCount + a.teamsAgainstCount;
      const bTotal = b.teamsWithCount + b.teamsAgainstCount;
      return bTotal - aTotal; // Most encounters first
    }
    // Sort by name
    return a.name.localeCompare(b.name);
  });
  
  // Sort menu
  const sortMenu = (
    <Menu
      onClick={(e) => setSortBy(e.key as 'recent' | 'most' | 'name')}
      selectedKeys={[sortBy]}
    >
      <Menu.Item key="recent" icon={<ClockCircleOutlined />}>
        {t('components.desktop.recent-players.sort-recent', 'Recently Seen')}
      </Menu.Item>
      <Menu.Item key="most" icon={<TeamOutlined />}>
        {t('components.desktop.recent-players.sort-most', 'Most Encounters')}
      </Menu.Item>
      <Menu.Item key="name" icon={<UserOutlined />}>
        {t('components.desktop.recent-players.sort-name', 'Player Name')}
      </Menu.Item>
    </Menu>
  );
  
  return (
    <div className="recent-players-container">
      <Card 
        title={<Title level={4}>{t('components.desktop.recent-players.title', 'Recent Players')}</Title>}
        className="recent-players-card"
        extra={
          <Space>
            <Input
              placeholder={t('components.desktop.recent-players.search', 'Search players...')}
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Space>
              <Button
                type={filter === 'all' ? 'primary' : 'default'}
                onClick={() => setFilter('all')}
              >
                {t('components.desktop.recent-players.all', 'All')}
              </Button>
              <Button
                type={filter === 'teammates' ? 'primary' : 'default'}
                onClick={() => setFilter('teammates')}
                icon={<TeamOutlined />}
              >
                {t('components.desktop.recent-players.teammates', 'Teammates')}
              </Button>
              <Button
                type={filter === 'opponents' ? 'primary' : 'default'}
                onClick={() => setFilter('opponents')}
                icon={<UserDeleteOutlined />}
              >
                {t('components.desktop.recent-players.opponents', 'Opponents')}
              </Button>
              <Dropdown overlay={sortMenu} placement="bottomRight">
                <Button icon={<FilterOutlined />}>
                  {t('components.desktop.recent-players.sort', 'Sort')}
                </Button>
              </Dropdown>
            </Space>
          </Space>
        }
      >
        {sortedPlayers.length > 0 ? (
          <List
            className="recent-players-list"
            dataSource={sortedPlayers}
            renderItem={(player) => <RecentPlayerItem player={player} />}
            pagination={{
              pageSize: 10,
              simple: true,
              position: 'bottom',
              showSizeChanger: false,
            }}
          />
        ) : (
          <div className="empty-state">
            <UserOutlined className="empty-icon" />
            <Text className="empty-text">
              {searchTerm || filter !== 'all'
                ? t('components.desktop.recent-players.no-matches', 'No players match your filters.')
                : t('components.desktop.recent-players.no-players', 'No players yet. Play some matches to see players here.')}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecentPlayers;