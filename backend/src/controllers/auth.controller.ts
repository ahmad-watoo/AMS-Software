/**
 * Authentication Controller
 * 
 * Handles HTTP requests for authentication endpoints.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/auth.controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { CreateUserDTO, LoginDTO } from '@/models/User.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register Endpoint Handler
   * 
   * Handles user registration requests.
   * Validates required fields and calls service to create user.
   * 
   * @route POST /api/v1/auth/register
   * @access Public
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function for error handling
   * 
   * @example
   * POST /api/v1/auth/register
   * Body: {
   *   email: "user@example.com",
   *   password: "SecurePass123!",
   *   firstName: "John",
   *   lastName: "Doe"
   * }
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDTO = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        cnic: req.body.cnic,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
      };

      // Validate required fields
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new ValidationError('Missing required fields: email, password, firstName, lastName');
      }

      // Call service to register user
      const result = await this.authService.register(userData);

      // Send success response
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      logger.error('Registration controller error:', error);
      next(error); // Pass to error middleware
    }
  };

  /**
   * Login Endpoint Handler
   * 
   * Handles user login requests.
   * Validates credentials and returns authentication tokens.
   * 
   * @route POST /api/v1/auth/login
   * @access Public
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function for error handling
   * 
   * @example
   * POST /api/v1/auth/login
   * Body: {
   *   email: "user@example.com",
   *   password: "SecurePass123!"
   * }
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials: LoginDTO = {
        email: req.body.email,
        password: req.body.password,
      };

      // Validate required fields
      if (!credentials.email || !credentials.password) {
        throw new ValidationError('Email and password are required');
      }

      // Call service to authenticate user
      const result = await this.authService.login(credentials);

      // Send success response with tokens
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login controller error:', error);
      next(error); // Pass to error middleware
    }
  };

  /**
   * Get Profile Endpoint Handler
   * 
   * Returns current authenticated user's profile information.
   * User is attached to request by auth middleware.
   * 
   * @route GET /api/v1/auth/profile
   * @access Private (requires authentication)
   * 
   * @param {Request} req - Express request object (with req.user from middleware)
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function for error handling
   * 
   * @example
   * GET /api/v1/auth/profile
   * Headers: { Authorization: "Bearer <token>" }
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User is attached by auth middleware
      if (!req.user) {
        sendError(res, 'AUTHENTICATION_ERROR', 'User not authenticated', 401);
        return;
      }

      // Return user info from token
      // TODO: Fetch full user data from database instead of using token payload
      sendSuccess(res, {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      });
    } catch (error) {
      logger.error('Get profile controller error:', error);
      next(error);
    }
  };

  /**
   * Refresh Token Endpoint Handler
   * 
   * Refreshes access token using refresh token.
   * 
   * @route POST /api/v1/auth/refresh-token
   * @access Public
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function for error handling
   * 
   * @example
   * POST /api/v1/auth/refresh-token
   * Body: { refreshToken: "<refresh-token>" }
   * 
   * @todo Implement refresh token logic
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // TODO: Implement refresh token logic
      // 1. Verify refresh token
      // 2. Check if refresh token is blacklisted
      // 3. Generate new access token
      // 4. Optionally rotate refresh token
      // 5. Return new tokens

      sendError(res, 'NOT_IMPLEMENTED', 'Refresh token endpoint not yet implemented', 501);
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      next(error);
    }
  };

  /**
   * Logout Endpoint Handler
   * 
   * Handles user logout requests.
   * Currently handled client-side by removing tokens.
   * Future: Token blacklisting can be implemented here.
   * 
   * @route POST /api/v1/auth/logout
   * @access Private (requires authentication)
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function for error handling
   * 
   * @example
   * POST /api/v1/auth/logout
   * Headers: { Authorization: "Bearer <token>" }
   * 
   * @todo Implement token blacklisting if needed
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement token blacklisting if needed
      // For now, logout is handled client-side by removing tokens
      // Future implementation:
      // 1. Add token to blacklist (Redis or database)
      // 2. Set expiration time for blacklisted token
      // 3. Check blacklist in auth middleware

      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout controller error:', error);
      next(error);
    }
  };
}
