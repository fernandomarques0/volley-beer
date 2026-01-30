import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert/Alert';
import Loading from '../../components/Loading/Loading';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddPlayer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    initialRating: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório' });
      return;
    }

    if (formData.initialRating && (formData.initialRating < 0 || formData.initialRating > 5)) {
      setMessage({ type: 'error', text: 'A nota deve estar entre 0 e 5' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          gender: 'M', // Valor padrão
          initialRating: formData.initialRating ? parseFloat(formData.initialRating) : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar jogador');
      }

      setMessage({ type: 'success', text: 'Jogador cadastrado com sucesso!' });
      
      setTimeout(() => {
        navigate('/rankings');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao cadastrar jogador' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-player-page">
      <div className="container">
        <div className="page-header">
          <h1>➕ Adicionar Novo Jogador</h1>
          <p>Cadastre um novo jogador no sistema</p>
        </div>

        <div className="form-container">
          {message && <Alert type={message.type} message={message.text} />}

          <form onSubmit={handleSubmit} className="player-form">
            <div className="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Digite o nome do jogador"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="initialRating">Nota Inicial (0-5)</label>
              <input
                type="number"
                id="initialRating"
                name="initialRating"
                value={formData.initialRating}
                onChange={handleChange}
                placeholder="Digite a nota inicial (opcional)"
                min="0"
                max="5"
                step="0.1"
                disabled={loading}
              />
              <small>Deixe em branco se o jogador ainda não tiver nota</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/rankings')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <Loading /> : 'Cadastrar Jogador'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlayer;