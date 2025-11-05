/**
 * RBAC Routes
 * 
 * Defines all Role-Based Access Control API endpoints.
 * 
 * Routes:
 * - Role Management: CRUD operations for roles
 * - Permission Management: CRUD operations for permissions
 * - User-Role Assignments: Assign/remove roles from users
 * - Role-Permission Assignments: Assign/remove permissions from roles
 * - User Permissions: Get permissions for users
 * 
 * All routes require authentication.
 * Admin-only routes are protected with requireRole('admin') middleware.
 * 
 * @module routes/rbac.routes
 */

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
 * @desc    Get all roles in the system
 * @access  Private
 * @returns {Role[]} Array of roles
 */
router.get('/roles', rbacController.getAllRoles);

/**
 * @route   GET /api/v1/rbac/roles/:id
 * @desc    Get a specific role by ID
 * @access  Private
 * @param   {string} id - Role ID
 * @returns {Role} Role object
 */
router.get('/roles/:id', rbacController.getRoleById);

/**
 * @route   POST /api/v1/rbac/roles
 * @desc    Create a new role
 * @access  Private (Admin only)
 * @body    { name: string, description?: string, level: number }
 * @returns {Role} Created role
 */
router.post('/roles', requireRole('admin'), rbacController.createRole);

/**
 * @route   PUT /api/v1/rbac/roles/:id
 * @desc    Update an existing role
 * @access  Private (Admin only)
 * @param   {string} id - Role ID
 * @body    { name?: string, description?: string, level?: number }
 * @returns {Role} Updated role
 */
router.put('/roles/:id', requireRole('admin'), rbacController.updateRole);

/**
 * @route   DELETE /api/v1/rbac/roles/:id
 * @desc    Delete a role
 * @access  Private (Admin only)
 * @param   {string} id - Role ID
 * @returns {message: "Role deleted successfully"}
 */
router.delete('/roles/:id', requireRole('admin'), rbacController.deleteRole);

/**
 * @route   GET /api/v1/rbac/users/:userId/roles
 * @desc    Get all roles assigned to a user
 * @access  Private
 * @param   {string} userId - User ID
 * @returns {Array<Role & {assignedAt: string}>} Array of roles with assignment details
 */
router.get('/users/:userId/roles', rbacController.getUserRoles);

/**
 * @route   POST /api/v1/rbac/users/assign-role
 * @desc    Assign a role to a user
 * @access  Private (Admin only)
 * @body    { userId: string, roleId: string, campusId?: string, departmentId?: string }
 * @returns {UserRole} User-role assignment
 */
router.post('/users/assign-role', requireRole('admin'), rbacController.assignRoleToUser);

/**
 * @route   POST /api/v1/rbac/users/remove-role
 * @desc    Remove a role from a user
 * @access  Private (Admin only)
 * @body    { userId: string, roleId: string }
 * @returns {message: "Role removed successfully"}
 */
router.post('/users/remove-role', requireRole('admin'), rbacController.removeRoleFromUser);

/**
 * @route   GET /api/v1/rbac/roles/:roleId/permissions
 * @desc    Get all permissions assigned to a role
 * @access  Private
 * @param   {string} roleId - Role ID
 * @returns {Permission[]} Array of permissions
 */
router.get('/roles/:roleId/permissions', rbacController.getRolePermissions);

/**
 * @route   POST /api/v1/rbac/roles/assign-permission
 * @desc    Assign a permission to a role
 * @access  Private (Admin only)
 * @body    { roleId: string, permissionId: string }
 * @returns {message: "Permission assigned successfully"}
 */
router.post('/roles/assign-permission', requireRole('admin'), rbacController.assignPermissionToRole);

/**
 * @route   POST /api/v1/rbac/roles/remove-permission
 * @desc    Remove a permission from a role
 * @access  Private (Admin only)
 * @body    { roleId: string, permissionId: string }
 * @returns {message: "Permission removed successfully"}
 */
router.post('/roles/remove-permission', requireRole('admin'), rbacController.removePermissionFromRole);

/**
 * @route   GET /api/v1/rbac/permissions
 * @desc    Get all permissions in the system
 * @access  Private
 * @returns {Permission[]} Array of all permissions
 */
router.get('/permissions', rbacController.getAllPermissions);

/**
 * @route   GET /api/v1/rbac/users/:userId/permissions
 * @desc    Get all permissions for a user (aggregated from all user's roles)
 * @access  Private
 * @param   {string} userId - User ID
 * @returns {Permission[]} Array of unique permissions
 */
router.get('/users/:userId/permissions', rbacController.getUserPermissions);

export default router;
