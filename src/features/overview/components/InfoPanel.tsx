import {Stats} from "./Stats";
import {useData} from "../hooks/useData";
import "./styles/Overview.css";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";

export const InfoPanel = () => {
  // const { events, infos } = useSelector((state: RootReducer) => state.background);
  const infoOverviewData =  useData().infos;

  return (
    <div className="overview">
      {/* <Stats label={infoOverviewData.label} value={infoOverviewData.quantity} />
      <div>
        
        {infos.map((info, index) => (
          <div key={index} className="event-row">
            {Object.keys(info).map((key, i) => (
              <div key={i} className="event-row">
                <span>{key}</span>
              </div>
            ))}
          </div>
        ))}
      </div> */}
      {/* <Stats label={infos.label} value={infos.quantity} /> */}
    </div>
  );
};