// (no imports needed here)

/**
 * Enum of all character names in Marvel Rivals
 * Use this to reference characters throughout the app for consistency
 */
export enum CharacterName {
  ADAM_WARLOCK = "Adam Warlock",
  BLACK_PANTHER = "Black Panther",
  BLACK_WIDOW = "Black Widow",
  BRUCE_BANNER = "Bruce Banner",  
  CAPTAIN_AMERICA = "Captain America",
  CLOAK_AND_DAGGER = "Cloak & Dagger",
  DOCTOR_STRANGE = "Doctor Strange",
  EMMA_FROST = "Emma Frost",
  GROOT = "Groot",
  HAWKEYE = "Hawkeye",
  HELA = "Hela",
  HULK = "Hulk",
  HUMAN_TORCH = "Human Torch",
  INVISIBLE_WOMAN = "Invisible Woman",
  IRON_FIST = "Iron Fist",
  IRON_MAN = "Iron Man",
  JEFF_THE_LAND_SHARK = "Jeff the Land Shark",
  LOKI = "Loki",
  LUNA_SNOW = "Luna Snow",
  MAGIK = "Magik",
  MAGNETO = "Magneto",
  MANTIS = "Mantis",
  MISTER_FANTASTIC = "Mister Fantastic",
  MOON_KNIGHT = "Moon Knight",
  NAMOR = "Namor",
  PENI_PARKER = "Peni Parker",
  PSYLOCKE = "Psylocke",
  ROCKET_RACCOON = "Rocket Raccoon",
  SCARLET_WITCH = "Scarlet Witch",
  SPIDER_MAN = "Spider-Man",
  SQUIRREL_GIRL = "Squirrel Girl",
  STAR_LORD = "Star-Lord",
  STORM = "Storm",
  THE_PUNISHER = "The Punisher",
  THE_THING = "The Thing",
  THOR = "Thor",
  VENOM = "Venom",
  WINTER_SOLDIER = "Winter Soldier",
  WOLVERINE = "Wolverine",
  BLADE = "Blade",
  PHOENIX = "Phoenix",
  ULTRON = "Ultron",
  DUELIST = "Duelist"
};

