import { createServer } from 'node:http';

import { app } from './app';
import { connectToDatabase, disconnectFromDatabase } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

async function start(): Promise<void> {
  try {
    await connectToDatabase(env.MONGODB_URI);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';

    if (env.NODE_ENV === 'production') {
      logger.fatal({ reason }, 'MongoDB connection failed');
      process.exit(1);
    }
    logger.warn({ reason }, 'MongoDB unavailable — starting in degraded mode (development only)');
  }

  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'SMS API listening');
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutting down');

    server.close(() => {
      void disconnectFromDatabase().finally(() => process.exit(0));
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void start();
