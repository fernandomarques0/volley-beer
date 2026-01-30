import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NewGame = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [team1Stats, setTeam1Stats] = useState({});
  const [team2Stats, setTeam2Stats] = useState({});
  const [notes, setNotes] = useState('');

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

  const handleTeam1PlayerToggle = (playerId) => {
    if (team1Players.includes(playerId)) {
      setTeam1Players(team1Players.filter(id => id !== playerId));
      const newStats = { ...team1Stats };
      delete newStats[playerId];
      setTeam1Stats(newStats);
    } else {
      setTeam1Players([...team1Players, playerId]);
      setTeam1Stats({ ...team1Stats, [playerId]: { points: '', assists: '', blocks: '' } });
    }
  };

  const handleTeam2PlayerToggle = (playerId) => {
    if (team2Players.includes(playerId)) {
      setTeam2Players(team2Players.filter(id => id !== playerId));
      const newStats = { ...team2Stats };
      delete newStats[playerId];
      setTeam2Stats(newStats);
    } else {
      setTeam2Players([...team2Players, playerId]);
      setTeam2Stats({ ...team2Stats, [playerId]: { points: '', assists: '', blocks: '' } });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (team1Players.length === 0 || team2Players.length === 0) {
      setMessage({ type: 'error', text: 'Selecione jogadores para ambos os times' });
      return;
    }

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

      setMessage({ type: 'success', text: 'Jogo cadastrado com sucesso!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao cadastrar jogo. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="new-game-page">
      <div className="container">
        <div className="page-header">
          <h1>⚽ Cadastrar Novo Jogo</h1>
          <p>Selecione os jogadores e registre as estatísticas</p>
        </div>

        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <form onSubmit={handleSubmit} className="game-form">
          <div className="teams-container">
            {/* Time 1 */}
            <div className="team-section">
              <h2>🔵 Time 1</h2>
              
              <div className="form-group">
                <label>Placar</label>
                <input
                  type="number"
                  className="form-input"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="players-selection">
                <h3>Selecione os Jogadores</h3>
                {players.length === 0 ? (
                  <p>Nenhum jogador disponível</p>
                ) : (
                  players.map(player => (
                    <div key={player._id || player.id} className="player-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={team1Players.includes(player._id || player.id)}
                          onChange={() => handleTeam1PlayerToggle(player._id || player.id)}
                        />
                        <span>{player.name || 'Sem nome'}</span>
                      </label>
                    </div>
                  ))
                )}
              </div>

              {team1Players.length > 0 && (
                <div className="player-stats">
                  <h3>Estatísticas</h3>
                  <div className="stats-grid">
                    {team1Players.map(playerId => {
                      const player = players.find(p => (p._id || p.id) === playerId);
                      const playerName = player?.name || player?.nickname || 'Jogador';
                      
                      return (
                        <div key={playerId} className="stat-row">
                          <h4>{playerName}</h4>
                          <div className="stat-inputs">
                            <div className="stat-input">
                              <label>Pontos</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={team1Stats[playerId]?.points ?? ''}
                                onChange={(e) => updatePlayerStat(1, playerId, 'points', e.target.value)}
                              />
                            </div>
                            <div className="stat-input">
                              <label>Assistências</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={team1Stats[playerId]?.assists ?? ''}
                                onChange={(e) => updatePlayerStat(1, playerId, 'assists', e.target.value)}
                              />
                            </div>
                            <div className="stat-input">
                              <label>Bloqueios</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={team1Stats[playerId]?.blocks ?? ''}
                                onChange={(e) => updatePlayerStat(1, playerId, 'blocks', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Time 2 */}
            <div className="team-section">
              <h2>🔴 Time 2</h2>
              
              <div className="form-group">
                <label>Placar</label>
                <input
                  type="number"
                  className="form-input"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="players-selection">
                <h3>Selecione os Jogadores</h3>
                {players.map(player => {
                  const playerId = player._id || player.id;
                  const playerName = player.name || player.nickname || 'Sem nome';
                  
                  return (
                    <div key={playerId} className="player-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={team2Players.includes(playerId)}
                          onChange={() => handleTeam2PlayerToggle(playerId)}
                          disabled={team1Players.includes(playerId)}
                        />
                        <span>{playerName}</span>
                      </label>
                    </div>
                  );
                })}
              </div>

              {team2Players.length > 0 && (
                <div className="player-stats">
                  <h3>Estatísticas</h3>
                  <div className="stats-grid">
                    {team2Players.map(playerId => {
                      const player = players.find(p => (p._id || p.id) === playerId);
                      const playerName = player?.name || player?.nickname || 'Jogador';
                      
                      return (
                        <div key={playerId} className="stat-row">
                          <h4>{playerName}</h4>
                          <div className="stat-inputs">
                            <div className="stat-input">
                              <label>Pontos</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={team2Stats[playerId]?.points ?? ''}
                                onChange={(e) => updatePlayerStat(2, playerId, 'points', e.target.value)}
                              />
                            </div>
                            <div className="stat-input">
                              <label>Assistências</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={team2Stats[playerId]?.assists ?? ''}
                                onChange={(e) => updatePlayerStat(2, playerId, 'assists', e.target.value)}
                              />
                            </div>
                            <div className="stat-input">
                              <label>Bloqueios</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={team2Stats[playerId]?.blocks ?? ''}
                                onChange={(e) => updatePlayerStat(2, playerId, 'blocks', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Observações (opcional)</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Adicione observações sobre o jogo..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : '✅ Cadastrar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGame;