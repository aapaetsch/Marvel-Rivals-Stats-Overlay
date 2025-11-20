import React, { useEffect, useRef } from 'react';
import type { OwAd } from "@overwolf/types/owads";

type AdContainerProps = {
  containerId: string;
  width: number;
  height: number;
  adUnitId?: string;       // optional if you pass one
  onAdLoaded?: () => void;
  onAdError?: (err: any) => void;
};

export const AdContainer: React.FC<AdContainerProps> = ({
  containerId,
  width,
  height,
  adUnitId,
  onAdLoaded,
  onAdError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adInstanceRef = useRef<OwAd | null>(null);

  useEffect(() => {
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
  }, [containerId, width, height, adUnitId, onAdLoaded, onAdError]);

  return (
    <div
      id={containerId}
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px`, overflow: 'hidden' }}
    />
  );
};