import React, { useState, useEffect } from 'react';
import { useRatings } from '../hooks/useRatings';
import { VotingInterface } from '../components/VotingInterface';
import { PlayerCard } from '../components/PlayerCard';

const Vote = () => {
  const { players, fetchPlayers } = useRatings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      await fetchPlayers();
      setLoading(false);
    };
    loadPlayers();
  }, [fetchPlayers]);

  if (loading) {
    return <div>Loading players...</div>;
  }

  return (
    <div>
      <h1>Vote for Your Favorite Players</h1>
      {players.map(player => (
        <div key={player._id}>
          <PlayerCard player={player} />
          <VotingInterface playerId={player._id} />
        </div>
      ))}
    </div>
  );
};

export default Vote;