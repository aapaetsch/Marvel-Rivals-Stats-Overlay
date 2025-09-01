import React from 'react';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootReducer } from "app/shared/rootReducer";
import { Card } from 'antd';
import PlayerCard from './PlayerCard';
import './CardView.css';

// CardView component to display match stats as vertical cards
const CardView = () => {
  const { t } = useTranslation();
  const { currentMatch } = useSelector((state: RootReducer) => state.matchStatsReducer);
  
  // Get players and separate them into teammates and opponents
  const players = Object.values(currentMatch.players);
  const teammates = players.filter(player => player.isTeammate);
  const opponents = players.filter(player => !player.isTeammate);
  
  // Check if data is available
  const hasMatchData = currentMatch && (currentMatch.matchId || players.length > 0);
  
  if (!hasMatchData) {
    return (
      <div className="card-view-container">
        <Card className="no-data-card">
          <div className="no-data-message">
            {t("components.desktop.card-view.no-data", "No match data available")}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="card-view-container">
      <div className="card-view-grid">
        {/* Teammates Row */}
        <div className="team-row teammates-row">
          <h3 className="team-header">
            {t("components.desktop.card-view.teammates", "Teammates")}
          </h3>
          <div className="cards-grid">
            {teammates.map((player) => (
              <PlayerCard key={player.uid} player={player} />
            ))}
          </div>
        </div>
        
        {/* Opponents Row */}
        <div className="team-row opponents-row">
          <h3 className="team-header">
            {t("components.desktop.card-view.opponents", "Opponents")}
          </h3>
          <div className="cards-grid">
            {opponents.map((player) => (
              <PlayerCard key={player.uid} player={player} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardView;