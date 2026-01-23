import { useState, useEffect } from 'react';
import { fetchPlayers as getPlayers, submitRating } from '../services/api';

const useRatings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlayers();
      setPlayers(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const ratePlayer = async (playerId, value, rater) => {
    try {
      await submitRating(playerId, value, rater);
      await fetchPlayers(); // Recarrega os jogadores após votar
    } catch (err) {
      setError(err.message);
      console.error('Error rating player:', err);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return {
    players,
    loading,
    error,
    fetchPlayers,
    ratePlayer,
  };
};

export default useRatings;