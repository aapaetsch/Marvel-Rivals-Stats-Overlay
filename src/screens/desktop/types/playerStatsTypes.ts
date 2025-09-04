export type PlayerStatsFilterType = 'all' | 'ranked' | 'casual';
export type TimeRangeFilterType = 'all' | 'week' | 'month' | 'season';

export interface PlayerRating {
  current: number;
  highest: number;
  rankIcon: string;
  danLevel: number;
}

export interface RankedHistoryPoint {
  date: string;
  rating: number;
  wins: number;
  losses: number;
}

export interface HeroStats {
  hero: string;
  heroImage: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  kda: number;
  avgDamage: number;
  avgScore: number;
}

export interface CumulativeStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKDA: number;
  averageDamage: number;
  topHeroes: string[];
  playtime: number; // in minutes
}

export interface PlayerStatsData {
  playerName: string;
  rating: PlayerRating;
  rankedHistory: RankedHistoryPoint[];
  heroStats: HeroStats[];
  cumulativeStats: CumulativeStats;
  externalApiData?: {
    uid?: string;
    username?: string;
    stats?: {
      matches?: number;
      wins?: number;
      losses?: number;
      winRate?: number;
    };
    rank?: {
      tier?: string;
      division?: number;
      points?: number;
    };
    mainCharacters?: string[];
    lastUpdated?: number;
  };
}

export interface PlayerStatsState {
  data: PlayerStatsData | null;
  activeFilter: PlayerStatsFilterType;
  timeRange: TimeRangeFilterType;
  isLoading: boolean;
  error: string | null;
}