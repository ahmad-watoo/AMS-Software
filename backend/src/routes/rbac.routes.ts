import { Router } from 'express';
import { RBACController } from '@/controllers/rbac.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();
const rbacController = new RBACController();

// All RBAC routes require authentication
router.use(authenticate);

// All RBAC routes require admin role (you can customize this)
// router.use(requireRole('admin'));

/**
 * @route   GET /api/v1/rbac/roles
 * @desc    Get all roles
 * @access  Private
 */
router.get('/roles', rbacController.getAllRoles);

/**
 * @route   GET /api/v1/rbac/roles/:id
 * @desc    Get role by ID
 * @access  Private
 */
router.get('/roles/:id', rbacController.getRoleById);

/**
 * @route   POST /api/v1/rbac/roles
 * @desc    Create a new role
 * @access  Private (Admin only)
 */
router.post('/roles', requireRole('admin'), rbacController.createRole);

/**
 * @route   PUT /api/v1/rbac/roles/:id
 * @desc    Update a role
 * @access  Private (Admin only)
 */
router.put('/roles/:id', requireRole('admin'), rbacController.updateRole);

/**
 * @route   DELETE /api/v1/rbac/roles/:id
 * @desc    Delete a role
 * @access  Private (Admin only)
 */
router.delete('/roles/:id', requireRole('admin'), rbacController.deleteRole);

/**
 * @route   GET /api/v1/rbac/users/:userId/roles
 * @desc    Get all roles for a user
 * @access  Private
 */
router.get('/users/:userId/roles', rbacController.getUserRoles);

/**
 * @route   POST /api/v1/rbac/users/assign-role
 * @desc    Assign a role to a user
 * @access  Private (Admin only)
 */
router.post('/users/assign-role', requireRole('admin'), rbacController.assignRoleToUser);

/**
 * @route   POST /api/v1/rbac/users/remove-role
 * @desc    Remove a role from a user
 * @access  Private (Admin only)
 */
router.post('/users/remove-role', requireRole('admin'), rbacController.removeRoleFromUser);

/**
 * @route   GET /api/v1/rbac/roles/:roleId/permissions
 * @desc    Get all permissions for a role
 * @access  Private
 */
router.get('/roles/:roleId/permissions', rbacController.getRolePermissions);

/**
 * @route   POST /api/v1/rbac/roles/assign-permission
 * @desc    Assign a permission to a role
 * @access  Private (Admin only)
 */
router.post('/roles/assign-permission', requireRole('admin'), rbacController.assignPermissionToRole);

/**
 * @route   POST /api/v1/rbac/roles/remove-permission
 * @desc    Remove a permission from a role
 * @access  Private (Admin only)
 */
router.post('/roles/remove-permission', requireRole('admin'), rbacController.removePermissionFromRole);

/**
 * @route   GET /api/v1/rbac/permissions
 * @desc    Get all permissions
 * @access  Private
 */
router.get('/permissions', rbacController.getAllPermissions);

/**
 * @route   GET /api/v1/rbac/users/:userId/permissions
 * @desc    Get all permissions for a user
 * @access  Private
 */
router.get('/users/:userId/permissions', rbacController.getUserPermissions);

export default router;

