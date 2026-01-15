import mongoose from 'mongoose';
import { logger } from './utils/logger.js';
import { config } from '../config.js';

export async function connectDB() {
  if (!config.mongoUri) throw new Error('Missing MONGODB_URI');
  try {
    mongoose.set('strictQuery', true);
    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error', { error: err.message }));
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    logger.error('Mongo connection failed', { error: err.message });
    throw err;
  }

  // graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed due to SIGINT');
    process.exit(0);
  });
}