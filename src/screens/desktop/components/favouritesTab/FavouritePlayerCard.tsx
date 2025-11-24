import React, { useMemo } from 'react';
import { Card, Avatar, Typography, Statistic, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { getCharacterClass, CharacterClass, getClassImagePath } from 'lib/characterClassIcons';
import type { RecentPlayer } from '../../../background/stores/recentPlayersSlice';
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

  // Compute role distribution (most -> least picked) with win rates using character class mapping
  const roleDistribution = useMemo(() => {
    const agg: Record<CharacterClass, { count: number; wins: number; losses: number }> = {
      [CharacterClass.VANGUARD]: { count: 0, wins: 0, losses: 0 },
      [CharacterClass.DUELIST]: { count: 0, wins: 0, losses: 0 },
      [CharacterClass.STRATEGIST]: { count: 0, wins: 0, losses: 0 },
    };
    const allyStats = player.allyCharacterStats || {};
    const oppStats = player.opponentCharacterStats || {};
    const addCounts = (stats: Record<string, any>) => {
      Object.entries(stats).forEach(([charName, s]: any) => {
        const cls = getCharacterClass(charName);
        if (cls != null) {
          agg[cls].count += s?.count || 0;
          agg[cls].wins += s?.wins || 0;
          agg[cls].losses += s?.losses || 0;
        }
      });
    };
    addCounts(allyStats);
    addCounts(oppStats);
    const total = Object.values(agg).reduce((a, b) => a + b.count, 0);
    // Convert to array and sort desc
    const arr = (Object.entries(agg) as Array<[CharacterClass, { count: number; wins: number; losses: number }]>).map(([cls, stats]) => {
      const winRate = stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;
      const pct = total > 0 ? Math.round((stats.count / total) * 100) : 0;
      return { cls, count: stats.count, wins: stats.wins, losses: stats.losses, winRate, pct };
    });
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

  return (
    <Card className="favourite-player-card" bordered={false}>
      <div className="favourite-player-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {/* Avatar + Name + Last Seen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <Avatar
            shape="square"
            size={64}
            src={characterIcon}
            icon={!characterIcon ? <UserOutlined /> : undefined}
            className="favourite-player-avatar"
          />
          <div className="favourite-player-meta">
            <Text className="favourite-player-name meta-name" style={{ display: 'block' }}>
              {player.name}
            </Text>

            <Text className="meta-text meta-last-seen" style={{ marginTop: 6, display: 'block' }}>
              {t('components.desktop.favourites.last-seen', 'Last seen')}: {lastSeenFormatted}
            </Text>

            {mostUsedCharacter && (
              <Text className="meta-text meta-most-played" style={{ marginTop: 6, display: 'block' }}>
                {t('components.desktop.favourites.most-played', 'Most played')}: {mostUsedCharacter}
              </Text>
            )}

            <Text className="meta-text meta-total-encounters" style={{ marginTop: 6, display: 'block' }}>
              {t('components.desktop.favourites.total-encounters', 'Total Encounters')}: {totalGames}
            </Text>
          </div>
        </div>

        {/* Rank Icon + ELO aligned right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            className="rank-image-placeholder"
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'var(--neutral-3)',
              border: '2px dashed var(--primary-color-medium)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UserOutlined style={{ color: 'var(--primary-color-medium)', fontSize: 20 }} />
          </div>
          <div className="fpc-elo-under-rankicon">
            <Text style={{ color: 'var(--text-color)', fontWeight: 600 }}>
              {player.elo_scores_by_mode?.Competitive ?? player.elo_scores_by_mode?.Ranked ?? player.elo_score ?? '-'}
            </Text>
          </div>
        </div>
      </div>

      {/* Win Rate Stats Row - first row under header */}
      <Row gutter={[12, 8]} style={{ marginBottom: 16 }}>
  <Col xs={24} sm={8} className="stat-col">
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
          <Text className="stat-wl">{totalWins}W - {totalGames - totalWins}L</Text>
          <Text className="stat-games">({totalGames} games)</Text>
        </Col>

  <Col xs={24} sm={8} className="stat-col">
          <Statistic
            title={t('components.desktop.favourites.with-teammate', 'As Teammate')}
            value={teammateWinRate}
            suffix="%"
            prefix={icons.teammate}
            valueStyle={{
              color: 'rgba(82, 196, 26, 1)',
              fontSize: '1rem',
            }}
          />
          <Text className="stat-wl">{player.teamsWithWins}W - {player.teamsWithCount - player.teamsWithWins}L</Text>
          <Text className="stat-games">({player.teamsWithCount} games)</Text>
        </Col>

  <Col xs={24} sm={8} className="stat-col">
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
          <Text className="stat-wl">{player.teamsAgainstWins}W - {player.teamsAgainstCount - player.teamsAgainstWins}L</Text>
          <Text className="stat-games">({player.teamsAgainstCount} games)</Text>
        </Col>
      </Row>

      {/* Role Distribution and Top Picks */}
      <Row gutter={[8, 8]}>
        <Col xs={24}>
          <div className="role-distribution">
            <Text className="stat-sub" strong>{t('components.desktop.favourites.role-distribution', 'Role Distribution')}</Text>
              <div className="role-list" style={{ marginTop: 4 }}>
                {roleDistribution.arr.map((r) => (
                  <div key={r.cls} className="role-row-small">
                    <Text className="role-pct-small">{r.pct}%</Text>
                    <Avatar shape="square" size={20} src={getClassImagePath(r.cls)} className="character-icon-small" />
                    <Text className="role-name-small">{r.cls}</Text>
                    <Text className="role-count-small">{r.winRate}% WR</Text>
                  </div>
                ))}
              </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Text className="stat-sub" strong>{t('components.desktop.favourites.top-picks', 'Top Picks')}</Text>
            <div className="top-picks-list-horizontal" style={{ marginTop: 6 }}>
              {topPicks.length === 0 ? (
                <Text type="secondary">{t('components.desktop.favourites.no-picks', 'No character picks recorded')}</Text>
              ) : (
                topPicks.map((p) => (
                  <div key={p.name} className="top-pick-item-horizontal">
                    <Avatar shape="square" size={40} src={getCharacterDefaultIconPath(p.name)} icon={<UserOutlined />} className="character-icon-small" />
                    <div className="top-pick-meta-horizontal">
                      <Text className="top-pick-name-horizontal">{p.name}</Text>
                      <Text type="secondary" className="top-pick-count-horizontal">{p.count} games</Text>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default FavouritePlayerCard;
