import React from 'react';
import './styles.css';

const Alert = ({ type = 'error', message, onClose }) => {
  const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icon}</span>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;