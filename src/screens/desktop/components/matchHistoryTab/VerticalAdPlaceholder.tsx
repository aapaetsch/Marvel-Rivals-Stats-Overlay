import React, { useState, useEffect, useMemo } from 'react';
import { AdContainer } from 'components/Ads';
import { useAdRemoval } from 'features/monetization';
import { useTranslation } from 'react-i18next';
import '../styles/HouseAd.css';

interface VerticalAdPlaceholderProps {
  containerId: string;
}

// Development house ad component
const DevelopmentHouseAd: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { t } = useTranslation();
  
  // Get random character icons for background
  const [char1, char2, char3, char4, char5] = useMemo(() => {
    const heroes = ['HULK', 'IRON MAN', 'THOR', 'BLACK PANTHER', 'CAPTAIN AMERICA', 'SPIDER-MAN', 'BLACK WIDOW', 'DOCTOR STRANGE', 'HAWKEYE'];
    return heroes.sort(() => 0.5 - Math.random()).slice(0, 5);
  }, []);

  return (
    <div 
      className="development-house-ad vertical"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background with character icons */}
      <div className="house-ad-background vertical">
        <img 
          src={`/heroheadshots/regular/${char1.replace(/\s+/g, '_')}.png`} 
          alt={char1}
          className="house-ad-bg-icon house-ad-bg-icon-1"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <img 
          src={`/heroheadshots/regular/${char2.replace(/\s+/g, '_')}.png`} 
          alt={char2}
          className="house-ad-bg-icon house-ad-bg-icon-2"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <img 
          src={`/heroheadshots/regular/${char3.replace(/\s+/g, '_')}.png`} 
          alt={char3}
          className="house-ad-bg-icon house-ad-bg-icon-3"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <img 
          src={`/heroheadshots/regular/${char4.replace(/\s+/g, '_')}.png`} 
          alt={char4}
          className="house-ad-bg-icon house-ad-bg-icon-4"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <img 
          src={`/heroheadshots/regular/${char5.replace(/\s+/g, '_')}.png`} 
          alt={char5}
          className="house-ad-bg-icon house-ad-bg-icon-5"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="house-ad-overlay"></div>
      </div>
      
      {/* Ad content */}
      <div className="house-ad-content vertical">
        <div className="house-ad-title vertical">
          {t('components.ads.house.title', 'Rivals Stats Pro')}
        </div>
        <div className="house-ad-subtitle vertical">
          {t('components.ads.house.subtitle', 'Track Your Performance & Improve Your Game')}
        </div>
        <div className="house-ad-features">
          <div className="house-ad-feature">
            ✓ {t('components.ads.house.feature1', 'Real-time Match Analytics')}
          </div>
          <div className="house-ad-feature">
            ✓ {t('components.ads.house.feature2', 'Player Performance Tracking')}
          </div>
          <div className="house-ad-feature">
            ✓ {t('components.ads.house.feature3', 'Strategic Insights')}
          </div>
        </div>
        <button 
          className="house-ad-button vertical"
          onClick={() => overwolf.utils.openUrlInDefaultBrowser('https://overwolf.com/applications/rivals-stats-overlay')}
        >
          {t('components.ads.house.button', 'Learn More')}
        </button>
      </div>
      
      {/* Dev indicator */}
      <div className="house-ad-dev-badge">
        {t('components.ads.house.dev', 'DEV')}
      </div>
    </div>
  );
};

export const VerticalAdPlaceholder: React.FC<VerticalAdPlaceholderProps> = ({ 
  containerId 
}) => {
  const { isSubscribed } = useAdRemoval();
  const [showHouseAd, setShowHouseAd] = useState(false);
  const [adAttempted, setAdAttempted] = useState(false);

  useEffect(() => {
    // Set a timeout to show house ad if real ad doesn't load within 2 seconds
    const timeout = setTimeout(() => {
      if (!adAttempted) {
        setShowHouseAd(true);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [adAttempted]);

  if (isSubscribed) {
    return null; // Don't show ads for subscribed users
  }

  return (
    <div className="ad-container-vertical">
      {!showHouseAd ? (
        <AdContainer
          containerId={containerId}
          width={300}
          height={600}
          enableAutoSwitch={true}
          onAdLoaded={() => {
            console.log(`${containerId} ad loaded`);
            setAdAttempted(true);
            setShowHouseAd(false);
          }}
          onAdError={(err) => {
            console.log(`${containerId} ad failed to load, showing house ad`);
            setAdAttempted(true);
            setShowHouseAd(true);
          }}
        />
      ) : (
        <DevelopmentHouseAd width={300} height={600} />
      )}
    </div>
  );
};