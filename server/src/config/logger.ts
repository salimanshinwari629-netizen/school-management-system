import pino from 'pino';

import { env } from './env';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  base: { service: 'sms-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
});
