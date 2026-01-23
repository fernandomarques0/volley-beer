import { useEffect, useState } from 'react';
import PlayerCard from '../PlayerCard/PlayerCard';
import Loading from '../Loading/Loading';
import Alert from '../Alert/Alert';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Ranking = ({ limit }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/players`);
      if (!response.ok) throw new Error('Erro ao carregar jogadores');
      
      const data = await response.json();
      
      // Ordenar por média de avaliação
      const sorted = data.sort((a, b) => {
        const avgA = a.stats?.avgRating || 0;
        const avgB = b.stats?.avgRating || 0;
        return avgB - avgA;
      });

      setPlayers(limit ? sorted.slice(0, limit) : sorted);
    } catch (err) {
      console.error('Erro ao buscar jogadores:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="ranking">
      <div className="ranking-table">
        <div className="ranking-header">
          <div className="rank-col">#</div>
          <div className="player-col">Jogador</div>
          <div className="stat-col">Jogos</div>
          <div className="stat-col">V/D</div>
          <div className="stat-col">Pontos</div>
          <div className="stat-col">Assist.</div>
          <div className="stat-col">Bloq.</div>
        </div>

        {players.map((player, index) => (
          <div key={player._id || player.id} className="ranking-row">
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
            <div className="stat-col">
              <span className="stat-value">{player.stats?.points || 0}</span>
            </div>
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
          <p>Nenhum jogador encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Ranking;