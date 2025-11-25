/**
 * ELO Tracking Service
 * 
 * This service handles tracking and storing the local player's ELO ratings
 * across competitive and quick match modes. It maintains:
 * - Recent match history (last 100 matches per mode)
 * - Compressed long-term storage (last ELO of each day beyond 100 matches)
 */

import { logger } from "./log";

// ELO data point structure
export interface EloDataPoint {
  elo: number;
  timestamp: number;
  matchId?: string | null;
}

// Storage structure for ELO tracking
export interface EloTrackingData {
  comp: {
    recent: EloDataPoint[]; // Last 100 matches
    longTerm: EloDataPoint[]; // Last ELO of each day (compressed)
  };
  quickMatch: {
    recent: EloDataPoint[]; // Last 100 matches
    longTerm: EloDataPoint[]; // Last ELO of each day (compressed)
  };
}

// Constants
const MAX_RECENT_MATCHES = 100;
const STORAGE_KEY = "elo_tracking_data";

/**
 * Retrieves all ELO tracking data from local storage
 */
export function getEloTrackingData(): EloTrackingData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.logError(
      error as Error,
      "eloTrackingService.ts",
      "getEloTrackingData"
    );
  }

  // Return empty structure if nothing stored
  return {
    comp: {
      recent: [],
      longTerm: [],
    },
    quickMatch: {
      recent: [],
      longTerm: [],
    },
  };
}

/**
 * Saves ELO tracking data to local storage
 */
function saveEloTrackingData(data: EloTrackingData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    logger.logInfo(
      {
        event: "elo_data_saved",
        compRecentCount: data.comp.recent.length,
        compLongTermCount: data.comp.longTerm.length,
        quickMatchRecentCount: data.quickMatch.recent.length,
        quickMatchLongTermCount: data.quickMatch.longTerm.length,
      },
      "eloTrackingService.ts",
      "saveEloTrackingData"
    );
  } catch (error) {
    logger.logError(
      error as Error,
      "eloTrackingService.ts",
      "saveEloTrackingData"
    );
  }
}

/**
 * Gets the start of day timestamp (midnight) for a given timestamp
 */
function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Compresses old data by moving oldest entries from recent to long-term storage
 * Keeps only the last ELO of each day in long-term storage
 */
