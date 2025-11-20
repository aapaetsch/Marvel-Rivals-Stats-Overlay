import React, { useState, useEffect, useMemo } from 'react';
import { AdContainer } from 'components/Ads';
import { useAdRemoval } from 'features/monetization';
import { useTranslation } from 'react-i18next';
import './styles/HouseAd.css';

interface HorizontalAdPlaceholderProps {
  height?: number;
}

// Development house ad component
const DevelopmentHouseAd: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { t } = useTranslation();
  
  // Get random character icons for background
  const [char1, char2, char3] = useMemo(() => {
    const heroes = ['HULK', 'IRON MAN', 'THOR', 'BLACK PANTHER', 'CAPTAIN AMERICA', 'SPIDER-MAN'];
    return heroes.sort(() => 0.5 - Math.random()).slice(0, 3);
  }, []);

  return (
    <div 
      className="development-house-ad"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background with character icons */}
      <div className="house-ad-background">
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
        <div className="house-ad-overlay"></div>
      </div>
      
      {/* Ad content */}
      <div className="house-ad-content">
        <div className="house-ad-title">
          {t('components.ads.house.title', 'Rivals Stats Pro')}
        </div>
        <div className="house-ad-subtitle">
          {t('components.ads.house.subtitle', 'Track Your Performance & Improve Your Game')}
        </div>
        <button 
          className="house-ad-button"
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

export const HorizontalAdPlaceholder: React.FC<HorizontalAdPlaceholderProps> = ({ 
  height = 120 
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
    <div className="ad-container-horizontal">
      {!showHouseAd ? (
        <AdContainer
          containerId="rivalsOverlay_780x90_desktop_bottom"
          width={780}
          height={90}
          onAdLoaded={() => {
            console.log('Desktop horizontal ad loaded');
            setAdAttempted(true);
            setShowHouseAd(false);
          }}
          onAdError={(err) => {
            console.log('Desktop horizontal ad failed to load, showing house ad');
            setAdAttempted(true);
            setShowHouseAd(true);
          }}
        />
      ) : (
        <DevelopmentHouseAd width={780} height={90} />
      )}
    </div>
  );
};