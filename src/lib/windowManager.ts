// Window Manager Service - Handles opening and closing windows based on settings
import { WINDOW_NAMES } from 'app/shared/constants';
import store from 'app/shared/store';
import { logger } from './log';

export interface WindowResource {
  windowName: string;
  settingsKey: string;
}

// Define the mapping between window names and their corresponding settings keys
const windowResources: WindowResource[] = [
  {
    windowName: WINDOW_NAMES.INGAME,
    settingsKey: 'enablePlayerStatsWindow'
  },
  {
    windowName: WINDOW_NAMES.FINALHITSBAR,
    settingsKey: 'enableFinalHitsWindow'
  },
  {
    windowName: WINDOW_NAMES.CHARSWAPBAR,
    settingsKey: 'enableCharSwapWindow'
  },
  {
    windowName: WINDOW_NAMES.DEVTOOLS,
    settingsKey: 'showDevWindow'
  }
];

/**
 * Updates window states (open/closed) based on the current app settings
 * @returns Promise that resolves when all window updates are complete
 */
export const updateWindowsBasedOnSettings = async (): Promise<void> => {
  try {
    const currentSettings = store.getState().appSettingsReducer.settings;
    
    // Process each window
    for (const windowResource of windowResources) {
      const { windowName, settingsKey } = windowResource;
      const isEnabled = currentSettings[settingsKey as keyof typeof currentSettings] as boolean;
      
      logger.logInfo(
        {
          event: 'window_resource_update',
          window: windowName,
          setting: settingsKey,
          enabled: isEnabled
        },
        'windowManager.ts',
        'updateWindowsBasedOnSettings'
      );
      
      if (isEnabled) {
        await openWindowIfNeeded(windowName);
      } else {
        await closeWindowIfOpen(windowName);
      }
    }
  } catch (error: any) {
    logger.logError(
      error,
      'windowManager.ts',
      'updateWindowsBasedOnSettings'
    );
  }
};

/**
 * Opens a window if it's not already open
 * @param windowName The name of the window to open
 */
export const openWindowIfNeeded = async (windowName: string): Promise<void> => {
  try {
    const windowResult = await new Promise<overwolf.windows.WindowInfo>((resolve) => {
      overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
        if (!result.success) {
          throw new Error(`Failed to obtain window ${windowName}: ${result.error}`);
        }
        resolve(result.window);
      });
    });
    
    // Check if window is already open/visible
    if (!windowResult.isVisible) {
      await new Promise<void>((resolve) => {
        overwolf.windows.restore(windowResult.id, (result: any) => {
          if (!result.success) {
            logger.logError(
              result,
              'windowManager.ts',
              `openWindowIfNeeded - restore ${windowName}`
            );
          }
          overwolf.windows.bringToFront(windowName,(result: any) => {
            if (!result.success) {
              logger.logError(
                result,
                'windowManager.ts',
                `openWindowIfNeeded - bringToFront ${windowName}`
              );
            }
          });
          resolve();
        });
      });
    }
  } catch (error: any) {
    logger.logError(
      error,
      'windowManager.ts',
      `openWindowIfNeeded - ${windowName}`
    );
  }
};

/**
 * Closes a window if it's open
 * @param windowName The name of the window to close
 */
export const closeWindowIfOpen = async (windowName: string): Promise<void> => {
  try {
    const windowResult = await new Promise<overwolf.windows.WindowInfo>((resolve) => {
      overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
        if (!result.success) {
          throw new Error(`Failed to obtain window ${windowName}: ${result.error}`);
        }
        resolve(result.window);
      });
    });
    
    // Only close the window if it's visible
    if (windowResult.isVisible) {
      await new Promise<void>((resolve) => {
        overwolf.windows.close(windowResult.id, (result: any) => {
          if (!result.success) {
            logger.logError(
              result,
              'windowManager.ts',
              `closeWindowIfOpen - close ${windowName}`
            );
          }
          resolve();
        });
      });
    }
  } catch (error: any) {
    logger.logError(
      error,
      'windowManager.ts',
      `closeWindowIfOpen - ${windowName}`
    );
  }
};

export default {
  updateWindowsBasedOnSettings,
  openWindowIfNeeded,
  closeWindowIfOpen
};



