import React, { useState, useEffect, useMemo } from 'react';
import { AdContainer } from 'components/Ads';
import { useAdRemoval } from 'features/monetization';
import { useTranslation } from 'react-i18next';
import './styles/HouseAd.css';

// Development house ad component
const DevelopmentHouseAd: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { t } = useTranslation();
  
  // Get random character icons for background
  const [char1, char2] = useMemo(() => {
    const heroes = ['HULK', 'IRON MAN', 'THOR', 'BLACK PANTHER', 'CAPTAIN AMERICA', 'SPIDER-MAN'];
    return heroes.sort(() => 0.5 - Math.random()).slice(0, 2);
  }, []);

  return (
    <div 
      className="development-house-ad in-game"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background with character icons */}
      <div className="house-ad-background in-game">
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
        <div className="house-ad-overlay"></div>
      </div>
      
      {/* Ad content */}
      <div className="house-ad-content in-game">
        <div className="house-ad-title in-game">
          {t('components.ads.house.title', 'Rivals Pro')}
        </div>
        <div className="house-ad-subtitle in-game">
          {t('components.ads.house.subtitle', 'Track Your Stats')}
        </div>
      </div>
      
      {/* Dev indicator */}
      <div className="house-ad-dev-badge">
        {t('components.ads.house.dev', 'DEV')}
      </div>
    </div>
  );
};

export const GameAdContainer: React.FC = () => {
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
    <div className="game-ad-container">
      {!showHouseAd ? (
        <AdContainer
          containerId="rivalsOverlay_400x60_ingame_top"
          width={400}
          height={60}
          onAdLoaded={() => {
            console.log('In-game ad loaded');
            setAdAttempted(true);
            setShowHouseAd(false);
          }}
          onAdError={(err) => {
            console.log('In-game ad failed to load, showing house ad');
            setAdAttempted(true);
            setShowHouseAd(true);
          }}
        />
      ) : (
        <DevelopmentHouseAd width={400} height={60} />
      )}
    </div>
  );
};