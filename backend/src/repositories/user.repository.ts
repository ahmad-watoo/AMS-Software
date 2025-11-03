import { supabaseAdmin } from '@/config/supabase';
import { User, CreateUserDTO, UpdateUserDTO } from '@/models/User.model';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class UserRepository {
  private tableName = 'users';

  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('email', email.toLowerCase())
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByCnic(cnic: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('cnic', cnic)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      logger.error('Error finding user by CNIC:', error);
      throw error;
    }
  }

  async create(userData: CreateUserDTO & { passwordHash: string }): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('Email already exists');
      }

      // Check if CNIC already exists (if provided)
      if (userData.cnic) {
        const existingCnic = await this.findByCnic(userData.cnic);
        if (existingCnic) {
          throw new ConflictError('CNIC already registered');
        }
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: userData.passwordHash,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          cnic: userData.cnic,
          date_of_birth: userData.dateOfBirth,
          gender: userData.gender,
          is_active: true,
          is_verified: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as User;
    } catch (error) {
      logger.error('Error creating user:', error);
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  async update(id: string, userData: UpdateUserDTO & { isActive?: boolean; isVerified?: boolean }): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.address !== undefined) updateData.address = userData.address;
      if (userData.city !== undefined) updateData.city = userData.city;
      if (userData.province !== undefined) updateData.province = userData.province;
      if (userData.postalCode !== undefined) updateData.postal_code = userData.postalCode;
      if (userData.profilePictureUrl !== undefined) updateData.profile_picture_url = userData.profilePictureUrl;
      if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
      if (userData.isVerified !== undefined) updateData.is_verified = userData.isVerified;

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as User;
    } catch (error) {
      logger.error('Error updating user:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw, this is not critical
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return (data || []) as User[];
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw new Error('Failed to fetch users');
    }
  }
}

