import React from 'react';
import RatingStars from './RatingStars';

const PlayerCard = ({ player, onVote }) => {
  return (
    <div className="player-card">
      <h3>{player.name}</h3>
      <p>Average Rating: {player.stats.avgRating.toFixed(2)}</p>
      <RatingStars
        currentRating={player.stats.avgRating}
        onVote={(value) => onVote(player._id, value)}
      />
    </div>
  );
};

export default PlayerCard;