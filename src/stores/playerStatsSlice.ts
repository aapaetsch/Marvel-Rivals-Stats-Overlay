import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  PlayerStatsState, 
  PlayerStatsFilterType, 
  TimeRangeFilterType 
} from '../screens/desktop/types/playerStatsTypes';

// Mock data for development
const mockPlayerStatsData = {
  playerName: 'PlayerOne',
  rating: {
    current: 1250,
    highest: 1320,
    rankIcon: '/rank icons/img_rank_dan_03.png',
    danLevel: 3
  },
  rankedHistory: [
    { date: '2025-01-01', rating: 1100, wins: 2, losses: 1 },
    { date: '2025-01-05', rating: 1150, wins: 3, losses: 2 },
    { date: '2025-01-10', rating: 1200, wins: 4, losses: 2 },
    { date: '2025-01-15', rating: 1180, wins: 4, losses: 3 },
    { date: '2025-01-20', rating: 1220, wins: 5, losses: 3 },
    { date: '2025-01-25', rating: 1250, wins: 7, losses: 3 },
    { date: '2025-02-01', rating: 1300, wins: 9, losses: 4 },
    { date: '2025-02-10', rating: 1320, wins: 11, losses: 5 },
    { date: '2025-02-20', rating: 1280, wins: 12, losses: 7 },
    { date: '2025-03-01', rating: 1250, wins: 13, losses: 9 },
    { date: '2025-03-15', rating: 1270, wins: 15, losses: 10 },
    { date: '2025-04-01', rating: 1250, wins: 16, losses: 12 }
  ],
  heroStats: [
    { 
      hero: 'Spider-Man', 
      heroImage: '/heroheadshots/regular/spiderman.png',
      gamesPlayed: 25, 
      wins: 15, 
      losses: 10, 
      winRate: 60, 
      kda: 3.2, 
      avgDamage: 15000, 
      avgScore: 8500 
    },
    { 
      hero: 'Iron Man', 
      heroImage: '/heroheadshots/regular/ironman.png',
      gamesPlayed: 18, 
      wins: 10, 
      losses: 8, 
      winRate: 55.5, 
      kda: 2.8, 
      avgDamage: 18000, 
      avgScore: 7800 
    },
    { 
      hero: 'Black Panther', 
      heroImage: '/heroheadshots/regular/blackpanther.png',
      gamesPlayed: 15, 
      wins: 9, 
      losses: 6, 
      winRate: 60, 
      kda: 3.5, 
      avgDamage: 12000, 
      avgScore: 8200 
    },
    { 
      hero: 'Captain America', 
      heroImage: '/heroheadshots/regular/captainamerica.png',
      gamesPlayed: 12, 
      wins: 5, 
      losses: 7, 
      winRate: 41.7, 
      kda: 2.5, 
      avgDamage: 10000, 
      avgScore: 7000 
    },
    { 
      hero: 'Storm', 
      heroImage: '/heroheadshots/regular/storm.png',
      gamesPlayed: 10, 
      wins: 6, 
      losses: 4, 
      winRate: 60, 
      kda: 3.0, 
      avgDamage: 14000, 
      avgScore: 7500 
    }
  ],
  cumulativeStats: {
    totalMatches: 80,
    wins: 45,
    losses: 35,
    winRate: 56.25,
    averageKDA: 3.0,
    averageDamage: 14000,
    topHeroes: ['Spider-Man', 'Iron Man', 'Black Panther'],
    playtime: 2400 // 40 hours
  }
};

const initialState: PlayerStatsState = {
  data: mockPlayerStatsData, // Using mock data for now
  activeFilter: 'all',
  timeRange: 'all',
  isLoading: false,
  error: null
};

const playerStatsSlice = createSlice({
  name: 'playerStats',
  initialState,
  reducers: {
    fetchPlayerStatsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchPlayerStatsSuccess(state, action) {
      state.isLoading = false;
      state.data = action.payload;
    },
    fetchPlayerStatsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setActiveFilter(state, action: PayloadAction<PlayerStatsFilterType>) {
      state.activeFilter = action.payload;
    },
    setTimeRange(state, action: PayloadAction<TimeRangeFilterType>) {
      state.timeRange = action.payload;
    }
  }
});

export const {
  fetchPlayerStatsStart,
  fetchPlayerStatsSuccess,
  fetchPlayerStatsFailure,
  setActiveFilter,
  setTimeRange
} = playerStatsSlice.actions;

export default playerStatsSlice.reducer;