// Maps character names to their icon file names
const characterIconMap: Record<CharacterName, string> = {
  [CharacterName.ADAM_WARLOCK]: "Adam_Warlock_Icon.png",
  [CharacterName.BLACK_PANTHER]: "Black_Panther_Icon.png",
  [CharacterName.BLACK_WIDOW]: "Black_Widow_Icon.png",
  [CharacterName.CAPTAIN_AMERICA]: "Captain_America_Icon.png",
  [CharacterName.CLOAK_AND_DAGGER]: "Cloak_and_Dagger_Icon.png",
  [CharacterName.DOCTOR_STRANGE]: "Doctor_Strange_Icon.png",
  [CharacterName.EMMA_FROST]: "Emma_Frost_Icon.png",
  [CharacterName.GROOT]: "Groot_Icon.png",
  [CharacterName.HAWKEYE]: "Hawkeye_Icon.png",
  [CharacterName.HELA]: "Hela_Icon.png",
  [CharacterName.HULK]: "Hulk_Icon.png",
  [CharacterName.BRUCE_BANNER]: "Hulk_Icon.png",
  [CharacterName.HUMAN_TORCH]: "Human_Torch_Icon.png",
  [CharacterName.INVISIBLE_WOMAN]: "Invisible_Woman_Icon.png",
  [CharacterName.IRON_FIST]: "Iron_Fist_Icon.png",
  [CharacterName.IRON_MAN]: "Iron_Man_Icon.png",
  [CharacterName.JEFF_THE_LAND_SHARK]: "Jeff_the_Land_Shark_Icon.png",
  [CharacterName.LOKI]: "Loki_Icon.png",
  [CharacterName.LUNA_SNOW]: "Luna_Snow_Icon.png",
  [CharacterName.MAGIK]: "Magik_Icon.png",
  [CharacterName.MAGNETO]: "Magneto_Icon.png",
  [CharacterName.MANTIS]: "Mantis_Icon.png",
  [CharacterName.MISTER_FANTASTIC]: "Mister_Fantastic_Icon.png",
  [CharacterName.MOON_KNIGHT]: "Moon_Knight_Icon.png",
  [CharacterName.NAMOR]: "Namor_Icon.png",
  [CharacterName.PENI_PARKER]: "Peni_Parker_Icon.png",
  [CharacterName.PSYLOCKE]: "Psylocke_Icon.png",
  [CharacterName.ROCKET_RACCOON]: "Rocket_Raccoon_Icon.png",
  [CharacterName.SCARLET_WITCH]: "Scarlet_Witch_Icon.png",
  [CharacterName.SPIDER_MAN]: "Spider-Man_Icon.png",
  [CharacterName.SQUIRREL_GIRL]: "Squirrel_Girl_Icon.png",
  [CharacterName.STAR_LORD]: "Star-Lord_Icon.png",
  [CharacterName.STORM]: "Storm_Icon.png",
  [CharacterName.THE_PUNISHER]: "The_Punisher_Icon.png",
  [CharacterName.THE_THING]: "The_Thing_Icon.png",
  [CharacterName.THOR]: "Thor_Icon.png",
  [CharacterName.VENOM]: "Venom_Icon.png",
  [CharacterName.WINTER_SOLDIER]: "Winter_Soldier_Icon.png",
  [CharacterName.WOLVERINE]: "Wolverine_Icon.png",
  [CharacterName.BLADE]: "Blade_DEFAULT_Table_Icon.png",
  [CharacterName.PHOENIX]: "Phoenix_DEFAULT_Table_Icon.png",
  [CharacterName.ULTRON]: "Ultron_DEFAULT_Table_Icon.png",
  [CharacterName.DUELIST]: "Duelist_Icon.png",
};

