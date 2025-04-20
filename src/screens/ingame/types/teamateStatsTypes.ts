export interface PlayerStatsProps {
  rosterId: string;
  playerName: string;
  characterName?: string;
  avatarUrl?: string;
  ultCharge?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  finalHits?: number;
  damageBlocked?: number;
  isTeammate?: boolean;
  isUser?: boolean;
}

export interface TeamStatProps {
  players: PlayerStatsProps[];
}

export interface PlayerStatsRowProps {
  label: string;
  value: number | string;
}