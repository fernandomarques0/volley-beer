import React, { useState } from 'react';
import RatingStars from '../RatingStars/RatingStars';
import Alert from '../Alert/Alert';
import { submitRating } from '../../services/api';
import './styles.css';

const VotingInterface = ({ playerId, raterEmail }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma avaliação' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRating(playerId, rating, raterEmail);
      setMessage({ type: 'success', text: 'Avaliação enviada com sucesso!' });
      setRating(0);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar avaliação. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="voting-interface">
      {message && (
        <Alert 
          type={message.type} 
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}
      <form onSubmit={handleSubmit} className="voting-form">
        <div className="form-group">
          <label className="form-label">Sua avaliação</label>
          <RatingStars rating={rating} onRatingChange={handleRatingChange} />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
        </button>
      </form>
    </div>
  );
};

export default VotingInterface;