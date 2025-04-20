export enum GameMaps {
  CENTRAL_PARK = 'Central Park',
  HALL_OF_DJALIA = 'Hall of Djalia',
  SYMBYOTIC_SURFACE = 'Symbiotic Surface',
  SHIN_SHIBUYA = 'Shin Shibuya',
  MIDTOWN = 'Midtown',
  SPIDER_ISLANDS = 'Spider Islands',
  YGGDRASILL_PATH = 'Yggdrasill Path',
  BIRNIN_TCHALLA = "Birnin T'Challa",
  HELLS_HEAVEN = 'Hell\'s Heaven',
  KRAKOA = 'Krakoa',
  ROYAL_PALACE = 'Royal Palace',
  NINOMARU = 'Ninomaru',
  SANCTUM_SANCTORUM = 'Sanctum Sanctorum',
  PRACTICE_RANGE = 'Practice Range',
}



/**
 * Returns the image name for the given game map or mode.
 * @param gameMap 
 * @param gameMode 
 * @returns 
 */
export const getGameMapImg = (gameMap: string | null = null, gameMode: string | null = null) => {
  if (gameMode === 'Doom Match') {
    return 'Empire_of_Eternal_Night_-_Sanctum_Sanctorum_Map_Image.png';
  }
  if (gameMode === 'Conquest') {
    return 'Tokyo_2099_-_Spider-Islands_Map_Image.png';
  }
  switch(gameMap) {
    case GameMaps.CENTRAL_PARK:
      return 'Empire_of_Eternal_Night_-_Central_Park_High_Res.png';
    case GameMaps.HALL_OF_DJALIA:
      return 'Wakanda_-_Hall_of_Djalia_Map_Image.png';
    case GameMaps.SYMBYOTIC_SURFACE:
      return 'Klyntar_-_Symbiotic_Surface_Map_Image.png';
    case GameMaps.SHIN_SHIBUYA:
      return 'Tokyo_2099_-_Shin-Shibuya_Map_Image.png';
    case GameMaps.MIDTOWN:
      return 'Empire_of_Eternal_Night_-_Midtown_Map_Image.png';
    case GameMaps.SPIDER_ISLANDS:
      return 'Tokyo_2099_-_Spider-Islands_Map_Image.png';
    case GameMaps.YGGDRASILL_PATH:
      return 'Yggsgard_-_Yggdrasill_Path_Map_Image.png';
    case GameMaps.BIRNIN_TCHALLA:
      return 'Wakanda_-_Birnin_T%27Challa_and_Practice_Range_Map_Image.png';
    case GameMaps.HELLS_HEAVEN:
      return 'Hydra_Charteris_Base_-_Hell%27s_Heaven_Map_Image.png';
    case GameMaps.KRAKOA:
      return 'Krakoa_Hellfire_Gala.png';
    case GameMaps.ROYAL_PALACE:
      return 'Yggsgard_-_Royal_Palace_-_Throne_Room_Map_Image.png';
    case GameMaps.NINOMARU:
      return 'Tokyo_2099_-_Spider-Islands_Map_Image.png';
    case GameMaps.SANCTUM_SANCTORUM:
      return 'Empire_of_Eternal_Night_-_Sanctum_Sanctorum_Map_Image.png';
    case GameMaps.PRACTICE_RANGE:
      return 'Wakanda_-_Birnin_T%27Challa_and_Practice_Range_Map_Image.png';
    default:
      return 'HYDRA_Charteris_base_outside.png';
  }
};