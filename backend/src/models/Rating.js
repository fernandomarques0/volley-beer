import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
  value: { type: Number, min: 0, max: 10, required: true },
  matchDate: { type: Date, required: true },
  rater: { type: String, lowercase: true, trim: true}, // identificador opcional do avaliador (email, nome, etc.)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Garante 1 voto por avaliador/jogador/data quando rater é informado
RatingSchema.index({ playerId: 1, matchDate: 1, rater: 1 }, { unique: true, sparse: true });

RatingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Rating', RatingSchema);