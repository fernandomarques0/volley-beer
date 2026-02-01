import Ranking from '../../components/Ranking/Ranking';
import './styles.css';

const Rankings = () => {
  return (
    <div className="rankings-page">
      <div className="container">
        <div className="page-header">
          <h1>🏆 Player rankings</h1>
          <p>Classificação completa dos jogadores</p>
        </div>
        
        <Ranking fullMode={true} />
      </div>
    </div>
  );
};

export default Rankings;