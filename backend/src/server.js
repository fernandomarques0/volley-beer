import express from 'express';
import cors from 'cors';
import { config } from '../config.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ensureDataStore } from './store.js';
import ratings from './routes/ratings.js';
import players from './routes/players.js';

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/players', players);
app.use('/api/ratings', ratings);

app.use(errorHandler);

await ensureDataStore();
app.listen(config.port, () => console.log(`API on http://localhost:${config.port}`));

export default app;