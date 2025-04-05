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
  GiHealing,
  GiShieldBash,
  GiBackwardTime,
  GiBrokenHeart,
  GiChart,
  GiCheckboxTree,
  GiDarkSquad,
  GiGamepad,
  GiHomeGarage,
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

import YellowLightning from '../../screens/ingame/components/YellowLightning';

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
  
  // Misc
  lightning: React.ReactElement;
}

// Create the icons object with all icon components
export const icons: IconsCollection = {
  // Combat icons
  kill: <GiCrossedSwords />,
  death: <GiBrokenHeart />,
  assist: <FaHandshake />,
  finalHits: <GiBackstab />,
  damageDealt: <GiSwordman />,
  healing: <GiHealing />,
  damageBlocked: <GiShieldBash />,

  
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
  
  // Misc
  lightning: <YellowLightning />
};

// Default export
export default icons;