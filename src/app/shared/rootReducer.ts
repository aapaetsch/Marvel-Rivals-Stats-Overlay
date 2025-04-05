import { combineReducers } from "redux";
import backgroundReducer from "../../screens/background/stores/background";
import appSettingsReducer from "../../features/appSettings/appSettingsSlice";
import matchStatsReducer from "../../screens/background/stores/matchStatsSlice";
import recentPlayersReducer from "../../screens/background/stores/recentPlayersSlice";
import menuReducer from "../../screens/desktop/stores/menuSlice";


const rootReducer = combineReducers({
  backgroundReducer,
  appSettingsReducer,
  matchStatsReducer,
  recentPlayersReducer,
  menuReducer
});

export type RootReducer = ReturnType<typeof rootReducer>;

export default rootReducer;
