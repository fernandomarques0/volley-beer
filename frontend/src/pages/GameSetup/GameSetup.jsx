import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GameSetup = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [activeTab, setActiveTab] = useState('team1');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/players`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar jogadores' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerToggle = (playerId) => {
    if (activeTab === 'team1') {
      if (team1Players.includes(playerId)) {
        setTeam1Players(team1Players.filter(id => id !== playerId));
      } else {
        setTeam1Players([...team1Players, playerId]);
      }
    } else {
      if (team2Players.includes(playerId)) {
        setTeam2Players(team2Players.filter(id => id !== playerId));
      } else {
        setTeam2Players([...team2Players, playerId]);
      }
    }
  };

  const handleStartGame = () => {
    if (team1Players.length === 0 || team2Players.length === 0) {
      setMessage({ type: 'error', text: 'Selecione jogadores para ambos os times' });
      return;
    }

    navigate('/game/register', {
      state: {
        team1Players,
        team2Players,
      }
    });
  };

  const isPlayerSelected = (playerId) => {
    if (activeTab === 'team1') {
      return team1Players.includes(playerId);
    } else {
      return team2Players.includes(playerId);
    }
  };

  const isPlayerInOtherTeam = (playerId) => {
    if (activeTab === 'team1') {
      return team2Players.includes(playerId);
    } else {
      return team1Players.includes(playerId);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="game-setup-page">
      <div className="container">
        <div className="page-header-compact">
          <h1>Novo Jogo</h1>
          <p className="header-subtitle">Selecione os jogadores de cada time</p>
        </div>

        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div className="team-tabs">
          <button
            className={`team-tab ${activeTab === 'team1' ? 'active' : ''}`}
            onClick={() => setActiveTab('team1')}
          >
            <span className="tab-label">Time 1</span>
            <span className="tab-count">{team1Players.length}</span>
          </button>
          <button
            className={`team-tab ${activeTab === 'team2' ? 'active' : ''}`}
            onClick={() => setActiveTab('team2')}
          >
            <span className="tab-label">Time 2</span>
            <span className="tab-count">{team2Players.length}</span>
          </button>
        </div>

        <div className="players-list">
          {players.map(player => {
            const playerId = player._id || player.id;
            const isSelected = isPlayerSelected(playerId);
            const isInOtherTeam = isPlayerInOtherTeam(playerId);
            
            return (
              <div
                key={playerId}
                className={`player-item ${isSelected ? 'selected' : ''} ${isInOtherTeam ? 'disabled' : ''}`}
                onClick={() => !isInOtherTeam && handlePlayerToggle(playerId)}
              >
                <div className="player-checkbox">
                  {isSelected && '✓'}
                </div>
                <div className="player-name">{player.name}</div>
                {isInOtherTeam && (
                  <div className="other-team-badge">
                    {activeTab === 'team1' ? '🔴' : '🔵'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="form-actions-fixed">
          <button 
            type="button" 
            className="btn btn-primary btn-large" 
            onClick={handleStartGame}
            disabled={team1Players.length === 0 || team2Players.length === 0}
          >
            Iniciar Jogo ({team1Players.length + team2Players.length} jogadores)
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;