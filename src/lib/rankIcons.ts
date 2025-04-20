export enum CompetitiveRank {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2,
  PLATINUM = 3,
  DIAMOND = 4,
  GRANDMASTER = 5,
  CELESTIAL = 6,
  ETERNITY = 7,
  ONEABOVEALL = 8,
}

const rankIconMap: Record<CompetitiveRank, string> = {
  [CompetitiveRank.BRONZE]: 'bronze.png',
  [CompetitiveRank.SILVER]: 'silver.png',
  [CompetitiveRank.GOLD]: 'gold.png',
  [CompetitiveRank.PLATINUM]: 'platinum.png',
  [CompetitiveRank.DIAMOND]: 'diamond.png',
  [CompetitiveRank.GRANDMASTER]: 'grandmaster.png',
  [CompetitiveRank.CELESTIAL]: 'celestial.png',
  [CompetitiveRank.ETERNITY]: 'eternity.png',
  [CompetitiveRank.ONEABOVEALL]: 'oneaboveall.png',
}