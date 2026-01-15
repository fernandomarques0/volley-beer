import { Router } from 'express';
import playersRoutes from './players.js';
import ratingsRoutes from './ratings.js';

const router = Router();

router.use('/players', playersRoutes);
router.use('/ratings', ratingsRoutes);

export default router;