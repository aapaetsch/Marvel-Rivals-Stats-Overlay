import React, { useState, useEffect } from 'react';
import { Switch, Alert, Collapse, FormInstance } from 'antd'; 
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/shared/store';
import { updateSettings } from 'features/appSettings/appSettingsSlice'; 
import { WINDOW_NAMES } from 'app/shared/constants';
import PlayerStatsSettings from './PlayerStatsSettings';
import OverlayToggleSettings from './OverlayToggleSettings';
import OverlayPositionEditor from './OverlayPositionEditor'; // Import the new component
import PlayerStatsAppearanceSettings from './PlayerStatsAppearanceSettings'; // Import the new appearance component
import CardSettingsRowSlider from './CardSettingsRowSlider';
import CardSettingsRowColorPicker from './CardSettingsRowColorPicker';
import '../styles/Settings.css';
import CardSettingsRowToggle from './CardSettingsRowToggle';

const { Panel } = Collapse;

// Export the constant
export const defaultOverlayWindowPositions = {
  playerStats: {
    _base: { x: 10, y: 200 },
    Domination: { x: 10, y: 200 },
    Convoy: { x: 10, y: 200 },
    'Doom Match': { x: 10, y: 200 },
    Conquest: { x: 10, y: 200 },
  },
  finalHitsBar: {
    _base: { x: 2455, y: 20 },
    Domination: { x: 2455, y: 20 },
    Convoy: { x: 2455, y: 20 },
    'Doom Match': { x: 2455, y: 20 },
    Conquest: { x: 2455, y: 20 },
  },
  charSwapBar: {
    _base: { x: 1668, y: 330 },
    Domination: { x: 1668, y: 330 },
    Convoy: { x: 1668, y: 330 },
    'Doom Match': { x: 1668, y: 330 },
    Conquest: { x: 1668, y: 330 },
  }
};

// Define props interface to accept the form instance
interface OverlaySettingsComponentProps {
  form: FormInstance<any>;
  // Add props for reset handler if needed, or handle reset logic in parent
}