export const approximateName = (characterName: string): CharacterName => {
  const s = characterName.toLowerCase().replace(/_/g, ' ').trim();

  // Specific checks for multiword/overlapping names should come first
  if (/cloak|dagger/.test(s)) return CharacterName.CLOAK_AND_DAGGER;
  if (/captain.*america|captain america|captain$|america/.test(s)) return CharacterName.CAPTAIN_AMERICA;
  if (/iron.*fist|ironfist/.test(s)) return CharacterName.IRON_FIST;
  if (/iron.*man|ironman/.test(s) && !/fist/.test(s)) return CharacterName.IRON_MAN;
  if (/scarlet.*witch|scarletwitch/.test(s)) return CharacterName.SCARLET_WITCH;
  // Check that both tokens 'star' and 'lord' are present (handles '-', '_', spaces, etc.)
  if (s.includes('star') && s.includes('lord')) return CharacterName.STAR_LORD;
  if (/rocket.*raccoon|rocket raccoon|rocket/.test(s)) return CharacterName.ROCKET_RACCOON;
  if (/squirrel.*girl|squirrel girl|squirrel/.test(s)) return CharacterName.SQUIRREL_GIRL;

  // Single token checks
  if (/adam/.test(s)) return CharacterName.ADAM_WARLOCK;
  if (/black.*panther|panther/.test(s)) return CharacterName.BLACK_PANTHER;
  if (/widow/.test(s)) return CharacterName.BLACK_WIDOW;
  if (/strange/.test(s)) return CharacterName.DOCTOR_STRANGE;
  if (/emma|frost/.test(s)) return CharacterName.EMMA_FROST;
  if (/groot/.test(s)) return CharacterName.GROOT;
  if (/hawkeye/.test(s)) return CharacterName.HAWKEYE;
  if (/hela/.test(s)) return CharacterName.HELA;
  // Distinguish Bruce Banner from Hulk
  if (/bruce|banner/.test(s)) return CharacterName.BRUCE_BANNER;
  if (/^hulk$|(^|\s)hulk(\s|$)/.test(s)) return CharacterName.HULK;
  if (/human.*torch|humantorch|torch/.test(s)) return CharacterName.HUMAN_TORCH;
  if (/invisible.*woman|invisible woman|invisible|woman/.test(s)) return CharacterName.INVISIBLE_WOMAN;
  if (/jeff|land.*shark|land_shark/.test(s)) return CharacterName.JEFF_THE_LAND_SHARK;
  if (/loki/.test(s)) return CharacterName.LOKI;
  if (/luna.*snow|luna snow|luna/.test(s)) return CharacterName.LUNA_SNOW;
  if (/magik/.test(s)) return CharacterName.MAGIK;
  if (/magneto/.test(s)) return CharacterName.MAGNETO;
  if (/mantis/.test(s)) return CharacterName.MANTIS;
  if (/mister.*fantastic|mr.*fantastic|mister fantastic/.test(s)) return CharacterName.MISTER_FANTASTIC;
  if (/moon.*knight|moon knight/.test(s)) return CharacterName.MOON_KNIGHT;
  if (/namor/.test(s)) return CharacterName.NAMOR;
  if (/peni.*parker|peni parker|peni/.test(s)) return CharacterName.PENI_PARKER;
  if (/psylocke/.test(s)) return CharacterName.PSYLOCKE;
  if (/scarlet/.test(s)) return CharacterName.SCARLET_WITCH;
  if (/spider[-\s]?man|spiderman|spider/.test(s)) return CharacterName.SPIDER_MAN;
  if (/storm/.test(s)) return CharacterName.STORM;
  if (/punisher/.test(s)) return CharacterName.THE_PUNISHER;
  if (/the.*thing|the thing|thing/.test(s)) return CharacterName.THE_THING;
  if (/thor/.test(s)) return CharacterName.THOR;
  if (/venom/.test(s)) return CharacterName.VENOM;
  if (/winter.*soldier|winter soldier|solider/.test(s)) return CharacterName.WINTER_SOLDIER;
  if (/wolverine|logan/.test(s)) return CharacterName.WOLVERINE;
  if (/blade/.test(s)) return CharacterName.BLADE;
  if (/phoenix/.test(s)) return CharacterName.PHOENIX;
  if (/ultron/.test(s)) return CharacterName.ULTRON;
  return CharacterName.DUELIST;
};

// Build maps for DEFAULT and Lord images for every character in characterIconMap
// @ts-ignore
const characterDefaultIconMap: Record<CharacterName, string> = {};
// @ts-ignore
const characterLordIconMap: Record<CharacterName, string> = {};


const postfixDefault = '_DEFAULT_Table_Icon.png';
Object.entries(characterIconMap).forEach(([key, filename]) => {
  // derive a base name by removing known suffixes
  const base = filename
    .replace(/_?Icon\.png$/i, '')
    .replace(/_DEFAULT_Table_Icon\.png$/i, '');
  
  // default table icon
  characterDefaultIconMap[key as CharacterName] = `${base}${postfixDefault}`;

  // lord icon -- most follow `${base}_Lord.png`, but some use different patterns
  characterLordIconMap[key as CharacterName] = `${base}_Lord.png`;
});
characterDefaultIconMap[CharacterName.PHOENIX] = 'Phoenix_DEFAULT_Table_Icon.png';

// Special cases / overrides based on actual asset filenames
characterDefaultIconMap[CharacterName.CLOAK_AND_DAGGER] = 'Cloak_Dagger_DEFAULT_Table_Icon.png';
characterLordIconMap[CharacterName.CLOAK_AND_DAGGER] = 'Cloak%26Dagger_Lord.png';

