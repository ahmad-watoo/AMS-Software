import { AuthService } from '@/services/auth.service';
import { UserRepository } from '@/repositories/user.repository';
import { ValidationError, AuthenticationError, ConflictError } from '@/utils/errors';

// Mock the repository
jest.mock('@/repositories/user.repository');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    authService = new AuthService();
    mockUserRepository = authService['userRepository'] as jest.Mocked<UserRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Test@1234',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser as any);

      const result = await authService.register(validUserData);

      expect(result.user.email).toBe(validUserData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid email', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };

      await expect(authService.register(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for weak password', async () => {
      const weakPasswordData = { ...validUserData, password: 'weak' };

      await expect(authService.register(weakPasswordData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if email already exists', async () => {
      const existingUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Existing',
        lastName: 'User',
        isActive: true,
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser as any);

      await expect(authService.register(validUserData)).rejects.toThrow(ConflictError);
    });

    it('should require all mandatory fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing password, firstName, lastName
      };

      await expect(authService.register(incompleteData as any)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'Test@1234',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2a$12$hashedpassword',
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      // Mock bcrypt compare to return true
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
      mockUserRepository.updateLastLogin.mockResolvedValue();

      const result = await authService.login(validCredentials);

      expect(result.user.email).toBe(validCredentials.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalled();
    });

    it('should throw AuthenticationError for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(validCredentials)).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for incorrect password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);

      await expect(authService.login(validCredentials)).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for inactive user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(authService.login(validCredentials)).rejects.toThrow(AuthenticationError);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});

