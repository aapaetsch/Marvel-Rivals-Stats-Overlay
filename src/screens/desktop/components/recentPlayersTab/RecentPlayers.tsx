import React, { useState, useEffect, useMemo } from 'react';
import { List, Avatar, Row, Col, Card, Typography, Space, Button, Dropdown, Menu, Input, Tooltip, message, Badge, Alert, Switch } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import { SearchOutlined, FilterOutlined, ClockCircleOutlined, TeamOutlined, UserOutlined, StarOutlined, StarFilled, DeleteOutlined } from '@ant-design/icons';
import { getCharacterDefaultIconPath } from 'lib/characterIcons';
import { getCharacterClass, getClassImagePath, CharacterClass } from 'lib/characterClassIcons';
import Gauge from '../../../../components/Gauge/Gauge';
import type { RecentPlayer } from '../../../background/stores/recentPlayersSlice';
import { togglePlayerFavorite, removePlayer } from '../../../background/stores/recentPlayersSlice';
import { formatRelativeTime } from 'lib/utils';
import '../styles/RecentPlayers.css';

const { Title, Text } = Typography;

interface RecentPlayerItemProps {
  player: RecentPlayer;
  censor?: boolean;
}

const RecentPlayerItem: React.FC<RecentPlayerItemProps> = ({ player, censor = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { maxFavoriteRecentPlayers } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  const [expandedSide, setExpandedSide] = useState<'opponent' | 'ally' | null>(null);
  
  // Compute primary (top overall) character and per-role top picks
  const getTopOverallCharacter = (): string => {
    const allyStats = player.allyCharacterStats || {};
    const oppStats = player.opponentCharacterStats || {};
    const counts: Record<string, number> = {};
    for (const [name, s] of Object.entries(allyStats)) {
      counts[name] = (counts[name] || 0) + (s?.count || 0);
    }
    for (const [name, s] of Object.entries(oppStats)) {
      counts[name] = (counts[name] || 0) + (s?.count || 0);
    }
    const entries = Object.entries(counts);
    if (entries.length === 0) {
      return player.charactersAsAlly?.[0] || player.charactersAsOpponent?.[0] || 'Unknown';
    }
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const getTopCharacters = (role: 'ally' | 'opponent', limit: number = 6): string[] => {
    const stats = role === 'ally' ? (player.allyCharacterStats || {}) : (player.opponentCharacterStats || {});
    const entries = Object.entries(stats).map(([name, s]) => ({ name, count: s?.count || 0 }));
    if (entries.length === 0) {
      const fallback = role === 'ally' ? (player.charactersAsAlly || []) : (player.charactersAsOpponent || []);
      return fallback.slice(0, limit);
    }
    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, limit).map(e => e.name);
  };

  const primaryCharacter = getTopOverallCharacter();
  const characterIcon = censor ? undefined : getCharacterDefaultIconPath(primaryCharacter);
  
  // Calculate total encounters
  const totalEncounters = player.teamsWithCount + player.teamsAgainstCount;
  
  // Calculate win rates
  const teamsWithWinRate = player.teamsWithCount > 0
    ? Math.round((player.teamsWithWins / player.teamsWithCount) * 100)
    : 0;
    
  const teamsAgainstWinRate = player.teamsAgainstCount > 0
    ? Math.round((player.teamsAgainstWins / player.teamsAgainstCount) * 100)
    : 0;
  
  // Format the last seen time
  const lastSeenFormatted = formatRelativeTime(player.lastSeen);

  // Overall W/L (opponent + teammate)
  const overallWins = player.teamsWithWins + player.teamsAgainstWins;
  const overallLosses = player.teamsWithLosses + player.teamsAgainstLosses;

  // Aggregated role W/L for ally or opponent view
  type RoleAgg = Record<CharacterClass, { wins: number; losses: number }>;

  const allyRoleAgg: RoleAgg = useMemo(() => {
    const agg: RoleAgg = {
      [CharacterClass.VANGUARD]: { wins: 0, losses: 0 },
      [CharacterClass.DUELIST]: { wins: 0, losses: 0 },
      [CharacterClass.STRATEGIST]: { wins: 0, losses: 0 },
    };
    const stats = player.allyCharacterStats || {};
    Object.entries(stats).forEach(([charName, s]: any) => {
      const cls = getCharacterClass(charName);
      if (!cls) return;
      agg[cls].wins += s?.wins || 0;
      agg[cls].losses += s?.losses || 0;
    });
    return agg;
  }, [player.allyCharacterStats]);

  const opponentRoleAgg: RoleAgg = useMemo(() => {
    const agg: RoleAgg = {
      [CharacterClass.VANGUARD]: { wins: 0, losses: 0 },
      [CharacterClass.DUELIST]: { wins: 0, losses: 0 },
      [CharacterClass.STRATEGIST]: { wins: 0, losses: 0 },
    };
    const stats = player.opponentCharacterStats || {};
    Object.entries(stats).forEach(([charName, s]: any) => {
      const cls = getCharacterClass(charName);
      if (!cls) return;
      agg[cls].wins += s?.wins || 0;
      agg[cls].losses += s?.losses || 0;
    });
    return agg;
  }, [player.opponentCharacterStats]);
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    dispatch(togglePlayerFavorite({ 
      uid: player.uid, 
      maxFavorites: maxFavoriteRecentPlayers 
    }));
    
    if (!player.isFavorited) {
      // TODO: Localize
      message.success(`${player.name} added to favorites!`);
    } else {
      // TODO: Localize
      message.info(`${player.name} removed from favorites.`);
    }
  };
  
  // Handle player removal
  const handleRemovePlayer = () => {
    dispatch(removePlayer({ uid: player.uid }));
    // TODO: Localize
    message.success(`${player.name} removed from recent players.`);
  };
  
  // Helper function to render character icons with tooltips (top 6)
  const renderCharacterIcons = (characters: string[], max: number = 6) => {
    const items = characters.slice(0, max);
    return items.map((charName, index) => {
      if (censor) {
        return (
          <Avatar
            key={index}
            shape="square"
            size={24}
            className="character-icon-small"
            icon={<UserOutlined />}
          />
        );
      }
      const iconPath = getCharacterDefaultIconPath(charName);
      return (
        <Tooltip key={index} title={charName}>
          <Avatar
            shape="square"
            size={24}
            src={iconPath}
            className="character-icon-small"
            icon={!iconPath ? <UserOutlined /> : undefined}
          />
        </Tooltip>
      );
    });
  };
  
  return (
    <List.Item className="recent-player-item">
      <Card className={`recent-player-card ${player.isFavorited ? 'favorited-player' : ''}`} bordered={false}>
        {/* Header: avatar + inline name (bottom-aligned) and last seen on right */}
        <div className="rpc-header">
          <div className="rpc-left">
            <div className="rpc-avatar-container">
              <Badge count={totalEncounters} overflowCount={999} offset={[-6, 6]} className="encounters-badge">
                <Avatar 
                  shape="square"
                  size={56} 
                  src={characterIcon}
                  icon={!characterIcon ? <UserOutlined /> : undefined}
                  className="rpc-avatar"
                />
              </Badge>
            </div>
            <div className="rpc-name">
              <Text className="player-name">{player.name}</Text>
              <div className="overall-wl-under-name">
                <Text className="overall-wl-text">{overallWins}W - {overallLosses}L</Text>
              </div>
            </div>
          </div>
          <div className="rpc-right">
            <ClockCircleOutlined className="time-icon" />
            <Text className="last-seen-text">{lastSeenFormatted}</Text>
          </div>
        </div>
        {/* Favorite star at card top-right */}
        <button className="favorite-card-star" onClick={handleToggleFavorite} aria-label={player.isFavorited ? 'Unfavorite' : 'Favorite'}>
          {player.isFavorited ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
        </button>
        {/* Two columns: Left = Opponent, Right = Ally */}
        <div className={`rpc-columns section ${expandedSide ? 'expanded' : ''}`}>
          <div className={`rpc-col opponent ${expandedSide === 'opponent' ? 'expanded' : ''}`} onClick={() => setExpandedSide(expandedSide === 'opponent' ? null : 'opponent')}>
            <div className="col-header">
              <Text className="col-title">{t('components.desktop.recent-players.as-opponent', 'As Opponent')}</Text>
              <span className="count-badge">{player.teamsAgainstCount}</span>
            </div>
            {expandedSide === 'opponent' ? (
              <div className="expanded-content">
                <div className="role-wl">
                  {([CharacterClass.VANGUARD, CharacterClass.DUELIST, CharacterClass.STRATEGIST] as CharacterClass[]).map((cls) => (
                    <div className="role-row" key={`opp-role-${cls}`}>
                      <Avatar shape="square" size={20} src={getClassImagePath(cls)} className="character-icon-small" />
                      <span className="role-name">{cls}</span>
                      <span className="role-wl-text">{opponentRoleAgg[cls].wins}W-{opponentRoleAgg[cls].losses}L</span>
                    </div>
                  ))}
                </div>
                <div className="gauge-col">
                  <Gauge value={teamsAgainstWinRate} color="#ff4d4f" textColor="#ffffff" variant="arc" mode="half" size={88} strokeWidth={8} />
                  <div className="wl">
                    <Text className="stat-sub">{player.teamsAgainstWins}W - {player.teamsAgainstLosses}L</Text>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-stats">
                <Gauge value={teamsAgainstWinRate} color="#ff4d4f" textColor="#ffffff" variant="arc" mode="half" size={88} strokeWidth={8} />
                <div className="wl">
                  <Text className="stat-sub">{player.teamsAgainstWins}W - {player.teamsAgainstLosses}L</Text>
                </div>
              </div>
            )}
            <div className="col-characters">
              {renderCharacterIcons(getTopCharacters('opponent', 6), 6)}
            </div>
            {expandedSide === 'opponent' && (
              <div className="col-breakdown">
                {Object.entries(player.opponentCharacterStats || {}).sort((a: any,b: any)=> (b[1]?.count||0)-(a[1]?.count||0)).map(([name, s]: any) => (
                  <div key={`opp-${name}`} className="breakdown-row">
                    <Avatar shape="square" size={20} src={censor ? undefined : (getCharacterDefaultIconPath(name) || undefined)} className="character-icon-small" icon={censor ? <UserOutlined /> : undefined} />
                    <span className="breakdown-name">{censor ? 'Hidden' : name}</span>
                    <span className="breakdown-wl">{s.wins}W-{s.losses}L</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`rpc-col ally ${expandedSide === 'ally' ? 'expanded' : ''}`} onClick={() => setExpandedSide(expandedSide === 'ally' ? null : 'ally')}>
            <div className="col-header">
              <Text className="col-title">{t('components.desktop.recent-players.as-teammate', 'As Teammate')}</Text>
              <span className="count-badge">{player.teamsWithCount}</span>
            </div>
            {expandedSide === 'ally' ? (
              <div className="expanded-content">
                <div className="role-wl">
                  {([CharacterClass.VANGUARD, CharacterClass.DUELIST, CharacterClass.STRATEGIST] as CharacterClass[]).map((cls) => (
                    <div className="role-row" key={`ally-role-${cls}`}>
                      <Avatar shape="square" size={20} src={getClassImagePath(cls)} className="character-icon-small" />
                      <span className="role-name">{cls}</span>
                      <span className="role-wl-text">{allyRoleAgg[cls].wins}W-{allyRoleAgg[cls].losses}L</span>
                    </div>
                  ))}
                </div>
                <div className="gauge-col">
                  <Gauge value={teamsWithWinRate} color="#52c41a" textColor="#ffffff" variant="arc" mode="half" size={88} strokeWidth={8} />
                  <div className="wl">
                    <Text className="stat-sub">{player.teamsWithWins}W - {player.teamsWithLosses}L</Text>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-stats">
                <Gauge value={teamsWithWinRate} color="#52c41a" textColor="#ffffff" variant="arc" mode="half" size={88} strokeWidth={8} />
                <div className="wl">
                  <Text className="stat-sub">{player.teamsWithWins}W - {player.teamsWithLosses}L</Text>
                </div>
              </div>
            )}
            <div className="col-characters">
              {renderCharacterIcons(getTopCharacters('ally', 6), 6)}
            </div>
            {expandedSide === 'ally' && (
              <div className="col-breakdown">
                {Object.entries(player.allyCharacterStats || {}).sort((a: any,b: any)=> (b[1]?.count||0)-(a[1]?.count||0)).map(([name, s]: any) => (
                  <div key={`ally-${name}`} className="breakdown-row">
                    <Avatar shape="square" size={20} src={censor ? undefined : (getCharacterDefaultIconPath(name) || undefined)} className="character-icon-small" icon={censor ? <UserOutlined /> : undefined} />
                    <span className="breakdown-name">{censor ? 'Hidden' : name}</span>
                    <span className="breakdown-wl">{s.wins}W-{s.losses}L</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="rpc-footer">
          <Button className="delete-outline" onClick={handleRemovePlayer} icon={<DeleteOutlined />}>Delete</Button>
        </div>
      </Card>
    </List.Item>
  );
};

const RecentPlayers: React.FC = () => {
  const { t } = useTranslation();
  const { players } = useSelector((state: RootReducer) => state.recentPlayersReducer);
  
  // Local state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'teammates' | 'opponents' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'most' | 'name'>('recent');
  // Censor state (can be wired to global store in future)
  const [censorCharactersWhileCurrentMatchCharacterPick, setCensorCharactersWhileCurrentMatchCharacterPick] = useState(false);
  
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
    if (filter === 'favorites' && !player.isFavorited) {
      return false;
    }
    
    return true;
  });
  
  // Apply sorting
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    // Always prioritize favorited players if we're not filtering by favorites specifically
    if (filter !== 'favorites') {
      if (a.isFavorited && !b.isFavorited) return -1;
      if (!a.isFavorited && b.isFavorited) return 1;
      
      // For favorites, also sort by favorite order
      if (a.isFavorited && b.isFavorited) {
        return b.favoriteOrder - a.favoriteOrder; // Most recently favorited first
      }
    } else {
      // When filtering by favorites, sort by favorite order
      if (sortBy === 'recent') {
        return b.favoriteOrder - a.favoriteOrder;
      }
    }
    
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
  
  // Filter dropdown menu
  const filterMenu = (
    <Menu onClick={(e) => setFilter(e.key as 'all' | 'favorites' | 'teammates' | 'opponents')} selectedKeys={[filter]}>
      <Menu.Item key="all">{t('components.desktop.recent-players.all', 'All')}</Menu.Item>
      <Menu.Item key="favorites">{t('components.desktop.recent-players.favorites', 'Favorites')}</Menu.Item>
      <Menu.Item key="teammates">{t('components.desktop.recent-players.teammates', 'Teammates')}</Menu.Item>
      <Menu.Item key="opponents">{t('components.desktop.recent-players.opponents', 'Opponents')}</Menu.Item>
    </Menu>
  );

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
            <Dropdown overlay={filterMenu} placement="bottomRight">
              <Button>
                {filter === 'all' && t('components.desktop.recent-players.all', 'All')}
                {filter === 'favorites' && t('components.desktop.recent-players.favorites', 'Favorites')}
                {filter === 'teammates' && t('components.desktop.recent-players.teammates', 'Teammates')}
                {filter === 'opponents' && t('components.desktop.recent-players.opponents', 'Opponents')}
              </Button>
            </Dropdown>
            <Dropdown overlay={sortMenu} placement="bottomRight">
              <Button icon={<FilterOutlined />}>
                {t('components.desktop.recent-players.sort', 'Sort')}
              </Button>
            </Dropdown>
            <Space size={4}>
              <span style={{ color: 'var(--primary-color-text)', opacity: 0.85 }}>{t('components.desktop.recent-players.censor-toggle', 'Censor during pick')}</span>
              <Switch checked={censorCharactersWhileCurrentMatchCharacterPick} onChange={setCensorCharactersWhileCurrentMatchCharacterPick} />
            </Space>
          </Space>
        }
      >
        {censorCharactersWhileCurrentMatchCharacterPick && (
          <div style={{ marginBottom: 8 }}>
            <Alert
              type="warning"
              showIcon
              message={t(
                'components.desktop.recent-players.censor-banner',
                'Recent player character picks are censored while players are selecting characters in the current match.'
              )}
            />
          </div>
        )}
        {sortedPlayers.length > 0 ? (
          <List
            className="recent-players-list"
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            dataSource={sortedPlayers}
            renderItem={(player) => <RecentPlayerItem player={player} censor={censorCharactersWhileCurrentMatchCharacterPick} />}
            pagination={{
              pageSize: 9,
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
