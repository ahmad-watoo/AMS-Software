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
 * @desc    Get all users (with pagination and search)
 * @access  Private (Requires user.read permission)
 */
router.get(
  '/',
  requirePermission('user', 'read'),
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Private (Requires user.create permission)
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
 */
router.delete(
  '/:id',
  requirePermission('user', 'delete'),
  userController.deleteUser
);

/**
 * @route   POST /api/v1/users/:id/activate
 * @desc    Activate a user
 * @access  Private (Requires admin role)
 */
router.post(
  '/:id/activate',
  requireRole('admin'),
  userController.activateUser
);

/**
 * @route   POST /api/v1/users/:id/deactivate
 * @desc    Deactivate a user
 * @access  Private (Requires admin role)
 */
router.post(
  '/:id/deactivate',
  requireRole('admin'),
  userController.deactivateUser
);

export default router;

