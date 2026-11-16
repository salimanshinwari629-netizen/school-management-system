import { API_VERSION, APP_NAME } from '@sms/shared';
import { Router } from 'express';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    data: {
      name: APP_NAME,
      apiVersion: API_VERSION,
      status: 'foundation',
      modules: [],
    },
  });
});
