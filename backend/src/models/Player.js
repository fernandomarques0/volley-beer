import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['M', 'F'], required: true },
  stats: {
    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);