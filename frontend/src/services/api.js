import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchPlayers = async () => {
  try {
    const response = await axios.get(`${API_URL}/players`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching players');
  }
};

export const submitRating = async (playerId, value, rater) => {
  try {
    const response = await axios.post(`${API_URL}/ratings`, {
      playerId,
      value,
      rater,
    });
    return response.data;
  } catch (error) {
    throw new Error('Error submitting rating');
  }
};

export const submitBatchRatings = async (ratings, rater) => {
  try {
    const response = await axios.post(`${API_URL}/ratings/batch`, {
      ratings,
      rater,
    });
    return response.data;
  } catch (error) {
    throw new Error('Error submitting batch ratings');
  }
};

export const fetchPlayerRatings = async (playerId) => {
  try {
    const response = await axios.get(`${API_URL}/ratings/player/${playerId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching player ratings');
  }
};

export const fetchAverageRating = async (playerId) => {
  try {
    const response = await axios.get(`${API_URL}/ratings/player/${playerId}/avg`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching average rating');
  }
};