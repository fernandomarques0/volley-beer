import React from 'react';
import './styles.css';

const RatingStars = ({ rating, onRatingChange }) => {
  const handleClick = (value, isHalf) => {
    const finalValue = isHalf ? value - 0.5 : value;
    onRatingChange(finalValue);
  };

  const renderStar = (starNumber) => {
    const isFull = rating >= starNumber;
    const isHalf = rating >= starNumber - 0.5 && rating < starNumber;

    return (
      <span key={starNumber} className="star-container">
        <span
          className={`star-half left ${isHalf || isFull ? 'filled' : ''}`}
          onClick={() => handleClick(starNumber, true)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick(starNumber, true);
            }
          }}
        >
          ★
        </span>
        <span
          className={`star-half right ${isFull ? 'filled' : ''}`}
          onClick={() => handleClick(starNumber, false)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick(starNumber, false);
            }
          }}
        >
          ★
        </span>
      </span>
    );
  };

  return (
    <div className="rating-stars">
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      <div className="rating-value">{rating.toFixed(1)}</div>
    </div>
  );
};

export default RatingStars;