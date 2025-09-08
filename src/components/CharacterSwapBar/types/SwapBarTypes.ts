export interface SwapBarCharacterProps {
  name: string;
  charName: string;
  avatarURLStr: string | null;
}

export interface SwapBarPlayerProps {
  uid: string;
  name: string;
  oldCharacterName: string;
  newCharacterName: string;
  oldAvatarURL: string | null;
  newAvatarURL: string | null;
  team: number;
  swapTimestamp?: number;
}

export interface MatchInfo {
  map: string | null;
  gameType: string | null;
  gameMode: string | null;
}

export interface SwapBarProps {
  characters: SwapBarPlayerProps[];
  show: boolean;
  matchInfo?: MatchInfo;
  showMatchInfo: boolean;
}

export interface SwapBarContainerProps {
  children: React.ReactNode;
  mapImageUrl?: string | null;
  isHidden?: boolean;
  className?: string;
}

export interface SwapBarPlayerRowProps {
  character: SwapBarPlayerProps;
  localPlayerTeam: number;
  allySwapColor: string;
  enemySwapColor: string;
}

export interface SwapBarMatchInfoProps {
  matchInfo: MatchInfo;
  show: boolean;
}