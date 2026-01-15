import { Router } from 'express';
import { PlayersStore, RatingsStore } from '../store.js';

const router = Router();
const normEmail = (s) => String(s).trim().toLowerCase();

router.post('/', async (req, res, next) => {
  try {
    const { playerId, value, rater } = req.body;
    if (!playerId || value === undefined || !rater) {
      return res.status(400).json({ message: 'playerId, value e rater (email) são obrigatórios' });
    }

    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 10) {
      return res.status(400).json({ message: 'value deve ser 0–10' });
    }

    const email = normEmail(rater);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'email inválido' });
    }

    const players = await PlayersStore.getAll();
    const player = players.find((p) => p._id === playerId);
    if (!player) return res.status(404).json({ message: 'jogador não encontrado' });

    const ratings = await RatingsStore.getAll();
    const idx = ratings.findIndex((r) => r.playerId === playerId && r.rater === email);
    const now = new Date().toISOString();

    if (idx >= 0) {
      ratings[idx].value = num;
      ratings[idx].updatedAt = now;
    } else {
      ratings.push({ playerId, value: num, rater: email, createdAt: now, updatedAt: now });
    }
    await RatingsStore.saveAll(ratings);

    // recomputar stats do jogador
    const rs = ratings.filter((r) => r.playerId === playerId);
    const avg = rs.length ? Number((rs.reduce((s, r) => s + r.value, 0) / rs.length).toFixed(2)) : 0;
    player.stats.avgRating = avg;
    player.stats.ratingsCount = rs.length;
    player.updatedAt = now;
    await PlayersStore.saveAll(players);

    return res.status(idx >= 0 ? 200 : 201).json({
      playerId,
      rater: email,
      value: num,
      stats: { avgRating: avg, ratingsCount: rs.length },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/player/:id/avg', async (req, res, next) => {
  try {
    const ratings = await RatingsStore.getAll();
    const rs = ratings.filter((r) => r.playerId === req.params.id);
    const avg = rs.length ? Number((rs.reduce((s, r) => s + r.value, 0) / rs.length).toFixed(2)) : 0;
    res.json({ avg, count: rs.length });
  } catch (e) {
    next(e);
  }
});

router.get('/player/:id', async (req, res, next) => {
  try {
    const ratings = await RatingsStore.getAll();
    const rs = ratings
      .filter((r) => r.playerId === req.params.id)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    res.json(rs);
  } catch (e) {
    next(e);
  }
});

export default router;