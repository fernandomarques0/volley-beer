import { useState, useEffect } from 'react';
import { fetchPlayers, submitRating } from '../services/api';

const useRatings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        setPlayers(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  const ratePlayer = async (playerId, rating) => {
    try {
      await submitRating(playerId, rating);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player._id === playerId ? { ...player, ratingsCount: player.ratingsCount + 1 } : player
        )
      );
    } catch (err) {
      setError(err);
    }
  };

  return { players, loading, error, ratePlayer };
};

export default useRatings;