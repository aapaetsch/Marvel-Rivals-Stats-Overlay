import { WINDOW_NAMES } from "app/shared/constants";
import { isDev } from "./utils";
import { log } from "./log";

async function obtainDeclaredWindow(
  windowName: string,
): Promise<overwolf.windows.WindowInfo> {
  return new Promise((resolve, reject) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        resolve(result.window);
      } else {
        reject(result.error);
      }
    });
  });
}

async function getCurrentWindow() {
  if (isDev) {
    log(
      `Running in dev mode, returning ${WINDOW_NAMES.DESKTOP} window, you can change this in src/lib/overwolf-essentials.ts: getCurrent`,
      "src/lib/overwolf-essentials.ts",
      "getCurrentWindow",
    );
    return Promise.resolve(WINDOW_NAMES.DESKTOP);
  }
  return new Promise<string>((resolve, reject) => {
    overwolf.windows.getCurrentWindow((result) => {
      if (result.success) {
        resolve(result.window.name);
      } else {
        reject(result.error);
      }
    });
  });
}

function getMonitorsList(): Promise<overwolf.utils.Display[]> {
  return new Promise<overwolf.utils.Display[]>((resolve) => {
    overwolf.utils.getMonitorsList((result) => {
      resolve(result.displays);
    });
  });
}

/**
 * Gets the game window position and size
 */
function getGameWindowInfo(): Promise<overwolf.games.GetRunningGameInfoResult> {
  return new Promise((resolve) => {
    overwolf.games.getRunningGameInfo((result) => {
      resolve(result);
    });
  });
}

/**
 * Position a window relative to the game window with improved support for:
 * - Multi-display setups
 * - Different screen resolutions
 * - Windowed game mode
 * - Upscalers like DLSS
 * - High DPI displays
 * 
 * @param windowId The window ID to position
 * @param position The position within the game (e.g., 'center', 'topRight', 'left')
 * @param offsetX Optional X offset from the position
 * @param offsetY Optional Y offset from the position
 */
async function positionWindowRelativeToGame(
  windowId: string, 
  position: 'center' | 'topRight' | 'left' | 'topCenter',
  offsetX: number = 0,
  offsetY: number = 0
): Promise<void> {
  try {
    const gameInfo = await getGameWindowInfo();
    if (!gameInfo || !gameInfo.isRunning) {
      console.warn('Game is not running, cannot position window');
      return;
    }

    // Get all available monitors
    const displays = await getMonitorsList();
    
    // Get the device pixel ratio (DPI scaling factor)
    const dpiScale = window.devicePixelRatio || 1;
    
    // Get game window details
    const { 
      width: rawGameWidth, 
      height: rawGameHeight, 
      logicalWidth, 
      logicalHeight,
      monitorHandle
    } = gameInfo;
    
    // Access properties that might not be in the type definition but exist at runtime
    // @ts-ignore - These properties exist at runtime but aren't in TypeScript definitions
    const clientWidth = gameInfo.clientWidth;
    // @ts-ignore - These properties exist at runtime but aren't in TypeScript definitions
    const clientHeight = gameInfo.clientHeight;
    
    // Log all available size info for debugging
    console.log('Game window info:', {
      monitorHandle,
      rawGameWidth,
      rawGameHeight,
      logicalWidth,
      logicalHeight,
      clientWidth,
      clientHeight,
      dpiScale
    });
    
    // Determine which monitor the game is on
    const gameMonitor = displays.find(display => display.handle === monitorHandle) || displays[0];
    
    // Get game position
    // @ts-ignore - These properties exist at runtime but aren't in TypeScript definitions
    const gameX = Math.round(gameInfo?.windowX || 0);
    // @ts-ignore - These properties exist at runtime but aren't in TypeScript definitions
    const gameY = Math.round(gameInfo?.windowY || 0);
    
    // Use the most reliable width/height values available
    // Prioritize logical dimensions as they're more accurate for windowed mode
    const gameWidth = logicalWidth || clientWidth || rawGameWidth;
    const gameHeight = logicalHeight || clientHeight || rawGameHeight;
    
    // Detect windowed mode and upscaling
    // @ts-ignore - These properties exist at runtime but aren't in TypeScript definitions
    const inWindowedMode = gameInfo.windowMode === 'Window';
    const possibleUpscaling = rawGameWidth && logicalWidth && 
                          (Math.abs(rawGameWidth - logicalWidth) > 100);
    
    // Log detection results
    console.log('Window positioning parameters:', {
      gameX,
      gameY,
      gameWidth,
      gameHeight,
      inWindowedMode,
      possibleUpscaling,
      dpiScale
    });
    
    // For multi-monitor setups, verify the game position is within monitor bounds
    const isMultiMonitor = displays.length > 1;
    if (isMultiMonitor) {
      console.log('Multi-monitor setup detected with', displays.length, 'displays');
    }
    
    // Get overlay window size and calculate position
    return new Promise((resolve) => {
      overwolf.windows.getWindow(windowId, (windowResult) => {
        if (!windowResult.success) {
          console.error('Failed to get window info:', windowResult.error);
          resolve();
          return;
        }
        
        const windowWidth = windowResult.window.width;
        const windowHeight = windowResult.window.height;
        let left = 0;
        let top = 0;
        
        // Calculate position based on the requested position type
        // Apply DPI scaling to ensure accurate positioning
        switch (position) {
          case 'center':
            left = Math.round(gameX + (gameWidth / 2) - (windowWidth / 2) + offsetX);
            top = Math.round(gameY + (gameHeight / 2) - (windowHeight / 2) + offsetY);
            break;
            
          case 'topRight':
            left = Math.round(gameX + gameWidth - windowWidth - offsetX);
            top = Math.round(gameY + offsetY);
            break;
            
          case 'left':
            left = Math.round(gameX + offsetX);
            top = Math.round(gameY + (gameHeight / 2) - (windowHeight / 2) + offsetY);
            break;
            
          case 'topCenter':
            left = Math.round(gameX + (gameWidth / 2) - (windowWidth / 2) + offsetX);
            top = Math.round(gameY + offsetY);
            break;
        }
        
        // Ensure the window is not positioned outside any screen
        const allDisplaysWidth = displays.reduce((max, display) => 
          Math.max(max, display.x + display.width), 0);
        const allDisplaysHeight = displays.reduce((max, display) => 
          Math.max(max, display.y + display.height), 0);
          
        // Constrain to visible screen space
        left = Math.max(0, Math.min(left, allDisplaysWidth - windowWidth));
        top = Math.max(0, Math.min(top, allDisplaysHeight - windowHeight));
        
        // Apply the final position
        overwolf.windows.changePosition(windowId, left, top, (positionResult) => {
          if (positionResult.success) {
            console.log(`Window ${windowId} positioned at ${position}:`, { left, top, dpiScale });
          } else {
            console.error(`Failed to position window ${windowId}:`, positionResult.error);
          }
          resolve();
        });
      });
    });
  } catch (error) {
    console.error('Error positioning window:', error);
  }
}

export { obtainDeclaredWindow, getMonitorsList, getCurrentWindow, getGameWindowInfo, positionWindowRelativeToGame };
