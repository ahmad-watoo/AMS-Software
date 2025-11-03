import { Router } from 'express';
import { MultiCampusController } from '@/controllers/multicampus.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const multiCampusController = new MultiCampusController();

// All multi-campus routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/multicampus/campuses
 * @desc    Get all campuses (with pagination and filters)
 * @access  Private
 */
router.get('/campuses', multiCampusController.getAllCampuses);

/**
 * @route   GET /api/v1/multicampus/campuses/:id
 * @desc    Get campus by ID
 * @access  Private
 */
router.get('/campuses/:id', multiCampusController.getCampusById);

/**
 * @route   POST /api/v1/multicampus/campuses
 * @desc    Create a new campus
 * @access  Private (Requires admin.create permission)
 */
router.post(
  '/campuses',
  requirePermission('admin', 'create'),
  multiCampusController.createCampus
);

/**
 * @route   PUT /api/v1/multicampus/campuses/:id
 * @desc    Update a campus
 * @access  Private (Requires admin.update permission)
 */
router.put(
  '/campuses/:id',
  requirePermission('admin', 'update'),
  multiCampusController.updateCampus
);

/**
 * @route   GET /api/v1/multicampus/campuses/:campusId/report
 * @desc    Get campus report/analytics
 * @access  Private
 */
router.get('/campuses/:campusId/report', multiCampusController.getCampusReport);

/**
 * @route   GET /api/v1/multicampus/student-transfers
 * @desc    Get all student transfers (with pagination and filters)
 * @access  Private
 */
router.get('/student-transfers', multiCampusController.getAllStudentTransfers);

/**
 * @route   GET /api/v1/multicampus/student-transfers/:id
 * @desc    Get student transfer by ID
 * @access  Private
 */
router.get('/student-transfers/:id', multiCampusController.getStudentTransferById);

/**
 * @route   POST /api/v1/multicampus/student-transfers
 * @desc    Create a student transfer request
 * @access  Private
 */
router.post('/student-transfers', multiCampusController.createStudentTransfer);

/**
 * @route   POST /api/v1/multicampus/student-transfers/:id/approve
 * @desc    Approve or reject a student transfer
 * @access  Private (Requires admin.approve permission)
 */
router.post(
  '/student-transfers/:id/approve',
  requirePermission('admin', 'approve'),
  multiCampusController.approveStudentTransfer
);

/**
 * @route   GET /api/v1/multicampus/staff-transfers
 * @desc    Get all staff transfers (with pagination and filters)
 * @access  Private
 */
router.get('/staff-transfers', multiCampusController.getAllStaffTransfers);

/**
 * @route   GET /api/v1/multicampus/staff-transfers/:id
 * @desc    Get staff transfer by ID
 * @access  Private
 */
router.get('/staff-transfers/:id', multiCampusController.getStaffTransferById);

/**
 * @route   POST /api/v1/multicampus/staff-transfers
 * @desc    Create a staff transfer request
 * @access  Private
 */
router.post('/staff-transfers', multiCampusController.createStaffTransfer);

/**
 * @route   POST /api/v1/multicampus/staff-transfers/:id/approve
 * @desc    Approve or reject a staff transfer
 * @access  Private (Requires admin.approve permission)
 */
router.post(
  '/staff-transfers/:id/approve',
  requirePermission('admin', 'approve'),
  multiCampusController.approveStaffTransfer
);

export default router;

