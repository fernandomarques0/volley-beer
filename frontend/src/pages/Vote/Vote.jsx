import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRatings from '../../hooks/useRatings';
import PlayerCard from '../../components/PlayerCard/PlayerCard';
import RatingStars from '../../components/RatingStars/RatingStars';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import { submitBatchRatings } from '../../services/api';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Vote = () => {
  const { players, loading, error } = useRatings();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch(`${API_URL}/ratings/check/${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.hasVoted) {
        setMessage({ 
          type: 'error', 
          text: 'Este email já foi utilizado para votação. Cada pessoa pode votar apenas uma vez.' 
        });
        return;
      }
      
      setEmailSubmitted(true);
      setMessage(null);
    } catch (err) {
      console.error('Erro ao verificar email:', err);
      setEmailSubmitted(true);
    }
  };

  const handleRatingChange = (playerId, value) => {
    setRatings(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  const handleSubmitAll = async () => {
    const hasRatings = Object.values(ratings).some(rating => rating > 0);
    
    if (!hasRatings) {
      setMessage({ type: 'error', text: 'Por favor, avalie pelo menos um jogador' });
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingsArray = Object.entries(ratings)
        .filter(([_, value]) => value > 0)
        .map(([playerId, value]) => ({ playerId, value }));
            
      await submitBatchRatings(ratingsArray, email);
      
      setMessage({ type: 'success', text: 'Avaliações enviadas com sucesso! Redirecionando...' });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      setMessage({ type: 'error', text: 'Erro ao enviar avaliações. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (isSubmitting) {
    return (
      <div className="vote-page">
        <div className="container">
          <Loading message="Enviando suas avaliações..." />
        </div>
      </div>
    );
  }

  if (!emailSubmitted) {
    return (
      <div className="vote-page">
        <div className="container">
          <div className="email-prompt">
            <h1>⭐ Vote nos Jogadores</h1>
            <p>Por favor, insira seu email para começar a votação</p>
            {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}
            <form onSubmit={handleEmailSubmit} className="email-form">
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                Começar votação
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <div className="container">
        <div className="vote-header">
          <h1>⭐ Vote nos Jogadores</h1>
          <p>Avalie o desempenho de cada jogador de 0 a 5 estrelas</p>
          <p className="voter-email">Votando como: <strong>{email}</strong></p>
        </div>
        
        {error && <Alert type="error" message={error} />}
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}
        
        <div className="vote-grid">
          {players.map(player => (
            <div key={player._id || player.id} className="vote-card">
              <PlayerCard player={player} showStats={false} />
              <div className="rating-section">
                <label className="form-label">Sua Avaliação</label>
                <RatingStars 
                  rating={ratings[player._id || player.id] || 0} 
                  onRatingChange={(value) => handleRatingChange(player._id || player.id, value)} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="submit-section">
          <button 
            onClick={handleSubmitAll}
            className="btn btn-primary btn-large"
            disabled={isSubmitting}
          >
            ✅ Enviar todas as avaliações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Vote;