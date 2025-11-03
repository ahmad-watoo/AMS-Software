import { UserService } from '@/services/user.service';
import { UserRepository } from '@/repositories/user.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

jest.mock('@/repositories/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userService = new UserService();
    mockUserRepository = userService['userRepository'] as jest.Mocked<UserRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return paginated users without password hash', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          passwordHash: 'hashed',
        },
        {
          id: '2',
          email: 'user2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          passwordHash: 'hashed',
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers as any);

      const result = await userService.getAllUsers(10, 0);

      expect(result.users.length).toBe(2);
      expect(result.users[0]).not.toHaveProperty('passwordHash');
      expect(result.total).toBe(2);
    });

    it('should filter users by search term', async () => {
      const mockUsers = [
        { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', passwordHash: 'hash' },
        { id: '2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', passwordHash: 'hash' },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers as any);

      const result = await userService.getAllUsers(10, 0, 'john');

      expect(result.users.length).toBe(1);
      expect(result.users[0].firstName).toBe('John');
    });
  });

  describe('getUserById', () => {
    it('should return user without password hash', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'Test@1234',
        firstName: 'New',
        lastName: 'User',
      };

      const mockUser = {
        id: '1',
        ...userData,
        passwordHash: 'hashed',
        isActive: true,
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser as any);

      const result = await userService.createUser(userData);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test@1234',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hash',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
      };

      mockUserRepository.findById.mockResolvedValue(existingUser as any);
      mockUserRepository.update.mockResolvedValue(updatedUser as any);

      const result = await userService.updateUser('1', updateData);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('1', { firstName: 'Test' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockUserRepository.delete.mockResolvedValue();

      await userService.deleteUser('1', true);

      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('1')).rejects.toThrow(NotFoundError);
    });
  });
});

