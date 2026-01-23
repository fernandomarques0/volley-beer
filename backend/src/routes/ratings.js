import { Router } from 'express';
import Player from '../models/Player.js';
import Rating from '../models/Rating.js';
import mongoose from 'mongoose';

const router = Router();
const normEmail = (s) => String(s).trim().toLowerCase();

const roundToHalf = (num) => {
  return Math.round(num * 2) / 2;
};

// Função auxiliar para recalcular stats de um jogador
async function updatePlayerStats(playerId) {
  const player = await Player.findById(playerId);
  if (!player) return null;

  const ratings = await Rating.find({ playerId });
  const sum = ratings.reduce((s, r) => s + r.value, 0);
  const rawAvg = ratings.length ? sum / ratings.length : 0;
  const avg = roundToHalf(rawAvg);
  
  player.stats.avgRating = avg;
  player.stats.ratingsCount = ratings.length;
  await player.save();
  
  return { avgRating: avg, ratingsCount: ratings.length };
}

router.get('/', async (req, res, next) => {
  try {
    const ratings = await Rating.find()
      .populate('playerId', 'name nickname')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ 
      total: await Rating.countDocuments(),
      ratings 
    });
  } catch (e) {
    next(e);
  }
});

router.get('/check/:email', async (req, res, next) => {
  try {
    const email = normEmail(req.params.email);
    const rating = await Rating.findOne({ rater: email });
    res.json({ hasVoted: !!rating });
  } catch (e) {
    next(e);
  }
});

router.post('/batch', async (req, res, next) => {
  try {
    const { ratings: ratingsData, rater } = req.body;
    
    if (!Array.isArray(ratingsData) || !rater) {
      return res.status(400).json({ message: 'ratings (array) e rater (email) são obrigatórios' });
    }

    const email = normEmail(rater);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'email inválido' });
    }

    const results = [];
    const updatedPlayers = new Set();

    for (const { playerId, value } of ratingsData) {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 5 || (num * 2) % 1 !== 0) {
        continue;
      }

      // Validar ObjectId
      if (!mongoose.Types.ObjectId.isValid(playerId)) {
        continue;
      }

      const player = await Player.findById(playerId);
      if (!player) continue;

      await Rating.findOneAndUpdate(
        { playerId: new mongoose.Types.ObjectId(playerId), rater: email },
        { value: num, playerId: new mongoose.Types.ObjectId(playerId), rater: email },
        { upsert: true, new: true }
      );

      updatedPlayers.add(playerId);
      results.push({ playerId, value: num });
    }

    const statsUpdates = [];
    for (const playerId of updatedPlayers) {
      const stats = await updatePlayerStats(playerId);
      if (stats) {
        statsUpdates.push({ playerId, stats });
      }
    }

    return res.status(201).json({
      message: 'Avaliações enviadas com sucesso',
      count: results.length,
      ratings: results,
      statsUpdates
    });
  } catch (e) {
    console.error('Erro no batch:', e);
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { playerId, value, rater } = req.body;
    
    if (!playerId || value === undefined || !rater) {
      return res.status(400).json({ message: 'playerId, value e rater (email) são obrigatórios' });
    }

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: 'playerId inválido' });
    }

    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 5 || (num * 2) % 1 !== 0) {
      return res.status(400).json({ message: 'value deve ser 0–5 com incrementos de 0.5' });
    }

    const email = normEmail(rater);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'email inválido' });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'jogador não encontrado' });
    }

    await Rating.findOneAndUpdate(
      { playerId: new mongoose.Types.ObjectId(playerId), rater: email },
      { value: num, playerId: new mongoose.Types.ObjectId(playerId), rater: email },
      { upsert: true, new: true }
    );

    const stats = await updatePlayerStats(playerId);

    return res.status(200).json({
      playerId,
      rater: email,
      value: num,
      stats
    });
  } catch (e) {
    next(e);
  }
});

router.get('/player/:id/avg', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const ratings = await Rating.find({ playerId: req.params.id });
    const sum = ratings.reduce((s, r) => s + r.value, 0);
    const rawAvg = ratings.length ? sum / ratings.length : 0;
    const avg = roundToHalf(rawAvg);
    res.json({ avg, count: ratings.length });
  } catch (e) {
    next(e);
  }
});

router.get('/player/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const ratings = await Rating.find({ playerId: req.params.id }).sort({ updatedAt: -1 });
    res.json(ratings);
  } catch (e) {
    next(e);
  }
});

export default router;