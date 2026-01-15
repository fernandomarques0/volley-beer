const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

function shouldLog(level) {
  return levels[level] >= levels[LOG_LEVEL];
}

export const logger = {
  debug: (msg, data = {}) => shouldLog('debug') && console.debug('[DEBUG]', msg, data),
  info: (msg, data = {}) => shouldLog('info') && console.info('[INFO]', msg, data),
  warn: (msg, data = {}) => shouldLog('warn') && console.warn('[WARN]', msg, data),
  error: (msg, data = {}) => shouldLog('error') && console.error('[ERROR]', msg, data),
};