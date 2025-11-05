/**
 * Error Handling Middleware
 * 
 * This module provides Express middleware for handling errors consistently across the application.
 * It distinguishes between operational errors (AppError instances) and programming errors,
 * providing appropriate responses and logging.
 * 
 * @module middleware/error.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { logger } from '@/config/logger';
import { sendError } from '@/utils/response';

/**
 * Global Error Handler Middleware
 * 
 * This middleware catches all errors thrown in the application and formats them into
 * consistent API responses. It should be registered as the last middleware in the Express app.
 * 
 * Error Handling Flow:
 * 1. Log the error with full details (stack trace, path, method)
 * 2. Check if it's an AppError (operational error)
 * 3. If AppError, send formatted error response with appropriate status code
 * 4. If unknown error, send generic error message (detailed in dev, generic in production)
 * 
 * @param {Error | AppError} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function (required for error middleware signature)
 * 
 * @example
 * // In app.ts
 * app.use(errorHandler); // Must be last middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error with full context for debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known operational errors (AppError instances)
  if (err instanceof AppError) {
    sendError(res, err.name, err.message, err.statusCode);
    return;
  }

  // Handle unknown errors (programming errors, unexpected errors)
  const statusCode = 500;
  
  // In production, don't expose internal error details
  // In development, show full error message for debugging
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  sendError(res, 'INTERNAL_ERROR', message, statusCode);
};

/**
 * 404 Not Found Handler
 * 
 * This middleware catches all unmatched routes and returns a 404 error.
 * It should be registered after all route handlers but before the error handler.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @example
 * // In app.ts
 * app.use(notFoundHandler); // After all routes, before errorHandler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'NOT_FOUND', `Route ${req.originalUrl} not found`, 404);
};
