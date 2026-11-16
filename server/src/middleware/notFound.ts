import type { RequestHandler } from 'express';

import { AppError } from '../utils/AppError';

/** Wraps the 404 case so responses share the API error envelope. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found`));
};
