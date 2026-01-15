import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { submitRating } from '../services/api';

const VotingInterface = ({ playerId }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitRating(playerId, rating);
      setMessage('Rating submitted successfully!');
      setRating(0); // Reset rating after submission
    } catch (error) {
      setMessage('Failed to submit rating. Please try again.');
    }
  };

  return (
    <div>
      <h3>Rate this Player</h3>
      <RatingStars rating={rating} onRatingChange={handleRatingChange} />
      <button onClick={handleSubmit}>Submit Rating</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VotingInterface;