import { Title } from "components/Title/Title";
import { useTranslation } from "react-i18next";
import { DesktopHeader } from "./DesktopHeader";
import { Overview } from "features/overview";
import { InfoPanel } from "features/overview/components/InfoPanel";
import { useAdRemoval } from "features/monetization";
import Menu from "./Menu";
import MatchInfo from "./matchTab/MatchInfo"; // Import our new component
import { GeneralSettingsComponent as Settings } from "./settings/Settings"; // Import the Settings component
import MatchHistory from "./matchHistoryTab/MatchHistory"; // Import the Match History component
import RecentPlayers from "./recentPlayersTab/RecentPlayers"; // Import the Recent Players component
import "./styles/Screen.css";
import { PremiumContent } from "./PremiumContent";
import { FreeContent } from "./FreeContent";
import { RootReducer } from "app/shared/rootReducer";
import { useSelector } from "react-redux";
import { MatchOutcome } from "../../background/types/matchStatsTypes";
import React from "react";

// Import Ant Design styles
import 'antd/dist/reset.css';
import { MenuKeys } from "../types/MenuTypes";

//avoid the use of static text, use i18n instead, each language has its own text, and the text is stored in the
//locales folder in the project root
const Screen = () => {
  const { t } = useTranslation();
  const { isLoading, isSubscribed } = useAdRemoval();
  const { collapsed, selectedKeys } = useSelector((state: RootReducer) => state.menuReducer);
  
  // Function to determine what content to show based on selected menu item
  const renderContent = () => {
    // Current Match option
    if (selectedKeys.includes(MenuKeys.CURRENT_MATCH)) {
      return <MatchInfo />;
    }
    
    // Match History option
    if (selectedKeys.includes(MenuKeys.MATCH_HISTORY)) {
      return <MatchHistory />;
    }
    
    // Recent Players option
    if (selectedKeys.includes(MenuKeys.RECENT)) {
      return <RecentPlayers />;
    }
    
    // Settings option
    if (selectedKeys.includes(MenuKeys.SETTINGS)) {
      return <Settings />;
    }
    
    // Default content (Home, etc.)
    return <Overview />;
  };
  
  return (
    <div className='desktop'>
      <DesktopHeader />
      <div className={`desktop__container ${collapsed ? 'menu-collapsed' : ''}`}>
        <nav className={"desktop__nav"}>
          <Menu />
        </nav>
        <main className={"desktop__main"}>
          <Title color='white'>{t("components.desktop.main.title")}</Title>
          {renderContent()}
        </main>
        <footer className={"desktop__footer desktop__fit"}>
          <Title color='white'>{t("components.desktop.footer")}</Title>
        </footer>
      </div>
    </div>
  );
};

export default Screen;
