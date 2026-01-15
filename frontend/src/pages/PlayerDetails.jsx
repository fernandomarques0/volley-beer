import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlayerDetails } from '../services/api';
import PlayerCard from '../components/PlayerCard';
import VotingInterface from '../components/VotingInterface';

const PlayerDetails = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const data = await getPlayerDetails(playerId);
        setPlayer(data);
      } catch (err) {
        setError('Failed to fetch player details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [playerId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!player) return <div>No player found</div>;

  return (
    <div>
      <h1>{player.name}</h1>
      <PlayerCard player={player} />
      <VotingInterface playerId={playerId} />
    </div>
  );
};

export default PlayerDetails;