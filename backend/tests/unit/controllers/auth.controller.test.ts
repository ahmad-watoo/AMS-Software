import { Request, Response, NextFunction } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { AuthService } from '@/services/auth.service';
import { ValidationError, AuthenticationError } from '@/utils/errors';

jest.mock('@/services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    authController = new AuthController();
    authController['authService'] = mockAuthService;

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRequest = {
        body: userData,
      };

      const mockAuthResponse = {
        user: { id: '123', email: 'test@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should call next with error for missing required fields', async () => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          // Missing password, firstName, lastName
        },
      };

      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with error if service throws', async () => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'Test@1234',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const error = new Error('Service error');
      mockAuthService.register.mockRejectedValue(error);

      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      mockRequest = {
        body: credentials,
      };

      const mockAuthResponse = {
        user: { id: '123', email: 'test@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should call next with error for missing credentials', async () => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          // Missing password
        },
      };

      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with error if service throws', async () => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'wrong',
        },
      };

      const error = new AuthenticationError('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('should return user profile when authenticated', async () => {
      mockRequest = {
        user: {
          userId: '123',
          email: 'test@example.com',
          role: 'student',
        },
      };

      await authController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should return error when not authenticated', async () => {
      mockRequest = {
        user: undefined,
      };

      await authController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalled();
    });
  });
});

