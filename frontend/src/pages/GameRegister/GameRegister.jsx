import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CACHE_KEY = 'game-register-cache';

const GameRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('team1');

  // Tentar recuperar do cache primeiro
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Erro ao recuperar cache:', error);
    }
    return null;
  };

  const cachedData = getCachedData();
  const { team1Players, team2Players } = location.state || cachedData || { team1Players: [], team2Players: [] };

  const [team1Score, setTeam1Score] = useState(cachedData?.team1Score || '');
  const [team2Score, setTeam2Score] = useState(cachedData?.team2Score || '');
  const [team1Stats, setTeam1Stats] = useState(cachedData?.team1Stats || {});
  const [team2Stats, setTeam2Stats] = useState(cachedData?.team2Stats || {});
  const [notes, setNotes] = useState(cachedData?.notes || '');

  // Salvar no cache sempre que houver mudanças
  useEffect(() => {
    if (team1Players.length > 0 && team2Players.length > 0) {
      const dataToCache = {
        team1Players,
        team2Players,
        team1Score,
        team2Score,
        team1Stats,
        team2Stats,
        notes,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
    }
  }, [team1Players, team2Players, team1Score, team2Score, team1Stats, team2Stats, notes]);

  useEffect(() => {
    if (!team1Players?.length || !team2Players?.length) {
      navigate('/game/setup');
      return;
    }
    fetchPlayers();
  }, [team1Players, team2Players, navigate]);

  useEffect(() => {
    // Só inicializa se ainda não tem stats no cache
    if (Object.keys(team1Stats).length === 0) {
      const initialStats = {};
      team1Players.forEach(id => {
        initialStats[id] = { points: '', assists: '', blocks: '', defense: '' };
      });
      setTeam1Stats(initialStats);
    }

    if (Object.keys(team2Stats).length === 0) {
      const initialStats2 = {};
      team2Players.forEach(id => {
        initialStats2[id] = { points: '', assists: '', blocks: '', defense: '' };
      });
      setTeam2Stats(initialStats2);
    }
  }, [team1Players, team2Players]);

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

  const updatePlayerStat = (team, playerId, stat, value) => {
    if (team === 1) {
      setTeam1Stats({
        ...team1Stats,
        [playerId]: { ...team1Stats[playerId], [stat]: value }
      });
    } else {
      setTeam2Stats({
        ...team2Stats,
        [playerId]: { ...team2Stats[playerId], [stat]: value }
      });
    }
  };

  const incrementStat = (team, playerId, stat) => {
    const currentValue = team === 1 
      ? parseInt(team1Stats[playerId]?.[stat]) || 0
      : parseInt(team2Stats[playerId]?.[stat]) || 0;
    
    updatePlayerStat(team, playerId, stat, (currentValue + 1).toString());
  };

  const decrementStat = (team, playerId, stat) => {
    const currentValue = team === 1 
      ? parseInt(team1Stats[playerId]?.[stat]) || 0
      : parseInt(team2Stats[playerId]?.[stat]) || 0;
    
    if (currentValue > 0) {
      updatePlayerStat(team, playerId, stat, (currentValue - 1).toString());
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (team1Score === '' || team2Score === '') {
      setMessage({ type: 'error', text: 'Informe o placar do jogo' });
      return;
    }

    setIsSubmitting(true);

    try {
      const gameData = {
        team1: {
          players: team1Players,
          score: parseInt(team1Score),
          stats: team1Players.map(id => ({
            playerId: id,
            points: parseInt(team1Stats[id]?.points) || 0,
            assists: parseInt(team1Stats[id]?.assists) || 0,
            blocks: parseInt(team1Stats[id]?.blocks) || 0,
            defense: parseInt(team1Stats[id]?.defense) || 0,
          })),
        },
        team2: {
          players: team2Players,
          score: parseInt(team2Score),
          stats: team2Players.map(id => ({
            playerId: id,
            points: parseInt(team2Stats[id]?.points) || 0,
            assists: parseInt(team2Stats[id]?.assists) || 0,
            blocks: parseInt(team2Stats[id]?.blocks) || 0,
            defense: parseInt(team2Stats[id]?.defense) || 0,
          })),
        },
        notes,
      };

      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar jogo');
      }

      // Limpar cache após sucesso
      clearCache();
      
      setMessage({ type: 'success', text: 'Jogo cadastrado com sucesso!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao cadastrar jogo. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Deseja realmente cancelar? Os dados serão perdidos.')) {
      clearCache();
      navigate('/game/setup');
    }
  };

  if (loading) return <Loading />;

  const getPlayer = (playerId) => players.find(p => (p._id || p.id) === playerId);

  const currentTeamPlayers = activeTab === 'team1' ? team1Players : team2Players;
  const currentTeamStats = activeTab === 'team1' ? team1Stats : team2Stats;
  const currentTeam = activeTab === 'team1' ? 1 : 2;

  return (
    <div className="game-register-page">
      <div className="container">
        <div className="page-header-compact">
          <button 
            type="button" 
            className="back-button"
            onClick={handleCancel}
          >
            ←
          </button>
          <h1>Registrar Jogo</h1>
          <div className="score-summary">
            <div className="score-box">
              <label>Time 1</label>
              <input
                type="number"
                className="score-input-compact"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                min="0"
                placeholder="0"
                required
              />
            </div>
            <span className="vs-text">×</span>
            <div className="score-box">
              <label>Time 2</label>
              <input
                type="number"
                className="score-input-compact"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                min="0"
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <form onSubmit={handleSubmit} className="game-form-compact">
          {/* Tabs de Times */}
          <div className="team-tabs">
            <button
              type="button"
              className={`team-tab ${activeTab === 'team1' ? 'active' : ''}`}
              onClick={() => setActiveTab('team1')}
            >
              <span className="tab-label">Time 1</span>
              <span className="tab-subtitle">{team1Players.length} jogadores</span>
            </button>
            <button
              type="button"
              className={`team-tab ${activeTab === 'team2' ? 'active' : ''}`}
              onClick={() => setActiveTab('team2')}
            >
              <span className="tab-label">Time 2</span>
              <span className="tab-subtitle">{team2Players.length} jogadores</span>
            </button>
          </div>

          {/* Estatísticas dos jogadores do time ativo */}
          <div className="stats-section">
            {currentTeamPlayers.map(playerId => {
              const player = getPlayer(playerId);
              if (!player) return null;
              
              return (
                <div key={playerId} className="player-stat-card">
                  <div className="player-stat-header">
                    <h4>{player.name}</h4>
                  </div>
                  
                  <div className="stat-controls-row">
                    <div className="stat-control-item">
                      <label>Pontos</label>
                      <div className="stat-control-compact">
                        <button
                          type="button"
                          className="stat-btn-compact minus"
                          onClick={() => decrementStat(currentTeam, playerId, 'points')}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={currentTeamStats[playerId]?.points ?? ''}
                          onChange={(e) => updatePlayerStat(currentTeam, playerId, 'points', e.target.value)}
                          className="stat-value"
                        />
                        <button
                          type="button"
                          className="stat-btn-compact plus"
                          onClick={() => incrementStat(currentTeam, playerId, 'points')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="stat-control-item">
                      <label>Assist.</label>
                      <div className="stat-control-compact">
                        <button
                          type="button"
                          className="stat-btn-compact minus"
                          onClick={() => decrementStat(currentTeam, playerId, 'assists')}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={currentTeamStats[playerId]?.assists ?? ''}
                          onChange={(e) => updatePlayerStat(currentTeam, playerId, 'assists', e.target.value)}
                          className="stat-value"
                        />
                        <button
                          type="button"
                          className="stat-btn-compact plus"
                          onClick={() => incrementStat(currentTeam, playerId, 'assists')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="stat-control-item">
                      <label>Bloq.</label>
                      <div className="stat-control-compact">
                        <button
                          type="button"
                          className="stat-btn-compact minus"
                          onClick={() => decrementStat(currentTeam, playerId, 'blocks')}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={currentTeamStats[playerId]?.blocks ?? ''}
                          onChange={(e) => updatePlayerStat(currentTeam, playerId, 'blocks', e.target.value)}
                          className="stat-value"
                        />
                        <button
                          type="button"
                          className="stat-btn-compact plus"
                          onClick={() => incrementStat(currentTeam, playerId, 'blocks')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="stat-control-item">
                      <label>Def.</label>
                      <div className="stat-control-compact">
                        <button
                          type="button"
                          className="stat-btn-compact minus"
                          onClick={() => decrementStat(currentTeam, playerId, 'defense')}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={currentTeamStats[playerId]?.defense ?? ''}
                          onChange={(e) => updatePlayerStat(currentTeam, playerId, 'defense', e.target.value)}
                          className="stat-value"
                        />
                        <button
                          type="button"
                          className="stat-btn-compact plus"
                          onClick={() => incrementStat(currentTeam, playerId, 'defense')}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="form-actions-fixed">
            <button 
              type="submit" 
              className="btn btn-primary btn-large" 
              disabled={isSubmitting || team1Score === '' || team2Score === ''}
            >
              {isSubmitting ? 'Salvando...' : '✅ Salvar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameRegister;