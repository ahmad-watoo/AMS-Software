/**
 * User Routes
 * 
 * Defines all user management API endpoints.
 * 
 * Routes:
 * - GET /users - Get all users (with pagination and search)
 * - GET /users/:id - Get user by ID
 * - POST /users - Create new user
 * - PUT /users/:id - Update user
 * - DELETE /users/:id - Delete user (soft delete)
 * - POST /users/:id/activate - Activate user
 * - POST /users/:id/deactivate - Deactivate user
 * 
 * All routes require authentication.
 * Most routes require specific permissions.
 * 
 * @module routes/user.routes
 */

import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission, requireRole } from '@/middleware/rbac.middleware';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and search
 * @access  Private (Requires user.read permission)
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [search] - Search query
 * @returns {Object} Users array and pagination info
 */
router.get(
  '/',
  requirePermission('user', 'read'),
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Users can view their own profile, admins can view any)
 * @param  {string} id - User ID
 * @returns {User} User object
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Private (Requires user.create permission)
 * @body   {CreateUserDTO} User creation data
 * @returns {User} Created user
 */
router.post(
  '/',
  requirePermission('user', 'create'),
  userController.createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update a user
 * @access  Private (Requires user.update permission or own profile)
 * @param  {string} id - User ID
 * @body   {UpdateUserDTO} Partial user data to update
 * @returns {User} Updated user
 */
router.put(
  '/:id',
  requirePermission('user', 'update'),
  userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user (soft delete by default)
 * @access  Private (Requires user.delete permission)
 * @param  {string} id - User ID
 * @query  {boolean} [soft=true] - Whether to soft delete (default: true)
 * @returns {message: "User deleted successfully"}
 */
router.delete(
  '/:id',
  requirePermission('user', 'delete'),
  userController.deleteUser
);

/**
 * @route   POST /api/v1/users/:id/activate
 * @desc    Activate a user account
 * @access  Private (Requires admin role)
 * @param  {string} id - User ID
 * @returns {message: "User activated successfully"}
 */
router.post(
  '/:id/activate',
  requireRole('admin'),
  userController.activateUser
);

/**
 * @route   POST /api/v1/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private (Requires admin role)
 * @param  {string} id - User ID
 * @returns {message: "User deactivated successfully"}
 */
router.post(
  '/:id/deactivate',
  requireRole('admin'),
  userController.deactivateUser
);

export default router;
