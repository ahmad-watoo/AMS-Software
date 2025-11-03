import { Router } from 'express';
import { AdministrationController } from '@/controllers/administration.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const administrationController = new AdministrationController();

// All administration routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/administration/system-configs
 * @desc    Get all system configs (with pagination and filters)
 * @access  Private
 */
router.get('/system-configs', administrationController.getAllSystemConfigs);

/**
 * @route   GET /api/v1/administration/system-configs/:key
 * @desc    Get system config by key
 * @access  Private
 */
router.get('/system-configs/:key', administrationController.getSystemConfigByKey);

/**
 * @route   POST /api/v1/administration/system-configs
 * @desc    Create a new system config
 * @access  Private (Requires admin.create permission)
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
 */
router.put(
  '/system-configs/:key',
  requirePermission('admin', 'update'),
  administrationController.updateSystemConfig
);

/**
 * @route   GET /api/v1/administration/events
 * @desc    Get all events (with pagination and filters)
 * @access  Private
 */
router.get('/events', administrationController.getAllEvents);

/**
 * @route   GET /api/v1/administration/events/:id
 * @desc    Get event by ID
 * @access  Private
 */
router.get('/events/:id', administrationController.getEventById);

/**
 * @route   POST /api/v1/administration/events
 * @desc    Create a new event
 * @access  Private (Requires admin.create permission)
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
 */
router.put(
  '/events/:id',
  requirePermission('admin', 'update'),
  administrationController.updateEvent
);

/**
 * @route   GET /api/v1/administration/notices
 * @desc    Get all notices (with pagination and filters)
 * @access  Private
 */
router.get('/notices', administrationController.getAllNotices);

/**
 * @route   GET /api/v1/administration/notices/:id
 * @desc    Get notice by ID
 * @access  Private
 */
router.get('/notices/:id', administrationController.getNoticeById);

/**
 * @route   POST /api/v1/administration/notices
 * @desc    Create a new notice
 * @access  Private (Requires admin.create permission)
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
 */
router.put(
  '/notices/:id',
  requirePermission('admin', 'update'),
  administrationController.updateNotice
);

/**
 * @route   GET /api/v1/administration/departments
 * @desc    Get all departments (with pagination and filters)
 * @access  Private
 */
router.get('/departments', administrationController.getAllDepartments);

/**
 * @route   GET /api/v1/administration/departments/:id
 * @desc    Get department by ID
 * @access  Private
 */
router.get('/departments/:id', administrationController.getDepartmentById);

/**
 * @route   POST /api/v1/administration/departments
 * @desc    Create a new department
 * @access  Private (Requires admin.create permission)
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
 */
router.put(
  '/departments/:id',
  requirePermission('admin', 'update'),
  administrationController.updateDepartment
);

export default router;

