/**
 * Administration Routes
 * 
 * Defines all administration management API endpoints.
 * 
 * Routes:
 * - System Configs: Key-value configuration management
 * - Events: Academic, cultural, sports events management
 * - Notices: Announcements and important notices
 * - Departments: Organizational structure management
 * 
 * All routes require authentication.
 * Create and update routes require admin.create/admin.update permissions.
 * 
 * @module routes/administration.routes
 */

import { Router } from 'express';
import { AdministrationController } from '@/controllers/administration.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const administrationController = new AdministrationController();

// All administration routes require authentication
router.use(authenticate);

// ==================== System Configs ====================

/**
 * @route   GET /api/v1/administration/system-configs
 * @desc    Get all system configs (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=100] - Items per page
 * @query  {string} [category] - Filter by category
 * @query  {boolean} [isEditable] - Filter by editable status
 * @returns {Object} System configs array and pagination info
 */
router.get('/system-configs', administrationController.getAllSystemConfigs);

/**
 * @route   GET /api/v1/administration/system-configs/:key
 * @desc    Get system config by key
 * @access  Private
 * @param  {string} key - System configuration key
 * @returns {SystemConfig} System configuration object
 */
router.get('/system-configs/:key', administrationController.getSystemConfigByKey);

/**
 * @route   POST /api/v1/administration/system-configs
 * @desc    Create a new system config
 * @access  Private (Requires admin.create permission)
 * @body   {CreateSystemConfigDTO} System configuration creation data
 * @returns {SystemConfig} Created system configuration
 */
router.post(
  '/system-configs',
  requirePermission('admin', 'create'),
  administrationController.createSystemConfig
);

/**
 * @route   PUT /api/v1/administration/system-configs/:key
 * @desc    Update a system config
 * @access  Private (Requires admin.update permission)
 * @param  {string} key - System configuration key
 * @body   {UpdateSystemConfigDTO} Partial configuration data to update
 * @returns {SystemConfig} Updated system configuration
 */
router.put(
  '/system-configs/:key',
  requirePermission('admin', 'update'),
  administrationController.updateSystemConfig
);

// ==================== Events ====================

/**
 * @route   GET /api/v1/administration/events
 * @desc    Get all events (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [eventType] - Filter by event type
 * @query  {string} [targetAudience] - Filter by target audience
 * @query  {boolean} [isActive] - Filter by active status
 * @query  {string} [startDate] - Filter by start date (YYYY-MM-DD)
 * @query  {string} [endDate] - Filter by end date (YYYY-MM-DD)
 * @returns {Object} Events array and pagination info
 */
router.get('/events', administrationController.getAllEvents);

/**
 * @route   GET /api/v1/administration/events/:id
 * @desc    Get event by ID
 * @access  Private
 * @param  {string} id - Event ID
 * @returns {Event} Event object
 */
router.get('/events/:id', administrationController.getEventById);

/**
 * @route   POST /api/v1/administration/events
 * @desc    Create a new event
 * @access  Private (Requires admin.create permission)
 * @body   {CreateEventDTO} Event creation data
 * @returns {Event} Created event
 */
router.post(
  '/events',
  requirePermission('admin', 'create'),
  administrationController.createEvent
);

/**
 * @route   PUT /api/v1/administration/events/:id
 * @desc    Update an event
 * @access  Private (Requires admin.update permission)
 * @param  {string} id - Event ID
 * @body   {UpdateEventDTO} Partial event data to update
 * @returns {Event} Updated event
 */
router.put(
  '/events/:id',
  requirePermission('admin', 'update'),
  administrationController.updateEvent
);

// ==================== Notices ====================

/**
 * @route   GET /api/v1/administration/notices
 * @desc    Get all notices (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [noticeType] - Filter by notice type
 * @query  {string} [priority] - Filter by priority
 * @query  {string} [targetAudience] - Filter by target audience
 * @query  {boolean} [isPublished] - Filter by published status
 * @returns {Object} Notices array and pagination info
 */
router.get('/notices', administrationController.getAllNotices);

/**
 * @route   GET /api/v1/administration/notices/:id
 * @desc    Get notice by ID
 * @access  Private
 * @param  {string} id - Notice ID
 * @returns {Notice} Notice object
 */
router.get('/notices/:id', administrationController.getNoticeById);

/**
 * @route   POST /api/v1/administration/notices
 * @desc    Create a new notice
 * @access  Private (Requires admin.create permission)
 * @body   {CreateNoticeDTO} Notice creation data
 * @returns {Notice} Created notice
 */
router.post(
  '/notices',
  requirePermission('admin', 'create'),
  administrationController.createNotice
);

/**
 * @route   PUT /api/v1/administration/notices/:id
 * @desc    Update a notice
 * @access  Private (Requires admin.update permission)
 * @param  {string} id - Notice ID
 * @body   {UpdateNoticeDTO} Partial notice data to update
 * @returns {Notice} Updated notice
 */
router.put(
  '/notices/:id',
  requirePermission('admin', 'update'),
  administrationController.updateNotice
);

// ==================== Departments ====================

/**
 * @route   GET /api/v1/administration/departments
 * @desc    Get all departments (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=100] - Items per page
 * @query  {boolean} [isActive] - Filter by active status
 * @returns {Object} Departments array and pagination info
 */
router.get('/departments', administrationController.getAllDepartments);

/**
 * @route   GET /api/v1/administration/departments/:id
 * @desc    Get department by ID
 * @access  Private
 * @param  {string} id - Department ID
 * @returns {Department} Department object
 */
router.get('/departments/:id', administrationController.getDepartmentById);

/**
 * @route   POST /api/v1/administration/departments
 * @desc    Create a new department
 * @access  Private (Requires admin.create permission)
 * @body   {CreateDepartmentDTO} Department creation data
 * @returns {Department} Created department
 */
router.post(
  '/departments',
  requirePermission('admin', 'create'),
  administrationController.createDepartment
);

/**
 * @route   PUT /api/v1/administration/departments/:id
 * @desc    Update a department
 * @access  Private (Requires admin.update permission)
 * @param  {string} id - Department ID
 * @body   {UpdateDepartmentDTO} Partial department data to update
 * @returns {Department} Updated department
 */
router.put(
  '/departments/:id',
  requirePermission('admin', 'update'),
  administrationController.updateDepartment
);

export default router;
