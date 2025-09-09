/**
 * Recent Players Service
 * 
 * This service manages recent player data, storing and retrieving information
 * about players encountered in recent matches.
 */
import { PlayerData, RecentPlayerData, getPlayerData } from './marvelRivalsApi';

// 12 hours in milliseconds
const RECENT_DATA_THRESHOLD_MS = 12 * 60 * 60 * 1000;

// In-memory storage for recent player data
// In a production app, consider using localStorage or IndexedDB for persistence
const recentPlayersMap = new Map<string, RecentPlayerData>();

/**
 * Checks if player data is considered recent (less than 12 hours old)
 * @param timestamp The timestamp when the data was last updated
 * @returns boolean indicating if the data is recent
 */
function isDataRecent(timestamp: number): boolean {
  const now = Date.now();
  return now - timestamp < RECENT_DATA_THRESHOLD_MS;
}

/**
 * Stores player data in the recent players cache
 * @param playerData The player data to store
 */
export function storeRecentPlayerData(playerData: PlayerData): void {
  if (!playerData || (!playerData.uid && !playerData.username)) {
    console.error('Invalid player data provided for storage');
    return;
  }

  // Use UID as the primary key, fallback to username
  const playerId = playerData.uid || playerData.username as string;
  
  const recentPlayerData: RecentPlayerData = {
    ...playerData,
    lastUpdated: Date.now()
  };

  recentPlayersMap.set(playerId, recentPlayerData);
  
  // Log the stored data for debugging
  console.log(`Stored recent data for player: ${playerId}`);
}

/**
 * Gets player data from cache or API if needed
 * @param params Object containing either uid or username
 * @returns Promise containing player data
 */
export async function getPlayerStats({ 
  uid, 
  username 
}: { 
  uid?: string; 
  username?: string 
}): Promise<PlayerData | null> {
  if (!uid && !username) {
    console.error('Either uid or username must be provided');
    return null;
  }

  const playerId = uid || username as string;
  const cachedData = recentPlayersMap.get(playerId);

  // If we have recent data, use it
  if (cachedData && isDataRecent(cachedData.lastUpdated)) {
    console.log(`Using cached data for player: ${playerId} (${Math.floor((Date.now() - cachedData.lastUpdated) / 60000)} minutes old)`);
    return cachedData;
  }

  // Otherwise, fetch from API and update cache
  console.log(`Fetching fresh data for player: ${playerId}`);
  const freshData = await getPlayerData({ uid, username });

  if (freshData) {
    storeRecentPlayerData(freshData);
    return freshData;
  }

  // If API fetch failed but we have old data, return it with a warning
  if (cachedData) {
    console.warn(`Using outdated cached data for player: ${playerId}`);
    return cachedData;
  }

  return null;
}

/**
 * Clears all stored recent player data
 */
export function clearRecentPlayersCache(): void {
  recentPlayersMap.clear();
  console.log('Recent players cache cleared');
}

export default {
  getPlayerStats,
  storeRecentPlayerData,
  clearRecentPlayersCache
};
