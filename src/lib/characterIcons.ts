import { isDev } from "./utils";

/**
 * Enum of all character names in Marvel Rivals
 * Use this to reference characters throughout the app for consistency
 */
export enum CharacterName {
  ADAM_WARLOCK = "Adam Warlock",
  BLACK_PANTHER = "Black Panther",
  BLACK_WIDOW = "Black Widow",
  CAPTAIN_AMERICA = "Captain America",
  CLOAK_AND_DAGGER = "Cloak & Dagger",
  DOCTOR_STRANGE = "Doctor Strange",
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
  VANGUARD = "Vanguard",
  VENOM = "Venom",
  WINTER_SOLDIER = "Winter Soldier",
  WOLVERINE = "Wolverine"
}

// Maps character names to their icon file names
const characterIconMap: Record<string, string> = {
  [CharacterName.ADAM_WARLOCK]: "Adam_Warlock_Icon.png",
  [CharacterName.BLACK_PANTHER]: "Black_Panther_Icon.png",
  [CharacterName.BLACK_WIDOW]: "Black_Widow_Icon.png",
  [CharacterName.CAPTAIN_AMERICA]: "Captain_America_Icon.png",
  [CharacterName.CLOAK_AND_DAGGER]: "Cloak_%26_Dagger_Icon.png",
  [CharacterName.DOCTOR_STRANGE]: "Doctor_Strange_Icon.png",
  [CharacterName.GROOT]: "Groot_Icon.png",
  [CharacterName.HAWKEYE]: "Hawkeye_Icon.png",
  [CharacterName.HELA]: "Hela_Icon.png",
  [CharacterName.HULK]: "Hulk_Icon.png",
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
  [CharacterName.VANGUARD]: "Vanguard_Icon.png",
  [CharacterName.VENOM]: "Venom_Icon.png",
  [CharacterName.WINTER_SOLDIER]: "Winter_Soldier_Icon.png",
  [CharacterName.WOLVERINE]: "Wolverine_Icon.png",
};

/**
 * Gets the path to a character's headshot icon
 * @param characterName The character name to get the icon for (can be string or CharacterName enum value)
 * @returns The path to the character's icon or null if not found
 */
export function getCharacterIconPath(characterName: string | CharacterName | null | undefined): string | null {
  if (!characterName) return null;
  
  // Try exact match
  if (characterIconMap[characterName]) {
    return `/heroheadshots/regular/${characterIconMap[characterName]}`;
  }
  
  // Special case for Cloak & Dagger
  if (typeof characterName === 'string' && 
      (characterName.toLowerCase() === 'cloak & dagger' || 
       characterName.toLowerCase() === 'cloak and dagger')) {
    return `/heroheadshots/regular/${characterIconMap[CharacterName.CLOAK_AND_DAGGER]}`;
  }
  
  // Handle ALL CAPS character names from the game
  // Convert from "IRON MAN" to "Iron Man" format to match our enum
  if (typeof characterName === 'string') {
    const properCaseName = characterName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/ And /g, ' & '); // Special case for "Cloak & Dagger"
      
    // Look for this properly cased name in our map
    if (characterIconMap[properCaseName]) {
      return `/heroheadshots/regular/${characterIconMap[properCaseName]}`;
    }
  }
  
  // Try case-insensitive match or partial match
  const lowerCaseName = characterName.toLowerCase();
  for (const [key, value] of Object.entries(characterIconMap)) {
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