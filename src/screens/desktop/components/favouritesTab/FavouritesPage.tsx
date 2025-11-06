import React, { useMemo } from 'react';
import { Card, Typography, Empty, Space, Statistic, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StarFilled, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import icons from 'components/Icons';
import { RootReducer } from 'app/shared/rootReducer';
import FavouritePlayerCard from './FavouritePlayerCard';
import './FavouritesPage.css';

const { Title, Text } = Typography;
/**
 * FavouritesPage displays all favourited players with their stats,
 * including a sticky header, aggregated stats at the top, and space for ads
 */
const FavouritesPage: React.FC = () => {
  const { t } = useTranslation();
  const { players } = useSelector((state: RootReducer) => state.recentPlayersReducer);

  // Filter for only favorited players and sort by favoriteOrder (newest first)
  const favoritedPlayers = useMemo(() => {
    return Object.values(players)
      .filter((player) => player.isFavorited)
      .sort((a, b) => b.favoriteOrder - a.favoriteOrder);
  }, [players]);

  // Calculate aggregate stats for all favorited players
  const aggregateStats = useMemo(() => {
    const stats = {
      totalFavorites: favoritedPlayers.length,
      totalEncounters: 0,
      totalTeammateEncounters: 0,
      totalOpponentEncounters: 0,
      totalWinsWithTeammates: 0,
      totalWinsAgainstOpponents: 0,
    };

    favoritedPlayers.forEach((player) => {
      stats.totalEncounters += player.teamsWithCount + player.teamsAgainstCount;
      stats.totalTeammateEncounters += player.teamsWithCount;
      stats.totalOpponentEncounters += player.teamsAgainstCount;
      stats.totalWinsWithTeammates += player.teamsWithWins;
      stats.totalWinsAgainstOpponents += player.teamsAgainstWins;
    });

    return stats;
  }, [favoritedPlayers]);

  return (
    <div className="favourites-page">
      {/* Main Content Area with Players Grid. Header moved inside this container so sticky works reliably */}
      <div className="favourites-content">
        {/* Compact Combined Header with Stats - now inside the scroll container */}
        <div className="favourites-header">
          <Card className="favourites-header-card" bordered={false}>
            {/* Title Row */}
            <div className="favourites-header-title">
              <Space align="center" size="middle">
                <StarFilled style={{ color: '#fadb14', fontSize: '1.25rem' }} />
                <Title level={4} style={{ margin: 0 }}>
                  {t('components.desktop.favourites.title', 'Favourite Players')}
                </Title>
                <Text type="secondary" style={{ fontSize: '0.875rem' }}  className="has-text-primary-color">
                  {t('components.desktop.favourites.count', {
                    count: aggregateStats.totalFavorites,
                    defaultValue: `${aggregateStats.totalFavorites} Players`,
                  })}
                </Text>
              </Space>
            </div>

            {/* Aggregate Stats Row - only shown when there are favorites */}
            {favoritedPlayers.length > 0 && (
              <div className="favourites-header-stats">
                <Row gutter={[12, 8]} align="middle">
                  <Col xs={12} sm={6}>
                    <Statistic
                      title={t('components.desktop.favourites.stats.total-encounters', 'Total')}
                      value={aggregateStats.totalEncounters}
                      prefix={<TeamOutlined />}
                      valueStyle={{ fontSize: '1.125rem' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title={t('components.desktop.favourites.stats.teammate-encounters', 'As Teammates')}
                      value={aggregateStats.totalTeammateEncounters}
                      prefix={icons.teammate}
                      valueStyle={{ fontSize: '1.125rem', color: 'rgba(82, 196, 26, 1)' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title={t('components.desktop.favourites.stats.opponent-encounters', 'As Opponents')}
                      value={aggregateStats.totalOpponentEncounters}
                      prefix={icons.opponent}
                      valueStyle={{ fontSize: '1.125rem', color: 'rgba(255, 77, 79, 1)' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title={t('components.desktop.favourites.stats.wins-with', 'Wins (Team)')}
                      value={aggregateStats.totalWinsWithTeammates}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ fontSize: '1.125rem', color: '#fadb14' }}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </div>

        <div className="favourites-content-grid">
          {/* Players Column - takes up main space */}
          <div className="favourites-players-column">
            {favoritedPlayers.length === 0 ? (
              <Card className="favourites-empty-card" bordered={false}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Space direction="vertical" size="small">
                      <Text className="text-base">
                        {t('components.desktop.favourites.empty.title', 'No Favourite Players Yet')}
                      </Text>
                      <Text type="secondary" className="text-sm">
                        {t(
                          'components.desktop.favourites.empty.description',
                          'Star players from your Recent Players list to add them here'
                        )}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            ) : (
              <div className="favourites-players-grid">
                {favoritedPlayers.map((player) => (
                  <FavouritePlayerCard key={player.uid} player={player} />
                ))}
              </div>
            )}
          </div>

          {/* Right Ad Space - fixed width */}
          <div className="favourites-ad-right">
            <Card className="ad-placeholder" bordered={false}>
              <Text type="secondary" className="text-center block">
                {t('components.desktop.favourites.ad-space', 'Ad Space')}
              </Text>
            </Card>
          </div>
        </div>

        {/* Bottom Ad Space removed to prevent page-level scrolling */}
      </div>
    </div>
  );
};

export default FavouritesPage;
