import { Link } from 'react-router-dom';
import Ranking from '../../components/Ranking/Ranking';
import './styles.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">          
          <div className="hero-actions">
            <Link to="/vote" className="btn btn-secondary">
              ⭐ Votar agora
            </Link>
            <Link to="/games/new" className="btn btn-secondary">
              ⚽ Cadastrar jogo
            </Link>
            <Link to="/draw" className="btn btn-secondary">
              🎲 Sorteio
            </Link>
          </div>
        </div>
      </section>

      <section className="ranking-preview">
        <div className="container">
          <h2>🏆 Top Jogadores</h2>
          <Ranking limit={5} />
          <div className="see-more">
            <Link to="/rankings" className="btn btn-secondary">
              Ver ranking completo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;