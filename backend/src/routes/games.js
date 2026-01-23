import { Router } from 'express';
import Game from '../models/Game.js';
import Player from '../models/Player.js';
import mongoose from 'mongoose';

const router = Router();

// Listar todos os jogos
router.get('/', async (req, res, next) => {
  try {
    const games = await Game.find()
      .populate('team1.players', 'name nickname')
      .populate('team2.players', 'name nickname')
      .populate('team1.stats.playerId', 'name nickname')
      .populate('team2.stats.playerId', 'name nickname')
      .sort({ date: -1 });
    res.json(games);
  } catch (e) {
    next(e);
  }
});

// Buscar jogo por ID
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const game = await Game.findById(req.params.id)
      .populate('team1.players', 'name nickname')
      .populate('team2.players', 'name nickname')
      .populate('team1.stats.playerId', 'name nickname')
      .populate('team2.stats.playerId', 'name nickname');

    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    res.json(game);
  } catch (e) {
    next(e);
  }
});

// Criar novo jogo
router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { team1, team2 } = req.body;

    // Validações
    if (!team1 || !team2) {
      return res.status(400).json({ message: 'team1 e team2 são obrigatórios' });
    }

    if (!Array.isArray(team1.players) || !Array.isArray(team2.players)) {
      return res.status(400).json({ message: 'players deve ser um array' });
    }

    if (team1.score === undefined || team2.score === undefined) {
      return res.status(400).json({ message: 'Placar é obrigatório' });
    }

    // Determinar vencedor
    const winner = team1.score > team2.score ? 'team1' : 'team2';

    // Criar jogo
    const game = new Game({
      team1: {
        players: team1.players,
        score: team1.score,
        stats: team1.stats || [],
      },
      team2: {
        players: team2.players,
        score: team2.score,
        stats: team2.stats || [],
      },
      winner,
      notes: req.body.notes,
    });

    await game.save({ session });

    // Atualizar estatísticas dos jogadores
    const allPlayers = [
      ...team1.players.map(id => ({ id, team: 'team1' })),
      ...team2.players.map(id => ({ id, team: 'team2' })),
    ];

    for (const { id, team } of allPlayers) {
      const player = await Player.findById(id).session(session);
      if (!player) continue;

      const isWinner = team === winner;
      const teamStats = team === 'team1' ? team1.stats : team2.stats;
      const playerStats = teamStats?.find(s => s.playerId.toString() === id.toString());

      player.stats.gamesPlayed += 1;
      if (isWinner) {
        player.stats.wins += 1;
      } else {
        player.stats.losses += 1;
      }

      if (playerStats) {
        player.stats.points += playerStats.points || 0;
        player.stats.assists += playerStats.assists || 0;
        player.stats.blocks += playerStats.blocks || 0;
      }

      await player.save({ session });
    }

    await session.commitTransaction();

    const populatedGame = await Game.findById(game._id)
      .populate('team1.players', 'name nickname')
      .populate('team2.players', 'name nickname')
      .populate('team1.stats.playerId', 'name nickname')
      .populate('team2.stats.playerId', 'name nickname');

    res.status(201).json(populatedGame);
  } catch (e) {
    await session.abortTransaction();
    console.error('Erro ao criar jogo:', e);
    next(e);
  } finally {
    session.endSession();
  }
});

// Deletar jogo
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    res.json({ message: 'Jogo deletado com sucesso' });
  } catch (e) {
    next(e);
  }
});

export default router;