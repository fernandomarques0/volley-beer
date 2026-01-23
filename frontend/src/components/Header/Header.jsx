import { Link } from 'react-router-dom';
import './styles.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🏐</span>
            <span className="logo-text">Volley Beer</span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/vote" className="nav-link">Votar</Link>
            <Link to="/rankings" className="nav-link">Rankings</Link>
            <Link to="/draw" className="nav-link">Sorteio</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;