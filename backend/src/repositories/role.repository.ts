import { supabaseAdmin } from '@/config/supabase';
import { Role, Permission, RolePermission, UserRole, CreateRoleDTO } from '@/models/Role.model';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class RoleRepository {
  async findRoleById(id: string): Promise<Role | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Role;
    } catch (error) {
      logger.error('Error finding role by ID:', error);
      throw error;
    }
  }

  async findRoleByName(name: string): Promise<Role | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Role;
    } catch (error) {
      logger.error('Error finding role by name:', error);
      throw error;
    }
  }

  async findAllRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('*')
        .order('level', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as Role[];
    } catch (error) {
      logger.error('Error finding all roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }

  async createRole(roleData: CreateRoleDTO): Promise<Role> {
    try {
      // Check if role name already exists
      const existingRole = await this.findRoleByName(roleData.name);
      if (existingRole) {
        throw new ConflictError(`Role with name "${roleData.name}" already exists`);
      }

      const { data, error } = await supabaseAdmin
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          level: roleData.level,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Role;
    } catch (error) {
      logger.error('Error creating role:', error);
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create role');
    }
  }

  async updateRole(id: string, roleData: Partial<CreateRoleDTO>): Promise<Role> {
    try {
      const role = await this.findRoleById(id);
      if (!role) {
        throw new NotFoundError('Role');
      }

      const { data, error } = await supabaseAdmin
        .from('roles')
        .update({
          name: roleData.name,
          description: roleData.description,
          level: roleData.level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Role;
    } catch (error) {
      logger.error('Error updating role:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update role');
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.from('roles').delete().eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error deleting role:', error);
      throw new Error('Failed to delete role');
    }
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      return (data || []) as UserRole[];
    } catch (error) {
      logger.error('Error getting user roles:', error);
      throw new Error('Failed to fetch user roles');
    }
  }

  async assignRoleToUser(userId: string, roleId: string, campusId?: string, departmentId?: string): Promise<UserRole> {
    try {
      // Check if role assignment already exists
      let query = supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (campusId) {
        query = query.eq('campus_id', campusId);
      }
      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data: existing } = await query.single();

      if (existing) {
        // Update existing assignment to active
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .update({ is_active: true })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as UserRole;
      }

      // Create new assignment
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          campus_id: campusId,
          department_id: departmentId,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as UserRole;
    } catch (error) {
      logger.error('Error assigning role to user:', error);
      throw new Error('Failed to assign role to user');
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error removing role from user:', error);
      throw new Error('Failed to remove role from user');
    }
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('role_permissions')
        .select(`
          permission_id,
          permissions (
            id,
            name,
            module,
            action,
            description,
            created_at
          )
        `)
        .eq('role_id', roleId);

      if (error) {
        throw error;
      }

      return (data || []).map((item: any) => item.permissions) as Permission[];
    } catch (error) {
      logger.error('Error getting role permissions:', error);
      throw new Error('Failed to fetch role permissions');
    }
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      // Check if already assigned
      const { data: existing } = await supabaseAdmin
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId)
        .eq('permission_id', permissionId)
        .single();

      if (existing) {
        return; // Already assigned
      }

      const { error } = await supabaseAdmin.from('role_permissions').insert({
        role_id: roleId,
        permission_id: permissionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error assigning permission to role:', error);
      throw new Error('Failed to assign permission to role');
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error removing permission from role:', error);
      throw new Error('Failed to remove permission from role');
    }
  }

  async findAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []) as Permission[];
    } catch (error) {
      logger.error('Error finding all permissions:', error);
      throw new Error('Failed to fetch permissions');
    }
  }
}

