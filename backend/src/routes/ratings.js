import { Router } from 'express';
import Player from '../models/Player.js';
import Rating from '../models/Rating.js';

const router = Router();
const normEmail = (s) => String(s).trim().toLowerCase();

const roundToHalf = (num) => {
  return Math.round(num * 2) / 2;
};

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

    for (const { playerId, value } of ratingsData) {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 5 || (num * 2) % 1 !== 0) {
        continue;
      }

      const player = await Player.findOne({ id: playerId });
      if (!player) continue;

      await Rating.findOneAndUpdate(
        { playerId, rater: email },
        { value, playerId, rater: email },
        { upsert: true, new: true }
      );

      // Recalcular média do jogador
      const ratings = await Rating.find({ playerId });
      const sum = ratings.reduce((s, r) => s + r.value, 0);
      const rawAvg = ratings.length ? sum / ratings.length : 0;
      const avg = roundToHalf(rawAvg);
      
      player.stats.avgRating = avg;
      player.stats.ratingsCount = ratings.length;
      await player.save();

      results.push({ playerId, value: num });
    }

    return res.status(201).json({
      message: 'Avaliações enviadas com sucesso',
      count: results.length,
      ratings: results,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { playerId, value, rater } = req.body;
    if (!playerId || value === undefined || !rater) {
      return res.status(400).json({ message: 'playerId, value e rater (email) são obrigatórios' });
    }

    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 5 || (num * 2) % 1 !== 0) {
      return res.status(400).json({ message: 'value deve ser 0–5 com incrementos de 0.5' });
    }

    const email = normEmail(rater);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'email inválido' });
    }

    const player = await Player.findOne({ id: playerId });
    if (!player) return res.status(404).json({ message: 'jogador não encontrado' });

    const rating = await Rating.findOneAndUpdate(
      { playerId, rater: email },
      { value, playerId, rater: email },
      { upsert: true, new: true }
    );

    // Recalcular média
    const ratings = await Rating.find({ playerId });
    const sum = ratings.reduce((s, r) => s + r.value, 0);
    const rawAvg = ratings.length ? sum / ratings.length : 0;
    const avg = roundToHalf(rawAvg);
    
    player.stats.avgRating = avg;
    player.stats.ratingsCount = ratings.length;
    await player.save();

    return res.status(200).json({
      playerId,
      rater: email,
      value: num,
      stats: { avgRating: avg, ratingsCount: ratings.length },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/player/:id/avg', async (req, res, next) => {
  try {
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
    const ratings = await Rating.find({ playerId: req.params.id }).sort({ updatedAt: -1 });
    res.json(ratings);
  } catch (e) {
    next(e);
  }
});

export default router;