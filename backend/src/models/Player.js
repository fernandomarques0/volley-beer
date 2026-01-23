import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String },
  gender: { type: String, enum: ['M', 'F'], required: true },
  stats: {
    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

playerSchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('Player', playerSchema);