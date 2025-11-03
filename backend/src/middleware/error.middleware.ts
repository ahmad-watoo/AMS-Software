import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { logger } from '@/config/logger';
import { sendError } from '@/utils/response';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known AppError
  if (err instanceof AppError) {
    sendError(res, err.name, err.message, err.statusCode);
    return;
  }

  // Handle unknown errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  sendError(res, 'INTERNAL_ERROR', message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'NOT_FOUND', `Route ${req.originalUrl} not found`, 404);
};

