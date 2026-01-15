import 'dotenv-defaults/config.js';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  dataDir: process.env.DATA_DIR || 'data', // pasta para JSON
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};