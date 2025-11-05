/**
 * Custom Error Classes
 * 
 * This module defines custom error classes for consistent error handling across the application.
 * All errors extend AppError which provides a standard structure with status codes and operational flags.
 * 
 * @module utils/errors
 */

/**
 * Base error class for all application errors.
 * 
 * Features:
 * - Standard HTTP status codes
 * - Operational flag to distinguish operational errors from programming errors
 * - Stack trace capture for debugging
 * 
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  /**
   * Creates an instance of AppError.
   * 
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {boolean} [isOperational=true] - Whether this is an operational error (vs programming error)
   */
  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 * 
 * Used when user input fails validation checks.
 * Status Code: 400 (Bad Request)
 * 
 * @class ValidationError
 * @extends AppError
 */
export class ValidationError extends AppError {
  /**
   * Creates an instance of ValidationError.
   * 
   * @param {string} message - Validation error message
   * @param {unknown} [details] - Optional validation details (e.g., field-specific errors)
   */
  constructor(message: string, details?: unknown) {
    super(message, 400);
    this.name = 'ValidationError';
    
    // Include details in message if provided
    if (details) {
      this.message = `${message}: ${JSON.stringify(details)}`;
    }
  }
}

/**
 * Authentication Error
 * 
 * Used when authentication fails (invalid credentials, missing token, etc.).
 * Status Code: 401 (Unauthorized)
 * 
 * @class AuthenticationError
 * @extends AppError
 */
export class AuthenticationError extends AppError {
  /**
   * Creates an instance of AuthenticationError.
   * 
   * @param {string} [message='Authentication failed'] - Authentication error message
   */
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 * 
 * Used when user is authenticated but lacks required permissions.
 * Status Code: 403 (Forbidden)
 * 
 * @class AuthorizationError
 * @extends AppError
 */
export class AuthorizationError extends AppError {
  /**
   * Creates an instance of AuthorizationError.
   * 
   * @param {string} [message='Insufficient permissions'] - Authorization error message
   */
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 * 
 * Used when a requested resource does not exist.
 * Status Code: 404 (Not Found)
 * 
 * @class NotFoundError
 * @extends AppError
 */
export class NotFoundError extends AppError {
  /**
   * Creates an instance of NotFoundError.
   * 
   * @param {string} [resource='Resource'] - Name of the resource that was not found
   */
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 * 
 * Used when a request conflicts with the current state (e.g., duplicate entry, concurrent modification).
 * Status Code: 409 (Conflict)
 * 
 * @class ConflictError
 * @extends AppError
 */
export class ConflictError extends AppError {
  /**
   * Creates an instance of ConflictError.
   * 
   * @param {string} message - Conflict error message
   */
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