// Bruce Banner's lord file includes a different suffix
characterLordIconMap[CharacterName.BRUCE_BANNER] = 'Bruce_Banner_Lord_Icon.png';
function getCharacterIconPathFromIconSet(characterName: CharacterName | string | null, iconSet: 'default' | 'lord' | 'white' = 'default'): string | null {
  if (!characterName) return null;
  const approxCharName = approximateName(characterName);
  let iconSetMap: Record<CharacterName, string>;
  switch (iconSet) {
    case 'default':
      iconSetMap = characterDefaultIconMap;
      break;
    case 'lord':
      iconSetMap = characterLordIconMap;
      break;
    case 'white':
      iconSetMap = characterIconMap; // assuming white icons are in the main map
      break;
    default:
      iconSetMap = characterDefaultIconMap;
      break;
  }

  if (!characterName) return null;
  if (approxCharName === CharacterName.DUELIST) {
    console.log(`No icon found for character: ${characterName}`);
    return null;
  }
  
  if (iconSetMap[approxCharName]) {
    return `/heroheadshots/regular/${characterDefaultIconMap[approximateName(characterName)]}`;
  }
  
  // Try exact match
  if (iconSetMap[characterName as CharacterName]) {
    return `/heroheadshots/regular/${iconSetMap[characterName as CharacterName]}`;
  }
  
  // Special case for Cloak & Dagger
  if (typeof characterName === 'string' && 
      (characterName.toLowerCase().includes('cloak') || 
       characterName.toLowerCase().includes('dagger'))) {
    return `/heroheadshots/regular/${iconSetMap[CharacterName.CLOAK_AND_DAGGER]}`;
  }
  
  // Handle ALL CAPS character names from the game
  // Convert from "IRON MAN" to "Iron Man" format to match our enum
  if (typeof characterName === 'string') {
    const properCaseName: CharacterName = characterName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/ And /g, ' & ') as CharacterName; // Special case for "Cloak & Dagger"
      
    // Look for this properly cased name in our map
    if (iconSetMap[properCaseName]) {
      return `/heroheadshots/regular/${iconSetMap[properCaseName]}`;
    }
  }
  
  // Try case-insensitive match or partial match
  const lowerCaseName = characterName.toLowerCase();
  for (const [key, value] of Object.entries(iconSetMap)) {
    if (key.toLowerCase() === lowerCaseName || 
        lowerCaseName.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(lowerCaseName)) {
      return `/heroheadshots/regular/${value}`;
    }
  }
  
  // If no match found, return null
  console.log(`No icon found for character: ${characterName}`);
  return null;



}
/**
 * Gets the path to a character's headshot icon
 * @param characterName The character name to get the icon for (can be string or CharacterName enum value)
 * @returns The path to the character's icon or null if not found
 */
export function getCharacterIconPath(characterName: string | CharacterName): string | null {
  return getCharacterIconPathFromIconSet(characterName, 'white');
}

/**
 * Gets the path to a character's DEFAULT table icon (not the Lord/alt art)
 * @param characterName The character name to get the default icon for
 * @returns The default icon path or null if not found
 */
export function getCharacterDefaultIconPath(characterName: string | CharacterName | null | undefined): string | null {
  return getCharacterIconPathFromIconSet(characterName ?? '', 'default');
}

/**
 * Gets the path to a character's Lord/alt art icon
 * @param characterName The character name to get the lord icon for
 * @returns The lord icon path or null if not found
 */
export function getCharacterLordIconPath(characterName: string | CharacterName | null | undefined): string | null {
  return getCharacterIconPathFromIconSet(characterName ?? '', 'lord');
}

/**
 * Gets an array of all character names in the game
 * @returns Array of all character names
 */
export function getAllCharacterNames(): CharacterName[] {
  return Object.values(CharacterName);
}

/**
 * Checks if a given string is a valid character name
 * @param name String to check
 * @returns True if the name matches a character in the game
 */
export function isValidCharacterName(name: string): boolean {
  return Object.values(CharacterName).includes(name as CharacterName);
}
