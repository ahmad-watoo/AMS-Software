import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '@/utils/jwt';
import { AuthenticationError } from '@/utils/errors';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & {
        roles?: string[];
        permissions?: string[];
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format');
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        try {
          const payload = verifyAccessToken(token);
          req.user = payload;
        } catch (error) {
          // Ignore token errors for optional auth
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

