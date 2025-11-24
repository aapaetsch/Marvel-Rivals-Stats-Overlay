import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InHouseAd } from 'lib/inHouseAds';
import '../../screens/desktop/components/styles/HouseAd.css';

interface InHouseAdComponentProps {
  ad: InHouseAd;
  showDevBadge?: boolean;
}

/**
 * Displays an in-house advertisement with dynamic content
 */
export const InHouseAdComponent: React.FC<InHouseAdComponentProps> = ({ 
  ad, 
  showDevBadge = false 
}) => {
  const { t } = useTranslation();
  
  // Get random character icons for background
  const characterIcons = useMemo(() => {
    const heroes = ['HULK', 'IRON MAN', 'THOR', 'BLACK PANTHER', 'CAPTAIN AMERICA', 'SPIDER-MAN', 
                    'BLACK WIDOW', 'DOCTOR STRANGE', 'HAWKEYE'];
    const count = ad.type === 'horizontal' ? 3 : 5;
    return heroes.sort(() => 0.5 - Math.random()).slice(0, count);
  }, [ad.type]);

  const handleButtonClick = () => {
    if (ad.buttonUrl) {
      overwolf.utils.openUrlInDefaultBrowser(ad.buttonUrl);
    }
  };

  const adClassName = `development-house-ad ${ad.type === 'vertical' ? 'vertical' : ''}`;

  return (
    <div 
      className={adClassName}
      style={{ 
        width: `${ad.width}px`, 
        height: `${ad.height}px`,
        backgroundColor: ad.backgroundColor 
      }}
    >
      {/* Background with character icons */}
      <div className="house-ad-background">
        {characterIcons.map((char, index) => (
          <img 
            key={`${char}-${index}`}
            src={`/heroheadshots/regular/${char.replace(/\s+/g, '_')}.png`} 
            alt={char}
            className={`house-ad-bg-icon house-ad-bg-icon-${index + 1}`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ))}
        <div className="house-ad-overlay"></div>
      </div>
      
      {/* Ad content */}
      <div className={`house-ad-content ${ad.type === 'vertical' ? 'vertical' : ''}`}>
        <div className={`house-ad-title ${ad.type === 'vertical' ? 'vertical' : ''}`}>
          {ad.title}
        </div>
        <div className={`house-ad-subtitle ${ad.type === 'vertical' ? 'vertical' : ''}`}>
          {ad.subtitle}
        </div>
        {ad.buttonText && (
          <button 
            className="house-ad-button"
            onClick={handleButtonClick}
          >
            {ad.buttonText}
          </button>
        )}
      </div>
      
      {/* Dev indicator */}
      {showDevBadge && (
        <div className="house-ad-dev-badge">
          {t('components.ads.house.dev', 'DEV')}
        </div>
      )}
      
      {/* In-house ad indicator */}
      <div className="house-ad-type-badge">
        IN-HOUSE
      </div>
    </div>
  );
};
