import bcrypt from 'bcryptjs';
import { UserRepository } from '@/repositories/user.repository';
import { User, CreateUserDTO, LoginDTO, AuthResponse } from '@/models/User.model';
import { AuthenticationError, ValidationError, ConflictError } from '@/utils/errors';
import { generateTokenPair, TokenPayload } from '@/utils/jwt';
import { logger } from '@/config/logger';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: CreateUserDTO): Promise<AuthResponse> {
    try {
      // Validate email format
      if (!this.isValidEmail(userData.email)) {
        throw new ValidationError('Invalid email format');
      }

      // Validate password strength
      if (!this.isValidPassword(userData.password)) {
        throw new ValidationError(
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        );
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        passwordHash,
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };
      const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour in seconds
      };
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is inactive. Please contact administrator');
      }

      // Verify password
      if (!user.passwordHash) {
        throw new AuthenticationError('Invalid email or password');
      }

      const isPasswordValid = await this.verifyPassword(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Get user roles (will be implemented with RBAC)
      // For now, we'll just use the user ID
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };

      const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 3600,
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Login failed');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.passwordHash) {
        return null;
      }

      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('User validation error:', error);
      return null;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, contains uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

