import React, { useState, useEffect } from 'react';
import { Switch, Form, Select, Button, Input, Divider, Slider, Radio, Segmented, Alert, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/shared/store';
import { updateSettings, OverlaySettings } from 'features/appSettings/appSettingsSlice';
import { WINDOW_NAMES } from 'app/shared/constants';
import PlayerStatsSettings from './PlayerStatsSettings';
import OverlayToggleSettings from './OverlayToggleSettings';
import CardSettingsRowSlider from './CardSettingsRowSlider';
import CardSettingsRowColorPicker from './CardSettingsRowColorPicker';
import '../styles/Settings.css';
import CardSettingsRowToggle from './CardSettingsRowToggle';

const { Panel } = Collapse;

const defaultOverlayWindowPositions = {

}

// Overlay Settings Component
const OverlaySettingsComponent: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appSettings = useSelector((state: RootState) => state.appSettingsReducer.settings);
  
  // State for overlay position editing mode
  const [isPositioningMode, setIsPositioningMode] = useState(false);
  // State to store temporary positions during editing
  const [tempPositions, setTempPositions] = useState({
    ingameOverlay: appSettings.customPositions?.ingameOverlay || { x: 15, y: -175 },
    finalHitsBar: appSettings.customPositions?.finalHitsBar || { x: 1000, y: 50 },
    charSwapBar: appSettings.customPositions?.charSwapBar || { x: 0, y: 300 }
  });
  
  const [overlayForm] = Form.useForm();
  
  useEffect(() => {
    overlayForm.setFieldsValue({
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
      finalHitsBackgroundColor: appSettings.finalHitsBackgroundColor || '#000000'
    });
  }, [appSettings, overlayForm]);

  const handleOverlayFormSubmit = (values: any) => {
    dispatch(updateSettings(values));
  };
  
  const handleResetOverlay = () => {
    const defaultOverlaySettings: OverlaySettings = {
      showTeamStats: true,
      showKillFeed: true,
      opacity: 80,
      position: 'top-left',
      overlayTheme: 'default',
      showPlayerStats: true,
      playerStatsOpacity: 100,
      playerStatsBackgroundColor: '#000000',
      showOwnPlayerCard: true,
      compactOwnPlayerCard: false,
      showTeammate1: true,
      compactTeammate1: false,
      showTeammate2: true,
      compactTeammate2: false,
      showTeammate3: true,
      compactTeammate3: false,
      showTeammate4: true,
      compactTeammate4: false,
      showTeammate5: true,
      compactTeammate5: false,
      showPlayerSwapNotification: true, playerSwapNotificationDuration: 5,
      showFinalHitsOverlay: true,
      finalHitsOpacity: 80,
      yourFinalHitsColor: '#1890FF',
      opponentFinalHitsColor: '#FF4D4F',
      finalHitsBackgroundColor: '#000000',
      customPositions: {
        ingameOverlay: { x: 15, y: -175 },
        finalHitsBar: { x: 1000, y: 50 },
        charSwapBar: { x: 0, y: 300 }
      },
      lockOverlayPositions: false,
      allySwapColor: '',
      enemySwapColor: '',
      swapScreenBackgroundColor: ''
    };
    overlayForm.setFieldsValue(defaultOverlaySettings);
    dispatch(updateSettings(defaultOverlaySettings));
  };
  
  // Handler for toggling positioning mode
  const handleEditOverlayPositions = (enable: boolean) => {
    setIsPositioningMode(enable);
    
    if (enable) {
      // Enable drag mode for each overlay window
      enableDragMode(WINDOW_NAMES.INGAME);
      enableDragMode(WINDOW_NAMES.FINALHITSBAR);
      enableDragMode(WINDOW_NAMES.CHARSWAPBAR);
      
      // Store the current position in case user cancels
      setTempPositions({
        ingameOverlay: { ...appSettings.customPositions.ingameOverlay },
        finalHitsBar: { ...appSettings.customPositions.finalHitsBar },
        charSwapBar: { ...appSettings.customPositions.charSwapBar }
      });
    } else {
      // Disable drag mode for each overlay window
      disableDragMode(WINDOW_NAMES.INGAME);
      disableDragMode(WINDOW_NAMES.FINALHITSBAR);
      disableDragMode(WINDOW_NAMES.CHARSWAPBAR);
    }
  };

  // Handler for saving custom overlay positions
  const handleSaveOverlayPositions = async () => {
    try {
      // Get current window positions
      const ingamePosition = await getWindowPosition(WINDOW_NAMES.INGAME);
      const finalHitsPosition = await getWindowPosition(WINDOW_NAMES.FINALHITSBAR);
      const charSwapPosition = await getWindowPosition(WINDOW_NAMES.CHARSWAPBAR);
      
      // Update settings with new positions
      const updatedCustomPositions = {
        ingameOverlay: { x: ingamePosition.x, y: ingamePosition.y },
        finalHitsBar: { x: finalHitsPosition.x, y: finalHitsPosition.y },
        charSwapBar: { x: charSwapPosition.x, y: charSwapPosition.y }
      };
      
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
        overwolf.windows.dragMove(result.window.id);
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
    <div className="settings-container">      <Form
        form={overlayForm}
        layout="vertical"
        initialValues={{ 
          showTeamStats: appSettings.showTeamStats,
          showKillFeed: appSettings.showKillFeed,
          opacity: appSettings.opacity,
          position: appSettings.position,
          showPlayerStats: appSettings.showPlayerStats,
          playerStatsOpacity: appSettings.playerStatsOpacity,
          playerStatsBackgroundColor: appSettings.playerStatsBackgroundColor || '#000000',
          // Player card visibility and layout
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
          // Player swap notifications
          showPlayerSwapNotification: appSettings.showPlayerSwapNotification,
          playerSwapNotificationDuration: appSettings.playerSwapNotificationDuration,
          // Final hits overlay
          showFinalHitsOverlay: appSettings.showFinalHitsOverlay,
          finalHitsOpacity: appSettings.finalHitsOpacity,
          // New color settings for final hits overlay
          yourFinalHitsColor: appSettings.yourFinalHitsColor || '#1890FF',
          opponentFinalHitsColor: appSettings.opponentFinalHitsColor || '#FF4D4F',
          finalHitsBackgroundColor: appSettings.finalHitsBackgroundColor || '#000000'
        }}
        onFinish={handleOverlayFormSubmit}
        className="settings-form"
      >
        <Collapse 
          defaultActiveKey={['1']}
          accordion
          className="settings-collapse"
        >          
        <Collapse.Panel 
            header={t("components.desktop.settings.overlay", "Overlay")} 
            key="1"
            className="settings-panel"
          >
            {/* General Overlay Settings */}
            <OverlayToggleSettings 
              form={overlayForm} 
              isPositioningMode={isPositioningMode}
              onEditPositions={handleEditOverlayPositions}
              onSavePositions={handleSaveOverlayPositions}
            />
            
            {isPositioningMode && (
              <div className="positioning-mode-notice">
                <Alert
                  message={t("components.desktop.settings.positioning-mode-active", "Positioning Mode Active")}
                  description={t("components.desktop.settings.positioning-mode-description", "You can now drag and position each overlay element. Click Save when finished.")}
                  type="info"
                  showIcon
                />
              </div>
            )}
          </Collapse.Panel>            
          <Collapse.Panel 
            header={t("components.desktop.settings.player-stats-overlay", "Player Stats Overlay")} 
            key="2"
            className="settings-panel"
            collapsible={!appSettings.showTeamStats ? "disabled" : undefined}
          >
            <PlayerStatsSettings form={overlayForm} />
          </Collapse.Panel>
          <Collapse.Panel 
            header={t("components.desktop.settings.player-swap", "Player Swap Notification")} 
            key="3"
            className="settings-panel"
            collapsible={!appSettings.showPlayerSwapNotification ? "disabled" : undefined}
          > 
            <CardSettingsRowSlider
              label={t("components.desktop.settings.notification-duration", "Notification Duration (seconds)")}
              formName="playerSwapNotificationDuration"
              min={1}
              max={10}
              marks={{
                1: '1s',
                5: '5s',
                10: '10s'
              }}
              showPercentage={false}
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.ally-swap-color", "Ally Swap Color")}
              formName="allySwapColor"
              tooltip={t("components.desktop.settings.ally-swap-color-tooltip", "Color for ally player character swaps")}
              initialValue="#1890FF"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.enemy-swap-color", "Enemy Swap Color")}
              formName="enemySwapColor"
              tooltip={t("components.desktop.settings.enemy-swap-color-tooltip", "Color for enemy player character swaps")}
              initialValue="#FF4D4F"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.swap-screen-background-color", "Background Color")}
              formName="swapScreenBackgroundColor"
              tooltip={t("components.desktop.settings.swap-screen-background-tooltip", "Background color for the character swap notification")}
              initialValue="#000000"
            />
          </Collapse.Panel>
          <Collapse.Panel 
            header={t("components.desktop.settings.final-hits", "Final Hits Overlay")} 
            key="4"
            className="settings-panel"
            collapsible={!appSettings.showFinalHitsOverlay ? "disabled" : undefined}
          >
            <CardSettingsRowSlider
              label={t("components.desktop.settings.final-hits-opacity", "Final Hits Overlay Opacity")}
              formName="finalHitsOpacity"
              min={20}
              max={100}
              marks={{
                20: '20%',
                50: '50%',
                80: '80%',
                100: '100%'
              }}
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.your-final-hits-color", "Your Final Hits Color")}
              formName="yourFinalHitsColor"
              tooltip={t("components.desktop.settings.your-final-hits-color-tooltip", "Color for final hits you've made on opponents")}
              initialValue="#1890FF"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.opponent-final-hits-color", "Opponent Final Hits Color")}
              formName="opponentFinalHitsColor"
              tooltip={t("components.desktop.settings.opponent-final-hits-color-tooltip", "Color for final hits opponents have made on you")}
              initialValue="#FF4D4F"
            />
            <CardSettingsRowColorPicker
              label={t("components.desktop.settings.final-hits-background-color", "Background Mask Color")}
              formName="finalHitsBackgroundColor"
              tooltip={t("components.desktop.settings.final-hits-background-color-tooltip", "Background color for the final hits display")}
              initialValue="#000000"
            />
          </Collapse.Panel>
        </Collapse>
        <div className="settings-actions">
          <Button type="primary" onClick={() => overlayForm.submit()}>
            {t("components.desktop.settings.save", "Save Settings")}
          </Button>
          <Button onClick={handleResetOverlay}>
            {t("components.desktop.settings.reset", "Reset to Default")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default OverlaySettingsComponent;
