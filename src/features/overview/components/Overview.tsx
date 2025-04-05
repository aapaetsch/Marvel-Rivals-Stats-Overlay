import { Stats } from "./Stats";
import { useData } from "../hooks/useData";
import "./styles/Overview.css";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";

export const Overview = () => {
  // const { events, infos } = useSelector((state: RootReducer) => state.background);
  const eventOverviewData =  useData().events;

  return (
    <div className="overview">
      {/* <Stats label={eventOverviewData.label} value={eventOverviewData.quantity} />
      <div>
        
        {events.map((event, index) => (
          <div key={index} className="event-row">
            {event.events.map((e, i) => (
              <div key={i} className="event-row">
                <span>{e.name}</span>
                <span>{e.data}</span>
              </div>
            ))}
          </div>
        ))}
      </div> */}
      {/* <Stats label={infos.label} value={infos.quantity} /> */}
    </div>
  );
};
