import React, { useState, useEffect, useMemo } from 'react';
import { List, Avatar, Card, Typography, Space, Button, Dropdown, Menu, Input, Tooltip, message, Badge, Alert, Switch } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import { SearchOutlined, FilterOutlined, ClockCircleOutlined, TeamOutlined, UserOutlined, StarOutlined, StarFilled, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import MorphChevron from '../shared/MorphChevron';
import PlayerEncounterSection from './components/PlayerEncounterSection';
import { getCharacterDefaultIconPath } from 'lib/characterIcons';
import { getCharacterClass, CharacterClass } from 'lib/characterClassIcons';
import type { RecentPlayer } from '../../../background/stores/recentPlayersSlice';
import { togglePlayerFavorite, removePlayer } from '../../../background/stores/recentPlayersSlice';
import { formatRelativeTime } from 'lib/utils';
import '../styles/RecentPlayers.css';
import { RecentPlayerSortOption, RecentPlayerTeam, RecentPlayerTeamFilter } from './RecentPlayerTypes';

const { Title, Text } = Typography;

export interface RecentPlayerItemProps {
  player: RecentPlayer;
  censor?: boolean;
}

const RecentPlayerItem: React.FC<RecentPlayerItemProps> = ({ player, censor = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { maxFavoriteRecentPlayers } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  const [expandedSide, setExpandedSide] = useState<RecentPlayerTeam | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  
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

  const getTopCharacters = (role: RecentPlayerTeam, limit: number = 6): string[] => {
    const stats = role === RecentPlayerTeam.Ally ? (player.allyCharacterStats || {}) : (player.opponentCharacterStats || {});
    const entries = Object.entries(stats).map(([name, s]) => ({ name, count: s?.count || 0 }));
    if (entries.length === 0) {
      const fallback = role === RecentPlayerTeam.Ally ? (player.charactersAsAlly || []) : (player.charactersAsOpponent || []);
      return fallback.slice(0, limit);
    }
    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, limit).map(e => e.name);
  };

  const primaryCharacter = getTopOverallCharacter();
  const characterIcon = censor ? undefined : getCharacterDefaultIconPath(primaryCharacter);
  
  // Calculate total encounters
  const totalEncounters = player.teamsWithCount + player.teamsAgainstCount;
  
  // Derive losses from counts minus wins to avoid drift issues
  const derivedTeamsWithWins = player.teamsWithWins;
  const derivedTeamsWithLosses = Math.max(0, player.teamsWithCount - derivedTeamsWithWins);
  const derivedTeamsAgainstWins = player.teamsAgainstWins;
  const derivedTeamsAgainstLosses = Math.max(0, player.teamsAgainstCount - derivedTeamsAgainstWins);

  // Calculate win rates
  const teamsWithWinRate = player.teamsWithCount > 0
    ? Math.round((derivedTeamsWithWins / player.teamsWithCount) * 100)
    : 0;
    
  const teamsAgainstWinRate = player.teamsAgainstCount > 0
    ? Math.round((derivedTeamsAgainstWins / player.teamsAgainstCount) * 100)
    : 0;
  
  // Format the last seen time
  const lastSeenFormatted = formatRelativeTime(player.lastSeen);

  // Overall W/L (opponent + teammate)
  const overallWins = derivedTeamsWithWins + derivedTeamsAgainstWins;
  const overallLosses = derivedTeamsWithLosses + derivedTeamsAgainstLosses;
  const overallWinRate = (overallWins + overallLosses) > 0
    ? Math.round((overallWins / (overallWins + overallLosses)) * 100)
    : 0;

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
      <Card className={`recent-player-card ${player.isFavorited ? 'favorited-player' : ''} ${collapsed ? 'collapsed' : ''}`} bordered={false}>
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
                <Text className="has-text-default-color" style={{ marginRight: 8 }}>{overallWinRate}%</Text>
                <Text className="has-text-default-color">{overallWins}W - {overallLosses}L</Text>
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
        <div className={`rpc-columns section ${expandedSide != null ? 'expanded' : ''}`}>
          <PlayerEncounterSection
            variant={RecentPlayerTeam.Opponent}
            title={t('components.desktop.recent-players.as-opponent', 'As Opponent')}
            count={player.teamsAgainstCount}
            expanded={!collapsed && expandedSide === RecentPlayerTeam.Opponent}
            collapsed={collapsed}
            winRate={teamsAgainstWinRate}
            wins={derivedTeamsAgainstWins}
            losses={derivedTeamsAgainstLosses}
            roleAgg={opponentRoleAgg}
            onClickHeader={() => {
              setCollapsed(false);
              setExpandedSide(expandedSide === RecentPlayerTeam.Opponent ? null : RecentPlayerTeam.Opponent); 
            }}
            renderCharacterIcons={!collapsed ? renderCharacterIcons(getTopCharacters(RecentPlayerTeam.Opponent, 6), 6) : null}
            statsMap={player.opponentCharacterStats || {}}
            censor={censor}
          />          
          <PlayerEncounterSection
            variant={RecentPlayerTeam.Ally}
            title={t('components.desktop.recent-players.as-teammate', 'As Teammate')}
            count={player.teamsWithCount}
            expanded={!collapsed && expandedSide === RecentPlayerTeam.Ally}
            collapsed={collapsed}
            winRate={teamsWithWinRate}
            wins={derivedTeamsWithWins}
            losses={derivedTeamsWithLosses}
            roleAgg={allyRoleAgg}
            onClickHeader={() => { 
              setCollapsed(false);
              setExpandedSide(expandedSide === RecentPlayerTeam.Ally ? null : RecentPlayerTeam.Ally); 
            }}
            renderCharacterIcons={!collapsed ? renderCharacterIcons(getTopCharacters(RecentPlayerTeam.Ally, 6), 6) : null}
            statsMap={player.allyCharacterStats || {}}
            censor={censor}
          />
        </div>
        <div className="rpc-footer">
          <MorphChevron expanded={!collapsed} onClick={() => {
            if (!collapsed) setExpandedSide(null);
            setCollapsed(v => !v);
          }} className="collapse-chevron" />
          <Button className="delete-outline" onClick={handleRemovePlayer} icon={<DeleteOutlined />}>Delete</Button>
        </div>
      </Card>
    </List.Item>
  );
};

