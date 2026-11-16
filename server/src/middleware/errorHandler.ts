import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

function requestIdOf(req: Parameters<ErrorRequestHandler>[0]): string | undefined {
  const id = (req as { id?: unknown }).id;
  return typeof id === 'string' ? id : undefined;
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = requestIdOf(req);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
        ...(requestId === undefined ? {} : { requestId }),
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
        ...(requestId === undefined ? {} : { requestId }),
      },
    });
    return;
  }

  logger.error({ err: error, requestId }, 'Unhandled request error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      ...(requestId === undefined ? {} : { requestId }),
    },
  });
};
