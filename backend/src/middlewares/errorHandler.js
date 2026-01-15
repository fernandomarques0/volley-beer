import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    method: req.method,
    url: req.originalUrl,
    status,
    message,
    stack: err.stack,
  });

  res.status(status).json({ message });
}