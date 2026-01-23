import React from 'react';
import PlayerAvatar from '../PlayerAvatar/PlayerAvatar';
import './styles.css';

const PlayerCard = ({ player, showStats = false }) => {
  return (
    <div className="player-card-simple">
      <PlayerAvatar player={player} size="medium" />
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        {player.nickname && <p className="player-nickname">"{player.nickname}"</p>}
      </div>
      {showStats && (
        <div className="player-stats">
          <div className="stat">
            <span className="stat-label">Média</span>
            <span className="stat-value">
              {player.stats?.avgRating?.toFixed(1) || '0.0'}⭐
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Votos</span>
            <span className="stat-value">{player.stats?.ratingsCount || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;