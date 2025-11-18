import React, { useState, useEffect } from 'react';
import { Tabs, Form, FormInstance, Alert, Typography, Badge } from 'antd';
// ... existing imports ...
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/shared/store';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import { WINDOW_NAMES } from 'app/shared/constants';
import { logger } from '../../../../../src/lib/log';
import { openWindowIfNeeded } from '../../../../../src/lib/windowManager';
import { icons } from '../../../../../src/components/Icons';
import '../styles/Settings.css';
import '../styles/ModernTabbedSettings.css';

// Import existing tab components
import { ModernGeneralSettingsComponent } from './ModernGeneralSettings';
import RecentPlayersSettings from './RecentPlayersSettings';
import PlayerStatsTab from './PlayerStatsTab';
import PlayerSwapTab from './PlayerSwapTab';
import FinalHitsTab from './FinalHitsTab';

const { TabPane } = Tabs;
const { Title } = Typography;

interface ModernTabbedSettingsProps {
  form?: FormInstance<any>;
}

/**
 * Modern tabbed settings screen with cleaner layout and better organization
 */
const ModernTabbedSettings: React.FC<ModernTabbedSettingsProps> = ({ form: parentForm }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  const [localForm] = Form.useForm();
  const form = parentForm || localForm;
  
  // State for overlay position editing mode
  const [positioningModeOverlay, setPositioningModeOverlay] = useState<string | null>(null);
  
  // Set the form values from Redux when component mounts
  useEffect(() => {
    form.setFieldsValue({
      ...appSettings,
    });
  }, [appSettings, form]);

  // Control settings page scrolling
  useEffect(() => {
    const mainElement = document.querySelector('.desktop__main');
    const scroller = document.querySelector('.desktop__main-scroller');
    if (mainElement) {
      mainElement.classList.add('has-settings');
    }
    if (scroller) {
      scroller.classList.add('has-settings');
    }
    return () => {
      if (mainElement) {
        mainElement.classList.remove('has-settings');
      }
      if (scroller) {
        scroller.classList.remove('has-settings');
      }
    };
  }, []);

  // Helper function to enable drag mode for a window
  const enableDragMode = async (windowName: string) => {
    try {
      // Ensure the window is visible/restored before attempting dragMove
      await openWindowIfNeeded(windowName);

      overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
        if (result.success) {
          overwolf.windows.dragMove(result.window.id, (dragResult) => {
            console.log(dragResult);
          });
        }
      });
    } catch (error) {
      const errToLog = error instanceof Error ? error : new Error(String(error));
      logger.logError(errToLog, 'ModernTabbedSettings.tsx', `enableDragMode - ${windowName}`);
    }
  };
  
  // Helper function to disable drag mode for a window
  const disableDragMode = (windowName: string) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        // There's no direct way to disable drag mode,
        // but we can restore the window which stops drag mode
        overwolf.windows.restore(windowName, (restoreResult: any) => {
          if (!restoreResult.success) {
            logger.logError(
              restoreResult,
              'windowManager.ts',
              `disableDragMode - restore ${windowName}`
            );
          } else {
            overwolf.windows.bringToFront(windowName,(result: any) => {
              if (!result.success) {
                logger.logError(
                  result,
                  'windowManager.ts',
                  `disableDragMode - bringToFront ${windowName}`
                );
              }
            });
          }
        });
      }
    });
  };

  // Handler for toggling positioning mode for a specific overlay
  const handleEditOverlayPositions = (enable: boolean, overlayWindowName?: string) => {
    const targetOverlay = overlayWindowName || null;
    
    // Update local component state to track which overlay is being positioned
    setPositioningModeOverlay(enable ? targetOverlay : null);
    
    // Update the Redux store with the positioning mode state for each window
    const updatedPositioningModeWindows = {
      ...appSettings.positioningModeWindows || {}
    };
    
    if (enable && targetOverlay) {
      // Enable drag mode for the specific overlay window and update Redux
      updatedPositioningModeWindows[targetOverlay] = true;
      enableDragMode(targetOverlay);
    } else {
      // Disable drag mode for all windows and update Redux
      updatedPositioningModeWindows[WINDOW_NAMES.INGAME] = false;
      updatedPositioningModeWindows[WINDOW_NAMES.FINALHITSBAR] = false;
      updatedPositioningModeWindows[WINDOW_NAMES.CHARSWAPBAR] = false;
      
      // Disable actual drag mode in the windows
      disableDragMode(WINDOW_NAMES.INGAME);
      disableDragMode(WINDOW_NAMES.FINALHITSBAR);
      disableDragMode(WINDOW_NAMES.CHARSWAPBAR);
    }
    
    // Dispatch the updated positioning mode state to Redux
    dispatch(updateSettings({ positioningModeWindows: updatedPositioningModeWindows }));
  };

  // Handler for saving custom overlay positions
  const handleSaveOverlayPositions = async (overlayWindowName?: string) => {
    if (!overlayWindowName) return;

    // Determine the overlay key from the window name
    let overlayKey: 'playerStats' | 'finalHitsBar' | 'charSwapBar' | null = null;
    if (overlayWindowName === WINDOW_NAMES.INGAME) overlayKey = 'playerStats';
    else if (overlayWindowName === WINDOW_NAMES.FINALHITSBAR) overlayKey = 'finalHitsBar';
    else if (overlayWindowName === WINDOW_NAMES.CHARSWAPBAR) overlayKey = 'charSwapBar';

    if (!overlayKey) {
      console.error("Could not map window name to overlay key:", overlayWindowName);
      return;
    }

    try {
      // Get current window position for the specific overlay
      const position = await getWindowPosition(overlayWindowName);
      
      // Get the current full customPositions state from the form
      const currentFormPositions = form.getFieldValue('customPositions');

      // Update the _base position for the specific overlay
      const updatedCustomPositions = {
        ...currentFormPositions,
        [overlayKey]: {
          ...currentFormPositions[overlayKey],
          _base: { x: position.x, y: position.y },
        },
      };
      
      // Update the form state and dispatch the update
      form.setFieldsValue({ customPositions: updatedCustomPositions });
      dispatch(updateSettings({ customPositions: updatedCustomPositions }));
      
      // Disable positioning mode
      handleEditOverlayPositions(false);
      
      // Show success notification
      overwolf.notifications.showToastNotification({
        header: t("components.desktop.settings.positions-saved-title", "Positions Saved"),
        texts: [t("components.desktop.settings.positions-saved-message", "Your custom overlay positions have been saved.")],
        attribution: "Rivals Overlay"
      }, (result) => {
        if (!result.success) {
          console.error("Failed to show success notification:", result.error);
        }
      });
    } catch (error) {
      console.error("Error saving overlay positions:", error);
      // Show error notification
      overwolf.notifications.showToastNotification({
        header: t("components.desktop.settings.positions-error-title", "Error"),
        texts: [t("components.desktop.settings.positions-error-message", "Failed to save custom positions.")],
        attribution: "Rivals Overlay"
      }, (result) => {
        if (!result.success) {
          console.error("Failed to show error notification:", result.error);
        }
      });
    }
  };
  
  // Helper function to get a window's position
  const getWindowPosition = (windowName: string): Promise<{x: number, y: number}> => {
    return new Promise((resolve, reject) => {
      overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
        if (result.success) {
          resolve({
            x: result.window.left,
            y: result.window.top
          });
        } else {
          reject(new Error(`Window ${windowName} not found`));
        }
      });
    });
  };

  // Helper function to get window status
  const getWindowStatus = (windowKey: 'enablePlayerStatsWindow' | 'enableFinalHitsWindow' | 'enableCharSwapWindow') => {
    return appSettings[windowKey] !== false;
  };

  // Helper function to create tab with status indicator
  const createTabWithStatus = (tabText: string, windowKey: 'enablePlayerStatsWindow' | 'enableFinalHitsWindow' | 'enableCharSwapWindow') => {
    const isEnabled = getWindowStatus(windowKey);
    return (
      <span className="tab-with-status">
        {tabText}
        <span className={`status-indicator ${isEnabled ? 'status-enabled' : 'status-disabled'}`}>
          ●
        </span>
      </span>
    );
  };

  return (
    <div className="modern-tabbed-settings">
      {/* Global positioning mode notice */}
      {positioningModeOverlay !== null && (
        <div className="positioning-mode-notice">
          <Alert
            message={t("components.desktop.settings.positioning-mode-active", "Positioning Mode Active")}
            description={t("components.desktop.settings.positioning-mode-description", `Drag the ${positioningModeOverlay} overlay to position it. Click Save when finished.`)}
            type="info"
            showIcon
            closable
            onClose={() => handleEditOverlayPositions(false)}
          />
        </div>
      )}

      <div className="settings-header">
        <Title level={2} className="settings-title">
          <span className="settings-title-icon">{icons.settings}</span>
          {t("components.desktop.settings.settings-title", "Settings")}
        </Title>
      </div>

      <Tabs 
        defaultActiveKey="general" 
        className="modern-settings-tabs settings-tabs-sticky"
        size="large"
      >
        {/* General Settings Tab */}
        <TabPane 
          tab={t("components.desktop.settings.general-tab", "General")} 
          key="general"
        >
          <ModernGeneralSettingsComponent form={form} />
        </TabPane>

        {/* Recent Players Tab */}
        <TabPane 
          tab={t("components.desktop.settings.recent-players-tab", "Recent Players")} 
          key="recent-players"
        >
          <RecentPlayersSettings form={form} />
        </TabPane>

        {/* Player Stats Overlay Tab */}
        <TabPane 
          tab={createTabWithStatus(t("components.desktop.settings.player-stats-tab", "Player Stats Overlay"), 'enablePlayerStatsWindow')} 
          key="player-stats"
        >
          <PlayerStatsTab 
            form={form}
            onEditPositions={handleEditOverlayPositions}
            onSavePositions={handleSaveOverlayPositions}
          />
        </TabPane>

        {/* Player Swap Notification Tab */}
        <TabPane 
          tab={createTabWithStatus(t("components.desktop.settings.player-swap-tab", "Player Swap Notification"), 'enableCharSwapWindow')} 
          key="player-swap"
        >
          <PlayerSwapTab 
            form={form}
            onEditPositions={handleEditOverlayPositions}
            onSavePositions={handleSaveOverlayPositions}
          />
        </TabPane>

        {/* Final Hits Overlay Tab */}
        <TabPane 
          tab={createTabWithStatus(t("components.desktop.settings.final-hits-tab", "Final Hits Overlay"), 'enableFinalHitsWindow')} 
          key="final-hits"
        >
          <FinalHitsTab 
            form={form}
            onEditPositions={handleEditOverlayPositions}
            onSavePositions={handleSaveOverlayPositions}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ModernTabbedSettings;