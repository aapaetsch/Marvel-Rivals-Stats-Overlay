import { CharacterName, approximateName } from './characterIcons';

// /c:/Users/aapae/Documents/Overwolf Projects/rivalsreactoverlay/src/lib/characterClassIcons.ts

// export type CharacterClass = 'Vanguard' | 'Dualist' | 'Strategist';

export enum CharacterClass {
  VANGUARD = 'Vanguard',
  DUALIST = 'Dualist',
  STRATEGIST = 'Strategist',
}

export const CLASS_ICONS: Record<
  CharacterClass,
  { name: CharacterClass; file: string }
> = {
  Vanguard: {
    name: CharacterClass.VANGUARD,
    file: '/heroheadshots/regular/Vanguard_Icon.png',
  },
  Dualist: {
    name: CharacterClass.DUALIST,
    file: '/heroheadshots/regular/Dualist_Icon.png',
  },
  Strategist: {
    name: CharacterClass.STRATEGIST,
    file: '/heroheadshots/regular/Strategist_Icon.png',
  },
};

function normalizeKey(input: unknown): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

// Hardcoded mapping from CharacterName -> CharacterClass based on provided lists.
export const CHARACTER_CLASS_RECORD: Record<CharacterName, CharacterClass> = {
  // Dualists
  [CharacterName.WINTER_SOLDIER]: CharacterClass.DUALIST,
  [CharacterName.WOLVERINE]: CharacterClass.DUALIST,
  [CharacterName.BLADE]: CharacterClass.DUALIST,
  [CharacterName.PHOENIX]: CharacterClass.DUALIST,
  [CharacterName.SCARLET_WITCH]: CharacterClass.DUALIST,
  [CharacterName.SPIDER_MAN]: CharacterClass.DUALIST,
  [CharacterName.SQUIRREL_GIRL]: CharacterClass.DUALIST,
  [CharacterName.STAR_LORD]: CharacterClass.DUALIST,
  [CharacterName.STORM]: CharacterClass.DUALIST,
  [CharacterName.HAWKEYE]: CharacterClass.DUALIST,
  [CharacterName.HELA]: CharacterClass.DUALIST,
  [CharacterName.THE_PUNISHER]: CharacterClass.DUALIST,
  [CharacterName.PSYLOCKE]: CharacterClass.DUALIST,
  [CharacterName.MISTER_FANTASTIC]: CharacterClass.DUALIST,
  [CharacterName.MOON_KNIGHT]: CharacterClass.DUALIST,
  [CharacterName.NAMOR]: CharacterClass.DUALIST,  
  [CharacterName.MAGIK]: CharacterClass.DUALIST,
  [CharacterName.HUMAN_TORCH]: CharacterClass.DUALIST,
  [CharacterName.BLACK_PANTHER]: CharacterClass.DUALIST,
  [CharacterName.BLACK_WIDOW]: CharacterClass.DUALIST,
  [CharacterName.IRON_FIST]: CharacterClass.DUALIST,
  [CharacterName.IRON_MAN]: CharacterClass.DUALIST,
  [CharacterName.DUELIST]: CharacterClass.DUALIST,
  // Vanguards
  [CharacterName.THE_THING]: CharacterClass.VANGUARD,
  [CharacterName.THOR]: CharacterClass.VANGUARD,
  [CharacterName.VENOM]: CharacterClass.VANGUARD,
  [CharacterName.PENI_PARKER]: CharacterClass.VANGUARD,
  [CharacterName.MAGNETO]: CharacterClass.VANGUARD,
  [CharacterName.HULK]: CharacterClass.VANGUARD,
  [CharacterName.DOCTOR_STRANGE]: CharacterClass.VANGUARD,
  [CharacterName.EMMA_FROST]: CharacterClass.VANGUARD,
  [CharacterName.GROOT]: CharacterClass.VANGUARD,
  [CharacterName.BRUCE_BANNER]: CharacterClass.VANGUARD,
  [CharacterName.CAPTAIN_AMERICA]: CharacterClass.VANGUARD,

  // Strategists (support)
  [CharacterName.ADAM_WARLOCK]: CharacterClass.STRATEGIST,
  [CharacterName.JEFF_THE_LAND_SHARK]: CharacterClass.STRATEGIST,
  [CharacterName.LOKI]: CharacterClass.STRATEGIST,
  [CharacterName.ULTRON]: CharacterClass.STRATEGIST,
  [CharacterName.ROCKET_RACCOON]: CharacterClass.STRATEGIST,
  [CharacterName.MANTIS]: CharacterClass.STRATEGIST,
  [CharacterName.LUNA_SNOW]: CharacterClass.STRATEGIST,
  [CharacterName.CLOAK_AND_DAGGER]: CharacterClass.STRATEGIST,
  [CharacterName.INVISIBLE_WOMAN]: CharacterClass.STRATEGIST,
};

// internal, normalized map from character-name-string -> CharacterClass
const characterToClass = new Map<string, CharacterClass>();
for (const [k, v] of Object.entries(CHARACTER_CLASS_RECORD)) {
  characterToClass.set(normalizeKey(k), v);
}

/**
 * Return the image path for a class.
 */
export function getClassImagePath(cls: CharacterClass): string {
  return CLASS_ICONS[cls].file;
}

/**
 * Given a CharacterName or an arbitrary string, return the CharacterClass (if registered).
 * If a string is provided, approximateName(...) will be used first to try to resolve to a canonical name.
 */
export function getCharacterClass(
  character: CharacterName | string
): CharacterClass | undefined {
  const resolved =
    typeof character === 'string' ? approximateName(character) ?? character : character;
  return characterToClass.get(normalizeKey(resolved));
}

/**
 * Given a CharacterName or string, return the class image path (if the character is registered).
 */
export function getCharacterClassImagePath(
  character: CharacterName | string
): string | undefined {
  const cls = getCharacterClass(character);
  return cls ? getClassImagePath(cls) : undefined;
}