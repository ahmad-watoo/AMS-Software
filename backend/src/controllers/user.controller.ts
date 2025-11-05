/**
 * User Controller
 * 
 * Handles HTTP requests for user management endpoints.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/user.controller
 */

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

  /**
   * Get All Users Endpoint Handler
   * 
   * Retrieves all users with pagination and optional search.
   * 
   * @route GET /api/v1/users
   * @access Private (Requires user.read permission)
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [search] - Search query
   * @returns {Object} Users array and pagination info
   * 
   * @example
   * GET /api/v1/users?page=1&limit=20&search=john
   */
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

  /**
   * Get User By ID Endpoint Handler
   * 
   * Retrieves a specific user by ID.
   * 
   * @route GET /api/v1/users/:id
   * @access Private
   * @param {string} id - User ID
   * @returns {User} User object
   */
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

  /**
   * Create User Endpoint Handler
   * 
   * Creates a new user account.
   * 
   * @route POST /api/v1/users
   * @access Private (Requires user.create permission)
   * @body {CreateUserDTO} User creation data
   * @returns {User} Created user
   * 
   * @example
   * POST /api/v1/users
   * Body: {
   *   email: "user@example.com",
   *   password: "SecurePass123!",
   *   firstName: "John",
   *   lastName: "Doe"
   * }
   */
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

      // Validate required fields
      if (!userData.email || !userData.firstName || !userData.lastName) {
        throw new ValidationError('Email, firstName, and lastName are required');
      }

      // Password is required for user creation
      if (!userData.password) {
        throw new ValidationError('Password is required');
      }

      const user = await this.userService.createUser(userData);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      logger.error('Create user error:', error);
      next(error);
    }
  };

  /**
   * Update User Endpoint Handler
   * 
   * Updates an existing user's information.
   * 
   * @route PUT /api/v1/users/:id
   * @access Private (Requires user.update permission or own profile)
   * @param {string} id - User ID
   * @body {UpdateUserDTO} Partial user data to update
   * @returns {User} Updated user
   * 
   * @example
   * PUT /api/v1/users/user123
   * Body: {
   *   firstName: "Jane",
   *   phone: "+92-300-1234567"
   * }
   */
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

  /**
   * Delete User Endpoint Handler
   * 
   * Deletes a user (soft delete by default).
   * 
   * @route DELETE /api/v1/users/:id
   * @access Private (Requires user.delete permission)
   * @param {string} id - User ID
   * @query {boolean} [soft=true] - Whether to soft delete (default: true)
   * @returns {message: "User deleted successfully"}
   * 
   * @example
   * DELETE /api/v1/users/user123?soft=true
   */
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

  /**
   * Activate User Endpoint Handler
   * 
   * Activates a user account, allowing them to login.
   * 
   * @route POST /api/v1/users/:id/activate
   * @access Private (Requires admin role)
   * @param {string} id - User ID
   * @returns {message: "User activated successfully"}
   */
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

  /**
   * Deactivate User Endpoint Handler
   * 
   * Deactivates a user account, preventing them from logging in.
   * 
   * @route POST /api/v1/users/:id/deactivate
   * @access Private (Requires admin role)
   * @param {string} id - User ID
   * @returns {message: "User deactivated successfully"}
   */
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
