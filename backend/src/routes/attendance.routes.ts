/**
 * Attendance Routes
 * 
 * Defines all attendance management API endpoints.
 * 
 * Routes:
 * - Records: CRUD operations for attendance records
 * - Bulk Operations: Bulk attendance marking
 * - Summary: Attendance statistics and summaries
 * - Reports: Section and student attendance reports
 * 
 * All routes require authentication.
 * Create and update routes require specific permissions.
 * 
 * @module routes/attendance.routes
 */

import { Router } from 'express';
import { AttendanceController } from '@/controllers/attendance.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const attendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(authenticate);

// ==================== Attendance Records ====================

/**
 * @route   GET /api/v1/attendance/records
 * @desc    Get all attendance records with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [enrollmentId] - Filter by enrollment ID
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [attendanceDate] - Filter by attendance date
 * @query  {string} [status] - Filter by status
 * @returns {Object} Records array and pagination info
 */
router.get('/records', attendanceController.getAllAttendanceRecords);

/**
 * @route   GET /api/v1/attendance/records/:id
 * @desc    Get attendance record by ID
 * @access  Private
 * @param  {string} id - Attendance record ID
 * @returns {AttendanceRecord} Attendance record object
 */
router.get('/records/:id', attendanceController.getAttendanceById);

/**
 * @route   POST /api/v1/attendance/records
 * @desc    Create a new attendance record
 * @access  Private (Requires attendance.create permission)
 * @body   {CreateAttendanceDTO} Attendance creation data
 * @returns {AttendanceRecord} Created attendance record
 */
router.post(
  '/records',
  requirePermission('attendance', 'create'),
  attendanceController.createAttendance
);

/**
 * @route   POST /api/v1/attendance/records/bulk
 * @desc    Bulk create attendance records for a section
 * @access  Private (Requires attendance.create permission)
 * @body   {BulkCreateAttendanceDTO} Bulk attendance creation data
 * @returns {AttendanceRecord[]} Array of created attendance records
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
 * @param  {string} id - Attendance record ID
 * @body   {Object} Update data (status, remarks)
 * @returns {AttendanceRecord} Updated attendance record
 */
router.put(
  '/records/:id',
  requirePermission('attendance', 'update'),
  attendanceController.updateAttendance
);

// ==================== Attendance Summary ====================

/**
 * @route   GET /api/v1/attendance/summary/:enrollmentId
 * @desc    Get attendance summary for an enrollment
 * @access  Private
 * @param  {string} enrollmentId - Enrollment ID
 * @query  {string} [startDate] - Optional start date for date range
 * @query  {string} [endDate] - Optional end date for date range
 * @returns {AttendanceSummary} Attendance summary with statistics
 */
router.get('/summary/:enrollmentId', attendanceController.getAttendanceSummary);

// ==================== Attendance Reports ====================

/**
 * @route   GET /api/v1/attendance/reports/section/:sectionId
 * @desc    Get section attendance report for a specific date
 * @access  Private
 * @param  {string} sectionId - Section ID
 * @query  {string} date - Date for the report (YYYY-MM-DD)
 * @returns {AttendanceReport} Section attendance report
 */
router.get('/reports/section/:sectionId', attendanceController.getSectionAttendanceReport);

/**
 * @route   GET /api/v1/attendance/reports/student/:studentId/:sectionId
 * @desc    Get student attendance report for a date range
 * @access  Private
 * @param  {string} studentId - Student ID
 * @param  {string} sectionId - Section ID
 * @query  {string} startDate - Start date for the range (YYYY-MM-DD)
 * @query  {string} endDate - End date for the range (YYYY-MM-DD)
 * @returns {StudentAttendanceReport} Student attendance report
 */
router.get('/reports/student/:studentId/:sectionId', attendanceController.getStudentAttendanceReport);

export default router;
