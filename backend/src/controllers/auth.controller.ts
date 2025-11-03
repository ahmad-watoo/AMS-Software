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

      const result = await this.authService.register(userData);

      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      logger.error('Registration controller error:', error);
      next(error);
    }
  };

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

      const result = await this.authService.login(credentials);

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login controller error:', error);
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User is attached by auth middleware
      if (!req.user) {
        sendError(res, 'AUTHENTICATION_ERROR', 'User not authenticated', 401);
        return;
      }

      // Return user info from token (later we'll fetch from database)
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

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // TODO: Implement refresh token logic
      // This will involve verifying the refresh token and generating a new access token

      sendError(res, 'NOT_IMPLEMENTED', 'Refresh token endpoint not yet implemented', 501);
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement token blacklisting if needed
      // For now, logout is handled client-side by removing tokens

      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout controller error:', error);
      next(error);
    }
  };
}

