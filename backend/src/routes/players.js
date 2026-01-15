import { Router } from 'express';
import crypto from 'crypto';
import { PlayersStore, RatingsStore } from '../store.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const players = await PlayersStore.getAll();
    res.json(players);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, nickname } = req.body;
    if (!name) return res.status(400).json({ message: 'name é obrigatório' });
    const players = await PlayersStore.getAll();
    if (players.some(p => p.name.toLowerCase() === String(name).toLowerCase())) {
      return res.status(409).json({ message: 'já existe jogador com esse nome' });
    }
    const now = new Date().toISOString();
    const player = {
      _id: crypto.randomUUID(),
      name: String(name).trim(),
      nickname: nickname ? String(nickname).trim() : undefined,
      active: true,
      stats: { avgRating: 0, ratingsCount: 0, games: 0, wins: 0, losses: 0 },
      createdAt: now,
      updatedAt: now,
    };
    players.push(player);
    await PlayersStore.saveAll(players);
    res.status(201).json(player);
  } catch (e) { next(e); }
});

// recomputa média a partir dos ratings
router.post('/:id/recompute', async (req, res, next) => {
  try {
    const playerId = req.params.id;
    const players = await PlayersStore.getAll();
    const ratings = await RatingsStore.getAll();
    const p = players.find(pl => pl._id === playerId);
    if (!p) return res.status(404).json({ message: 'jogador não encontrado' });
    const rs = ratings.filter(r => r.playerId === playerId);
    const avg = rs.length ? Number((rs.reduce((s, r) => s + r.value, 0) / rs.length).toFixed(2)) : 0;
    p.stats.avgRating = avg;
    p.stats.ratingsCount = rs.length;
    p.updatedAt = new Date().toISOString();
    await PlayersStore.saveAll(players);
    res.json(p.stats);
  } catch (e) { next(e); }
});

export default router;