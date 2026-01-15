export const formatRating = (rating) => {
  return Math.max(0, Math.min(5, rating));
};

export const calculateAverageRating = (ratings) => {
  if (ratings.length === 0) return 0;
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return parseFloat((total / ratings.length).toFixed(2));
};

export const getPlayerRank = (playerRatings, playerId) => {
  const sortedRatings = [...playerRatings].sort((a, b) => b.avgRating - a.avgRating);
  const playerIndex = sortedRatings.findIndex(player => player.id === playerId);
  return playerIndex >= 0 ? playerIndex + 1 : null;
};