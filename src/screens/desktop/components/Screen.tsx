import { Title } from "components/Title/Title";
import { useTranslation } from "react-i18next";
import { DesktopHeader } from "./DesktopHeader";
import { Overview } from "features/overview";
import { InfoPanel } from "features/overview/components/InfoPanel";
import { useAdRemoval } from "features/monetization";
import Menu from "./Menu";
import MatchInfo from "./matchTab/MatchInfo"; // Import our new component
import MatchTabNew from "./matchTabNew/MatchTabNew"; // Import the new card view component
import LiveMatch from "./liveMatch/LiveMatch"; // Import the combined live match component
// Settings components are now imported dynamically when needed
import MatchHistory from "./matchHistoryTab/MatchHistory"; // Import the Match History component
import RecentPlayers from "./recentPlayersTab/RecentPlayers"; // Import the Recent Players component
import FavouritesPage from "./favouritesTab/FavouritesPage"; // Import the Favourites Page component
import HomeTab from "./homeTab/HomeTab"; // Import our new HomeTab component
import '../../../app/shared/themes.css';
import "./styles/Screen.css";
import { PremiumContent } from "./PremiumContent";
import { FreeContent } from "./FreeContent";
import { RootReducer } from "app/shared/rootReducer";
import { useSelector, useDispatch } from "react-redux";
import { MatchOutcome } from "../../background/types/matchStatsTypes";
import React, { useEffect } from "react";
import { isDev } from "lib/utils"; // Import isDev utility
import { HorizontalAdPlaceholder } from "./HorizontalAdPlaceholder";

// Import Ant Design styles
import 'antd/dist/reset.css';
import { MenuKeys } from "../types/MenuTypes";
import PlayerStatsTab from "./playerStatsTab/PlayerStatsTab";
import { Form, Button } from 'antd'; // Import Form and Button
import { updateSettings, OverlaySettings } from 'features/appSettings/appSettingsSlice'; // Import updateSettings and OverlaySettings type
import { defaultOverlayWindowPositions } from './settings/OverlaySettings'; // Import defaults if needed for reset
import Layout, { Content, Footer } from "antd/es/layout/layout";
import DevPlayground from "./dev/DevPlayground";
import Sider from "antd/es/layout/Sider";

