/**
 * Authentication Service
 * 
 * This service handles all authentication-related business logic including:
 * - User registration with validation
 * - User login with credential verification
 * - Password hashing and verification
 * - JWT token generation
 * - User session management
 * 
 * @module services/auth.service
 */

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

  /**
   * Register a new user
   * 
   * Validates user data, checks for duplicate email, hashes password,
   * creates user record, and generates JWT tokens.
   * 
   * @param {CreateUserDTO} userData - User registration data
   * @returns {Promise<AuthResponse>} User data with access and refresh tokens
   * @throws {ValidationError} If email or password is invalid
   * @throws {ConflictError} If email already exists
   * 
   * @example
   * const result = await authService.register({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   */
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

      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Hash password before storing (using bcrypt with 12 salt rounds)
      const passwordHash = await this.hashPassword(userData.password);

      // Create user in database
      const user = await this.userRepository.create({
        ...userData,
        passwordHash,
      });

      // Generate JWT tokens for immediate authentication
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };
      const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

      // Remove sensitive password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour in seconds
      };
    } catch (error) {
      logger.error('Registration error:', error);
      // Re-throw known errors (ValidationError, ConflictError)
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      // Wrap unknown errors
      throw new Error('Registration failed');
    }
  }

  /**
   * Login user
   * 
   * Authenticates user with email and password, verifies account status,
   * updates last login timestamp, and generates JWT tokens.
   * 
   * @param {LoginDTO} credentials - Login credentials (email, password)
   * @returns {Promise<AuthResponse>} User data with access and refresh tokens
   * @throws {AuthenticationError} If credentials are invalid or account is inactive
   * 
   * @example
   * const result = await authService.login({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!'
   * });
   */
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user account is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is inactive. Please contact administrator');
      }

      // Verify password hash exists
      if (!user.passwordHash) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Verify password matches hash
      const isPasswordValid = await this.verifyPassword(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Update last login timestamp
      await this.userRepository.updateLastLogin(user.id);

      // Generate JWT tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        // Role will be added when RBAC is fully integrated
      };

      const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

      // Remove sensitive password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour in seconds
      };
    } catch (error) {
      logger.error('Login error:', error);
      // Re-throw AuthenticationError
      if (error instanceof AuthenticationError) {
        throw error;
      }
      // Wrap unknown errors
      throw new AuthenticationError('Login failed');
    }
  }

  /**
   * Validate user credentials
   * 
   * Validates email and password without generating tokens.
   * Used internally for credential verification.
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User | null>} User object if valid, null otherwise
   * 
   * @example
   * const user = await authService.validateUser('user@example.com', 'password');
   * if (user) {
   *   // Credentials are valid
   * }
   */
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

  /**
   * Hash password using bcrypt
   * 
   * Uses bcrypt with 12 salt rounds for secure password hashing.
   * 
   * @private
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // High security, acceptable performance
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * 
   * Compares plain text password with bcrypt hash.
   * 
   * @private
   * @param {string} password - Plain text password
   * @param {string} hash - Bcrypt hash
   * @returns {Promise<boolean>} True if password matches hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate email format
   * 
   * @private
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * 
   * Requirements:
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one digit
   * - At least one special character
   * 
   * @private
   * @param {string} password - Password to validate
   * @returns {boolean} True if password meets requirements
   */
  private isValidPassword(password: string): boolean {
    // At least 8 characters, contains uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}
