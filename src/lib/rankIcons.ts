export enum CompetitiveRank {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2,
  PLATINUM = 3,
  DIAMOND = 4,
  GRANDMASTER = 5,
  CELESTIAL = 6,
  ETERNITY = 7,
  ONEABOVEALL = 8,
}

const rankIconMap: Record<CompetitiveRank, string> = {
  [CompetitiveRank.BRONZE]: 'bronze.png',
  [CompetitiveRank.SILVER]: 'silver.png',
  [CompetitiveRank.GOLD]: 'gold.png',
  [CompetitiveRank.PLATINUM]: 'platinum.png',
  [CompetitiveRank.DIAMOND]: 'diamond.png',
  [CompetitiveRank.GRANDMASTER]: 'grandmaster.png',
  [CompetitiveRank.CELESTIAL]: 'celestial.png',
  [CompetitiveRank.ETERNITY]: 'eternity.png',
  [CompetitiveRank.ONEABOVEALL]: 'oneaboveall.png',
};

// Rank name strings (for display)
const rankNameMap: Record<CompetitiveRank, string> = {
  [CompetitiveRank.BRONZE]: 'Bronze',
  [CompetitiveRank.SILVER]: 'Silver',
  [CompetitiveRank.GOLD]: 'Gold',
  [CompetitiveRank.PLATINUM]: 'Platinum',
  [CompetitiveRank.DIAMOND]: 'Diamond',
  [CompetitiveRank.GRANDMASTER]: 'Grandmaster',
  [CompetitiveRank.CELESTIAL]: 'Celestial',
  [CompetitiveRank.ETERNITY]: 'Eternity',
  [CompetitiveRank.ONEABOVEALL]: 'One Above All',
};

// ELO range constants
// We know that Grandmaster 1 is 4700-4800 ELO
// Each step within a rank is 100 ELO
// Each rank has 3 steps (3, 2, 1)
const GRANDMASTER_1_MIN_ELO = 4700;
const ELO_PER_STEP = 100;
const STEPS_PER_RANK = 3;

/**
 * Interface representing rank information derived from ELO score
 */
export interface RankInfo {
  rank: CompetitiveRank;
  rankName: string;
  step: 1 | 2 | 3;
  eloMin: number;
  eloMax: number;
  iconPath: string;
}

/**
 * Converts an ELO score to rank and step information
 * 
 * @param elo The ELO score to convert
 * @returns RankInfo object with rank, step, and ELO range information
 * 
 * @example
 * // Returns { rank: CompetitiveRank.GRANDMASTER, rankName: 'Grandmaster', step: 1, ... }
 * getEloRankInfo(4750);
 */
export function getEloRankInfo(elo: number): RankInfo {
  // Calculate how many steps away from Grandmaster 1 minimum
  const stepsFromGM1 = Math.floor((elo - GRANDMASTER_1_MIN_ELO) / ELO_PER_STEP);
  
  // Calculate rank index (0 = Bronze, 5 = Grandmaster, etc.)
  // Grandmaster starts at rank index 5, step 3 is at GM1_MIN
  // Step 3 is highest in rank, step 1 is lowest
  // GM 3 = 4500-4600, GM 2 = 4600-4700, GM 1 = 4700-4800
  
  // Calculate total steps from Bronze 3 (the lowest rank/step)
  // Grandmaster 1 is at: (rank 5 * 3 steps/rank) + (step 1) = 16 steps from Bronze 3
  const grandmaster1TotalSteps = (CompetitiveRank.GRANDMASTER * STEPS_PER_RANK) + 1; // 16
  const totalSteps = grandmaster1TotalSteps + stepsFromGM1;
  
  // Calculate rank and step
  let rankIndex = Math.floor(totalSteps / STEPS_PER_RANK);
  let stepInRank = (totalSteps % STEPS_PER_RANK);
  
  // Clamp rank to valid range
  if (rankIndex > CompetitiveRank.ONEABOVEALL) {
    rankIndex = CompetitiveRank.ONEABOVEALL;
    stepInRank = 0; // One Above All step 1 (highest)
  } else if (rankIndex < CompetitiveRank.BRONZE) {
    rankIndex = CompetitiveRank.BRONZE;
    stepInRank = 2; // Bronze step 3 (lowest)
  }
  
  // Convert step index (0, 1, 2) to display step (3, 2, 1)
  // stepInRank 0 = step 3 (lowest in rank)
  // stepInRank 1 = step 2 (middle in rank)
  // stepInRank 2 = step 1 (highest in rank)
  const step = (3 - stepInRank) as 1 | 2 | 3;
  
  const rank = rankIndex as CompetitiveRank;
  
  // Calculate ELO range for this rank/step
  const stepsSinceBronze3 = (rankIndex * STEPS_PER_RANK) + stepInRank;
  const bronze3MinElo = GRANDMASTER_1_MIN_ELO - (grandmaster1TotalSteps * ELO_PER_STEP);
  const eloMin = bronze3MinElo + (stepsSinceBronze3 * ELO_PER_STEP);
  const eloMax = eloMin + ELO_PER_STEP - 1;
  
  return {
    rank,
    rankName: rankNameMap[rank],
    step,
    eloMin,
    eloMax,
    iconPath: `/rank icons/${rankIconMap[rank]}`,
  };
}

/**
 * Gets the rank icon path for a given ELO score
 * 
 * @param elo The ELO score
 * @returns Path to the rank icon image
 * 
 * @example
 * getRankIconPath(4750); // Returns '/rank icons/grandmaster.png'
 */
export function getRankIconPath(elo: number): string {
  const rankInfo = getEloRankInfo(elo);
  return rankInfo.iconPath;
}

/**
 * Gets a formatted rank display string (e.g., "Grandmaster 1")
 * 
 * @param elo The ELO score
 * @returns Formatted rank string
 * 
 * @example
 * getFormattedRank(4750); // Returns 'Grandmaster 1'
 */
export function getFormattedRank(elo: number): string {
  const rankInfo = getEloRankInfo(elo);
  return `${rankInfo.rankName} ${rankInfo.step}`;
}

/**
 * Gets a short formatted rank display string (e.g., "GM 1")
 * 
 * @param elo The ELO score
 * @returns Short formatted rank string
 */
export function getShortFormattedRank(elo: number): string {
  const rankInfo = getEloRankInfo(elo);
  const shortName = getShortRankName(rankInfo.rank);
  return `${shortName} ${rankInfo.step}`;
}

/**
 * Gets a short rank name abbreviation
 */
function getShortRankName(rank: CompetitiveRank): string {
  const shortNames: Record<CompetitiveRank, string> = {
    [CompetitiveRank.BRONZE]: 'BR',
    [CompetitiveRank.SILVER]: 'SI',
    [CompetitiveRank.GOLD]: 'GO',
    [CompetitiveRank.PLATINUM]: 'PL',
    [CompetitiveRank.DIAMOND]: 'DI',
    [CompetitiveRank.GRANDMASTER]: 'GM',
    [CompetitiveRank.CELESTIAL]: 'CE',
    [CompetitiveRank.ETERNITY]: 'ET',
    [CompetitiveRank.ONEABOVEALL]: 'OAA',
  };
  return shortNames[rank];
}
