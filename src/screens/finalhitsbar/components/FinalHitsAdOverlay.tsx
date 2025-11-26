import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AdContainer } from 'components/Ads';
import { useAdRemoval } from 'features/monetization';
import { RootReducer } from 'app/shared/rootReducer';
import './styles/FinalHitsAdOverlay.css';

interface FinalHitsAdOverlayProps {
  // Ad dimensions to match the final hits bar
  adWidth?: number;
  adHeight?: number;
}

export const FinalHitsAdOverlay: React.FC<FinalHitsAdOverlayProps> = ({ 
  adWidth = 288, 
  adHeight = 130 
}) => {
  const { isSubscribed } = useAdRemoval();
  const [showAd, setShowAd] = useState(true);
  const [hasGameplayStarted, setHasGameplayStarted] = useState(false);

  // Get match state from Redux
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Track match state changes
  const isMatchInProgress = currentMatch.timestamps.matchStart !== null && 
                          currentMatch.timestamps.matchEnd === null;

  // Track when there's actual gameplay activity (kills, deaths, etc.)
  const hasGameplayActivity = useMemo(() => {
    const players = Object.values(currentMatch.players);
    return players.some(player => 
      (player.kills || 0) > 0 || 
      (player.deaths || 0) > 0 ||
      (player.assists || 0) > 0 ||
      (player.finalHits || 0) > 0 ||
      Object.keys(player.killedPlayers || {}).length > 0
    );
  }, [currentMatch.players]);

  useEffect(() => {
    // When match first starts with gameplay activity, hide the ad
    if (isMatchInProgress && hasGameplayActivity && !hasGameplayStarted) {
      setHasGameplayStarted(true);
      setShowAd(false);
    }
    
    // When match ends, reset for next match and hide ad
    if (!isMatchInProgress) {
      setHasGameplayStarted(false);
      setShowAd(false);
    }
    
    // Show ad during pre-game phase of match (before gameplay starts)
    if (isMatchInProgress && !hasGameplayActivity) {
      setShowAd(true);
    }
  }, [isMatchInProgress, hasGameplayActivity, hasGameplayStarted]);

  // Don't show ads for subscribed users
  if (isSubscribed) {
    return null;
  }

  // Don't render if no match is in progress and ad should be hidden
  if (!showAd) {
    return null;
  }

  // Show a simple placeholder if real ads fail
  const handleAdError = () => {
    console.log('Final hits ad failed to load, showing placeholder');
  };

  return (
    <div className="final-hits-ad-overlay">
      <AdContainer
        key={`finalhits-ad-${currentMatch.timestamps.matchStart}`}
        containerId="rivalsOverlay_finalhits_top"
        width={adWidth}
        height={adHeight}
        enableAutoSwitch={false}
        onAdLoaded={() => {
          console.log('Final hits ad loaded');
        }}
        onAdError={handleAdError}
      />
    </div>
  );
};