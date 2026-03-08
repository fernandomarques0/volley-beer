import { useState } from 'react';
import useRatings from '../../hooks/useRatings';
import PlayerAvatar from '../../components/PlayerAvatar/PlayerAvatar';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import './styles.css';
import { FaTrash } from "react-icons/fa";


const Draw = () => {
  const { players, loading, error } = useRatings();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playersPerTeam, setPlayersPerTeam] = useState(3);
  const [numberOfTeams, setNumberOfTeams] = useState(3);
  const [teams, setTeams] = useState([]);
  const [playersOut, setPlayersOut] = useState([]);
  const [message, setMessage] = useState(null);

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      return [...prev, playerId];
    });
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${playerName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/players/${playerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir jogador');
      }

      setMessage({ type: 'success', text: 'Jogador excluído com sucesso!' });
      // Remove o jogador da lista de selecionados se estiver lá
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
      // Recarrega a página para atualizar a lista
      window.location.reload();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao excluir jogador' });
    }
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map(p => p.id));
    }
  };

  const handlePlayersPerTeamChange = (value) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 10) {
      setPlayersPerTeam(num);
    } else if (value === '') {
      setPlayersPerTeam('');
    }
  };

  const handleNumberOfTeamsChange = (value) => {
    const num = parseInt(value) || 0;
    if (num >= 2 && num <= 6) {
      setNumberOfTeams(num);
    } else if (value === '') {
      setNumberOfTeams('');
    }
  };

  const calculateTeamAverage = (teamPlayers) => {
    const sum = teamPlayers.reduce((acc, player) => acc + (player.stats?.avgRating || 0), 0);
    return (sum / teamPlayers.length).toFixed(2);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createMockPlayers = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${Date.now()}-${i}`,
    name: `Jogador Aleatório ${i + 1}`,
    stats: {
      avgRating: 3
    },
    isMock: true
  }));
};

  const distributeTeams = (shuffle = false) => {
    const ppt = parseInt(playersPerTeam) || 0;
    const not = parseInt(numberOfTeams) || 0;
    
    if (ppt < 1 || not < 2) {
      setMessage({
        type: 'error',
        text: 'Configure corretamente o número de jogadores por time (mínimo 1) e número de times (mínimo 2)'
      });
      return;
    }

    const totalPlayers = ppt * not;
    
    let selected = players.filter(p => selectedPlayers.includes(p.id));

    // Se faltar jogador, completa com mock
    if (selected.length < totalPlayers) {
      const missing = totalPlayers - selected.length;
      const mockPlayers = createMockPlayers(missing);
      selected = [...selected, ...mockPlayers];
    }
    
    // Embaralhar completamente os jogadores primeiro
    selected = shuffleArray(selected);
    
    // Ordenar por rating (do maior para o menor)
    selected.sort((a, b) => (b.stats?.avgRating || 0) - (a.stats?.avgRating || 0));

    // Dividir jogadores em grupos (rounds) baseado no número de jogadores por time
    // Cada grupo terá 'numberOfTeams' jogadores
    const rounds = [];
    for (let i = 0; i < ppt; i++) {
      const roundPlayers = selected.slice(i * not, (i + 1) * not);
      // Embaralhar jogadores dentro de cada round para adicionar aleatoriedade
      rounds.push(shuffleArray(roundPlayers));
    }

    // Criar times vazios
    const newTeams = Array.from({ length: not }, () => []);

    // Distribuir usando snake draft por round
    rounds.forEach((roundPlayers, roundIndex) => {
      const isReverseRound = roundIndex % 2 === 1;
      
      roundPlayers.forEach((player, playerIndex) => {
        const teamIndex = isReverseRound 
          ? (not - 1 - playerIndex) 
          : playerIndex;
        
        if (newTeams[teamIndex]) {
          newTeams[teamIndex].push(player);
        }
      });
    });

    // Embaralhar ordem dos jogadores dentro de cada time
    newTeams.forEach(team => {
      for (let i = team.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [team[i], team[j]] = [team[j], team[i]];
      }
    });

    // Embaralhar ordem dos times
    const shuffledTeams = shuffleArray(newTeams);

    setTeams(shuffledTeams);
    setMessage({ type: 'success', text: shuffle ? 'Times sorteados novamente!' : 'Times sorteados com sucesso!' });
  };

  const redrawTeams = () => {
    setMessage(null);
    distributeTeams(true);
  };

  const resetDraw = () => {
    setTeams([]);
    setSelectedPlayers([]);
    setMessage(null);
  };

  if (loading) {
    return <Loading />;
  }

  const totalPlayersNeeded = (parseInt(playersPerTeam) || 0) * (parseInt(numberOfTeams) || 0);

  return (
    <div className="draw-page">
      <div className="container">
        <div className="draw-header">
          <h1>🎲 Sorteio de Times</h1>
          <p>Selecione os jogadores e configure o sorteio</p>
        </div>

        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}
        {error && <Alert type="error" message={error} />}

        {teams.length === 0 ? (
          <>
            <div className="draw-config">
              <div className="config-card">
                <label className="config-label">Jogadores por Time</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={playersPerTeam}
                  onChange={(e) => handlePlayersPerTeamChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                      setPlayersPerTeam(3);
                    }
                  }}
                  className="config-input"
                  placeholder="3"
                />
              </div>
              <div className="config-card">
                <label className="config-label">Número de Times</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={numberOfTeams}
                  onChange={(e) => handleNumberOfTeamsChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseInt(e.target.value) < 2) {
                      setNumberOfTeams(3);
                    }
                  }}
                  className="config-input"
                  placeholder="3"
                />
              </div>
              <div className="config-card total-info">
                <div className="total-label">Total Necessário</div>
                <div className="total-value">{totalPlayersNeeded}</div>
              </div>
            </div>

            <div className="players-selection">
              <div className="selection-header">
                <h2>Selecionar Jogadores ({selectedPlayers.length}/{players.length})</h2>
                <button className="btn btn-secondary" onClick={handleSelectAll}>
                  {selectedPlayers.length === players.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              </div>

              <div className="players-grid">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`player-select-card ${selectedPlayers.includes(player.id) ? 'selected' : ''}`}
                  >
                    <div 
                      className="player-select-content"
                      onClick={() => handlePlayerToggle(player.id)}
                    >
                      <div className="player-checkbox">
                        {selectedPlayers.includes(player.id) && '✓'}
                      </div>
                      <div className="player-select-info">
                        <div className="player-select-name">{player.name}</div>
                      </div>
                    </div>
                    <button
                      className="btn-delete-player"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlayer(player.id, player.name);
                      }}
                      title="Excluir jogador"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="draw-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() => distributeTeams(false)}
                disabled={selectedPlayers.length === 0 || totalPlayersNeeded === 0}
              >
                🎲 Sortear Times
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="teams-result">
              {teams.map((team, index) => (
                <div key={index} className="team-card">
                  <div className="team-header">
                    <h3>Time {index + 1}</h3>
                    <div className="team-average">
                      Média: <strong>{calculateTeamAverage(team)}⭐</strong>
                      <span className="team-count"> ({team.length} jogadores)</span>
                    </div>
                  </div>
                  <div className="team-players">
                    {team.map(player => (
                      <div key={player.id} className="team-player">
                        <div className="team-player-info">
                          {player.name} {player.isMock ? "(Aleatório)" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="draw-actions">
              <button className="btn btn-primary btn-large" onClick={redrawTeams}>
                🔄 Refazer sorteio
              </button>
              <button className="btn btn-secondary btn-large" onClick={resetDraw}>
                ↩️ Novo sorteio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Draw; 