import Header from '../components/Header';
import Ranking from '../components/Ranking';
import useRatings from '../hooks/useRatings';

const Home = () => {
  const { players } = useRatings();

  return (
    <div>
      <Header />
      <h1>Welcome to the Volleyball Player Rating System</h1>
      <h2>Player Rankings</h2>
      <Ranking players={players} />
    </div>
  );
};

export default Home;