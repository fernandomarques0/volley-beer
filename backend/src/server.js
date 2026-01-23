import express from 'express';
import cors from 'cors';
import { config } from '../config.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { connectDB } from './connection.js';
import ratings from './routes/ratings.js';
import players from './routes/players.js';

const app = express();

app.use(cors({ 
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.get('/', (_req, res) => res.json({ message: 'Volley Beer API está rodando!' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/players', players);
app.use('/api/ratings', ratings);

app.use(errorHandler);

// Conectar ao MongoDB
await connectDB();

if (process.env.VERCEL !== '1') {
  app.listen(config.port, () => console.log(`🚀 API rodando em http://localhost:${config.port}`));
}

export default app;