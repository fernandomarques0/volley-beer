import { Router } from 'express';
import Player from '../models/Player.js';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const players = await Player.find().sort({ name: 1 });
    res.json(players);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }
    res.json(player);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, nickname, gender, initialRating } = req.body;
    
    if (!name || !gender) {
      return res.status(400).json({ message: 'Nome e gênero são obrigatórios' });
    }

    const playerData = {
      name,
      nickname,
      gender,
      stats: {
        avgRating: initialRating || 0,
        ratingsCount: initialRating ? 1 : 0,
        wins: 0,
        losses: 0,
        points: 0,
        assists: 0,
        blocks: 0,
        gamesPlayed: 0,
      }
    };

    const player = new Player(playerData);
    await player.save();
    res.status(201).json(player);
  } catch (e) {
    next(e);
  }
});

export default router;