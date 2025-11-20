import { useEffect } from 'react';
import { WINDOW_NAMES } from 'app/shared/constants';

export const useAdWindowManager = () => {
  useEffect(() => {
    // Listen for window state changes to pause/resume ads
    const handleWindowStateChanged = (state: any) => {
      if (state.window_name === WINDOW_NAMES.INGAME) {
        if (state.window_state === 'minimized') {
          // Ad instance should be shut down when window is minimized
          // This will be handled by the component's cleanup
        } else if (state.window_previous_state === 'minimized' && state.window_state === 'normal') {
          // Window is restored from minimized state
          // The ad should be automatically recreated when component remounts
        }
      }
    };

    // Add listener for window state changes
    overwolf.windows.onStateChanged.addListener(handleWindowStateChanged);

    // Cleanup listener when component unmounts
    return () => {
      overwolf.windows.onStateChanged.removeListener(handleWindowStateChanged);
    };
  }, []);
};