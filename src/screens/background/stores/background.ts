import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SwapBarPlayerProps } from "screens/characterswapbar/types/swapbartypes";

interface Timestamp {
  timestamp: number;
}
type OwInfo =
  | overwolf.games.events.InfoUpdates2Event
  | overwolf.games.InstalledGameInfo;
type OwEvent = overwolf.games.events.NewGameEvents;
type InfoPayload = PayloadAction<Timestamp & OwInfo>;
type EventPayload = PayloadAction<Timestamp & OwEvent>;

interface BackgroundState {
  events: Array<Timestamp & OwEvent>;
  infos: Array<Timestamp & OwInfo>;
  roster: Record<string, string>;
  swapQueue: SwapBarPlayerProps[];
}

const initialState: BackgroundState = {
  events: [],
  infos: [],
  roster: {},
  swapQueue: [],
};

const backgroundSlice = createSlice({
  name: "backgroundScreen",
  initialState,
  reducers: {
    setEvent(state, action: EventPayload) {
      const { timestamp, events } = action.payload as any;
    
      // Handle both array of events and single event objects
      // This fixes the "n is not iterable" error
      if (events) {
        // If events property exists
        if (Array.isArray(events)) {
          // If it's already an array, process each event
          events.forEach((event) => {
            state.events.push({ ...event, timestamp });
          });
        } else {
          // If events is an object but not an array, add it as a single event
          state.events.push({ events, timestamp });
        }
      } else {
        // If no events property, treat the whole payload as the event
        state.events.push({ ...(action.payload as any), timestamp });
      }
    },    
    setInfo(state, action: InfoPayload) {
      state.infos.push(action.payload);
    
      // This assumes the payload is an InfoUpdates2Event
      const infoEvent = action.payload as overwolf.games.events.InfoUpdates2Event;
      // @ts-ignore
      const matchInfo = infoEvent.info?.match_info;
    
      if (matchInfo) {
        const keys = Object.keys(matchInfo);
        const rosterKeys = keys.filter((key) => key.startsWith("roster_"));
    
        rosterKeys.forEach((key) => {
          try {
            const value = JSON.parse(matchInfo[key]);
            const uid = value.uid;
            const newChar = value.character_name;
    
            if (!uid || !newChar) return;
    
            const prevChar = state.roster[uid];
            if (prevChar && prevChar !== newChar) {
              state.swapQueue.push({
                uid,
                name: value.name,
                oldCharacterName: prevChar,
                newCharacterName: newChar,
                oldAvatarURL: null,
                newAvatarURL: null,
                team: value.team ?? 1,
              });
            }
    
            state.roster[uid] = newChar;
          } catch (err) {
            console.warn("Failed parsing roster JSON", err);
          }
        });
      }
    },    
    removeFirstSwap(state) {
      state.swapQueue.shift();
    }
  },
});

export const { setEvent, setInfo } = backgroundSlice.actions;

export default backgroundSlice.reducer;
