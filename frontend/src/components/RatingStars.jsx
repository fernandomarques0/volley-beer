import React from 'react';

const RatingStars = ({ rating, onRatingChange }) => {
  const handleClick = (value) => {
    onRatingChange(value);
  };

  return (
    <div className="rating-stars">
      {[...Array(5)].map((_, index) => {
        const value = index + 1;
        return (
          <span
            key={value}
            className={`star ${value <= rating ? 'filled' : ''}`}
            onClick={() => handleClick(value)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;