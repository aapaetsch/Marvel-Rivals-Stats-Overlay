import React, { useState, useEffect, useMemo } from 'react';
import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { GiCardRandom } from 'react-icons/gi';
import { BsTable } from 'react-icons/bs';
import { InfoCircleOutlined } from '@ant-design/icons';
import MatchCardGrid from '../matchTabNew/components/MatchCardGrid';
import MatchTable from '../matchTab/MatchTable';
import MatchInfoCard from '../matchTab/MatchInfoCard';
import LiveMatchCover from '../matchTabNew/components/LiveMatchCover';
import { useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import { shouldShowCardViewCover, hasAnyMatchData } from 'lib/matchStatusUtils';
import { useCardFlip } from '../matchTabNew/hooks/useCardFlip';
import { PlayerCardData, TeamData } from '../matchTabNew/types/MatchCardTypes';
import './styles/LiveMatch.css';

type ViewMode = 'cards' | 'table' | 'info';

/**
 * LiveMatch component that combines card view and table view with a toggle
 */
const LiveMatch: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [roundSelection, setRoundSelection] = useState<'match' | number>('match');
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const { forceShowCardViewCover } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  const { flippedCards, toggleCard } = useCardFlip();

  // Check if data is available and if cover should be shown
  const hasMatchData = hasAnyMatchData(currentMatch);
  const showCover = shouldShowCardViewCover(currentMatch, forceShowCardViewCover);

  // Update a tick every second to refresh duration while match is ongoing
  useEffect(() => {
    if (currentMatch?.timestamps?.matchStart && !currentMatch?.timestamps?.matchEnd) {
      const id = setInterval(() => setNowTs(Date.now()), 1000);
      return () => clearInterval(id);
    }
  }, [currentMatch?.timestamps?.matchStart, currentMatch?.timestamps?.matchEnd]);

  // When the cover is visible, hide overflow-y on the global main scroller to prevent page scroll
  React.useEffect(() => {
    const scroller = document.querySelector('.desktop__main-scroller') as HTMLElement | null;
    if (!scroller) return;
    const prevOverflowY = scroller.style.overflowY;
    if (showCover) {
      scroller.style.overflowY = 'hidden';
    } else {
      scroller.style.overflowY = prevOverflowY || '';
    }
    return () => {
      if (scroller) scroller.style.overflowY = prevOverflowY || '';
    };
  }, [showCover]);

  // Build title details without dangling separators
  const titleParts = [
    currentMatch?.gameType || undefined,
    currentMatch?.gameMode || undefined,
    currentMatch?.map || undefined,
  ].filter(Boolean) as string[];

  const formatDuration = (start?: number | null, end?: number | null) => {
    if (!start) return '00:00';
    const effectiveEnd = end ?? nowTs;
    const ms = Math.max(0, effectiveEnd - start);
    const s = Math.floor(ms / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Build a source players map based on selection (shared logic for both views)
  const selectedPlayersMap = useMemo(() => {
    const rounds = currentMatch?.rounds || [];
    if (!currentMatch?.players) return {} as any;

    if (roundSelection === 'match' || rounds.length === 0) {
      return currentMatch.players;
    }

    const idx = roundSelection as number;
    const snap = rounds[idx];
    if (!snap?.players) return currentMatch.players;

    if (idx === 0) return snap.players;

    const prev = rounds[idx - 1];
    const prevPlayers = prev?.players || {};

    const uidMap: Record<string, true> = {};
    Object.keys(snap.players).forEach((k) => { uidMap[k] = true; });
    Object.keys(prevPlayers).forEach((k) => { uidMap[k] = true; });
    const deltaPlayers: Record<string, any> = {};

    const diffNum = (a?: number, b?: number) => Math.max(0, (a || 0) - (b || 0));
    const diffMap = (am?: Record<string, number>, bm?: Record<string, number>) => {
      const keyMap: Record<string, true> = {};
      Object.keys(am || {}).forEach((k) => { keyMap[k] = true; });
      Object.keys(bm || {}).forEach((k) => { keyMap[k] = true; });
      const out: Record<string, number> = {};
      for (const k in keyMap) {
        const v = diffNum(am?.[k], bm?.[k]);
        if (v > 0) out[k] = v;
      }
      return out;
    };

    for (const uid in uidMap) {
      const cur = (snap.players as any)[uid] || {};
      const pre = (prevPlayers as any)[uid] || {};

      deltaPlayers[uid] = {
        uid: cur.uid || pre.uid || uid,
        name: cur.name || pre.name || 'Player',
        characterName: cur.characterName || pre.characterName,
        characterId: cur.characterId || pre.characterId,
        team: cur.team ?? pre.team ?? 1,
        isLocal: cur.isLocal ?? pre.isLocal ?? false,
        isTeammate: cur.isTeammate ?? pre.isTeammate ?? false,
        kills: diffNum(cur.kills, pre.kills),
        deaths: diffNum(cur.deaths, pre.deaths),
        assists: diffNum(cur.assists, pre.assists),
        finalHits: diffNum(cur.finalHits, pre.finalHits),
        damageDealt: diffNum(cur.damageDealt, pre.damageDealt),
        damageBlocked: diffNum(cur.damageBlocked, pre.damageBlocked),
        totalHeal: diffNum(cur.totalHeal, pre.totalHeal),
        killedPlayers: diffMap(cur.killedPlayers, pre.killedPlayers),
        killedBy: diffMap(cur.killedBy, pre.killedBy),
      };
    }

    return deltaPlayers;
  }, [currentMatch?.players, currentMatch?.rounds, roundSelection]);

  // Transform selected data to card format
  const transformPlayerData = useMemo((): PlayerCardData[] => {
    const players = selectedPlayersMap || {};
    const list = Object.values(players) as any[];
    if (!list.length) return [];

    return list.map((player: any) => ({
      uid: player.uid,
      name: player.name,
      characterName: player.characterName,
      characterId: player.characterId,
      team: player.team,
      isLocal: player.isLocal,
      isTeammate: player.isTeammate,
      kills: player.kills || 0,
      deaths: player.deaths || 0,
      assists: player.assists || 0,
      finalHits: player.finalHits || 0,
      damageDealt: player.damageDealt || 0,
      damageBlocked: player.damageBlocked || 0,
      totalHeal: player.totalHeal || 0,
      killedPlayers: player.killedPlayers || {},
      killedBy: player.killedBy || {}
    }));
  }, [selectedPlayersMap]);

  // Generate dummy data if no real data available (copied from MatchTabNew)
  const generateDummyData = (): PlayerCardData[] => {
    const characters = [
      'IRON MAN', 'SPIDER-MAN', 'HULK', 'STORM', 'BLACK PANTHER', 'DOCTOR STRANGE',
      'SCARLET WITCH', 'CAPTAIN AMERICA', 'THOR', 'BLACK WIDOW', 'HAWKEYE', 'WOLVERINE'
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const isTeammate = i < 6;
      const enemyPlayers = Array.from({ length: 6 }, (_, j) => `dummy_${j + 6}`);
      const teammateUids = Array.from({ length: 6 }, (_, j) => `dummy_${j}`);

      const killedPlayers: Record<string, number> = {};
      const killedBy: Record<string, number> = {};

      if (Math.random() > 0.3) {
        const targets = isTeammate ? enemyPlayers : teammateUids;
        const numTargets = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numTargets; j++) {
          const targetUid = targets[Math.floor(Math.random() * targets.length)];
          killedPlayers[targetUid] = Math.floor(Math.random() * 3) + 1;
        }
      }

      if (Math.random() > 0.4) {
        const attackers = isTeammate ? enemyPlayers : teammateUids;
        const numAttackers = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < numAttackers; j++) {
          const attackerUid = attackers[Math.floor(Math.random() * attackers.length)];
          killedBy[attackerUid] = Math.floor(Math.random() * 2) + 1;
        }
      }

      return {
        uid: `dummy_${i}`,
        name: `Player ${i + 1}`,
        characterName: characters[i] || 'UNKNOWN',
        characterId: `char_${i}`,
        team: i < 6 ? 1 : 2,
        isLocal: i === 0,
        isTeammate: i < 6,
        kills: Math.floor(Math.random() * 15),
        deaths: Math.floor(Math.random() * 10),
        assists: Math.floor(Math.random() * 20),
        finalHits: Object.values(killedPlayers).reduce((sum, count) => sum + count, 0),
        damageDealt: Math.floor(Math.random() * 15000) + 5000,
        damageBlocked: Math.floor(Math.random() * 8000) + 1000,
        totalHeal: Math.floor(Math.random() * 12000) + 2000,
        killedPlayers,
        killedBy
      };
    });
  };

  // Use real data if available, otherwise use dummy data
  const playerData = transformPlayerData.length > 0 ? transformPlayerData : generateDummyData();


  // Group players by team for card view
  const teamData = useMemo((): TeamData[] => {
    const teams: { [key: number]: PlayerCardData[] } = {};
    
    playerData.forEach(player => {
      if (!teams[player.team]) {
        teams[player.team] = [];
      }
      teams[player.team].push(player);
    });

    const grouped: TeamData[] = Object.entries(teams).map(([teamNumber, players]) => ({
      teamNumber: parseInt(teamNumber),
      players: players.sort((a, b) => {
        if (a.isLocal) return -1;
        if (b.isLocal) return 1;
        return a.name.localeCompare(b.name);
      }),
      isPlayerTeam: players.some(p => p.isTeammate)
    }));

    const outcome = currentMatch?.outcome;
    const playerTeam = grouped.find(g => g.isPlayerTeam);
    const enemyTeam = grouped.find(g => !g.isPlayerTeam);
    if (outcome && playerTeam && enemyTeam) {
      if (outcome === 'Victory') {
        playerTeam.isWinner = true;
        enemyTeam.isWinner = false;
      } else if (outcome === 'Defeat') {
        playerTeam.isWinner = false;
        enemyTeam.isWinner = true;
      } else {
        playerTeam.isWinner = false;
        enemyTeam.isWinner = false;
      }
    }

    grouped.sort((a, b) => {
      if (a.isPlayerTeam === b.isPlayerTeam) {
        return a.teamNumber - b.teamNumber;
      }
      return a.isPlayerTeam ? -1 : 1;
    });

    return grouped;
  }, [playerData, currentMatch?.outcome]);

  const renderContent = () => {
    if (viewMode === 'cards') {
      return (
        <div className="live-match-cards-view">
          <MatchCardGrid 
            teams={teamData}
            flippedCards={flippedCards}
            onCardFlip={toggleCard}
            allPlayers={playerData}
          />
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="live-match-table-container">
          <MatchTable />
        </div>
      );
    }

    // Match Info view
    return (
      <div className="live-match-info-container">
        <MatchInfoCard />
      </div>
    );
  };

  return (
    <div className="live-match-container">
      {showCover && (
        <LiveMatchCover
          hasAnyMatchData={hasMatchData}
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* Inner wrapper: keeps header + content together so the whole overlay can be centered */}
      <div className="live-match-inner">
        <div className="live-match-header">
          <div className="live-match-header-left">
            <h2 className="live-match-title">
              {t('components.desktop.live-match.title', 'Live Match')}
            </h2>
            {titleParts.length > 0 && (
              <span className="live-match-details">
                {titleParts.join(' - ')}
              </span>
            )}
            <span className="live-match-duration">
              {formatDuration(currentMatch?.timestamps?.matchStart, currentMatch?.timestamps?.matchEnd)}
            </span>
          </div>
          <div className="live-match-header-right">
            <Segmented
              value={roundSelection}
              onChange={(val) => setRoundSelection(val as any)}
              options={(() => {
                const rounds = currentMatch?.rounds || [];
                const base: { label: string; value: 'match' }[] = [{ label: 'Match', value: 'match' }];
                const roundOpts = rounds.map((_: any, i: number) => ({ label: `Round ${i + 1}`, value: i }));
                return [...base, ...roundOpts];
              })()}
              size="small"
            />
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
              options={[
                {
                  label: t('components.desktop.live-match.card-view', 'Card View'),
                  value: 'cards',
                  icon: <GiCardRandom />,
                },
                {
                  label: t('components.desktop.live-match.table-view', 'Table View'),
                  value: 'table',
                  icon: <BsTable />,
                },
                {
                  label: t('components.desktop.live-match.info-view', 'Match Info'),
                  value: 'info',
                  icon: <InfoCircleOutlined />,
                },
              ]}
              size="middle"
            />
          </div>
        </div>

        <div className="live-match-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LiveMatch;
