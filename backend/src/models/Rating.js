import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  playerId: { type: String, required: true, index: true },
  value: { type: Number, required: true, min: 0, max: 5 },
  rater: { type: String, required: true, lowercase: true, trim: true},
}, { timestamps: true });

ratingSchema.index({ playerId: 1, rater: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);