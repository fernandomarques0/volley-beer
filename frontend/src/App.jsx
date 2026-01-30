import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Vote from './pages/Vote/Vote';
import Ranking from './pages/Ranking/Ranking';
import Draw from './pages/Draw/Draw';
import PlayerDetails from './pages/PlayerDetails';
import NewGame from './pages/Game/Game';
import AddPlayer from './pages/AddPlayer/AddPlayer';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/rankings" element={<Ranking />} />
        <Route path="/draw" element={<Draw />} />
        <Route path="/player/:id" element={<PlayerDetails />} />
        <Route path="/games/new" element={<NewGame />} />
        <Route path="/players/new" element={<AddPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;