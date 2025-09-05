export interface PlayerCardData {
  uid: string;
  name: string;
  characterName: string;
  characterId: string;
  team: number;
  isLocal: boolean;
  isTeammate: boolean;
  
  // Core stats
  kills: number;
  deaths: number;
  assists: number;
  finalHits: number;
  
  // Damage stats
  damageDealt: number;
  damageBlocked: number;
  totalHeal: number;
  
  // Additional data
  killedPlayers: Record<string, number>;
  killedBy: Record<string, number>;
}

export interface TeamData {
  teamNumber: number;
  players: PlayerCardData[];
  isPlayerTeam: boolean;
}

export interface MatchCardState {
  flippedCards: Set<string>;
  playerData: PlayerCardData[];
  teamData: TeamData[];
  isLoading: boolean;
}

export interface CardFlipState {
  [cardId: string]: boolean;
}

export interface StatRowProps {
  label: string;
  value: string | number;
  className?: string;
}

export interface KDADisplayProps {
  kills: number;
  deaths: number;
  assists: number;
  finalHits?: number;
  compact?: boolean;
}

export interface PlayerStatsProps {
  player: PlayerCardData;
  showExtended?: boolean;
}
