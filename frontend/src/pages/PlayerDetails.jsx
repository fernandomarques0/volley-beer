import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlayers, fetchPlayerRatings, fetchAverageRating } from '../services/api';
import PlayerCard from '../components/PlayerCard';
import VotingInterface from '../components/VotingInterface';

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const players = await fetchPlayers();
        const foundPlayer = players.find(p => p._id === id || p.id === id);
        const playerRatings = await fetchPlayerRatings(id);
        const avgData = await fetchAverageRating(id);
        
        setPlayer({ ...foundPlayer, avgRating: avgData.avg, ratingsCount: avgData.count });
        setRatings(playerRatings);
      } catch (err) {
        setError('Failed to fetch player details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!player) return <div>No player found</div>;

  return (
    <div>
      <h1>{player.name}</h1>
      <PlayerCard player={player} />
      <VotingInterface playerId={id} />
    </div>
  );
};

export default PlayerDetails;