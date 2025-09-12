export enum MatchOutcome {
  Victory = "Victory",
  Defeat = "Defeat",
  Draw = "Draw",
  Unknown = "Unknown"
}

export interface PlayerStats {
  uid: string;
  name: string;
  characterName: string;
  characterId: string;
  team: number;

  isTeammate: boolean;
  isLocal: boolean;
  isAlive: boolean;

  kills: number;
  finalHits: number;
  deaths: number;
  assists: number;

  ultCharge: number | null;
  damageDealt: number;
  damageBlocked: number;
  totalHeal: number;

  pctTeamDamage: number;   // 0–100
  pctTeamBlocked: number;  // 0–100
  pctTeamHealing: number;  // 0–100
  lastUpdated: number;  // timestamp of last update

  killedPlayers: Record<string, number>;
  killedBy: Record<string, number>;
  characterSwaps: Array<{
    oldCharacterName: string;
    newCharacterName: string;
    timestamp: number;
  }>;
}

export interface TeamStats {
  finalHits: number;
  totalDamage: number;
  totalBlocked: number;
  totalHealing: number;
}

export interface MatchSnapshot {
  matchId: string | null;
  map: string | null;
  gameType: string | null;
  gameMode: string | null;
  outcome: MatchOutcome;

  players: Record<string, PlayerStats>;  // keyed by uid
  teamStats: Record<number, TeamStats>;  // keyed by team number

  timestamps: {
    matchStart: number | null;
    matchEnd: number | null;
  };
}

// Current match state, with per-round snapshots
export interface MatchStatsState extends MatchSnapshot {
  rounds: MatchSnapshot[]; // snapshots captured at round boundaries
}

export interface MatchStoreState {
  currentMatch: MatchStatsState;
  matchHistory: MatchStatsState[];
  clearMatchTimeout: number | null; // Stores timeout ID for delayed match clearing
  lastKillEvents?: Array<{
    attacker: string;
    victim: string;
    timestamp: number;
  }>;
}
