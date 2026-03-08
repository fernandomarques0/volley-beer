import { Router } from 'express';
import Player from '../models/Player.js';
import Game from '../models/Game.js';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { period, month, year } = req.query;
    
    // Construir filtro de data
    let dateFilter = {};
    
    if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { date: { $gte: oneWeekAgo } };
    } else if (period === 'month' && month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }
    
    const players = await Player.find();
    
    // Se não há filtro de data, retorna estatísticas normais
    if (Object.keys(dateFilter).length === 0) {
      return res.json(players);
    }
    
    // Buscar jogos do período filtrado
    const games = await Game.find(dateFilter);
    
    // Calcular estatísticas para o período filtrado
    const playersWithFilteredStats = players.map(player => {
      const playerId = player._id.toString();
      
      let wins = 0;
      let losses = 0;
      let points = 0;
      let assists = 0;
      let blocks = 0;
      let gamesPlayed = 0;
      let defense = 0;
      
      games.forEach(game => {
        // Verificar Time 1
        const isInTeam1 = game.team1.players.some(p => p.toString() === playerId);
        if (isInTeam1) {
          gamesPlayed++;
          if (game.team1.score > game.team2.score) wins++;
          else losses++;
          
          const playerStats = game.team1.stats.find(s => s.playerId.toString() === playerId);
          if (playerStats) {
            points += playerStats.points || 0;
            assists += playerStats.assists || 0;
            blocks += playerStats.blocks || 0;
            defense += playerStats.defense || 0;
          }
        }
        
        // Verificar Time 2
        const isInTeam2 = game.team2.players.some(p => p.toString() === playerId);
        if (isInTeam2) {
          gamesPlayed++;
          if (game.team2.score > game.team1.score) wins++;
          else losses++;
          
          const playerStats = game.team2.stats.find(s => s.playerId.toString() === playerId);
          if (playerStats) {
            points += playerStats.points || 0;
            assists += playerStats.assists || 0;
            blocks += playerStats.blocks || 0;
            defense += playerStats.defense || 0;
          }
        }
      });
      
      return {
        ...player.toObject(),
        stats: {
          wins,
          losses,
          points,
          assists,
          blocks,
          defense,
          gamesPlayed
        }
      };
    });
    
    res.json(playersWithFilteredStats);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({ message: 'Erro ao buscar jogadores', error: error.message });
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
        defense: 0,
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

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }
    
    res.json({ message: 'Jogador excluído com sucesso', player });
  } catch (e) {
    next(e);
  }
});

export default router;