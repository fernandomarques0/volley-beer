import { Link } from 'react-router-dom';
import Ranking from '../../components/Ranking';
import './styles.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-actions">
            <Link to="/vote" className="btn btn-primary">
              ⭐ Votar Agora
            </Link>
            <Link to="/rankings" className="btn btn-secondary">
              🏆 Ver Rankings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;