import { ItemType } from 'antd/es/menu/interface';

export enum MenuKeys {
  HOME = 'Home',
  STATS = 'Stats-Sub',
  PLAYER_STATS = 'Stats-Player',
  SQUAD_STATS = 'Stats-Squad',
  MATCH = 'Match-Sub',
  LIVE_MATCH = 'Match-Live',
  CURRENT_MATCH = 'Match-Current',
  CURRENT_MATCH_CARDS = 'Match-Current-Cards',
  MATCH_HISTORY = 'Match-History',
  PLAYERS = 'Players-Sub',
  FAVORITES = 'Players-Favorites',
  RECENT = 'Players-Recent',
  MY_STATS = 'Players-MyStats',
  HEROS = 'Heros-Sub',
  HEROS_TIERLIST = 'Heros-Tierlist',
  SETTINGS = 'Settings',
  DEV_PLAYGROUND = 'Dev-Playground',
}

export type AntMenuItem = ItemType;
