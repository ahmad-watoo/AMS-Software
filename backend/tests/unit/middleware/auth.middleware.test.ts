import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate } from '@/middleware/auth.middleware';
import { verifyAccessToken } from '@/utils/jwt';
import { AuthenticationError } from '@/utils/errors';

jest.mock('@/utils/jwt');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and attach user to request', () => {
      const token = 'valid.token.here';
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'student',
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (verifyAccessToken as jest.Mock).mockReturnValue(payload);

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(verifyAccessToken).toHaveBeenCalledWith(token);
      expect(mockRequest.user).toEqual(payload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with AuthenticationError when authorization header is missing', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });

    it('should call next with AuthenticationError for invalid header format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });

    it('should call next with AuthenticationError for invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token',
      };

      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });
  });

  describe('optionalAuthenticate', () => {
    it('should attach user when valid token is provided', () => {
      const token = 'valid.token.here';
      const payload = {
        userId: '123',
        email: 'test@example.com',
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (verifyAccessToken as jest.Mock).mockReturnValue(payload);

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(payload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without error when no authorization header', () => {
      mockRequest.headers = {};

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without error when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token',
      };

      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});

