export enum MenuKeys {
  HOME = 'Home',
  STATS = 'Stats-Sub',
  PLAYER_STATS = 'Stats-Player',
  SQUAD_STATS = 'Stats-Squad',
  MATCH = 'Match-Sub',
  CURRENT_MATCH = 'Match-Current',
  CARD_VIEW = 'Match-CardView',
  MATCH_HISTORY = 'Match-History',
  PLAYERS = 'Players-Sub',
  FAVORITES = 'Players-Favorites',
  RECENT = 'Players-Recent',
  HEROS = 'Heros-Sub',
  HEROS_TIERLIST = 'Heros-Tierlist',
  SETTINGS = 'Settings',
  GENERAL_SETTINGS = 'Settings-General',
  OVERLAY_SETTINGS = 'Settings-Overlay',
}

export interface AntMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode | JSX.Element;
  children?: AntMenuItem[];
}