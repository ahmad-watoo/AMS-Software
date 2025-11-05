/**
 * Attendance Service
 * 
 * This service handles all attendance management business logic including:
 * - Attendance record creation (individual and bulk)
 * - Attendance record updates
 * - Attendance summary calculations
 * - Attendance reporting (section and student level)
 * 
 * The attendance system manages:
 * - Daily attendance tracking (present, absent, late, excused)
 * - Bulk attendance marking for entire sections
 * - Attendance percentage calculations
 * - Attendance reports and summaries
 * 
 * @module services/attendance.service
 */

import { AttendanceRepository } from '@/repositories/attendance.repository';
import {
  AttendanceRecord,
  AttendanceSummary,
  CreateAttendanceDTO,
  BulkCreateAttendanceDTO,
  AttendanceReport,
  StudentAttendanceReport,
} from '@/models/Attendance.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AttendanceService {
  private attendanceRepository: AttendanceRepository;

  constructor() {
    this.attendanceRepository = new AttendanceRepository();
  }

  /**
   * Get all attendance records with pagination and filters
   * 
   * Retrieves attendance records with optional filtering by enrollment,
   * section, student, date, and status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of records to return
   * @param {number} [offset=0] - Number of records to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.enrollmentId] - Filter by enrollment ID
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.attendanceDate] - Filter by attendance date
   * @param {string} [filters.status] - Filter by status (present, absent, late, excused)
   * @returns {Promise<{records: AttendanceRecord[], total: number}>} Records and total count
   * 
   * @example
   * const { records, total } = await attendanceService.getAllAttendanceRecords(20, 0, {
   *   sectionId: 'section123',
   *   attendanceDate: '2024-10-15',
   *   status: 'present'
   * });
   */
  async getAllAttendanceRecords(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      enrollmentId?: string;
      sectionId?: string;
      studentId?: string;
      attendanceDate?: string;
      status?: string;
    }
  ): Promise<{
    records: AttendanceRecord[];
    total: number;
  }> {
    try {
      const allRecords = await this.attendanceRepository.findAllAttendanceRecords(limit * 10, 0, filters);
      const paginatedRecords = allRecords.slice(offset, offset + limit);

      return {
        records: paginatedRecords,
        total: allRecords.length,
      };
    } catch (error) {
      logger.error('Error getting all attendance records:', error);
      throw new Error('Failed to fetch attendance records');
    }
  }

  /**
   * Get attendance record by ID
   * 
   * Retrieves a specific attendance record by its ID.
   * 
   * @param {string} id - Attendance record ID
   * @returns {Promise<AttendanceRecord>} Attendance record object
   * @throws {NotFoundError} If record not found
   */
  async getAttendanceById(id: string): Promise<AttendanceRecord> {
    try {
      const record = await this.attendanceRepository.findAttendanceById(id);
      if (!record) {
        throw new NotFoundError('Attendance record');
      }
      return record;
    } catch (error) {
      logger.error('Error getting attendance by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch attendance record');
    }
  }

  /**
   * Create a new attendance record
   * 
   * Creates a new attendance record with validation.
   * Validates required fields, date format, and status.
   * 
   * @param {CreateAttendanceDTO} attendanceData - Attendance creation data
   * @param {string} [markedBy] - ID of user marking the attendance
   * @returns {Promise<AttendanceRecord>} Created attendance record
   * @throws {ValidationError} If attendance data is invalid
   * 
   * @example
   * const record = await attendanceService.createAttendance({
   *   enrollmentId: 'enrollment123',
   *   sectionId: 'section456',
   *   studentId: 'student789',
   *   attendanceDate: '2024-10-15',
   *   status: 'present',
   *   remarks: 'On time'
   * }, 'faculty123');
   */
  async createAttendance(attendanceData: CreateAttendanceDTO, markedBy?: string): Promise<AttendanceRecord> {
    try {
      // Validate required fields
      if (!attendanceData.enrollmentId || !attendanceData.sectionId || !attendanceData.studentId || !attendanceData.attendanceDate || !attendanceData.status) {
        throw new ValidationError('All required fields must be provided');
      }

      // Validate date format
      const date = new Date(attendanceData.attendanceDate);
      if (isNaN(date.getTime())) {
        throw new ValidationError('Invalid date format');
      }

      // Validate status
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(attendanceData.status)) {
        throw new ValidationError('Invalid attendance status');
      }

      return await this.attendanceRepository.createAttendance(attendanceData, markedBy);
    } catch (error) {
      logger.error('Error creating attendance:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new ValidationError(error.message);
      }
      throw new Error('Failed to create attendance');
    }
  }

  /**
   * Bulk create attendance records
   * 
   * Creates multiple attendance records for a section in a single operation.
   * Useful for marking attendance for an entire class at once.
   * 
   * @param {BulkCreateAttendanceDTO} bulkData - Bulk attendance creation data
   * @param {string} [markedBy] - ID of user marking the attendance
   * @returns {Promise<AttendanceRecord[]>} Array of created attendance records
   * @throws {ValidationError} If bulk data is invalid
   * 
   * @example
   * const records = await attendanceService.bulkCreateAttendance({
   *   sectionId: 'section123',
   *   attendanceDate: '2024-10-15',
   *   entries: [
   *     { enrollmentId: 'enrollment1', status: 'present' },
   *     { enrollmentId: 'enrollment2', status: 'absent', remarks: 'Sick' },
   *     { enrollmentId: 'enrollment3', status: 'late' }
   *   ]
   * }, 'faculty123');
   */
  async bulkCreateAttendance(
    bulkData: BulkCreateAttendanceDTO,
    markedBy?: string
  ): Promise<AttendanceRecord[]> {
    try {
      // Validate required fields
      if (!bulkData.sectionId || !bulkData.attendanceDate || !bulkData.entries || bulkData.entries.length === 0) {
        throw new ValidationError('Section ID, attendance date, and entries are required');
      }

      // Validate date format
      const date = new Date(bulkData.attendanceDate);
      if (isNaN(date.getTime())) {
        throw new ValidationError('Invalid date format');
      }

      // Validate all entries
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      for (const entry of bulkData.entries) {
        if (!entry.enrollmentId) {
          throw new ValidationError('All entries must have enrollment ID');
        }
        if (!validStatuses.includes(entry.status)) {
          throw new ValidationError(`Invalid attendance status: ${entry.status}`);
        }
      }

      return await this.attendanceRepository.bulkCreateAttendance(bulkData, markedBy);
    } catch (error) {
      logger.error('Error bulk creating attendance:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to bulk create attendance');
    }
  }

  /**
   * Update an attendance record
   * 
   * Updates an existing attendance record's status and remarks.
   * 
   * @param {string} id - Attendance record ID
   * @param {'present' | 'absent' | 'late' | 'excused'} status - New attendance status
   * @param {string} [remarks] - Optional remarks
   * @returns {Promise<AttendanceRecord>} Updated attendance record
   * @throws {NotFoundError} If record not found
   * @throws {ValidationError} If status is invalid
   */
  async updateAttendance(
    id: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    remarks?: string
  ): Promise<AttendanceRecord> {
    try {
      const existingRecord = await this.attendanceRepository.findAttendanceById(id);
      if (!existingRecord) {
        throw new NotFoundError('Attendance record');
      }

      // Validate status
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError('Invalid attendance status');
      }

      return await this.attendanceRepository.updateAttendance(id, status, remarks);
    } catch (error) {
      logger.error('Error updating attendance:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update attendance');
    }
  }

  /**
   * Get attendance summary for an enrollment
   * 
   * Calculates attendance statistics for a specific enrollment
   * within an optional date range.
   * 
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} [startDate] - Optional start date for date range
   * @param {string} [endDate] - Optional end date for date range
   * @returns {Promise<AttendanceSummary>} Attendance summary with statistics
   * @throws {ValidationError} If enrollment ID is missing
   * @throws {NotFoundError} If summary not found
   * 
   * @example
   * const summary = await attendanceService.getAttendanceSummary(
   *   'enrollment123',
   *   '2024-09-01',
   *   '2024-10-31'
   * );
   * console.log(summary.attendancePercentage); // 85.5
   */
  async getAttendanceSummary(
    enrollmentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceSummary> {
    try {
      if (!enrollmentId) {
        throw new ValidationError('Enrollment ID is required');
      }

      const summary = await this.attendanceRepository.getAttendanceSummary(enrollmentId, startDate, endDate);
      if (!summary) {
        throw new NotFoundError('Attendance summary');
      }

      return summary;
    } catch (error) {
      logger.error('Error getting attendance summary:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to fetch attendance summary');
    }
  }

  /**
   * Get section attendance report for a specific date
   * 
   * Generates a comprehensive attendance report for a section on a specific date.
   * Includes counts for each status and overall attendance percentage.
   * 
   * @param {string} sectionId - Section ID
   * @param {string} attendanceDate - Date for the report (YYYY-MM-DD)
   * @returns {Promise<AttendanceReport>} Section attendance report
   * @throws {ValidationError} If section ID or date is missing
   * 
   * @example
   * const report = await attendanceService.getSectionAttendanceReport(
   *   'section123',
   *   '2024-10-15'
   * );
   * console.log(report.attendancePercentage); // 92.5
   * console.log(report.present); // 37
   * console.log(report.absent); // 3
   */
  async getSectionAttendanceReport(
    sectionId: string,
    attendanceDate: string
  ): Promise<AttendanceReport> {
    try {
      if (!sectionId || !attendanceDate) {
        throw new ValidationError('Section ID and attendance date are required');
      }

      const records = await this.attendanceRepository.getSectionAttendanceByDate(sectionId, attendanceDate);
      const totalStudents = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const excused = records.filter((r) => r.status === 'excused').length;
      const attendancePercentage = totalStudents > 0 ? (present / totalStudents) * 100 : 0;

      return {
        sectionId,
        attendanceDate,
        totalStudents,
        present,
        absent,
        late,
        excused,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        records,
      };
    } catch (error) {
      logger.error('Error getting section attendance report:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to fetch attendance report');
    }
  }

  /**
   * Get student attendance report for a date range
   * 
   * Generates a comprehensive attendance report for a specific student
   * in a section over a date range.
   * 
   * @param {string} studentId - Student ID
   * @param {string} sectionId - Section ID
   * @param {string} startDate - Start date for the range (YYYY-MM-DD)
   * @param {string} endDate - End date for the range (YYYY-MM-DD)
   * @returns {Promise<StudentAttendanceReport>} Student attendance report
   * @throws {ValidationError} If any parameter is missing
   * 
   * @example
   * const report = await attendanceService.getStudentAttendanceReport(
   *   'student123',
   *   'section456',
   *   '2024-09-01',
   *   '2024-10-31'
   * );
   * console.log(report.attendancePercentage); // 88.2
   * console.log(report.totalClasses); // 34
   * console.log(report.present); // 30
   */
  async getStudentAttendanceReport(
    studentId: string,
    sectionId: string,
    startDate: string,
    endDate: string
  ): Promise<StudentAttendanceReport> {
    try {
      if (!studentId || !sectionId || !startDate || !endDate) {
        throw new ValidationError('All parameters are required');
      }

      const records = await this.attendanceRepository.findAllAttendanceRecords(1000, 0, {
        studentId,
        sectionId,
      });

      // Filter by date range
      const filteredRecords = records.filter(
        (r) => r.attendanceDate >= startDate && r.attendanceDate <= endDate
      );

      const totalClasses = filteredRecords.length;
      const present = filteredRecords.filter((r) => r.status === 'present').length;
      const absent = filteredRecords.filter((r) => r.status === 'absent').length;
      const late = filteredRecords.filter((r) => r.status === 'late').length;
      const excused = filteredRecords.filter((r) => r.status === 'excused').length;
      const attendancePercentage = totalClasses > 0 ? (present / totalClasses) * 100 : 0;

      return {
        studentId,
        sectionId,
        startDate,
        endDate,
        totalClasses,
        present,
        absent,
        late,
        excused,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        records: filteredRecords,
      };
    } catch (error) {
      logger.error('Error getting student attendance report:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to fetch student attendance report');
    }
  }
}
