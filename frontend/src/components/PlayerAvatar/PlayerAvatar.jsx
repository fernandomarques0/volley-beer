import React from 'react';
import './styles.css';

const PlayerAvatar = ({ player, size = 'medium' }) => {
  const isMale = player.gender === 'M';
  
  return (
    <div className={`player-avatar-icon ${size} ${isMale ? 'male' : 'female'}`}>
      {isMale ? (
        <svg viewBox="0 0 24 24" fill="currentColor">
          {/* Cabeça */}
          <circle cx="12" cy="6" r="3.5" />
          {/* Corpo */}
          <path d="M12 11c-3.5 0-6 2-6 4.5V20h12v-4.5c0-2.5-2.5-4.5-6-4.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor">
          {/* Cabeça */}
          <circle cx="12" cy="6" r="3.5" />
          {/* Cabelo/Laço */}
          <path d="M8.5 4.5c0-1 .5-2 1.5-2.5M15.5 4.5c0-1-.5-2-1.5-2.5" stroke="currentColor" strokeWidth="1" fill="none"/>
          {/* Vestido */}
          <path d="M12 11c-3.5 0-6 2-6 4.5L4 20h16l-2-4.5c0-2.5-2.5-4.5-6-4.5z" />
        </svg>
      )}
    </div>
  );
};

export default PlayerAvatar;