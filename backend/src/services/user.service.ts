/**
 * User Service
 * 
 * This service handles all user management business logic including:
 * - User CRUD operations
 * - User search and pagination
 * - User activation/deactivation
 * - Password hashing and validation
 * 
 * @module services/user.service
 */

import { UserRepository } from '@/repositories/user.repository';
import { User, CreateUserDTO, UpdateUserDTO } from '@/models/User.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users with pagination and search
   * 
   * Retrieves users with optional search filtering and pagination.
   * Search matches against firstName, lastName, email, and phone.
   * 
   * @param {number} [limit=50] - Maximum number of users to return
   * @param {number} [offset=0] - Number of users to skip
   * @param {string} [search] - Optional search query
   * @returns {Promise<{users: User[], total: number}>} Users and total count
   * 
   * @example
   * const { users, total } = await userService.getAllUsers(20, 0, 'john');
   */
  async getAllUsers(limit: number = 50, offset: number = 0, search?: string): Promise<{
    users: User[];
    total: number;
  }> {
    try {
      // Fetch more users than needed for client-side filtering
      // TODO: Move filtering to database level for better performance
      const allUsers = await this.userRepository.findAll(limit * 10, 0);
      let filteredUsers = allUsers;

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = allUsers.filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.phone?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);
      const total = filteredUsers.length;

      // Remove password hash from response for security
      const usersWithoutPassword = paginatedUsers.map(({ passwordHash, ...user }) => user);

      return {
        users: usersWithoutPassword as User[],
        total,
      };
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get user by ID
   * 
   * Retrieves a specific user by their ID.
   * 
   * @param {string} id - User ID
   * @returns {Promise<Omit<User, 'passwordHash'>>} User object without password hash
   * @throws {NotFoundError} If user not found
   */
  async getUserById(id: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Remove password hash for security
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Create a new user
   * 
   * Creates a new user with validation and password hashing.
   * 
   * @param {CreateUserDTO & {createdBy?: string}} userData - User creation data
   * @returns {Promise<Omit<User, 'passwordHash'>>} Created user without password hash
   * @throws {ValidationError} If user data is invalid
   * @throws {ConflictError} If email already exists
   * 
   * @example
   * const user = await userService.createUser({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   */
  async createUser(userData: CreateUserDTO & { createdBy?: string }): Promise<Omit<User, 'passwordHash'>> {
    try {
      // Validate email format
      if (!this.isValidEmail(userData.email)) {
        throw new ValidationError('Invalid email format');
      }

      // Validate password if provided
      if (userData.password && !this.isValidPassword(userData.password)) {
        throw new ValidationError(
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        );
      }

      // Hash password before storing
      const passwordHash = userData.password ? await this.hashPassword(userData.password) : undefined;

      // Create user in database
      const user = await this.userRepository.create({
        ...userData,
        passwordHash: passwordHash!,
      });

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error creating user:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update a user
   * 
   * Updates an existing user's information.
   * 
   * @param {string} id - User ID
   * @param {UpdateUserDTO} userData - Partial user data to update
   * @returns {Promise<Omit<User, 'passwordHash'>>} Updated user without password hash
   * @throws {NotFoundError} If user not found
   * 
   * @example
   * const user = await userService.updateUser('user123', {
   *   firstName: 'Jane',
   *   phone: '+92-300-1234567'
   * });
   */
  async updateUser(id: string, userData: UpdateUserDTO): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      const updatedUser = await this.userRepository.update(id, userData);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error updating user:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user
   * 
   * Deletes a user (soft delete by default).
   * Soft delete marks user as inactive, hard delete removes from database.
   * 
   * @param {string} id - User ID
   * @param {boolean} [softDelete=true] - Whether to soft delete (default: true)
   * @returns {Promise<void>}
   * @throws {NotFoundError} If user not found
   * 
   * @example
   * // Soft delete (recommended)
   * await userService.deleteUser('user123', true);
   * 
   * @example
   * // Hard delete (not recommended, data loss)
   * await userService.deleteUser('user123', false);
   */
  async deleteUser(id: string, softDelete: boolean = true): Promise<void> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      if (softDelete) {
        // Soft delete: mark as inactive
        await this.userRepository.delete(id);
      } else {
        // Hard delete: permanently remove from database
        // TODO: Implement hard delete if needed
        throw new Error('Hard delete not implemented');
      }
    } catch (error) {
      logger.error('Error deleting user:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Activate a user
   * 
   * Activates a user account, allowing them to login.
   * 
   * @param {string} id - User ID
   * @returns {Promise<Omit<User, 'passwordHash'>>} Updated user without password hash
   * @throws {NotFoundError} If user not found
   * 
   * @example
   * const user = await userService.activateUser('user123');
   */
  async activateUser(id: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      const updatedUser = await this.userRepository.update(id, { isActive: true });
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error activating user:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to activate user');
    }
  }

  /**
   * Deactivate a user
   * 
   * Deactivates a user account, preventing them from logging in.
   * 
   * @param {string} id - User ID
   * @returns {Promise<Omit<User, 'passwordHash'>>} Updated user without password hash
   * @throws {NotFoundError} If user not found
   * 
   * @example
   * const user = await userService.deactivateUser('user123');
   */
  async deactivateUser(id: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      const updatedUser = await this.userRepository.update(id, { isActive: false });
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error deactivating user:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Hash password using bcrypt
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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}