// Overlay Settings Component
const OverlaySettingsComponent: React.FC<OverlaySettingsComponentProps> = ({ form }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  // State for overlay position editing mode (now tracks which overlay is being edited)
  const [positioningModeOverlay, setPositioningModeOverlay] = useState<string | null>(null);
  
  useEffect(() => {
    // Use the passed-in form instance
    form.setFieldsValue({
      showTeamStats: appSettings.showTeamStats,
      showKillFeed: appSettings.showKillFeed,
      opacity: appSettings.opacity,
      position: appSettings.position,
      showPlayerStats: appSettings.showPlayerStats,
      playerStatsOpacity: appSettings.playerStatsOpacity,
      showOwnPlayerCard: appSettings.showOwnPlayerCard,
      compactOwnPlayerCard: appSettings.compactOwnPlayerCard,
      showTeammate1: appSettings.showTeammate1,
      compactTeammate1: appSettings.compactTeammate1,
      showTeammate2: appSettings.showTeammate2,
      compactTeammate2: appSettings.compactTeammate2,
      showTeammate3: appSettings.showTeammate3,
      compactTeammate3: appSettings.compactTeammate3,
      showTeammate4: appSettings.showTeammate4,
      compactTeammate4: appSettings.compactTeammate4,
      showTeammate5: appSettings.showTeammate5,
      compactTeammate5: appSettings.compactTeammate5,
      showPlayerSwapNotification: appSettings.showPlayerSwapNotification,
      playerSwapNotificationDuration: appSettings.playerSwapNotificationDuration,
      showFinalHitsOverlay: appSettings.showFinalHitsOverlay,
      finalHitsOpacity: appSettings.finalHitsOpacity,
      yourFinalHitsColor: appSettings.yourFinalHitsColor || '#1890FF',
      opponentFinalHitsColor: appSettings.opponentFinalHitsColor || '#FF4D4F',
      finalHitsBackgroundColor: appSettings.finalHitsBackgroundColor || '#000000',
      // Ensure customPositions includes game modes, merging with defaults if necessary
      customPositions: deepMergePositions(defaultOverlayWindowPositions, appSettings.customPositions || {}),
    });
  }, [appSettings, form]); // Add form to dependency array

  // Helper function for deep merging position objects
  const deepMergePositions = (defaults: any, current: any): any => {
    const merged = { ...defaults };
    for (const overlayKey in defaults) {
      if (current[overlayKey]) {
        merged[overlayKey] = { ...defaults[overlayKey], ...current[overlayKey] };
        // Ensure _base and all game modes exist
        merged[overlayKey]._base = current[overlayKey]._base || defaults[overlayKey]._base;
        for (const mode in defaults[overlayKey]) {
          if (mode !== '_base') {
             merged[overlayKey][mode] = current[overlayKey][mode] || defaults[overlayKey][mode];
          }
        }
      } else {
        merged[overlayKey] = { ...defaults[overlayKey] };
      }
    }
    return merged;
  };

  // Handler for toggling positioning mode for a specific overlay
  const handleEditOverlayPositions = (enable: boolean, overlayWindowName?: string) => {
    const targetOverlay = overlayWindowName || null;
    setPositioningModeOverlay(enable ? targetOverlay : null);
    
    if (enable && targetOverlay) {
      // Enable drag mode for the specific overlay window
      enableDragMode(targetOverlay);
    } else {
      disableDragMode(WINDOW_NAMES.INGAME);
      disableDragMode(WINDOW_NAMES.FINALHITSBAR);
      disableDragMode(WINDOW_NAMES.CHARSWAPBAR);
    }
  };

  // Handler for saving custom overlay positions (now saves the base position)
  const handleSaveOverlayPositions = async (overlayWindowName?: string) => {
    if (!overlayWindowName) return; // Should have the window name

    // Determine the overlay key ('playerStats', 'finalHitsBar', 'charSwapBar') from the window name
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
      const currentFormPositions = form.getFieldValue('customPositions'); // Use passed-in form

      // Update the _base position for the specific overlay
      const updatedCustomPositions = {
        ...currentFormPositions,
        [overlayKey]: {
          ...currentFormPositions[overlayKey],
          _base: { x: position.x, y: position.y },
        },
      };
      
      // Update the form state and dispatch the update
      form.setFieldsValue({ customPositions: updatedCustomPositions }); // Use passed-in form
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
  
  // Helper function to enable drag mode for a window
  const enableDragMode = (windowName: string) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        overwolf.windows.dragMove(result.window.id, (dragResult) => {
          console.log(dragResult);
        });
      }
    });
  };
  
  // Helper function to disable drag mode for a window
  const disableDragMode = (windowName: string) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        // There's no direct way to disable drag mode,
        // but we can restore the window which stops drag mode
        overwolf.windows.restore(result.window.id);
      }
    });
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
  
  return (
    <div className="settings-content-scrollable"> {/* Keep scrollable container */} 
      <Collapse 
        defaultActiveKey={['1']}
        accordion
        className="settings-collapse"
        ghost // Added ghost prop for cleaner look
      >
        {/* Panel 1: Overlay Visibility & Positioning */}
        <Collapse.Panel 
          header={t("components.desktop.settings.overlay-visibility", "Overlay Visibility & Positioning")} 
          key="1"
          className="settings-panel"
        >
          <OverlayToggleSettings 
            form={form} // Pass down the form instance
            isPositioningMode={positioningModeOverlay !== null} 
            onEditPositions={handleEditOverlayPositions}
            onSavePositions={handleSaveOverlayPositions}
          />
          
          {positioningModeOverlay !== null && ( 
            <div className="positioning-mode-notice">
              <Alert
                message={t("components.desktop.settings.positioning-mode-active", "Positioning Mode Active")}
                description={t("components.desktop.settings.positioning-mode-description", `Drag the ${positioningModeOverlay} overlay to position it. Click Save when finished.`)}
                type="info"
                showIcon
              />
            </div>
          )}
        </Collapse.Panel>
        
        {/* Panel 2: Player Stats Overlay */}
        <Collapse.Panel 
          header={t("components.desktop.settings.player-stats-overlay", "Player Stats Overlay")} 
          key="2"
          className={`settings-panel ${!appSettings.showTeamStats ? 'disabled-panel' : ''}`}
          collapsible={!appSettings.showTeamStats ? "disabled" : undefined}
        >
          <div className="settings-columns">
            <div className="settings-column">
              <PlayerStatsAppearanceSettings form={form} /> {/* Pass down form */} 
            </div>
            <div className="settings-column">
              <OverlayPositionEditor 
                overlayKey="playerStats" 
                form={form} // Pass down form
                isPositioningMode={positioningModeOverlay === WINDOW_NAMES.INGAME}
                onEditPositions={handleEditOverlayPositions}
                onSavePositions={handleSaveOverlayPositions}
              />
            </div>
          </div>
          <PlayerStatsSettings form={form} /> {/* Pass down form */} 
        </Collapse.Panel>
        
        {/* Panel 3: Player Swap Notification */}
        <Collapse.Panel 
          header={t("components.desktop.settings.player-swap", "Player Swap Notification")} 
          key="3"
          className={`settings-panel ${!appSettings.showPlayerSwapNotification ? 'disabled-panel' : ''}`}
          collapsible={!appSettings.showPlayerSwapNotification ? "disabled" : undefined}
        > 
          <div className="settings-columns">
            <div className="settings-column">
              <div className="settings-column-title">
                {t("components.desktop.settings.appearance", "Appearance Settings")}
              </div>
              <CardSettingsRowSlider
                label={t("components.desktop.settings.player-swap-duration", "Notification Duration (seconds)")}
                formName="playerSwapNotificationDuration"
                min={1}
                max={10}
                marks={{ 1: '1s', 5: '5s', 10: '10s' }}
                stackedLabel={true}
              />
              <CardSettingsRowColorPicker
                label={t("components.desktop.settings.ally-swap-color", "Ally Swap Color")}
                formName="allySwapColor"
                tooltip={t("components.desktop.settings.ally-swap-color-tooltip", "Highlight color when an ally swaps character")}
                initialValue="#1890FF"
              />
              <CardSettingsRowColorPicker
                label={t("components.desktop.settings.enemy-swap-color", "Enemy Swap Color")}
                formName="enemySwapColor"
                tooltip={t("components.desktop.settings.enemy-swap-color-tooltip", "Highlight color when an enemy swaps character")}
                initialValue="#FF4D4F"
              />
              <CardSettingsRowColorPicker
                label={t("components.desktop.settings.swap-screen-background-color", "Background Color")}
                formName="swapScreenBackgroundColor"
                tooltip={t("components.desktop.settings.swap-screen-background-tooltip", "Background color for the character swap notification")}
                initialValue="#000000"
              />
            </div>
            <div className="settings-column">
              <OverlayPositionEditor 
                overlayKey="charSwapBar" 
                form={form} // Pass down form
                isPositioningMode={positioningModeOverlay === WINDOW_NAMES.CHARSWAPBAR}
                onEditPositions={handleEditOverlayPositions}
                onSavePositions={handleSaveOverlayPositions}
              />
            </div>
          </div>
        </Collapse.Panel>
        {/* Panel 4: Final Hits Overlay */}
        <Collapse.Panel 
          header={t("components.desktop.settings.final-hits", "Final Hits Overlay")} 
          key="4"
          className={`settings-panel ${!appSettings.showFinalHitsOverlay ? 'disabled-panel' : ''}`}
          collapsible={!appSettings.showFinalHitsOverlay ? "disabled" : undefined}
        >
          <div className="settings-columns">
            <div className="settings-column">
              <div className="settings-column-title">
                {t("components.desktop.settings.appearance", "Appearance Settings")}
              </div>
              <CardSettingsRowSlider
                label={t("components.desktop.settings.final-hits-opacity", "Final Hits Opacity")}
                formName="finalHitsOpacity"
                min={20}
                max={100}
                marks={{ 20: '20%', 50: '50%', 80: '80%', 100: '100%' }}
                stackedLabel={true}
              />
              <CardSettingsRowColorPicker
                label={t("components.desktop.settings.your-final-hits-color", "Your Final Hits Color")}
                formName="yourFinalHitsColor"
                tooltip={t("components.desktop.settings.your-final-hits-color-tooltip", "Color for your final hits in the display")}
                initialValue="#1890FF"
              />
              <CardSettingsRowColorPicker
                label={t("components.desktop.settings.opponent-final-hits-color", "Opponent Final Hits Color")}
                formName="opponentFinalHitsColor"
                tooltip={t("components.desktop.settings.opponent-final-hits-color-tooltip", "Color for opponent final hits in the display")}
                initialValue="#FF4D4F"
              />
              <CardSettingsRowColorPicker
                label={t("components.desktop.settings.final-hits-background-color", "Background Color")}
                formName="finalHitsBackgroundColor"
                tooltip={t("components.desktop.settings.final-hits-background-color-tooltip", "Background color for the final hits display")}
                initialValue="#000000"
              />
            </div>
            <div className="settings-column">
              <OverlayPositionEditor 
                overlayKey="finalHitsBar" 
                form={form} // Pass down form
                isPositioningMode={positioningModeOverlay === WINDOW_NAMES.FINALHITSBAR}
                onEditPositions={handleEditOverlayPositions}
                onSavePositions={handleSaveOverlayPositions}
              />
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div> 
  );
};

export default OverlaySettingsComponent;
