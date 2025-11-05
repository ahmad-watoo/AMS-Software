/**
 * API Response Utilities
 * 
 * This module provides standardized response formatting functions for consistent API responses.
 * All API responses follow a standard structure with success flag, data, and optional error information.
 * 
 * @module utils/response
 */

import { Response } from 'express';

/**
 * Standard API Response Interface
 * 
 * All API responses follow this structure:
 * - success: Boolean indicating if the request was successful
 * - data: The actual response data (present on success)
 * - error: Error information (present on failure)
 * - message: Optional success message
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

/**
 * Send a successful API response.
 * 
 * This function formats and sends a successful response with optional success message.
 * 
 * @template T - Type of the data being returned
 * @param {Response} res - Express response object
 * @param {T} data - Data to send in the response
 * @param {string} [message] - Optional success message
 * @param {number} [statusCode=200] - HTTP status code (default: 200)
 * 
 * @example
 * sendSuccess(res, { id: 1, name: 'John' }, 'User retrieved successfully');
 */
export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  // Add message if provided
  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
};

/**
 * Send an error API response.
 * 
 * This function formats and sends an error response with error code, message, and optional details.
 * 
 * @param {Response} res - Express response object
 * @param {string} code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @param {string} message - Human-readable error message
 * @param {number} [statusCode=500] - HTTP status code (default: 500)
 * @param {unknown} [details] - Optional additional error details (e.g., validation errors)
 * 
 * @example
 * sendError(res, 'VALIDATION_ERROR', 'Invalid email format', 400, { field: 'email' });
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      // Include details if provided
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
};
