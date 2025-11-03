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

  async getAllUsers(limit: number = 50, offset: number = 0, search?: string): Promise<{
    users: User[];
    total: number;
  }> {
    try {
      const allUsers = await this.userRepository.findAll(limit * 10, 0); // Get more to filter
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

      // Remove password hash from response
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

  async getUserById(id: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Remove password hash
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

  async createUser(userData: CreateUserDTO & { createdBy?: string }): Promise<Omit<User, 'passwordHash'>> {
    try {
      // Validate email
      if (!this.isValidEmail(userData.email)) {
        throw new ValidationError('Invalid email format');
      }

      // Validate password if provided
      if (userData.password && !this.isValidPassword(userData.password)) {
        throw new ValidationError(
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        );
      }

      // Hash password
      const passwordHash = userData.password ? await this.hashPassword(userData.password) : undefined;

      // Create user
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

  async deleteUser(id: string, softDelete: boolean = true): Promise<void> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      if (softDelete) {
        await this.userRepository.delete(id);
      } else {
        // Hard delete - would need additional implementation
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

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

