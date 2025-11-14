import React from 'react';
import { Menu as AntMenu } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import {
  setSelectedKeys,
  setOpenKeys
} from '../stores/menuSlice';
import {
  SettingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './styles/Menu.css';
import { IoGameControllerOutline, IoStatsChartOutline, IoHomeOutline } from 'react-icons/io5';
import { GiStarfighter } from 'react-icons/gi';
import { MdOutlineWorkHistory } from 'react-icons/md';
import { LiaUserInjuredSolid, LiaUserTagSolid } from 'react-icons/lia';
import { PiUserListBold } from 'react-icons/pi';
import { AntMenuItem, MenuKeys } from '../types/MenuTypes';
import { isDev } from 'lib/utils';
import { isMatchLive } from 'lib/matchStatusUtils';

// Define the items for the menu
const getMenuItems = (t: any, isLiveMatch: boolean = false, showHome: boolean = false): AntMenuItem[] => {
  const base: AntMenuItem[] = [];
  // Optionally include the HOME item. Hidden by default while we iterate on the UI.
  if (showHome) {
    base.push({
      key: MenuKeys.HOME,
      icon: <IoHomeOutline />,
      label: t('components.desktop.menu.home'),
    });
  }
  base.push({
    key: MenuKeys.MATCH,
    icon: <GiStarfighter />,
    label: t('components.desktop.menu.match'),
    children: [
      {
        key: MenuKeys.LIVE_MATCH,
        icon: (
          <div className="menu-icon-wrapper">
            <IoGameControllerOutline />
            {isLiveMatch && <span className="live-match-indicator" />}
          </div>
        ),
        label: t('components.desktop.menu.live_match'),
      },
      {
        key: MenuKeys.MATCH_HISTORY,
        icon: <MdOutlineWorkHistory />,
        label: t('components.desktop.menu.match_history'),
      },
    ],
  });
  // {
  //   key: MenuKeys.STATS,
  //   icon: <IoStatsChartOutline />,
  //   label: t('components.desktop.menu.stats'),
  //   children: [
  //     {
  //       key: MenuKeys.PLAYER_STATS,
  //       icon: <LiaUserGraduateSolid />,
  //       label: t('components.desktop.menu.player_stats'),
  //     },
  //     {
  //       key: MenuKeys.SQUAD_STATS,
  //       icon: <LiaUsersSolid />,
  //       label: t('components.desktop.menu.squad_stats'),
  //     },
  //   ],
  // },
  base.push({
    key: MenuKeys.PLAYERS,
    icon: <PiUserListBold />,
    label: t('components.desktop.menu.players'),
    children: [
      {
        key: MenuKeys.RECENT,
        icon: <LiaUserInjuredSolid />,
        label: t('components.desktop.menu.recent'),
      },
      {
        key: MenuKeys.FAVORITES,
        icon:<LiaUserTagSolid />,
        label: t('components.desktop.menu.favourites'),
      },
    ],
  });
  // {
  //   key: MenuKeys.HEROS,
  //   icon: <GiKing />,
  //   label: t('components.desktop.menu.heros'),
  //   children: [
  //     {
  //       key: MenuKeys.HEROS_TIERLIST,
  //       icon: <GiFloatingPlatforms />,
  //       label: t('components.desktop.menu.heros_tierlist'),
  //     },
  //   ],
  // },  
  base.push({
    key: MenuKeys.SETTINGS,
    icon: <SettingOutlined />,
    label: t('components.desktop.menu.settings'),
    // Removed children to make this a direct menu item
  });


  // Append dev-only playground entry
  if (isDev) {
    base.push({
      key: MenuKeys.DEV_PLAYGROUND,
      icon: <IoStatsChartOutline />,
      label: t('components.desktop.menu.dev_playground', 'Dev Playground'),
    });
  }

  return base;
};

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { selectedKeys, openKeys, collapsed } = useSelector(
    (state: RootReducer) => state.menuReducer
  );
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);

  // Check if match is live
  const isLiveMatchActive = isMatchLive(currentMatch);

  // Handle menu item selection
  const onSelect = (info: { selectedKeys: string[] }) => {
    dispatch(setSelectedKeys(info.selectedKeys as unknown as MenuKeys[]));
  };

  // Handle submenu open/close
  const onOpenChange = (keys: string[]) => {
    dispatch(setOpenKeys(keys as unknown as MenuKeys[]));
  };

  // Handle menu collapse/expand
  // const handleToggleCollapsed = () => {
  //   dispatch(toggleCollapsed());
  // };

  // Menu items with translations and live match status
  const items = getMenuItems(t, isLiveMatchActive, false);

  return (
    <div className="side-menu">
      {/* <div className="menu-header">
        <Button
          type="text"
          onClick={handleToggleCollapsed}
          className="toggle-button"
          icon={collapsed ? <GiOpenGate size={16} /> : <GiClosedDoors size={16} />}
        />
      </div> */}
      <AntMenu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={collapsed ? [] : openKeys}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
        items={items}
        // inlineCollapsed={collapsed}
        className="desktop-menu"
      />
    </div>
  );
};

export default Menu;

