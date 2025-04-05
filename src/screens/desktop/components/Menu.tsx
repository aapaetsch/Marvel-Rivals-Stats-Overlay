import React from 'react';
import { Menu as AntMenu } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import {
  setSelectedKeys,
  setOpenKeys
} from '../stores/menuSlice';
import {
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  HomeOutlined,
  HistoryOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './styles/Menu.css';
import { IoGameControllerOutline, IoStatsChartOutline, IoHomeOutline } from 'react-icons/io5';
import { GiFloatingPlatforms, GiKing, GiStarfighter } from 'react-icons/gi';
import { MdOutlineWorkHistory } from 'react-icons/md';
import { LiaUsersSolid, LiaUserTagSolid, LiaUserInjuredSolid, LiaUserGraduateSolid } from 'react-icons/lia';
import { PiUserListBold } from 'react-icons/pi';
import { AntMenuItem, MenuKeys } from '../types/MenuTypes';


// Define the items for the menu
const getMenuItems = (t: any): AntMenuItem[] => [
  {
    key: MenuKeys.HOME,
    icon: <IoHomeOutline />,
    label: t('components.desktop.menu.home'),
  },
  {
    key: MenuKeys.MATCH,
    icon: <GiStarfighter />,
    label: t('components.desktop.menu.match'),
    children: [
      {
        key: MenuKeys.CURRENT_MATCH,
        icon: <IoGameControllerOutline />,
        label: t('components.desktop.menu.current_match'),
      },
      {
        key: MenuKeys.MATCH_HISTORY,
        icon: <MdOutlineWorkHistory />,
        label: t('components.desktop.menu.match_history'),
      },
    ],
  },
  {
    key: MenuKeys.STATS,
    icon: <IoStatsChartOutline />,
    label: t('components.desktop.menu.stats'),
    children: [
      {
        key: MenuKeys.PLAYER_STATS,
        icon: <LiaUserGraduateSolid />,
        label: t('components.desktop.menu.player_stats'),
      },
      {
        key: MenuKeys.SQUAD_STATS,
        icon: <LiaUsersSolid />,
        label: t('components.desktop.menu.squad_stats'),
      },
    ],
  },
  {
    key: MenuKeys.PLAYERS,
    icon: <PiUserListBold />,
    label: t('components.desktop.menu.players'),
    children: [
      {
        key: MenuKeys.FAVORITES,
        icon:<LiaUserTagSolid />,
        label: t('components.desktop.menu.favourites'),
      },
      {
        key: MenuKeys.RECENT,
        icon: <LiaUserInjuredSolid />,
        label: t('components.desktop.menu.recent'),
      },
    ],
  },
  {
    key: MenuKeys.HEROS,
    icon: <GiKing />,
    label: t('components.desktop.menu.heros'),
    children: [
      {
        key: MenuKeys.HEROS_TIERLIST,
        icon: <GiFloatingPlatforms />,
        label: t('components.desktop.menu.heros_tierlist'),
      },
    ],
  },
  {
    key: MenuKeys.SETTINGS,
    icon: <SettingOutlined />,
    label: t('components.desktop.menu.settings'),
  },
];

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { selectedKeys } = useSelector(
    (state: RootReducer) => state.menuReducer
  );

  // Handle menu item selection
  const onSelect = (info: { selectedKeys: string[] }) => {
    dispatch(setSelectedKeys(info.selectedKeys as unknown as MenuKeys[]));
  };

  // Menu items with translations
  const items = getMenuItems(t);

  return (
    <div className="horizontal-menu">
      <AntMenu
        mode="horizontal"
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        items={items}
        className="desktop-menu"
      />
    </div>
  );
};

export default Menu;

