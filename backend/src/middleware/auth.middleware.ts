/**
 * Authentication Middleware
 * 
 * Express middleware for JWT token authentication.
 * Validates and extracts user information from Authorization header.
 * 
 * @module middleware/auth.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '@/utils/jwt';
import { AuthenticationError } from '@/utils/errors';

/**
 * Extended Express Request interface
 * Adds user property to request object after authentication
 */
declare global {
  namespace Express {
    interface Request {
      /** User information from JWT token (set by authenticate middleware) */
      user?: TokenPayload & {
        roles?: string[];
        permissions?: string[];
      };
    }
  }
}

/**
 * Authentication Middleware
 * 
 * Validates JWT access token from Authorization header and attaches
 * user information to the request object.
 * 
 * Usage:
 * - Add to routes that require authentication
 * - Token format: "Bearer <token>"
 * - Sets req.user with token payload on success
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @throws {AuthenticationError} If token is missing, invalid, or expired
 * 
 * @example
 * // In route definition
 * router.get('/protected', authenticate, controller.handler);
 * 
 * // Access user in controller
 * const userId = req.user?.userId;
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Authorization header missing');
    }

    // Parse Bearer token format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format');
    }

    const token = parts[1];
    
    // Verify and decode token
    const payload = verifyAccessToken(token);

    // Attach user information to request object
    req.user = payload;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      // Wrap unknown errors
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};

/**
 * Optional Authentication Middleware
 * 
 * Similar to authenticate, but doesn't fail if token is missing or invalid.
 * Attaches user to request if valid token is present.
 * 
 * Usage:
 * - Use for routes that work with or without authentication
 * - Example: Public content with optional personalization
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @example
 * // In route definition
 * router.get('/public', optionalAuthenticate, controller.handler);
 * 
 * // Check if user is authenticated
 * if (req.user) {
 *   // User is authenticated
 * } else {
 *   // User is not authenticated (still proceed)
 * }
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // If Authorization header exists, try to authenticate
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        try {
          // Verify token and attach user if valid
          const payload = verifyAccessToken(token);
          req.user = payload;
        } catch (error) {
          // Ignore token errors for optional auth - continue without user
        }
      }
    }

    // Always continue, even if no token or invalid token
    next();
  } catch (error) {
    // Continue even on errors
    next();
  }
};