function compressOldData(
  recent: EloDataPoint[],
  longTerm: EloDataPoint[]
): { recent: EloDataPoint[]; longTerm: EloDataPoint[] } {
  // If recent array is within limit, no compression needed
  if (recent.length <= MAX_RECENT_MATCHES) {
    return { recent, longTerm };
  }

  // Determine how many entries need to be moved to long-term
  const entriesToCompress = recent.slice(0, recent.length - MAX_RECENT_MATCHES);
  const remainingRecent = recent.slice(recent.length - MAX_RECENT_MATCHES);

  // Group compressed entries by day and keep only the last ELO of each day
  const dayMap = new Map<number, EloDataPoint>();

  // First, add existing long-term entries to the map
  longTerm.forEach((entry) => {
    const dayStart = getStartOfDay(entry.timestamp);
    const existing = dayMap.get(dayStart);
    // Keep the entry with the latest timestamp for each day
    if (!existing || entry.timestamp > existing.timestamp) {
      dayMap.set(dayStart, entry);
    }
  });

  // Then, add entries to compress
  entriesToCompress.forEach((entry) => {
    const dayStart = getStartOfDay(entry.timestamp);
    const existing = dayMap.get(dayStart);
    // Keep the entry with the latest timestamp for each day
    if (!existing || entry.timestamp > existing.timestamp) {
      dayMap.set(dayStart, entry);
    }
  });

  // Convert map back to array and sort by timestamp
  const compressedLongTerm = Array.from(dayMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  logger.logInfo(
    {
      event: "elo_data_compressed",
      entriesCompressed: entriesToCompress.length,
      longTermEntries: compressedLongTerm.length,
    },
    "eloTrackingService.ts",
    "compressOldData"
  );

  return {
    recent: remainingRecent,
    longTerm: compressedLongTerm,
  };
}

/**
 * Records an ELO data point for the local player
 * 
 * @param elo The ELO score to record
 * @param gameMode The game mode ("Ranked" or "Quick Match")
 * @param matchId Optional match ID for reference
 */
export function recordElo(
  elo: number,
  gameMode: string,
  matchId?: string | null
): void {
  // Validate ELO value
  if (typeof elo !== "number" || isNaN(elo)) {
    logger.logInfo(
      {
        event: "invalid_elo_skipped",
        elo,
        gameMode,
      },
      "eloTrackingService.ts",
      "recordElo"
    );
    return;
  }

  // Normalize game mode
  const normalizedMode = normalizeGameMode(gameMode);
  if (!normalizedMode) {
    logger.logInfo(
      {
        event: "unknown_game_mode_skipped",
        gameMode,
      },
      "eloTrackingService.ts",
      "recordElo"
    );
    return;
  }

  const data = getEloTrackingData();
  const modeData = normalizedMode === "comp" ? data.comp : data.quickMatch;

  // Create new data point
  const dataPoint: EloDataPoint = {
    elo,
    timestamp: Date.now(),
    matchId,
  };

  // Add to recent array
  modeData.recent.push(dataPoint);

  // Compress if needed
  const compressed = compressOldData(modeData.recent, modeData.longTerm);
  modeData.recent = compressed.recent;
  modeData.longTerm = compressed.longTerm;

  // Save updated data
  saveEloTrackingData(data);

  logger.logInfo(
    {
      event: "elo_recorded",
      elo,
      gameMode,
      normalizedMode,
      matchId,
      recentCount: modeData.recent.length,
      longTermCount: modeData.longTerm.length,
    },
    "eloTrackingService.ts",
    "recordElo"
  );
}

/**
 * Normalizes game mode string to either "comp" or "quickMatch"
 * Returns null if the mode is not recognized
 */
function normalizeGameMode(gameMode: string): "comp" | "quickMatch" | null {
  const lower = gameMode.toLowerCase();
  
  if (lower.includes("rank") || lower.includes("comp")) {
    return "comp";
  }
  
  if (lower.includes("quick") || lower.includes("casual")) {
    return "quickMatch";
  }
  
  return null;
}

/**
 * Gets all ELO data points for a specific mode (recent + long-term combined)
 */
export function getEloHistory(
  mode: "comp" | "quickMatch"
): EloDataPoint[] {
  const data = getEloTrackingData();
  const modeData = mode === "comp" ? data.comp : data.quickMatch;
  
  // Combine long-term and recent, sorted by timestamp
  return [...modeData.longTerm, ...modeData.recent].sort(
    (a, b) => a.timestamp - b.timestamp
  );
}

/**
 * Gets only recent ELO data points (last 100 matches) for a specific mode
 */
export function getRecentEloHistory(
  mode: "comp" | "quickMatch"
): EloDataPoint[] {
  const data = getEloTrackingData();
  const modeData = mode === "comp" ? data.comp : data.quickMatch;
  
  return [...modeData.recent];
}

/**
 * Gets the latest ELO for a specific mode
 */
export function getLatestElo(mode: "comp" | "quickMatch"): number | null {
  const recent = getRecentEloHistory(mode);
  
  if (recent.length === 0) {
    return null;
  }
  
  return recent[recent.length - 1].elo;
}

/**
 * Clears all ELO tracking data (useful for testing or reset)
 */
export function clearEloTrackingData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    logger.logInfo(
      { event: "elo_data_cleared" },
      "eloTrackingService.ts",
      "clearEloTrackingData"
    );
  } catch (error) {
    logger.logError(
      error as Error,
      "eloTrackingService.ts",
      "clearEloTrackingData"
    );
  }
}

const eloTrackingService = {
  recordElo,
  getEloTrackingData,
  getEloHistory,
  getRecentEloHistory,
  getLatestElo,
  clearEloTrackingData,
};

export default eloTrackingService;
