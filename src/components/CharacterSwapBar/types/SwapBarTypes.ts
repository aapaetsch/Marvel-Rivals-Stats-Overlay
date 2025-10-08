export interface SwapBarCharacterProps {
  name: string;
  charName: string;
  avatarURLStr: string | null;
  avatarSize?: number | null;
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
  mapImageUrl?: string | null;
  // optional row height to render each swap row at (px)
  rowHeight?: number | null;
}

export interface SwapBarContainerProps {
  children: React.ReactNode;
  mapImageUrl?: string | null;
  isHidden?: boolean;
  className?: string;
  // Optional explicit height (px) to enforce for the container when you need to cap size
  contentHeight?: number | null;
}

export interface SwapBarPlayerRowProps {
  character: SwapBarPlayerProps;
  localPlayerTeam: number;
  allySwapColor: string;
  enemySwapColor: string;
  // optional per-row height (px)
  rowHeight?: number | null;
}

export interface SwapBarMatchInfoProps {
  matchInfo: MatchInfo;
  show: boolean;
  mapImageUrl?: string | null;
}