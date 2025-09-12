import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import { PlayerCardData, TeamData } from './types/MatchCardTypes';
import { useCardFlip } from './hooks/useCardFlip';
import MatchCardGrid from './components/MatchCardGrid';
import './styles/MatchTabNew.css';
import './styles/PlayerCard.css';
import './styles/CardFlipAnimation.css';
import { Segmented } from 'antd';

const MatchTabNew: React.FC = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  // Update a tick every second to refresh duration while match is ongoing
  useEffect(() => {
    if (currentMatch?.timestamps?.matchStart && !currentMatch?.timestamps?.matchEnd) {
      const id = setInterval(() => setNowTs(Date.now()), 1000);
      return () => clearInterval(id);
    }
  }, [currentMatch?.timestamps?.matchStart, currentMatch?.timestamps?.matchEnd]);
  const { flippedCards, toggleCard, resetAllCards } = useCardFlip();
  // Round selection: 'match' (default cumulative) or specific round index
  const [roundSelection, setRoundSelection] = useState<'match' | number>('match');

  // Build a source players map based on selection
  const selectedPlayersMap = useMemo(() => {
    const rounds = currentMatch?.rounds || [];
    if (!currentMatch?.players) return {} as any;

    if (roundSelection === 'match' || rounds.length === 0) {
      return currentMatch.players;
    }

    const idx = roundSelection as number;
    const snap = rounds[idx];
    if (!snap?.players) return currentMatch.players;

    // First round: use snapshot as-is
    if (idx === 0) return snap.players;

    const prev = rounds[idx - 1];
    const prevPlayers = prev?.players || {};

    // Compute delta between current and previous snapshot
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

  // Generate dummy data if no real data available
  const generateDummyData = (): PlayerCardData[] => {
    const characters = [
      'IRON MAN', 'SPIDER-MAN', 'HULK', 'STORM', 'BLACK PANTHER', 'DOCTOR STRANGE',
      'SCARLET WITCH', 'CAPTAIN AMERICA', 'THOR', 'BLACK WIDOW', 'HAWKEYE', 'WOLVERINE'
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const isTeammate = i < 6;
      const enemyPlayers = Array.from({ length: 6 }, (_, j) => `dummy_${j + 6}`);
      const teammateUids = Array.from({ length: 6 }, (_, j) => `dummy_${j}`);
      
      // Generate some sample final hits data
      const killedPlayers: Record<string, number> = {};
      const killedBy: Record<string, number> = {};
      
      // Add some random final hits against opponents
      if (Math.random() > 0.3) {
        const targets = isTeammate ? enemyPlayers : teammateUids;
        const numTargets = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numTargets; j++) {
          const targetUid = targets[Math.floor(Math.random() * targets.length)];
          killedPlayers[targetUid] = Math.floor(Math.random() * 3) + 1;
        }
      }
      
      // Add some deaths from opponents
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

  // Group players by team
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
        // Put local player first, then sort by name
        if (a.isLocal) return -1;
        if (b.isLocal) return 1;
        return a.name.localeCompare(b.name);
      }),
      isPlayerTeam: players.some(p => p.isTeammate)
    }));

    // Mark winner team
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

    // Ensure player's team is first (top), enemy team second (bottom)
    grouped.sort((a, b) => {
      if (a.isPlayerTeam === b.isPlayerTeam) {
        // If both are same type, keep stable order by team number
        return a.teamNumber - b.teamNumber;
      }
      return a.isPlayerTeam ? -1 : 1;
    });

    return grouped;
  }, [playerData, currentMatch?.outcome]);

  const formatDuration = (start?: number | null, end?: number | null) => {
    if (!start) return '00:00';
    const effectiveEnd = end ?? nowTs;
    const ms = Math.max(0, effectiveEnd - start);
    const s = Math.floor(ms / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  if (!playerData.length) {
    return (
      <div className="match-tab-new">
        <div className="no-match-data">
          <h3>{t('components.desktop.match-tab-new.no-data', 'No Match Data Available')}</h3>
          <p>{t('components.desktop.match-tab-new.no-data-desc', 'Start a match to see player statistics in card view.')}</p>
        </div>
      </div>
    );
  }

  // Build title details without dangling separators
  const titleParts = [
    currentMatch?.gameType || undefined,
    currentMatch?.gameMode || undefined,
    currentMatch?.map || undefined,
  ].filter(Boolean) as string[];

  return (
    <div className="match-tab-new">
      <div className="match-tab-new-header">
        <div className="match-title-row">
          <h2 className="match-tab-title">
            <span className="current-match-label">Current Match</span>
            <span className="title-sep"> - </span>
            <span className="title-details">
              {titleParts.length ? titleParts.join(' - ') : 'Type - Mode - Map'}
            </span>
          </h2>
        </div>
        <div className="match-tab-controls">
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
          <div className="match-duration">
            {formatDuration(currentMatch?.timestamps?.matchStart, currentMatch?.timestamps?.matchEnd)}
          </div>
        </div>
      </div>
      <MatchCardGrid 
        teams={teamData}
        flippedCards={flippedCards}
        onCardFlip={toggleCard}
        allPlayers={playerData}
      />
    </div>
  );
};

export default MatchTabNew;
