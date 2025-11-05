/**
 * Attendance Controller
 * 
 * Handles HTTP requests for attendance management endpoints.
 * Manages attendance records, bulk operations, summaries, and reports.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/attendance.controller
 */

import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '@/services/attendance.service';
import {
  CreateAttendanceDTO,
  BulkCreateAttendanceDTO,
} from '@/models/Attendance.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  /**
   * Get All Attendance Records Endpoint Handler
   * 
   * Retrieves all attendance records with pagination and optional filters.
   * 
   * @route GET /api/v1/attendance/records
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [enrollmentId] - Filter by enrollment ID
   * @query {string} [sectionId] - Filter by section ID
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [attendanceDate] - Filter by attendance date
   * @query {string} [status] - Filter by status
   * @returns {Object} Records array and pagination info
   * 
   * @example
   * GET /api/v1/attendance/records?page=1&limit=20&sectionId=section123&status=present
   */
  getAllAttendanceRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        enrollmentId: req.query.enrollmentId as string,
        sectionId: req.query.sectionId as string,
        studentId: req.query.studentId as string,
        attendanceDate: req.query.attendanceDate as string,
        status: req.query.status as string,
      };

      const result = await this.attendanceService.getAllAttendanceRecords(limit, offset, filters);

      sendSuccess(res, {
        records: result.records,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all attendance records error:', error);
      next(error);
    }
  };

  /**
   * Get Attendance By ID Endpoint Handler
   * 
   * Retrieves a specific attendance record by ID.
   * 
   * @route GET /api/v1/attendance/records/:id
   * @access Private
   * @param {string} id - Attendance record ID
   * @returns {AttendanceRecord} Attendance record object
   */
  getAttendanceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.attendanceService.getAttendanceById(id);
      sendSuccess(res, record);
    } catch (error) {
      logger.error('Get attendance by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Attendance Endpoint Handler
   * 
   * Creates a new attendance record.
   * 
   * @route POST /api/v1/attendance/records
   * @access Private (Requires attendance.create permission)
   * @body {CreateAttendanceDTO} Attendance creation data
   * @returns {AttendanceRecord} Created attendance record
   * 
   * @example
   * POST /api/v1/attendance/records
   * Body: {
   *   enrollmentId: "enrollment123",
   *   sectionId: "section456",
   *   studentId: "student789",
   *   attendanceDate: "2024-10-15",
   *   status: "present",
   *   remarks: "On time"
   * }
   */
  createAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attendanceData: CreateAttendanceDTO = {
        enrollmentId: req.body.enrollmentId,
        sectionId: req.body.sectionId,
        studentId: req.body.studentId,
        attendanceDate: req.body.attendanceDate,
        status: req.body.status,
        remarks: req.body.remarks,
      };

      if (!attendanceData.enrollmentId || !attendanceData.sectionId || !attendanceData.studentId || !attendanceData.attendanceDate || !attendanceData.status) {
        throw new ValidationError('All required fields must be provided');
      }

      const markedBy = req.user?.userId;
      const record = await this.attendanceService.createAttendance(attendanceData, markedBy);
      sendSuccess(res, record, 'Attendance marked successfully', 201);
    } catch (error) {
      logger.error('Create attendance error:', error);
      next(error);
    }
  };

  /**
   * Bulk Create Attendance Endpoint Handler
   * 
   * Creates multiple attendance records for a section in a single operation.
   * 
   * @route POST /api/v1/attendance/records/bulk
   * @access Private (Requires attendance.create permission)
   * @body {BulkCreateAttendanceDTO} Bulk attendance creation data
   * @returns {AttendanceRecord[]} Array of created attendance records
   * 
   * @example
   * POST /api/v1/attendance/records/bulk
   * Body: {
   *   sectionId: "section123",
   *   attendanceDate: "2024-10-15",
   *   entries: [
   *     { enrollmentId: "enrollment1", status: "present" },
   *     { enrollmentId: "enrollment2", status: "absent", remarks: "Sick" }
   *   ]
   * }
   */
  bulkCreateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bulkData: BulkCreateAttendanceDTO = {
        sectionId: req.body.sectionId,
        attendanceDate: req.body.attendanceDate,
        entries: req.body.entries,
      };

      if (!bulkData.sectionId || !bulkData.attendanceDate || !bulkData.entries || bulkData.entries.length === 0) {
        throw new ValidationError('Section ID, attendance date, and entries are required');
      }

      const markedBy = req.user?.userId;
      const records = await this.attendanceService.bulkCreateAttendance(bulkData, markedBy);
      sendSuccess(res, records, `Attendance marked for ${records.length} students`, 201);
    } catch (error) {
      logger.error('Bulk create attendance error:', error);
      next(error);
    }
  };

  /**
   * Update Attendance Endpoint Handler
   * 
   * Updates an existing attendance record.
   * 
   * @route PUT /api/v1/attendance/records/:id
   * @access Private (Requires attendance.update permission)
   * @param {string} id - Attendance record ID
   * @body {Object} Update data
   * @body {string} body.status - New attendance status
   * @body {string} [body.remarks] - Optional remarks
   * @returns {AttendanceRecord} Updated attendance record
   * 
   * @example
   * PUT /api/v1/attendance/records/record123
   * Body: {
   *   status: "late",
   *   remarks: "Arrived 10 minutes late"
   * }
   */
  updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError('Invalid attendance status');
      }

      const record = await this.attendanceService.updateAttendance(id, status, remarks);
      sendSuccess(res, record, 'Attendance updated successfully');
    } catch (error) {
      logger.error('Update attendance error:', error);
      next(error);
    }
  };

  /**
   * Get Attendance Summary Endpoint Handler
   * 
   * Retrieves attendance summary for a specific enrollment.
   * 
   * @route GET /api/v1/attendance/summary/:enrollmentId
   * @access Private
   * @param {string} enrollmentId - Enrollment ID
   * @query {string} [startDate] - Optional start date for date range
   * @query {string} [endDate] - Optional end date for date range
   * @returns {AttendanceSummary} Attendance summary with statistics
   * 
   * @example
   * GET /api/v1/attendance/summary/enrollment123?startDate=2024-09-01&endDate=2024-10-31
   */
  getAttendanceSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { enrollmentId } = req.params;
      const { startDate, endDate } = req.query;

      const summary = await this.attendanceService.getAttendanceSummary(
        enrollmentId,
        startDate as string,
        endDate as string
      );
      sendSuccess(res, summary);
    } catch (error) {
      logger.error('Get attendance summary error:', error);
      next(error);
    }
  };

  /**
   * Get Section Attendance Report Endpoint Handler
   * 
   * Generates attendance report for a section on a specific date.
   * 
   * @route GET /api/v1/attendance/reports/section/:sectionId
   * @access Private
   * @param {string} sectionId - Section ID
   * @query {string} date - Date for the report (YYYY-MM-DD)
   * @returns {AttendanceReport} Section attendance report
   * 
   * @example
   * GET /api/v1/attendance/reports/section/section123?date=2024-10-15
   */
  getSectionAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sectionId } = req.params;
      const { date } = req.query;

      if (!date) {
        throw new ValidationError('Date is required');
      }

      const report = await this.attendanceService.getSectionAttendanceReport(sectionId, date as string);
      sendSuccess(res, report);
    } catch (error) {
      logger.error('Get section attendance report error:', error);
      next(error);
    }
  };

  /**
   * Get Student Attendance Report Endpoint Handler
   * 
   * Generates attendance report for a specific student in a section over a date range.
   * 
   * @route GET /api/v1/attendance/reports/student/:studentId/:sectionId
   * @access Private
   * @param {string} studentId - Student ID
   * @param {string} sectionId - Section ID
   * @query {string} startDate - Start date for the range (YYYY-MM-DD)
   * @query {string} endDate - End date for the range (YYYY-MM-DD)
   * @returns {StudentAttendanceReport} Student attendance report
   * 
   * @example
   * GET /api/v1/attendance/reports/student/student123/section456?startDate=2024-09-01&endDate=2024-10-31
   */
  getStudentAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, sectionId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date are required');
      }

      const report = await this.attendanceService.getStudentAttendanceReport(
        studentId,
        sectionId,
        startDate as string,
        endDate as string
      );
      sendSuccess(res, report);
    } catch (error) {
      logger.error('Get student attendance report error:', error);
      next(error);
    }
  };
}
