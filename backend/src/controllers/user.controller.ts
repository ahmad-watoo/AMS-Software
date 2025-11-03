import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '@/models/User.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const offset = (page - 1) * limit;

      const result = await this.userService.getAllUsers(limit, offset, search);

      sendSuccess(res, {
        users: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      sendSuccess(res, user);
    } catch (error) {
      logger.error('Get user by ID error:', error);
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDTO = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        cnic: req.body.cnic,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
      };

      if (!userData.email || !userData.firstName || !userData.lastName) {
        throw new ValidationError('Email, firstName, and lastName are required');
      }

      // If password not provided, generate a temporary one (optional)
      if (!userData.password) {
        // You might want to generate a temporary password or require it
        throw new ValidationError('Password is required');
      }

      const user = await this.userService.createUser(userData);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      logger.error('Create user error:', error);
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userData: UpdateUserDTO = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        postalCode: req.body.postalCode,
        profilePictureUrl: req.body.profilePictureUrl,
      };

      const user = await this.userService.updateUser(id, userData);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const softDelete = req.query.soft !== 'false'; // Default to soft delete
      await this.userService.deleteUser(id, softDelete);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.activateUser(id);
      sendSuccess(res, null, 'User activated successfully');
    } catch (error) {
      logger.error('Activate user error:', error);
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deactivateUser(id);
      sendSuccess(res, null, 'User deactivated successfully');
    } catch (error) {
      logger.error('Deactivate user error:', error);
      next(error);
    }
  };
}

