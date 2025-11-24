import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { OwAd } from "@overwolf/types/owads";
import { RootReducer } from 'app/shared/rootReducer';
import { getRandomInHouseAd, InHouseAd } from 'lib/inHouseAds';
import { InHouseAdComponent } from './InHouseAdComponent';
import { isDev } from 'lib/utils';

type AdContainerProps = {
  containerId: string;
  width: number;
  height: number;
  adUnitId?: string;
  onAdLoaded?: () => void;
  onAdError?: (err: any) => void;
  enableAutoSwitch?: boolean; // Enable switching between Overwolf and in-house ads
  inHouseAdOnly?: boolean; // Only show in-house ads (for dev/testing)
};

type AdType = 'overwolf' | 'in-house';

export const AdContainer: React.FC<AdContainerProps> = ({
  containerId,
  width,
  height,
  adUnitId,
  onAdLoaded,
  onAdError,
  enableAutoSwitch = false,
  inHouseAdOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adInstanceRef = useRef<OwAd | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentAdType, setCurrentAdType] = useState<AdType>('overwolf');
  const [currentInHouseAd, setCurrentInHouseAd] = useState<InHouseAd | null>(null);
  
  // Get ad auto-refresh settings from Redux
  const { enableAdAutoRefresh, adRefreshIntervalMinutes } = useSelector(
    (state: RootReducer) => state.appSettingsReducer.settings
  );

  // Set up auto-refresh timer
  useEffect(() => {
    if (!enableAdAutoRefresh || adRefreshIntervalMinutes <= 0) {
      return;
    }

    const intervalMs = adRefreshIntervalMinutes * 60 * 1000; // Convert minutes to milliseconds
    console.log(`Ad auto-refresh enabled: will refresh every ${adRefreshIntervalMinutes} minutes`);

    const intervalId = setInterval(() => {
      console.log(`Auto-refreshing ad container: ${containerId}`);
      
      // If auto-switch is enabled, alternate between ad types
      if (enableAutoSwitch && !inHouseAdOnly) {
        setCurrentAdType(prev => prev === 'overwolf' ? 'in-house' : 'overwolf');
      }
      
      setRefreshKey(prev => prev + 1);
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enableAdAutoRefresh, adRefreshIntervalMinutes, containerId, enableAutoSwitch, inHouseAdOnly]);

  // Initialize or update in-house ad when needed
  useEffect(() => {
    if (currentAdType === 'in-house' || inHouseAdOnly) {
      const randomAd = getRandomInHouseAd(width, height);
      if (randomAd) {
        setCurrentInHouseAd(randomAd);
        console.log(`Selected in-house ad: ${randomAd.name}`);
      }
    }
  }, [currentAdType, width, height, refreshKey, inHouseAdOnly]);

  // Determine if we should show in-house ad
  const shouldShowInHouseAd = inHouseAdOnly || currentAdType === 'in-house';

  useEffect(() => {
    // Skip Overwolf ad creation if we should show in-house ad
    if (shouldShowInHouseAd) {
      return;
    }

    if (!containerRef.current) {
      console.warn(`AdContainer: containerRef not set for id ${containerId}`);
      return;
    }

    // Check if the Overwolf Ads SDK is available
    if (!(window as any).OwAd) {
      console.error('Overwolf Ads SDK not available. Make sure the script is loaded.');
      onAdError && onAdError(new Error('Overwolf Ads SDK not available'));
      return;
    }

    // Clean up previous instance if it exists
    if (adInstanceRef.current) {
      adInstanceRef.current.shutdown();
      adInstanceRef.current = null;
    }

    // instantiate the ad
    try {
      adInstanceRef.current = new (window as any).OwAd(containerRef.current, {
        size: { width, height },
        adUnitId: adUnitId
      });
      
      if (adInstanceRef.current) {
        adInstanceRef.current.addEventListener('loaded', () => {
          onAdLoaded && onAdLoaded();
        });
        
        adInstanceRef.current.addEventListener('error', (err: any) => {
          onAdError && onAdError(err);
        });
      }
    } catch (error) {
      console.error('Error creating ad instance:', error);
      onAdError && onAdError(error);
    }

    // Cleanup function
    return () => {
      if (adInstanceRef.current) {
        adInstanceRef.current.shutdown();
        adInstanceRef.current = null;
      }
    };
  }, [containerId, width, height, adUnitId, onAdLoaded, onAdError, refreshKey, shouldShowInHouseAd]);

  // Render in-house ad if that's what we're showing
  if (shouldShowInHouseAd && currentInHouseAd) {
    return <InHouseAdComponent ad={currentInHouseAd} showDevBadge={isDev} />;
  }

  // Otherwise render Overwolf ad container
  return (
    <div
      id={containerId}
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px`, overflow: 'hidden' }}
    />
  );
};