import React from 'react';
import { Table, Tag, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { icons } from 'components';
import { getCharacterIconPath } from 'lib/characterIcons';
import '../styles/MatchTable.css';

export interface PlayerDataItem {
  key: string;
  name: string;
  characterName: string;
  team?: number;
  isLocal?: boolean;
  isTeammate?: boolean;
  kills: number;
  deaths: number;
  assists: number;
  finalHits: number;
  damageDealt: number;
  totalHeal: number;
  damageBlocked: number;
}

// Special type for team separator
interface TeamSeparatorRow {
  key: string;
  isSeparator: true;
}

// Combined type for table data source
type TableDataItem = PlayerDataItem | TeamSeparatorRow;

export interface MatchTableProps {
  players: PlayerDataItem[];
  showTeams?: boolean;
  showAvatar?: boolean;
  translationPrefix?: 'match-info' | 'match-detail';
  compact?: boolean;
  showSortControls?: boolean;
  className?: string;
}

const MatchTableComponent: React.FC<MatchTableProps> = ({
  players,
  showTeams = true,
  showAvatar = false,
  translationPrefix = 'match-info',
  compact = false,
  showSortControls = true,
  className = 'players-table'
}) => {
  const { t } = useTranslation();
  const prefix = `components.desktop.${translationPrefix}`;

  // Define table columns
  const columns: ColumnsType<TableDataItem> = [
    {
      title: t(`${prefix}.player-name`, 'Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if ('isSeparator' in record && record.isSeparator) return null;

        const playerRecord = record as PlayerDataItem;

        if (showAvatar) {
          return (
            <div className="player-cell">
              <Avatar 
                src={getCharacterIconPath(playerRecord.characterName)} 
                size="small" 
                className="character-icon-small"
              />
              <span className={playerRecord.isLocal ? 'local-player-name' : ''}>{text}</span>
            </div>
          );
        }
        
        return (
          <span className={`player-name ${playerRecord.isLocal ? 'local-player' : ''}`}>
            {text}
            {playerRecord.isLocal && (
              <Tag color="blue" className="player-tag">
                {t(`${prefix}.you`, 'You')}
              </Tag>
            )}
          </span>
        );
      },
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).name.localeCompare((b as PlayerDataItem).name);
      } : undefined,
    },
    {
      title: t(`${prefix}.character`, 'Character'),
      dataIndex: 'characterName',
      key: 'characterName',
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).characterName.localeCompare((b as PlayerDataItem).characterName);
      } : undefined,
    },
    {
      title: () => (
        <span className={compact ? "column-header" : "icon-header"}>
          <span className={compact ? "icon-wrapper" : ""}>{icons.kill}</span>
          <span className={compact ? "" : "icon-label"}>{t(`${prefix}.kills`, compact ? 'K' : 'Kills')}</span>
        </span>
      ),
      dataIndex: 'kills',
      key: 'kills',
      className: 'column-number',
      align: compact ? 'center' : undefined,
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).kills - (b as PlayerDataItem).kills;
      } : undefined,
    },
    {
      title: () => (
        <span className={compact ? "column-header" : "icon-header"}>
          <span className={compact ? "icon-wrapper" : ""}>{icons.death}</span>
          <span className={compact ? "" : "icon-label"}>{t(`${prefix}.deaths`, compact ? 'D' : 'Deaths')}</span>
        </span>
      ),
      dataIndex: 'deaths',
      key: 'deaths',
      className: 'column-number',
      align: compact ? 'center' : undefined,
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).deaths - (b as PlayerDataItem).deaths;
      } : undefined,
    },
    {
      title: () => (
        <span className={compact ? "column-header" : "icon-header"}>
          <span className={compact ? "icon-wrapper" : ""}>{icons.assist}</span>
          <span className={compact ? "" : "icon-label"}>{t(`${prefix}.assists`, compact ? 'A' : 'Assists')}</span>
        </span>
      ),
      dataIndex: 'assists',
      key: 'assists',
      className: 'column-number',
      align: compact ? 'center' : undefined,
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).assists - (b as PlayerDataItem).assists;
      } : undefined,
    },
    {
      title: () => (
        <span className={compact ? "column-header" : "icon-header"}>
          <span className={compact ? "icon-wrapper" : ""}>{icons.finalHits}</span>
          <span className={compact ? "" : "icon-label"}>{t(`${prefix}.final-hits`, compact ? 'FB' : 'Final Hits')}</span>
        </span>
      ),
      dataIndex: 'finalHits',
      key: 'finalHits',
      className: 'column-number',
      align: compact ? 'center' : undefined,
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).finalHits - (b as PlayerDataItem).finalHits;
      } : undefined,
    },
    {
      title: t(`${prefix}.damage`, 'Damage'),
      dataIndex: 'damageDealt',
      key: 'damageDealt',
      className: 'column-number',
      align: compact ? 'right' : undefined,
      render: (value, record) => {
        if ('isSeparator' in record && record.isSeparator) return null;
        return (value as number).toLocaleString();
      },
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).damageDealt - (b as PlayerDataItem).damageDealt;
      } : undefined,
    },
    {
      title: t(`${prefix}.healing`, 'Healing'),
      dataIndex: 'totalHeal',
      key: 'totalHeal',
      className: 'column-number',
      align: compact ? 'right' : undefined,
      render: (value, record) => {
        if ('isSeparator' in record && record.isSeparator) return null;
        return (value as number).toLocaleString();
      },
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).totalHeal - (b as PlayerDataItem).totalHeal;
      } : undefined,
    },
    {
      title: t(`${prefix}.block`, 'Blocked'),
      dataIndex: 'damageBlocked',
      key: 'damageBlocked',
      className: 'column-number',
      align: compact ? 'right' : undefined,
      render: (value, record) => {
        if ('isSeparator' in record && record.isSeparator) return null;
        return (value as number).toLocaleString();
      },
      sorter: showSortControls ? (a, b) => {
        if ('isSeparator' in a || 'isSeparator' in b) return 0;
        return (a as PlayerDataItem).damageBlocked - (b as PlayerDataItem).damageBlocked;
      } : undefined,
    }
  ];

  // Group data by team for display if showTeams is true
  const tableData = React.useMemo(() => {
    if (!showTeams) return players;
    
    // Separate players into two groups: allies (local player + teammates) and enemies
    const allies: PlayerDataItem[] = [];
    const enemies: PlayerDataItem[] = [];
    
    players.forEach(player => {
      if (player.isLocal || player.isTeammate) {
        allies.push(player);
      } else {
        enemies.push(player);
      }
    });
    
    // Sort allies: local player first, then by name
    allies.sort((a, b) => {
      if (a.isLocal !== b.isLocal) {
        return a.isLocal ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Sort enemies by name
    enemies.sort((a, b) => a.name.localeCompare(b.name));
    
    // If we have both allies and enemies, add a separator between them
    if (allies.length > 0 && enemies.length > 0) {
      // Create data with separator
      return [
        ...allies,
        { key: 'team-separator', isSeparator: true } as TeamSeparatorRow,
        ...enemies
      ] as TableDataItem[];
    }
    
    // Otherwise just return the combined list
    return [...allies, ...enemies] as TableDataItem[];
  }, [players, showTeams]);
  
  return (
    <div className="match-table-wrapper">
      <Table 
        columns={columns} 
        dataSource={tableData}
        pagination={false}
        size="small"
        className={className}
        rowClassName={(record) => {
          // Add a class for the separator row
          if ('isSeparator' in record && record.isSeparator) {
            return 'team-separator';
          }
          
          // TypeScript safety - we know this is a PlayerDataItem now
          const playerRecord = record as PlayerDataItem;
          
          if (!showTeams) return playerRecord.isLocal ? 'local-player-row' : '';
          if (playerRecord.isLocal) return 'local-player-row';
          if (playerRecord.isTeammate) return 'teammate-row';
          return 'opponent-row';
        }}
        locale={{
          emptyText: t(`${prefix}.no-players`, 'No player data available.')
        }}
        // Make the separator row not selectable and not interactive
        onRow={(record) => ({
          onClick: ('isSeparator' in record && record.isSeparator) ? undefined : () => {},
        })}
      />
    </div>
  );
};

export default MatchTableComponent;