
export interface SwapBarPlayerProps {
  name: string;
  oldCharacterName?: string | null;
  oldAvatarURL?: string | null;
  newCharacterName?: string | null;
  newAvatarURL?: string | null;
  uid?: string;
  team: number;
}

export interface SwapBarProps {
  characters?: SwapBarPlayerProps[];
  show: boolean;
  locationX?: number;
  locationY?: number;
}

export interface SwapBarCharProps {
  charName: string;
  avatarURLStr: string;
  name?: string;
}