const RecentPlayers: React.FC = () => {
  const { t } = useTranslation();
  const { players } = useSelector((state: RootReducer) => state.recentPlayersReducer);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<RecentPlayerTeamFilter>(RecentPlayerTeamFilter.All);
  const [sortBy, setSortBy] = useState<RecentPlayerSortOption>(RecentPlayerSortOption.Recent);
  const [censorCharactersWhileCurrentMatchCharacterPick, setCensorCharactersWhileCurrentMatchCharacterPick] = useState(false);
  // Infinite scroll visible item count
  const [visibleCount, setVisibleCount] = useState(30);
  const batchSize = 30;

  // Control parent scroller to prevent full page scrolling
  useEffect(() => {
    const scroller = document.querySelector('.desktop__main-scroller');
    if (scroller) {
      scroller.classList.add('has-recent-players');
      return () => {
        scroller.classList.remove('has-recent-players');
      };
    }
  }, []);

  const playersList = Object.values(players).map(p => p);

  const filteredPlayers = playersList.filter(player => {
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filter === RecentPlayerTeamFilter.Teammates && player.teamsWithCount === 0) return false;
    if (filter === RecentPlayerTeamFilter.Opponents && player.teamsAgainstCount === 0) return false;
    if (filter === RecentPlayerTeamFilter.Favorites && !player.isFavorited) return false;
    return true;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === RecentPlayerSortOption.Recent) return b.lastSeen - a.lastSeen;
    if (sortBy === RecentPlayerSortOption.MostEncounters) {
      const aTotal = a.teamsWithCount + a.teamsAgainstCount;
      const bTotal = b.teamsWithCount + b.teamsAgainstCount;
      return bTotal - aTotal;
    }
    if (sortBy === RecentPlayerSortOption.MostEncountersAsTeammate) return b.teamsWithCount - a.teamsWithCount;
    if (sortBy === RecentPlayerSortOption.MostEncountersAsOpponent) return b.teamsAgainstCount - a.teamsAgainstCount;
    // Default to name sort
    return a.name.localeCompare(b.name);
  });

  // Reset visible items on filter/sort/search changes
  useEffect(() => { 
    setVisibleCount(batchSize); 
  }, [searchTerm, filter, sortBy]);
  
  const visiblePlayers = sortedPlayers.slice(0, visibleCount);

  // Simple scroll observer with debug logging
  useEffect(() => {
    if (visibleCount >= sortedPlayers.length) return;
    
    const container = scrollContainerRef.current;
    if (!container) {
      console.log('Scroll container not found');
      return;
    }
    
    console.log('Setting up scroll listener, container:', container);
    console.log('Has scrollHeight:', container.scrollHeight, 'clientHeight:', container.clientHeight);
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollBottom = scrollHeight - (scrollTop + clientHeight);
      
      console.log('Scroll event:', { scrollTop, scrollHeight, clientHeight, scrollBottom, visibleCount });
      
      // Load more when within 150px of bottom
      if (scrollBottom <= 150) {
        console.log('Loading more players...');
        setVisibleCount(v => Math.min(v + batchSize, sortedPlayers.length));
      }
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [visibleCount, sortedPlayers.length, batchSize]);

  // Container-based infinite scroll for recent players
  useEffect(() => {
    if (visibleCount >= sortedPlayers.length) return;
    
    const onScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Debug log to check scroll detection
      console.log('Recent Players scroll:', { scrollTop, scrollHeight, clientHeight, visibleCount, totalPlayers: sortedPlayers.length });
      
      // Load more when we're within 200px of the bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        console.log('Loading more players...');
        setVisibleCount(v => Math.min(v + batchSize, sortedPlayers.length));
      }
    };
    
    // Throttle scroll events to prevent performance issues
    let timeoutId: number | null = null;
    const throttledOnScroll = () => {
      if (timeoutId) return;
      timeoutId = window.setTimeout(() => {
        onScroll();
        timeoutId = null;
      }, 16); // ~60fps
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', throttledOnScroll, { passive: true });
      
      // Check initial scroll position
      setTimeout(() => {
        onScroll();
        console.log('Initial scroll check completed');
      }, 100);
      
      return () => {
        container.removeEventListener('scroll', throttledOnScroll);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } else {
      console.error('Recent players scroll container not found');
    }
  }, [visibleCount, sortedPlayers.length, batchSize]);

  const filterMenu = (
    <Menu onClick={(e) => setFilter(Number(e.key) as RecentPlayerTeamFilter)} selectedKeys={[filter.toString()]}>
      <Menu.Item key="0">{t('components.desktop.recent-players.all', 'All')}</Menu.Item>
      <Menu.Item key="3">{t('components.desktop.recent-players.favorites', 'Favorites')}</Menu.Item>
      <Menu.Item key="1">{t('components.desktop.recent-players.teammates', 'Teammates')}</Menu.Item>
      <Menu.Item key="2">{t('components.desktop.recent-players.opponents', 'Opponents')}</Menu.Item>
    </Menu>
  );

  const sortMenu = (
    <Menu onClick={(e) => setSortBy(Number(e.key) as RecentPlayerSortOption)} selectedKeys={[sortBy.toString()]}>
      <Menu.Item key="0" icon={<ClockCircleOutlined />}>{t('components.desktop.recent-players.sort-recent', 'Recently Seen')}</Menu.Item>
      <Menu.Item key="1" icon={<TeamOutlined />}>{t('components.desktop.recent-players.sort-most', 'Most Encounters')}</Menu.Item>
      <Menu.Item key="2" icon={<UserOutlined />}>{t('components.desktop.recent-players.sort-name', 'Player Name')}</Menu.Item>
      <Menu.Item key="3" icon={<TeamOutlined />}>{t('components.desktop.recent-players.sort-most-teammate', 'Most Teammate Encounters')}</Menu.Item>
      <Menu.Item key="4" icon={<UserOutlined />}>{t('components.desktop.recent-players.sort-most-opponent', 'Most Opponent Encounters')}</Menu.Item>
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
                <span>
                  {filter === RecentPlayerTeamFilter.All && t('components.desktop.recent-players.all', 'All')}
                  {filter === RecentPlayerTeamFilter.Favorites && t('components.desktop.recent-players.favorites', 'Favorites')}
                  {filter === RecentPlayerTeamFilter.Teammates && t('components.desktop.recent-players.teammates', 'Teammates')}
                  {filter === RecentPlayerTeamFilter.Opponents && t('components.desktop.recent-players.opponents', 'Opponents')}
                </span>
                <DownOutlined style={{ marginLeft: 6 }} />
              </Button>
            </Dropdown>
            <Dropdown overlay={sortMenu} placement="bottomRight">
              <Button icon={<FilterOutlined />}>{t('components.desktop.recent-players.sort', 'Sort')}</Button>
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
            <Alert type="warning" showIcon message={t('components.desktop.recent-players.censor-banner','Recent player character picks are censored while players are selecting characters in the current match.')} />
          </div>
        )}
        {sortedPlayers.length > 0 ? (
          /* Replace Ant List grid with a 3-column round-robin layout so each column grows independently */
          <div className="recent-players-columns" ref={scrollContainerRef}>
            {(() => {
              const cols: RecentPlayer[][] = [[], [], []];
              for (let i = 0; i < visiblePlayers.length; i++) {
                cols[i % 3].push(visiblePlayers[i]);
              }
              return cols.map((col, idx) => (
                <div className="recent-players-column" key={`col-${idx}`}>
                  {col.map((player) => (
                    <RecentPlayerItem key={player.uid} player={player} censor={censorCharactersWhileCurrentMatchCharacterPick} />
                  ))}
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="empty-state">
            <UserOutlined className="empty-icon" />
            <Text className="empty-text">
              {searchTerm || filter !== RecentPlayerTeamFilter.All
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
