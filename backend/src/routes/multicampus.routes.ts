/**
 * Multi-Campus Routes
 * 
 * Defines all multi-campus management API endpoints.
 * 
 * Routes:
 * - Campuses: CRUD operations for campus management
 * - Student Transfers: Student transfer requests and approvals
 * - Staff Transfers: Staff transfer requests and approvals
 * - Campus Reports: Campus analytics and reporting
 * 
 * All routes require authentication.
 * Create, update, and approve routes require specific permissions.
 * 
 * @module routes/multicampus.routes
 */

import { Router } from 'express';
import { MultiCampusController } from '@/controllers/multicampus.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const multiCampusController = new MultiCampusController();

// All multi-campus routes require authentication
router.use(authenticate);

// ==================== Campuses ====================

/**
 * @route   GET /api/v1/multicampus/campuses
 * @desc    Get all campuses (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=100] - Items per page
 * @query  {string} [province] - Filter by province
 * @query  {string} [city] - Filter by city
 * @query  {boolean} [isActive] - Filter by active status
 * @returns {Object} Campuses array and pagination info
 */
router.get('/campuses', multiCampusController.getAllCampuses);

/**
 * @route   GET /api/v1/multicampus/campuses/:id
 * @desc    Get campus by ID
 * @access  Private
 * @param  {string} id - Campus ID
 * @returns {Campus} Campus object
 */
router.get('/campuses/:id', multiCampusController.getCampusById);

/**
 * @route   POST /api/v1/multicampus/campuses
 * @desc    Create a new campus
 * @access  Private (Requires admin.create permission)
 * @body   {CreateCampusDTO} Campus creation data
 * @returns {Campus} Created campus
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
 * @param  {string} id - Campus ID
 * @body   {UpdateCampusDTO} Partial campus data to update
 * @returns {Campus} Updated campus
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
 * @param  {string} campusId - Campus ID
 * @query  {string} [reportPeriod] - Report period (YYYY-MM-DD)
 * @returns {CampusReport} Campus report with statistics
 */
router.get('/campuses/:campusId/report', multiCampusController.getCampusReport);

// ==================== Student Transfers ====================

/**
 * @route   GET /api/v1/multicampus/student-transfers
 * @desc    Get all student transfers (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [fromCampusId] - Filter by source campus ID
 * @query  {string} [toCampusId] - Filter by destination campus ID
 * @query  {string} [status] - Filter by transfer status
 * @returns {Object} Student transfers array and pagination info
 */
router.get('/student-transfers', multiCampusController.getAllStudentTransfers);

/**
 * @route   GET /api/v1/multicampus/student-transfers/:id
 * @desc    Get student transfer by ID
 * @access  Private
 * @param  {string} id - Student transfer ID
 * @returns {StudentTransfer} Student transfer object
 */
router.get('/student-transfers/:id', multiCampusController.getStudentTransferById);

/**
 * @route   POST /api/v1/multicampus/student-transfers
 * @desc    Create a student transfer request
 * @access  Private
 * @body   {CreateStudentTransferDTO} Student transfer creation data
 * @returns {StudentTransfer} Created student transfer
 */
router.post('/student-transfers', multiCampusController.createStudentTransfer);

/**
 * @route   POST /api/v1/multicampus/student-transfers/:id/approve
 * @desc    Approve or reject a student transfer
 * @access  Private (Requires admin.approve permission)
 * @param  {string} id - Student transfer ID
 * @body   {ApproveTransferDTO} Approval/rejection data
 * @returns {StudentTransfer} Updated student transfer
 */
router.post(
  '/student-transfers/:id/approve',
  requirePermission('admin', 'approve'),
  multiCampusController.approveStudentTransfer
);

// ==================== Staff Transfers ====================

/**
 * @route   GET /api/v1/multicampus/staff-transfers
 * @desc    Get all staff transfers (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [staffId] - Filter by staff ID
 * @query  {string} [fromCampusId] - Filter by source campus ID
 * @query  {string} [toCampusId] - Filter by destination campus ID
 * @query  {string} [status] - Filter by transfer status
 * @returns {Object} Staff transfers array and pagination info
 */
router.get('/staff-transfers', multiCampusController.getAllStaffTransfers);

/**
 * @route   GET /api/v1/multicampus/staff-transfers/:id
 * @desc    Get staff transfer by ID
 * @access  Private
 * @param  {string} id - Staff transfer ID
 * @returns {StaffTransfer} Staff transfer object
 */
router.get('/staff-transfers/:id', multiCampusController.getStaffTransferById);

/**
 * @route   POST /api/v1/multicampus/staff-transfers
 * @desc    Create a staff transfer request
 * @access  Private
 * @body   {CreateStaffTransferDTO} Staff transfer creation data
 * @returns {StaffTransfer} Created staff transfer
 */
router.post('/staff-transfers', multiCampusController.createStaffTransfer);

/**
 * @route   POST /api/v1/multicampus/staff-transfers/:id/approve
 * @desc    Approve or reject a staff transfer
 * @access  Private (Requires admin.approve permission)
 * @param  {string} id - Staff transfer ID
 * @body   {ApproveTransferDTO} Approval/rejection data
 * @returns {StaffTransfer} Updated staff transfer
 */
router.post(
  '/staff-transfers/:id/approve',
  requirePermission('admin', 'approve'),
  multiCampusController.approveStaffTransfer
);

export default router;
