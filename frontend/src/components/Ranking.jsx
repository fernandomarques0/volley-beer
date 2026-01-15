import React, { useEffect, useState } from 'react';
import { fetchPlayers } from '../services/api';
import PlayerCard from './PlayerCard';

const Ranking = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const getPlayers = async () => {
      const data = await fetchPlayers();
      setPlayers(data);
    };

    getPlayers();
  }, []);

  const sortedPlayers = players.sort((a, b) => b.stats.avgRating - a.stats.avgRating);

  return (
    <div>
      <h2>Player Rankings</h2>
      <div>
        {sortedPlayers.map(player => (
          <PlayerCard key={player._id} player={player} />
        ))}
      </div>
    </div>
  );
};

export default Ranking;