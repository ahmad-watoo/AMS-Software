import { Router } from 'express';
import { AttendanceController } from '@/controllers/attendance.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const attendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/attendance/records
 * @desc    Get all attendance records (with pagination and filters)
 * @access  Private
 */
router.get('/records', attendanceController.getAllAttendanceRecords);

/**
 * @route   GET /api/v1/attendance/records/:id
 * @desc    Get attendance record by ID
 * @access  Private
 */
router.get('/records/:id', attendanceController.getAttendanceById);

/**
 * @route   POST /api/v1/attendance/records
 * @desc    Create a new attendance record
 * @access  Private (Requires attendance.create permission)
 */
router.post(
  '/records',
  requirePermission('attendance', 'create'),
  attendanceController.createAttendance
);

/**
 * @route   POST /api/v1/attendance/records/bulk
 * @desc    Bulk create attendance records
 * @access  Private (Requires attendance.create permission)
 */
router.post(
  '/records/bulk',
  requirePermission('attendance', 'create'),
  attendanceController.bulkCreateAttendance
);

/**
 * @route   PUT /api/v1/attendance/records/:id
 * @desc    Update an attendance record
 * @access  Private (Requires attendance.update permission)
 */
router.put(
  '/records/:id',
  requirePermission('attendance', 'update'),
  attendanceController.updateAttendance
);

/**
 * @route   GET /api/v1/attendance/summary/:enrollmentId
 * @desc    Get attendance summary for an enrollment
 * @access  Private
 */
router.get('/summary/:enrollmentId', attendanceController.getAttendanceSummary);

/**
 * @route   GET /api/v1/attendance/reports/section/:sectionId
 * @desc    Get section attendance report for a specific date
 * @access  Private
 */
router.get('/reports/section/:sectionId', attendanceController.getSectionAttendanceReport);

/**
 * @route   GET /api/v1/attendance/reports/student/:studentId/:sectionId
 * @desc    Get student attendance report for a date range
 * @access  Private
 */
router.get('/reports/student/:studentId/:sectionId', attendanceController.getStudentAttendanceReport);

export default router;

