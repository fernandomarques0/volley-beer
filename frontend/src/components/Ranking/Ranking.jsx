import { useEffect, useState } from 'react';
import PlayerCard from '../PlayerCard/PlayerCard';
import Loading from '../Loading/Loading';
import Alert from '../Alert/Alert';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Ranking = ({ limit, fullMode = false }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('wins');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthsList = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchPlayers();
  }, [filterPeriod, selectedMonth, selectedYear]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/players`;
      const params = new URLSearchParams();
      
      if (filterPeriod === 'week') {
        params.append('period', 'week');
      } else if (filterPeriod === 'month') {
        if (selectedMonth && selectedYear) {
          params.append('period', 'month');
          params.append('month', selectedMonth);
          params.append('year', selectedYear);
        } else {
          // Se mensal mas sem mês/ano selecionado, não aplica filtro
          setError('Selecione um mês e ano para filtrar');
          setLoading(false);
          return;
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar jogadores');
      
      const data = await response.json();
      
      // Filtrar jogadores que jogaram no período (se houver filtro)
      let filteredData = data;
      if (filterPeriod !== 'all') {
        filteredData = data.filter(player => (player.stats?.gamesPlayed || 0) > 0);
      }
      
      const sorted = sortPlayers(filteredData, sortBy);
      setPlayers(limit ? sorted.slice(0, limit) : sorted);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar ranking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortPlayers = (data, criteria) => {
    return [...data].sort((a, b) => {
      const getValue = (player, type) => {
        switch (type) {
          case 'points': return player.stats?.points || 0;
          case 'assists': return player.stats?.assists || 0;
          case 'blocks': return player.stats?.blocks || 0;
          case 'pointsPerGame': return parseFloat(calculatePointsPerGame(player));
          case 'winRate': return parseFloat(calculateWinRate(player));
          default: return player.stats?.wins || 0;
        }
      };

      const valA = getValue(a, criteria);
      const valB = getValue(b, criteria);

      if (valB !== valA) return valB - valA;

      const tiebreakers = ['wins', 'points', 'assists', 'blocks'];
      for (const tiebreaker of tiebreakers) {
        const tieA = getValue(a, tiebreaker);
        const tieB = getValue(b, tiebreaker);
        if (tieB !== tieA) return tieB - tieA;
      }

      return 0;
    });
  };

  const calculatePointsPerGame = (player) => {
    const games = player.stats?.gamesPlayed || 0;
    const points = player.stats?.points || 0;
    return games > 0 ? (points / games).toFixed(1) : '0.0';
  };

  const calculateWinRate = (player) => {
    const games = player.stats?.gamesPlayed || 0;
    const wins = player.stats?.wins || 0;
    return games > 0 ? ((wins / games) * 100).toFixed(0) : '0';
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const sorted = sortPlayers([...players], newSort);
    setPlayers(limit ? sorted.slice(0, limit) : sorted);
  };

  const handleFilterChange = (period) => {
    setFilterPeriod(period);
    if (period !== 'month') {
      setSelectedMonth('');
    } else if (period === 'month' && !selectedMonth) {
      // Definir mês atual como padrão
      setSelectedMonth(new Date().getMonth() + 1);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="ranking">
      {fullMode && (
        <div className="ranking-controls">
          <div className="ranking-filters">
            <button
              className={`filter-btn ${filterPeriod === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todo período
            </button>
            <button
              className={`filter-btn ${filterPeriod === 'month' ? 'active' : ''}`}
              onClick={() => handleFilterChange('month')}
            >
              Mensal
            </button>
            <button
              className={`filter-btn ${filterPeriod === 'week' ? 'active' : ''}`}
              onClick={() => handleFilterChange('week')}
            >
              Última semana
            </button>
          </div>

          {filterPeriod === 'month' && (
            <div className="month-filter">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-select"
              >
                <option value="">Selecione o mês</option>
                {monthsList.map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="year-select"
              >
                {yearsList.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ranking-sort">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="wins">Vitórias</option>
              <option value="points">Pontos</option>
              <option value="assists">Assistências</option>
              <option value="blocks">Bloqueios</option>
              <option value="pointsPerGame">Pts/Jogo</option>
              <option value="winRate">Aproveitamento</option>
            </select>
          </div>
        </div>
      )}

      <div className="ranking-table">
        <div className={`ranking-header ${fullMode ? 'full-mode' : ''}`}>
          <div className="rank-col">#</div>
          <div className="player-col">Jogador</div>
          <div className="stat-col">Jogos</div>
          <div className="stat-col">V/D</div>
          {fullMode && <div className="stat-col">%</div>}
          <div className="stat-col">Pts</div>
          {fullMode && <div className="stat-col">PPG</div>}
          <div className="stat-col">Ass.</div>
          <div className="stat-col">Blq.</div>
        </div>

        {players.map((player, index) => (
          <div key={player._id || player.id} className={`ranking-row ${fullMode ? 'full-mode' : ''}`}>
            <div className="rank-col">
              <span className="rank-number">{index + 1}</span>
            </div>
            <div className="player-col">
              <PlayerCard player={player} showStats={false} compact={true} />
            </div>
            <div className="stat-col">
              <span className="stat-value">{player.stats?.gamesPlayed || 0}</span>
            </div>
            <div className="stat-col">
              <span className="stat-value wins">{player.stats?.wins || 0}</span>
              <span className="stat-separator">/</span>
              <span className="stat-value losses">{player.stats?.losses || 0}</span>
            </div>
            {fullMode && (
              <div className="stat-col">
                <span className="stat-value highlight">{calculateWinRate(player)}%</span>
              </div>
            )}
            <div className="stat-col">
              <span className="stat-value">{player.stats?.points || 0}</span>
            </div>
            {fullMode && (
              <div className="stat-col">
                <span className="stat-value">{calculatePointsPerGame(player)}</span>
              </div>
            )}
            <div className="stat-col">
              <span className="stat-value">{player.stats?.assists || 0}</span>
            </div>
            <div className="stat-col">
              <span className="stat-value">{player.stats?.blocks || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="no-players">
          <p>Nenhum jogo encontrado neste período</p>
        </div>
      )}
    </div>
  );
};

export default Ranking;