import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootReducer } from 'app/shared/rootReducer';
import { PlayerCardData, TeamData } from './types/MatchCardTypes';
import { useCardFlip } from './hooks/useCardFlip';
import MatchCardGrid from './components/MatchCardGrid';
import './styles/MatchTabNew.css';
import './styles/PlayerCard.css';
import './styles/CardFlipAnimation.css';

const MatchTabNew: React.FC = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  const { flippedCards, toggleCard, resetAllCards } = useCardFlip();

  // Transform Redux data to card format
  const transformPlayerData = useMemo((): PlayerCardData[] => {
    if (!currentMatch?.players) return [];

    return Object.values(currentMatch.players).map(player => ({
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
  }, [currentMatch?.players]);

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

    return Object.entries(teams).map(([teamNumber, players]) => ({
      teamNumber: parseInt(teamNumber),
      players: players.sort((a, b) => {
        // Put local player first, then sort by name
        if (a.isLocal) return -1;
        if (b.isLocal) return 1;
        return a.name.localeCompare(b.name);
      }),
      isPlayerTeam: players.some(p => p.isTeammate)
    }));
  }, [playerData]);

  // Calculate match summary stats
  const matchStats = useMemo(() => {
    const totalKills = playerData.reduce((sum, p) => sum + p.kills, 0);
    const totalDeaths = playerData.reduce((sum, p) => sum + p.deaths, 0);
    const totalDamage = playerData.reduce((sum, p) => sum + p.damageDealt, 0);
    const totalHealing = playerData.reduce((sum, p) => sum + p.totalHeal, 0);

    return {
      totalKills,
      totalDeaths,
      totalDamage: (totalDamage / 1000).toFixed(1) + 'K',
      totalHealing: (totalHealing / 1000).toFixed(1) + 'K'
    };
  }, [playerData]);

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

  return (
    <div className="match-tab-new">
      <div className="match-tab-new-header">
        <h2 className="match-tab-title">
          {t('components.desktop.match-tab-new.title', 'Match Overview - Card View')}
        </h2>
      </div>
      <div className="match-info-summary">
        <div className="match-stat">
          <span className="match-stat-label">
            {t('components.desktop.match-tab-new.total-kills', 'Total Kills')}
          </span>
          <span className="match-stat-value">{matchStats.totalKills}</span>
        </div>
        <div className="match-stat">
          <span className="match-stat-label">
            {t('components.desktop.match-tab-new.total-deaths', 'Total Deaths')}
          </span>
          <span className="match-stat-value">{matchStats.totalDeaths}</span>
        </div>
        <div className="match-stat">
          <span className="match-stat-label">
            {t('components.desktop.match-tab-new.total-damage', 'Total Damage')}
          </span>
          <span className="match-stat-value">{matchStats.totalDamage}</span>
        </div>
        <div className="match-stat">
          <span className="match-stat-label">
            {t('components.desktop.match-tab-new.total-healing', 'Total Healing')}
          </span>
          <span className="match-stat-value">{matchStats.totalHealing}</span>
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