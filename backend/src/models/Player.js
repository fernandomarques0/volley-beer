/**
 * id: int
 * name: string
 * rating: float 
 * jogos: int
 * vitorias: int
 */

import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nickname: { type: String, trim: true },
  active: { type: Boolean, default: true },

  stats: {
    avgRating: { type: Number, default: 0 },      // média 0-10
    ratingsCount: { type: Number, default: 0 },   // total de votos
    games: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PlayerSchema.index({ name: 1 }, { unique: true });

PlayerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Recalcula média e contagem de votos a partir de Ratings
PlayerSchema.statics.recomputeRatingStats = async function (playerId) {
  const { default: Rating } = await import('./Rating.js');

  const agg = await Rating.aggregate([
    { $match: { playerId: new mongoose.Types.ObjectId(playerId) } },
    { $group: { _id: '$playerId', avgRating: { $avg: '$value' }, ratingsCount: { $sum: 1 } } },
  ]);

  const stats = agg[0]
    ? { avgRating: Number(agg[0].avgRating?.toFixed(2)), ratingsCount: agg[0].ratingsCount }
    : { avgRating: 0, ratingsCount: 0 };

  await this.updateOne(
    { _id: playerId },
    { $set: { 'stats.avgRating': stats.avgRating, 'stats.ratingsCount': stats.ratingsCount, updatedAt: new Date() } },
  );

  return stats;
};

export default mongoose.model('Player', PlayerSchema);