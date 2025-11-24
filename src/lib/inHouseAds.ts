/**
 * In-House Ads Configuration
 * Define custom advertisements that can be displayed alongside Overwolf ads
 */

export interface InHouseAd {
  id: string;
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  type: 'horizontal' | 'vertical';
}

/**
 * Registry of all in-house advertisements
 */
export const IN_HOUSE_ADS: InHouseAd[] = [
  // Horizontal Ads (728x90, 780x90, 400x60)
  {
    id: 'house-horizontal-1',
    name: 'Rivals Pro - Horizontal',
    width: 780,
    height: 90,
    type: 'horizontal',
    title: 'Rivals Stats Pro',
    subtitle: 'Track Your Performance & Improve Your Game',
    buttonText: 'Learn More',
    buttonUrl: 'https://overwolf.com/applications/rivals-stats-overlay',
  },
  {
    id: 'house-horizontal-2',
    name: 'Join Community - Horizontal',
    width: 780,
    height: 90,
    type: 'horizontal',
    title: 'Join Our Community',
    subtitle: 'Get tips, strategies, and connect with other players',
    buttonText: 'Join Discord',
    buttonUrl: 'https://discord.gg/yourserver',
  },
  
  // Vertical Ads (300x600, 160x600)
  {
    id: 'house-vertical-1',
    name: 'Rivals Pro - Vertical',
    width: 300,
    height: 600,
    type: 'vertical',
    title: 'Rivals Stats Pro',
    subtitle: 'Elevate Your Game',
    buttonText: 'Learn More',
    buttonUrl: 'https://overwolf.com/applications/rivals-stats-overlay',
  },
  {
    id: 'house-vertical-2',
    name: 'Premium Features - Vertical',
    width: 300,
    height: 600,
    type: 'vertical',
    title: 'Go Premium',
    subtitle: 'Remove Ads & Get Exclusive Features',
    buttonText: 'Upgrade Now',
    buttonUrl: 'https://overwolf.com/applications/rivals-stats-overlay',
  },
];

/**
 * Get in-house ads that match specific dimensions
 */
export function getInHouseAdsBySize(width: number, height: number): InHouseAd[] {
  return IN_HOUSE_ADS.filter(ad => ad.width === width && ad.height === height);
}

/**
 * Get in-house ads by type
 */
export function getInHouseAdsByType(type: 'horizontal' | 'vertical'): InHouseAd[] {
  return IN_HOUSE_ADS.filter(ad => ad.type === type);
}

/**
 * Get a specific in-house ad by ID
 */
export function getInHouseAdById(id: string): InHouseAd | undefined {
  return IN_HOUSE_ADS.find(ad => ad.id === id);
}

/**
 * Get a random in-house ad for specific dimensions
 */
export function getRandomInHouseAd(width: number, height: number): InHouseAd | null {
  const matchingAds = getInHouseAdsBySize(width, height);
  if (matchingAds.length === 0) return null;
  return matchingAds[Math.floor(Math.random() * matchingAds.length)];
}
