import { RBACService } from '@/services/rbac.service';
import { RoleRepository } from '@/repositories/role.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';

jest.mock('@/repositories/role.repository');

describe('RBACService', () => {
  let rbacService: RBACService;
  let mockRoleRepository: jest.Mocked<RoleRepository>;

  beforeEach(() => {
    rbacService = new RBACService();
    mockRoleRepository = rbacService['roleRepository'] as jest.Mocked<RoleRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: '1', name: 'admin', level: 10 },
        { id: '2', name: 'student', level: 5 },
      ];
      mockRoleRepository.findAllRoles.mockResolvedValue(mockRoles as any);

      const result = await rbacService.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.findAllRoles).toHaveBeenCalled();
    });
  });

  describe('getRoleById', () => {
    it('should return role if found', async () => {
      const mockRole = { id: '1', name: 'admin', level: 10 };
      mockRoleRepository.findRoleById.mockResolvedValue(mockRole as any);

      const result = await rbacService.getRoleById('1');

      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundError if role not found', async () => {
      mockRoleRepository.findRoleById.mockResolvedValue(null);

      await expect(rbacService.getRoleById('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const roleData = { name: 'teacher', description: 'Teacher role', level: 7 };
      const mockRole = { id: '1', ...roleData };
      mockRoleRepository.findRoleByName.mockResolvedValue(null);
      mockRoleRepository.createRole.mockResolvedValue(mockRole as any);

      const result = await rbacService.createRole(roleData);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.createRole).toHaveBeenCalledWith(roleData);
    });

    it('should throw ValidationError for empty name', async () => {
      const roleData = { name: '', level: 5 };

      await expect(rbacService.createRole(roleData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid level', async () => {
      const roleData = { name: 'test', level: 11 };

      await expect(rbacService.createRole(roleData)).rejects.toThrow(ValidationError);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const mockPermissions = [
        { id: '1', module: 'student', action: 'create' },
        { id: '2', module: 'student', action: 'read' },
      ];

      mockRoleRepository.getUserRoles.mockResolvedValue([
        { id: '1', userId: 'user1', roleId: 'role1' } as any,
      ]);
      mockRoleRepository.getRolePermissions
        .mockResolvedValueOnce(mockPermissions as any)
        .mockResolvedValueOnce([]);

      const result = await rbacService.hasPermission('user1', 'student', 'create');

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      mockRoleRepository.getUserRoles.mockResolvedValue([]);

      const result = await rbacService.hasPermission('user1', 'student', 'create');

      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      mockRoleRepository.getUserRoles.mockResolvedValue([
        { id: '1', userId: 'user1', roleId: 'role1' } as any,
      ]);
      mockRoleRepository.findRoleById.mockResolvedValue({
        id: 'role1',
        name: 'admin',
      } as any);

      const result = await rbacService.hasRole('user1', 'admin');

      expect(result).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      mockRoleRepository.getUserRoles.mockResolvedValue([]);

      const result = await rbacService.hasRole('user1', 'admin');

      expect(result).toBe(false);
    });
  });
});

