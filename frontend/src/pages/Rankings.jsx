import React, { useEffect, useState } from 'react';
import { getPlayers } from '../services/api';
import PlayerCard from '../components/PlayerCard';
import './Rankings.css'; // Optional: Add styles for the rankings page

const Rankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rankings">
      <h1>Player Rankings</h1>
      <div className="player-list">
        {players
          .sort((a, b) => b.stats.avgRating - a.stats.avgRating)
          .map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
      </div>
    </div>
  );
};

export default Rankings;