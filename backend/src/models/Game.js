import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  points: { type: Number, default: 0, min: 0 },
  assists: { type: Number, default: 0, min: 0 },
  blocks: { type: Number, default: 0, min: 0 },
}, { _id: false });

const gameSchema = new mongoose.Schema({
  team1: {
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }],
    score: { type: Number, required: true, min: 0 },
    stats: [playerStatsSchema],
  },
  team2: {
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }],
    score: { type: Number, required: true, min: 0 },
    stats: [playerStatsSchema],
  },
  winner: { type: String, enum: ['team1', 'team2'], required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true });

gameSchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('Game', gameSchema);