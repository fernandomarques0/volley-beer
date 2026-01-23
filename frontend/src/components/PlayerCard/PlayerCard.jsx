import './styles.css';

const PlayerCard = ({ player, showStats = true, compact = false }) => {
  const isMale = player.gender === 'M';
  const avatar = isMale ? '👨' : '👩';

  return (
    <div className={`player-card ${compact ? 'compact' : ''}`}>
      <div className={`player-avatar ${isMale ? 'male' : 'female'}`}>
        {avatar}
      </div>
      <div className="player-info">
        <div className="player-name">{player.name}</div>
        {showStats && (
          <div className="player-stats">
            <div className="player-games">
              {player.stats?.gamesPlayed || 0} jogos
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;