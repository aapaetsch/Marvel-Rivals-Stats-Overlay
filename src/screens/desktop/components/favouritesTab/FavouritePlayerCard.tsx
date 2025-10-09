import React, { useMemo } from 'react';
import { Card, Avatar, Typography, Space, Statistic, Row, Col, Button, Tooltip, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined,
  StarFilled,
  TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { getCharacterClass, CharacterClass, getClassImagePath } from 'lib/characterClassIcons';
import type { RecentPlayer } from '../../../background/stores/recentPlayersSlice';
import { togglePlayerFavorite } from '../../../background/stores/recentPlayersSlice';
import { getCharacterDefaultIconPath } from 'lib/characterIcons';
import { formatRelativeTime } from 'lib/utils';
import icons from 'components/Icons';

const { Text } = Typography;

interface FavouritePlayerCardProps {
  player: RecentPlayer;
}

/**
 * FavouritePlayerCard displays a single favourited player with their
 * avatar (most used character), name, and key statistics
 */
const FavouritePlayerCard: React.FC<FavouritePlayerCardProps> = ({ player }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get the most played character across both ally and opponent stats
  const mostUsedCharacter = useMemo(() => {
    const allyStats = player.allyCharacterStats || {};
    const oppStats = player.opponentCharacterStats || {};
    const counts: Record<string, number> = {};

    // Aggregate counts from both ally and opponent stats
    for (const [name, s] of Object.entries(allyStats)) {
      counts[name] = (counts[name] || 0) + (s?.count || 0);
    }
    for (const [name, s] of Object.entries(oppStats)) {
      counts[name] = (counts[name] || 0) + (s?.count || 0);
    }

    // Find character with highest count
    let maxChar = '';
    let maxCount = 0;
    for (const [char, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxChar = char;
      }
    }

    return maxChar;
  }, [player.allyCharacterStats, player.opponentCharacterStats]);

  // Compute top picks (most-played characters) across both ally and opponent roles
  const topPicks = useMemo(() => {
    const counts: Record<string, number> = {};
    const allyStats = player.allyCharacterStats || {};
    const oppStats = player.opponentCharacterStats || {};
    for (const [name, s] of Object.entries(allyStats)) {
      counts[name] = (counts[name] || 0) + (s?.count || 0);
    }
    for (const [name, s] of Object.entries(oppStats)) {
      counts[name] = (counts[name] || 0) + (s?.count || 0);
    }
    const items = Object.entries(counts).map(([name, count]) => ({ name, count }));
    items.sort((a, b) => b.count - a.count);
    return items.slice(0, 5);
  }, [player.allyCharacterStats, player.opponentCharacterStats]);

  // Compute role distribution (most -> least picked) using character class mapping
  const roleDistribution = useMemo(() => {
    const agg: Record<CharacterClass, number> = {
      [CharacterClass.VANGUARD]: 0,
      [CharacterClass.DUELIST]: 0,
      [CharacterClass.STRATEGIST]: 0,
    };
    const allyStats = player.allyCharacterStats || {};
    const oppStats = player.opponentCharacterStats || {};
    const addCounts = (stats: Record<string, any>) => {
      Object.entries(stats).forEach(([charName, s]: any) => {
        const cls = getCharacterClass(charName);
        if (cls != null) {
          agg[cls] += s?.count || 0;
        }
      });
    };
    addCounts(allyStats);
    addCounts(oppStats);
    const total = Object.values(agg).reduce((a, b) => a + b, 0);
    // Convert to array and sort desc
    const arr = (Object.entries(agg) as Array<[CharacterClass, number]>).map(([cls, count]) => ({ cls, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));
    arr.sort((a, b) => b.count - a.count);
    return { total, arr };
  }, [player.allyCharacterStats, player.opponentCharacterStats]);

  const characterIcon = mostUsedCharacter
    ? getCharacterDefaultIconPath(mostUsedCharacter)
    : undefined;

  // Calculate overall win rate
  const totalGames = player.teamsWithCount + player.teamsAgainstCount;
  const totalWins = player.teamsWithWins + player.teamsAgainstWins;
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  // Calculate teammate win rate
  const teammateWinRate =
    player.teamsWithCount > 0
      ? Math.round((player.teamsWithWins / player.teamsWithCount) * 100)
      : 0;

  // Calculate opponent win rate
  const opponentWinRate =
    player.teamsAgainstCount > 0
      ? Math.round((player.teamsAgainstWins / player.teamsAgainstCount) * 100)
      : 0;

  const lastSeenFormatted = formatRelativeTime(player.lastSeen);

  /**
   * Handles unfavoriting the player
   */
  const handleUnfavorite = () => {
    dispatch(togglePlayerFavorite({ uid: player.uid }));
    message.success(
      t('components.desktop.favourites.unfavorited', {
        name: player.name,
        defaultValue: `${player.name} removed from favourites`,
      })
    );
  };

  return (
    <Card className="favourite-player-card" bordered={false}>
      {/* Header: Avatar and Player Name */}
      <div className="flex items-start justify-between mb-4">
        <Space size="middle" align="start">
          <Avatar
            shape="square"
            size={64}
            src={characterIcon}
            icon={!characterIcon ? <UserOutlined /> : undefined}
            className="favourite-player-avatar"
          />
          <div className="flex flex-col">
            <Text className="favourite-player-name font-bold text-lg">
              {player.name}
            </Text>
            <Text type="secondary" className="text-sm">
              {t('components.desktop.favourites.last-seen', 'Last seen')}: {lastSeenFormatted}
            </Text>
            {mostUsedCharacter && (
              <Text type="secondary" className="text-sm">
                {t('components.desktop.favourites.most-played', 'Most played')}: {mostUsedCharacter}
              </Text>
            )}
          </div>
        </Space>

        {/* Unfavorite Button */}
        <Tooltip
          title={t('components.desktop.favourites.remove-favourite', 'Remove from favourites')}
        >
          <Button
            type="text"
            icon={<StarFilled style={{ color: '#fadb14' }} />}
            onClick={handleUnfavorite}
            className="favourite-star-button"
          />
        </Tooltip>
      </div>

      {/* Stats Section */}
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12}>
          <Statistic
            title={t('components.desktop.favourites.overall-winrate', 'Overall Win Rate')}
            value={overallWinRate}
            suffix="%"
            prefix={<TrophyOutlined />}
            valueStyle={{
              color: overallWinRate >= 50 ? 'rgba(82, 196, 26, 1)' : 'rgba(255, 77, 79, 1)',
              fontSize: '1.25rem',
            }}
          />
          <Text type="secondary" className="text-xs block mt-1">
            {totalWins}W - {totalGames - totalWins}L
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <Statistic
            title={t('components.desktop.favourites.total-encounters', 'Total Encounters')}
            value={totalGames}
            prefix={<TeamOutlined />}
            valueStyle={{ fontSize: '1.25rem' }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <Statistic
            title={t('components.desktop.favourites.with-teammate', 'As Teammate')}
            value={teammateWinRate}
            suffix="%"
            valueStyle={{
              color: 'rgba(82, 196, 26, 1)',
              fontSize: '1rem',
            }}
          />
          <Text type="secondary" className="text-xs block mt-1">
            {player.teamsWithWins}W - {player.teamsWithCount - player.teamsWithWins}L ({player.teamsWithCount} games)
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <Statistic
            title={t('components.desktop.favourites.vs-opponent', 'Vs Opponent')}
            value={opponentWinRate}
            prefix={icons.opponent}
            suffix="%"
            valueStyle={{
              color: 'rgba(255, 77, 79, 1)',
              fontSize: '1rem',
            }}
          />
          <Text type="secondary" className="text-xs block mt-1">
            {player.teamsAgainstWins}W - {player.teamsAgainstCount - player.teamsAgainstWins}L ({player.teamsAgainstCount} games)
          </Text>
        </Col>
      </Row>

      {/* Top picks & role distribution */}
      <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={14}>
          <div className="top-picks">
            <Text className="stat-sub" strong>{t('components.desktop.favourites.top-picks', 'Top Picks')}</Text>
            <div className="top-picks-list" style={{ marginTop: 8 }}>
              {topPicks.length === 0 ? (
                <Text type="secondary">{t('components.desktop.favourites.no-picks', 'No character picks recorded')}</Text>
              ) : (
                topPicks.map((p) => (
                  <div key={p.name} className="top-pick-item">
                    <Avatar shape="square" size={28} src={getCharacterDefaultIconPath(p.name)} icon={<UserOutlined />} className="character-icon-small" />
                    <div className="top-pick-meta">
                      <Text className="top-pick-name">{p.name}</Text>
                      <Text type="secondary" className="top-pick-count">{p.count} games</Text>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={10}>
          <div className="role-distribution">
            <Text className="stat-sub" strong>{t('components.desktop.favourites.role-distribution', 'Role Distribution')}</Text>
            <div className="role-list" style={{ marginTop: 8 }}>
              {roleDistribution.arr.map((r) => (
                <div key={r.cls} className="role-row-small">
                  <Avatar shape="square" size={20} src={getClassImagePath(r.cls)} className="character-icon-small" />
                  <Text className="role-name-small">{r.cls}</Text>
                  <Text className="role-count-small">{r.count} ({r.pct}%)</Text>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default FavouritePlayerCard;
