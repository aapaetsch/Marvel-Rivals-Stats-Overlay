import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuKeys } from "../types/MenuTypes";

export interface MenuState {
  selectedKeys: MenuKeys[];
  openKeys: MenuKeys[];
  collapsed: boolean;
}

const initialState: MenuState = {
  selectedKeys: [MenuKeys.HOME],  // Default selected menu item
  openKeys: [],   // Default open submenu
  collapsed: false      // Menu is expanded by default
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setSelectedKeys(state, action: PayloadAction<MenuKeys[]>) {
      state.selectedKeys = action.payload;
    },
    setOpenKeys(state, action: PayloadAction<MenuKeys[]>) {
      state.openKeys = action.payload;
    },
    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
    },
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.collapsed = action.payload;
    }
  },
});

export const { setSelectedKeys, setOpenKeys, toggleCollapsed, setCollapsed } = menuSlice.actions;

export default menuSlice.reducer;