//avoid the use of static text, use i18n instead, each language has its own text, and the text is stored in the
//locales folder in the project root
const Screen = () => {
  const { t } = useTranslation();
  const { isLoading, isSubscribed } = useAdRemoval();
  const { collapsed, selectedKeys } = useSelector((state: RootReducer) => state.menuReducer);
  const { theme, ...appSettings } = useSelector((state: RootReducer) => state.appSettingsReducer.settings);
  const dispatch = useDispatch(); // Get dispatch hook
  const [settingsForm] = Form.useForm(); // Create form instance for settings
  const [ isCollapsed, setCollapsed ] = React.useState(collapsed); // State for menu collapse
  
  // Apply the selected theme to the body element
  useEffect(() => {
    // First, remove any existing theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-minimalistic-black');
    
    // Then add the current theme class
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  // Submit handler for settings form
  const handleSettingsSubmit = (values: any) => {
    console.log("Saving settings:", values);
    
    // Dispatch the update to ensure we have the latest values saved
    dispatch(updateSettings(values));
    
    // Apply settings immediate effects if needed
    // For example, certain settings might need to trigger other actions
    
    // Show a success notification
    overwolf.notifications.showToastNotification({
      header: t("components.desktop.settings.saved-title", "Settings Saved"),
      texts: [t("components.desktop.settings.saved-message", "Your settings have been saved and will take effect immediately.")],
      attribution: "Rivals Overlay"
    }, (result) => {
      if (!result.success) {
        console.error("Failed to show success notification:", result.error);
      }
    });
  };

  // Reset handler for overlay settings
  const handleResetOverlay = () => {
    // Define default overlay settings (consider moving this to a constants file)
    const defaultOverlaySettings: Partial<OverlaySettings> = {
      showTeamStats: true,
      showKillFeed: true,
      opacity: 80, // This is the general opacity setting (not directly used)
      position: 'top-left',
      showPlayerStats: true,
      playerStatsOpacity: 80, // Fixed: Changed to 80 to match the general opacity setting
      playerStatsBackgroundColor: '#000000',
      playerStatsFontColor: '#FFFFFF', 
      teammateBorderColor: '#1890FF',
      ultFullyChargedBorderColor: '#FFD700',
      // Window resource management settings
      enablePlayerStatsWindow: true,
      enableFinalHitsWindow: true,
      enableCharSwapWindow: true, 
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
      showPlayerSwapNotification: true, 
      playerSwapNotificationDuration: 5,
      allySwapColor: '#1890FF',
      enemySwapColor: '#FF4D4F',
      swapScreenBackgroundColor: '#000000',
      showFinalHitsOverlay: true,
      finalHitsOpacity: 80,
      yourFinalHitsColor: '#1890FF',
      opponentFinalHitsColor: '#FF4D4F',
      finalHitsBackgroundColor: '#000000',
      customPositions: defaultOverlayWindowPositions, // Reset to defaults
      lockOverlayPositions: false,
    };
    settingsForm.setFieldsValue(defaultOverlaySettings);
    dispatch(updateSettings(defaultOverlaySettings as OverlaySettings)); // Dispatch defaults
    
    // Show reset notification
    overwolf.notifications.showToastNotification({
      header: t("components.desktop.settings.reset-title", "Settings Reset"),
      texts: [t("components.desktop.settings.reset-message", "Settings have been reset to default values.")],
      attribution: "Rivals Overlay"
    }, (result) => {
      if (!result.success) {
        console.error("Failed to show reset notification:", result.error);
      }
    });
  };
  
  // Function to determine what content to show based on selected menu item
  const renderContent = () => {
    // Live Match (combined card and table view)
    if (selectedKeys.includes(MenuKeys.LIVE_MATCH)) {
      return <LiveMatch />;
    }
    
    // Legacy Current Match option (for backwards compatibility if needed)
    if (selectedKeys.includes(MenuKeys.CURRENT_MATCH)) {
      return <MatchInfo />;
    }
    
    // Legacy Current Match Cards option (for backwards compatibility if needed)
    if (selectedKeys.includes(MenuKeys.CURRENT_MATCH_CARDS)) {
      return <MatchTabNew />;
    }
    
    // Match History option
    if (selectedKeys.includes(MenuKeys.MATCH_HISTORY)) {
      return <MatchHistory />;
    }

    if (selectedKeys.includes(MenuKeys.PLAYER_STATS)) {
      return <PlayerStatsTab />;
    }
    
    // Recent Players option
    if (selectedKeys.includes(MenuKeys.RECENT)) {
      return <RecentPlayers />;
    }
    
    // Favourites option
    if (selectedKeys.includes(MenuKeys.FAVORITES)) {
      return <FavouritesPage />;
    }
    
    // Modern Settings page
    if (selectedKeys.includes(MenuKeys.SETTINGS)) {
      const ModernSettingsScreen = require('../ModernSettingsScreen').default;
      return <ModernSettingsScreen form={settingsForm} />;
    }
    
    // Dev-only playground
    if (selectedKeys.includes(MenuKeys.DEV_PLAYGROUND)) {
      return <DevPlayground />;
    }

    // Home tab
    if (selectedKeys.includes(MenuKeys.HOME)) {
      return <HomeTab />;
    }
    
    // Default content as fallback
    return <Overview />;
  };
  
  return (
  <div>
    <DesktopHeader />
    <Layout style={{ minHeight: 'calc(100vh - 2.5rem)', paddingTop: '2.5rem' }}>
      <Sider collapsible collapsed={isCollapsed} onCollapse={(value) => setCollapsed(value)} >
        <Menu />
      </Sider>
      <Layout>
        <Content>
          <Form 
              form={settingsForm} 
              className="desktop__main-form"
              onValuesChange={(changedValues, allValues) => {
                // Log what changed for debugging
                const changedKeys = Object.keys(changedValues);
                console.log('Form value changed:', changedKeys);
                
                // Update Redux immediately when any value changes
                dispatch(updateSettings(allValues));
                
                // Skip notification for color values (they'll be handled by the color picker component)
                const colorPickerFields = [
                  'playerStatsFontColor', 'teammateBorderColor', 'playerStatsBackgroundColor', 'ultFullyChargedBorderColor',
                  'allySwapColor', 'enemySwapColor', 'swapScreenBackgroundColor',
                  'yourFinalHitsColor', 'opponentFinalHitsColor', 'finalHitsBackgroundColor'
                ];
                
                const isColorChange = changedKeys.some(key => colorPickerFields.includes(key));
                
                // Show a subtle notification for better UX, but not for color changes
                if (selectedKeys.includes(MenuKeys.SETTINGS) && !isColorChange) {
                  // Only show notification if we're on settings page
                  overwolf.notifications.showToastNotification({
                    header: t("components.desktop.settings.saved-title", "Setting Updated"),
                    texts: [t("components.desktop.settings.auto-save-message", "Your changes have been automatically saved")],
                    attribution: "Rivals Overlay"
                  }, (result) => {
                    if (!result.success) {
                      console.error("Failed to show notification:", result.error);
                    }
                  });
                }
                }}
              initialValues={appSettings} // Set initial values from Redux state
            >
              <div className={`desktop__main-scroller ${selectedKeys.includes(MenuKeys.SETTINGS) ? 'has-settings' : ''}`}>
                {renderContent()}
              </div>
              
              {/* Only show reset button since settings save automatically - positioned within form */}
              {selectedKeys.includes(MenuKeys.SETTINGS) && (
                <div className="desktop__main-footer settings-actions">
                  <Button type="default" danger onClick={handleResetOverlay}>
                    {t("components.desktop.settings.reset", "Reset to Default")}
                  </Button>
                </div>
              )}
            </Form>
            {/* Developer tools moved to separate window (Dev Window) */}
            
            {/* Horizontal ad positioned OUTSIDE form but with form context for styling */}
            <div className="desktop__main-ad">
                <HorizontalAdPlaceholder height={130} />
            </div>
        </Content>
        <Footer style={{ padding: 0, margin: 0, height: '0', background: 'transparent' }}>
          {/* Footer now empty - ad moved to main content area */}
        </Footer>
      </Layout>
    </Layout>                                                                                         
    </div>
  );
};

export default Screen;
