import { Router } from 'express';

import { databaseState, isDatabaseReady } from '../config/db';

export const healthRouter = Router();

/** Liveness: the process can serve requests. */
healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

/** Readiness: dependencies (MongoDB) are usable. */
healthRouter.get('/ready', (_req, res) => {
  const ready = isDatabaseReady();

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'degraded',
    db: databaseState(),
    timestamp: new Date().toISOString(),
  });
});
