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
      {/* Sticky Header */}
      <div className="favourites-header sticky top-0 z-10">
        <Card className="favourites-header-card" bordered={false}>
          <div className="flex items-center justify-between">
            <Space align="center" size="large">
              <StarFilled className="text-yellow-400 text-2xl" />
              <Title level={3} className="mb-0">
                {t('components.desktop.favourites.title', 'Favourite Players')}
              </Title>
            </Space>
            <Text className="text-base">
              {t('components.desktop.favourites.count', {
                count: aggregateStats.totalFavorites,
                defaultValue: `${aggregateStats.totalFavorites} Players`,
              })}
            </Text>
          </div>
        </Card>
      </div>

      {/* Aggregate Stats Section */}
      {favoritedPlayers.length > 0 && (
        <div className="favourites-stats-section">
          <Card className="favourites-stats-card" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('components.desktop.favourites.stats.total-encounters', 'Total Encounters')}
                  value={aggregateStats.totalEncounters}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: 'var(--primary-color-text)' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('components.desktop.favourites.stats.teammate-encounters', 'As Teammates')}
                  value={aggregateStats.totalTeammateEncounters}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: 'rgba(82, 196, 26, 1)' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('components.desktop.favourites.stats.opponent-encounters', 'As Opponents')}
                  value={aggregateStats.totalOpponentEncounters}
                  prefix={icons.opponent}
                  valueStyle={{ color: 'rgba(255, 77, 79, 1)' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('components.desktop.favourites.stats.wins-with', 'Wins With Teammates')}
                  value={aggregateStats.totalWinsWithTeammates}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#fadb14' }}
                />
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* Main Content Area with Players Grid */}
      <div className="favourites-content">
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
                        {t(
                          'components.desktop.favourites.empty.title',
                          'No Favourite Players Yet'
                        )}
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

        {/* Bottom Ad Space */}
        <div className="favourites-ad-bottom">
          <Card className="ad-placeholder" bordered={false}>
            <Text type="secondary" className="text-center block">
              {t('components.desktop.favourites.ad-space', 'Ad Space')}
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FavouritesPage;
