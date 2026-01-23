import { useState } from 'react';
import useRatings from '../../hooks/useRatings';
import PlayerAvatar from '../../components/PlayerAvatar/PlayerAvatar';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import './styles.css';

const Draw = () => {
  const { players, loading, error } = useRatings();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playersPerTeam, setPlayersPerTeam] = useState(3);
  const [numberOfTeams, setNumberOfTeams] = useState(3);
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState(null);

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      return [...prev, playerId];
    });
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map(p => p.id));
    }
  };

  const calculateTeamAverage = (teamPlayers) => {
    const sum = teamPlayers.reduce((acc, player) => acc + (player.stats?.avgRating || 0), 0);
    return (sum / teamPlayers.length).toFixed(2);
  };

  // Função para embaralhar array (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const distributeTeams = (shuffle = false) => {
    const totalPlayers = playersPerTeam * numberOfTeams;
    
    if (selectedPlayers.length < totalPlayers) {
      setMessage({
        type: 'error',
        text: `Você precisa selecionar pelo menos ${totalPlayers} jogadores (${playersPerTeam} por time × ${numberOfTeams} times)`
      });
      return;
    }

    if (selectedPlayers.length > totalPlayers) {
      setMessage({
        type: 'error',
        text: `Você selecionou ${selectedPlayers.length} jogadores, mas precisa de exatamente ${totalPlayers} (${playersPerTeam} por time × ${numberOfTeams} times)`
      });
      return;
    }

    // Pegar jogadores selecionados
    let selected = players.filter(p => selectedPlayers.includes(p.id));
    
    // Se for um refazer sorteio, embaralhar antes de ordenar
    if (shuffle) {
      selected = shuffleArray(selected);
    }
    
    // Ordenar por rating (do maior para o menor)
    selected.sort((a, b) => (b.stats?.avgRating || 0) - (a.stats?.avgRating || 0));

    const newTeams = Array.from({ length: numberOfTeams }, () => []);

    let currentRound = 0;
    
    for (let i = 0; i < selected.length; i++) {
      const player = selected[i];
      const roundInCycle = currentRound % numberOfTeams;
      const isReversing = Math.floor(currentRound / numberOfTeams) % 2 === 1;
      const teamIndex = isReversing ? (numberOfTeams - 1 - roundInCycle) : roundInCycle;
      
      newTeams[teamIndex].push(player);
      currentRound++;
    }

    const allCorrect = newTeams.every(team => team.length === playersPerTeam);
    
    if (!allCorrect) {
      console.error('Erro na distribuição:', newTeams.map(t => t.length));
      setMessage({
        type: 'error',
        text: 'Erro ao distribuir times. Tente novamente.'
      });
      return;
    }

    setTeams(newTeams);
    setMessage({ type: 'success', text: shuffle ? 'Times sorteados novamente!' : 'Times sorteados com sucesso!' });
  };

  const redrawTeams = () => {
    setMessage(null);
    distributeTeams(true); // Passa true para embaralhar
  };

  const resetDraw = () => {
    setTeams([]);
    setSelectedPlayers([]);
    setMessage(null);
  };

  if (loading) {
    return <Loading />;
  }

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
                  onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                  className="config-input"
                />
              </div>
              <div className="config-card">
                <label className="config-label">Número de Times</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(Number(e.target.value))}
                  className="config-input"
                />
              </div>
              <div className="config-card total-info">
                <div className="total-label">Total de Jogadores Necessários</div>
                <div className="total-value">{playersPerTeam * numberOfTeams}</div>
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
                    onClick={() => handlePlayerToggle(player.id)}
                  >
                    <div className="player-checkbox">
                      {selectedPlayers.includes(player.id) && '✓'}
                    </div>
                    <PlayerAvatar player={player} size="medium" />
                    <div className="player-select-info">
                      <div className="player-select-name">{player.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="draw-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() => distributeTeams(false)}
                disabled={selectedPlayers.length === 0}
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
                        <PlayerAvatar player={player} size="medium" />
                        <div className="team-player-info">
                          <div className="team-player-name">{player.name}</div>
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