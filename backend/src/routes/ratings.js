import { Router } from 'express';
import { PlayersStore, RatingsStore } from '../store.js';

const router = Router();
const normEmail = (s) => String(s).trim().toLowerCase();

// Função para arredondar para o 0.5 mais próximo
const roundToHalf = (num) => {
  return Math.round(num * 2) / 2;
};

// Verificar se email já votou
router.get('/check/:email', async (req, res, next) => {
  try {
    const email = normEmail(req.params.email);
    const ratings = await RatingsStore.getAll();
    const hasVoted = ratings.some(r => r.rater === email);
    res.json({ hasVoted });
  } catch (e) {
    next(e);
  }
});

// Endpoint para enviar múltiplas avaliações de uma vez
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

    const players = await PlayersStore.getAll();
    const ratings = await RatingsStore.getAll();
    const now = new Date().toISOString();
    const results = [];

    // Processar todas as avaliações
    for (const { playerId, value } of ratingsData) {
      const num = Number(value);
      // Aceitar valores de 0 a 5 com incrementos de 0.5
      if (Number.isNaN(num) || num < 0 || num > 5 || (num * 2) % 1 !== 0) {
        continue; // Pula avaliações inválidas
      }

      const player = players.find((p) => (p._id || p.id) === playerId);
      if (!player) continue;

      const idx = ratings.findIndex((r) => r.playerId === playerId && r.rater === email);

      if (idx >= 0) {
        ratings[idx].value = num;
        ratings[idx].updatedAt = now;
      } else {
        ratings.push({ playerId, value: num, rater: email, createdAt: now, updatedAt: now });
      }

      results.push({ playerId, value: num });
    }

    // Salvar todas as avaliações de uma vez
    await RatingsStore.saveAll(ratings);

    // Recomputar stats de todos os jogadores afetados
    for (const { playerId } of results) {
      const player = players.find((p) => (p._id || p.id) === playerId);
      const rs = ratings.filter((r) => r.playerId === playerId);
      const sum = rs.reduce((s, r) => s + r.value, 0);
      const rawAvg = rs.length ? sum / rs.length : 0;
      const avg = roundToHalf(rawAvg);
      
      if (!player.stats) player.stats = {};
      player.stats.avgRating = avg;
      player.stats.ratingsCount = rs.length;
      player.updatedAt = now;
    }

    // Salvar todos os jogadores de uma vez
    await PlayersStore.saveAll(players);

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
    // Aceitar valores de 0 a 5 com incrementos de 0.5
    if (Number.isNaN(num) || num < 0 || num > 5 || (num * 2) % 1 !== 0) {
      return res.status(400).json({ message: 'value deve ser 0–5 com incrementos de 0.5' });
    }

    const email = normEmail(rater);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'email inválido' });
    }

    const players = await PlayersStore.getAll();
    const player = players.find((p) => (p._id || p.id) === playerId);
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
    const sum = rs.reduce((s, r) => s + r.value, 0);
    const rawAvg = rs.length ? sum / rs.length : 0;
    const avg = roundToHalf(rawAvg);
    
    if (!player.stats) player.stats = {};
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
    const sum = rs.reduce((s, r) => s + r.value, 0);
    const rawAvg = rs.length ? sum / rs.length : 0;
    const avg = roundToHalf(rawAvg);
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