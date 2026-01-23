import mongoose from 'mongoose';
import Player from './models/Player.js';
import playersData from '../data/players.json' with { type: 'json' };

const MONGODB_URI = 'mongodb+srv://fernandmrqs0_db_user:pv3PnJzJBJlex18I@volley-beer-cluster.ncvsyvc.mongodb.net/?appName=volley-beer-cluster';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB');

    await Player.deleteMany({});
    console.log('Jogadores antigos removidos');

    const players = playersData.map(p => ({
      id: p.id,
      name: p.name,
      nickname: p.nickname,
      gender: p.gender,
      stats: { avgRating: 0, ratingsCount: 0 }
    }));

    await Player.insertMany(players);
    console.log(`✅ ${players.length} jogadores importados!`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

seed();