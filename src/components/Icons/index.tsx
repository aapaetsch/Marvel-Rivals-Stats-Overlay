import React from 'react';
import { 
  // Game-related icons
  IoGameControllerOutline, 
  IoStatsChartOutline,
  IoHomeOutline 
} from 'react-icons/io5';

import {
  // Combat icons
  GiCrossedSwords,
  GiSwordman,
  GiKing,
  GiStarfighter,
  GiFloatingPlatforms,
  GiBackstab,
  GiDeadlyStrike,
  GiHealing,
  GiShieldBash,
  GiBackwardTime,
  GiBrokenHeart,
  GiChart,
  GiCheckboxTree,
  GiDarkSquad,
  GiGamepad,
  GiHomeGarage,
  GiInfo,
  GiCheckeredFlag,
  GiCrossMark,
  GiLaserWarning 
} from 'react-icons/gi';

import { 
  // User/player icons
  LiaUsersSolid, 
  LiaUserTagSolid, 
  LiaUserInjuredSolid, 
  LiaUserGraduateSolid 
} from 'react-icons/lia';

import { 
  // Misc icons
  MdOutlineWorkHistory 
} from 'react-icons/md';

import { 
  BsFillHeartbreakFill 
} from 'react-icons/bs';

import { 
  FaHandshake 
} from 'react-icons/fa';

import { 
  PiUserListBold 
} from 'react-icons/pi';

// Define an interface for the icons collection
export interface IconsCollection {
  // Combat
  kill: React.ReactElement;
  death: React.ReactElement;
  assist: React.ReactElement;
  finalHits: React.ReactElement;
  damageDealt: React.ReactElement;
  healing: React.ReactElement;
  damageBlocked: React.ReactElement;
  kd?: React.ReactElement;
  kda?: React.ReactElement;
  
  // Navigation icons
  home: React.ReactElement;
  stats: React.ReactElement;
  match: React.ReactElement;
  currentMatch: React.ReactElement;
  matchHistory: React.ReactElement;
  
  // Player icons
  players: React.ReactElement;
  player: React.ReactElement;
  squad: React.ReactElement;
  favorites: React.ReactElement;
  recent: React.ReactElement;
  
  // Character icons
  heros: React.ReactElement;
  heroTierlist: React.ReactElement;

  // Tag Icons
  successTag: React.ReactElement;
  infoTag: React.ReactElement;
  warningTag: React.ReactElement;
  errorTag: React.ReactElement;
}

// Small badge component similar to the ult% pill
const UltLikeBadge: React.FC<{ text: string; accent?: boolean }> = ({ text, accent }) => (
  <span className={`ult-like-badge${accent ? ' accent' : ''}`}>{text}</span>
);

// Create the icons object with all icon components
export const icons: IconsCollection = {
  // Combat icons
  kill: <GiCrossedSwords />,
  death: <GiBrokenHeart />,
  assist: <FaHandshake />,
  finalHits: <GiDeadlyStrike />,
  damageDealt: <GiSwordman />,
  healing: <GiHealing />,
  damageBlocked: <GiShieldBash />,
  kd: <UltLikeBadge text="KD" />,
  kda: <UltLikeBadge text="KDA" accent />,

  
  // Navigation icons
  home: <GiHomeGarage />,
  stats: <GiChart />,
  match: <GiCheckboxTree />,
  currentMatch: <GiGamepad />,
  matchHistory: <GiBackwardTime />,
  
  // Player icons
  players: <PiUserListBold />,
  player: <LiaUserGraduateSolid />,
  squad: <GiDarkSquad />,
  favorites: <LiaUserTagSolid />,
  recent: <LiaUserInjuredSolid />,
  
  // Character icons
  heros: <GiKing />,
  heroTierlist: <GiFloatingPlatforms />,

  // Tag Icons
  successTag: <GiCheckeredFlag />,
  infoTag: <GiInfo />,
  warningTag: <GiLaserWarning />,
  errorTag: <GiCrossMark />,
};

// Default export
export default icons;
