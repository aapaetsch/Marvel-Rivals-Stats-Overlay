import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  PlayerStatsState, 
  PlayerStatsFilterType, 
  TimeRangeFilterType, 
  PlayerRating, 
  RankedHistoryPoint,
  HeroStats,
  CumulativeStats,
  PlayerStatsData
} from '../../desktop/types/playerStatsTypes';
import { initializeApiService, PlayerData, setApiKey } from '../../../lib/marvelRivalsApi';
import { getPlayerStats } from '../../../lib/recentPlayersService';
import { logger } from '../../../lib/log';

// Marvel Rivals API key - in production, this should be stored securely
// const MARVEL_RIVALS_API_KEY = 'YOUR_API_KEY_HERE';

// Initialize API key when in production environment
// if (typeof overwolf !== 'undefined') {
//   setApiKey(MARVEL_RIVALS_API_KEY);
// }
initializeApiService();
// Generate some dummy data for the ranked history
const generateRankedHistoryData = (): RankedHistoryPoint[] => {
  const data: RankedHistoryPoint[] = [];
  const startDate = new Date('2024-01-01');
  let rating = 1200;

  for (let i = 0; i < 90; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Random fluctuation in rating
    const change = Math.floor(Math.random() * 60) - 30;
    rating += change;
    
    // Ensure rating stays within reasonable bounds
    rating = Math.max(800, Math.min(2000, rating));
    
    const wins = Math.floor(Math.random() * 5);
    const losses = Math.floor(Math.random() * 5);
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      rating,
      wins,
      losses
    });
  }
  
  return data;
};

// Generate dummy hero stats
const generateHeroStats = (): HeroStats[] => {
  const heroNames = ['Iron Man', 'Black Panther', 'Storm', 'Hulk', 'Doctor Strange', 'Spider-Man', 'Luna Snow', 'Magik'];
  
  return heroNames.map((name, index) => ({
    hero: name,
    heroImage: `/heroheadshots/regular/${name.toLowerCase().replace(' ', '-')}.png`,
    gamesPlayed: Math.floor(Math.random() * 100) + 10,
    wins: Math.floor(Math.random() * 50) + 5,
    losses: Math.floor(Math.random() * 50) + 5,
    winRate: Math.floor(Math.random() * 60) + 40,
    kda: parseFloat((Math.random() * 4 + 1).toFixed(2)),
    avgDamage: Math.floor(Math.random() * 15000) + 5000,
    avgScore: Math.floor(Math.random() * 800) + 200
  }));
};

const heroStats = generateHeroStats();

// Create a player rating object that matches the defined type
const createPlayerRating = (): PlayerRating => {
  return {
    current: 1650,
    highest: 1800,
    rankIcon: '/rank icons/img_rank_dan_05.png',
    danLevel: 5
  };
};

// Create cumulative stats that match the defined type
const createCumulativeStats = (): CumulativeStats => {
  return {
    totalMatches: 250,
    wins: 145,
    losses: 105,
    winRate: 58,
    averageKDA: 3.2,
    averageDamage: 12500,
    topHeroes: heroStats.slice(0, 3).map(h => h.hero),
    playtime: 15000 // 250 hours in minutes
  };
};

// Async thunk to fetch current user's player data from the API
export const fetchCurrentPlayerData = createAsyncThunk(
  'playerStats/fetchCurrentPlayerData',
  async (username: string, { rejectWithValue }) => {
    try {
      logger.logInfo(
        { event: "fetch_current_player_data", player: username },
        "playerStatsSlice.ts",
        "fetchCurrentPlayerData"
      );
      
      const playerData = await getPlayerStats({ username });
      
      if (!playerData) {
        return rejectWithValue("Failed to fetch player data");
      }
      
      return playerData;
    } catch (error) {
      logger.logInfo(
        { 
          event: "fetch_current_player_data_error", 
          error: error instanceof Error ? error.message : String(error) 
        },
        "playerStatsSlice.ts",
        "fetchCurrentPlayerData"
      );
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch player data");
    }
  }
);

// Initial state with dummy data
const initialState: PlayerStatsState = {
  data: {
    playerName: 'RivalsPlayer',
    rating: createPlayerRating(),
    rankedHistory: generateRankedHistoryData(),
    heroStats,
    cumulativeStats: createCumulativeStats()
  },
  activeFilter: 'all',
  timeRange: 'month',
  isLoading: false,
  error: null
};

const playerStatsSlice = createSlice({
  name: 'playerStats',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentPlayerData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPlayerData.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // If we have player data already, update it with the API data
        if (state.data) {
          state.data.externalApiData = {
            ...action.payload,
            lastUpdated: Date.now()
          };
        }
        
        logger.logInfo(
          { 
            event: "player_api_data_success", 
            username: action.payload.username,
            hasRankInfo: !!action.payload.rank
          },
          "playerStatsSlice.ts",
          "fetchCurrentPlayerData.fulfilled"
        );
      })
      .addCase(fetchCurrentPlayerData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        logger.logInfo(
          { event: "player_api_data_failed", error: action.payload },
          "playerStatsSlice.ts",
          "fetchCurrentPlayerData.rejected"
        );
      });
  },
  reducers: {
    setActiveFilter: (state, action: PayloadAction<PlayerStatsFilterType>) => {
      state.activeFilter = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<TimeRangeFilterType>) => {
      state.timeRange = action.payload;
    },
    fetchPlayerStatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPlayerStatsSuccess: (state, action: PayloadAction<PlayerStatsData>) => {
      state.isLoading = false;
      state.data = action.payload;
    },
    fetchPlayerStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export const {
  setActiveFilter,
  setTimeRange,
  fetchPlayerStatsStart,
  fetchPlayerStatsSuccess,
  fetchPlayerStatsFailure
} = playerStatsSlice.actions;

export default playerStatsSlice.reducer;