/**
 * Attendance Management API Client
 * 
 * Frontend API client for attendance management endpoints.
 * Provides typed functions for all attendance operations including:
 * - Attendance record management (CRUD)
 * - Bulk attendance operations
 * - Attendance summaries and reports
 * 
 * @module api/attendance.api
 */

import apiClient from './client';

/**
 * Attendance Record Interface
 * 
 * Represents a single attendance record for a student.
 * 
 * @interface AttendanceRecord
 */
export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy?: string;
  markedAt?: string;
  createdAt: string;
}

/**
 * Attendance Summary Interface
 * 
 * Represents attendance statistics for an enrollment.
 * 
 * @interface AttendanceSummary
 */
export interface AttendanceSummary {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

/**
 * Bulk Attendance Entry Interface
 * 
 * Represents an entry in a bulk attendance operation.
 * 
 * @interface BulkAttendanceEntry
 */
export interface BulkAttendanceEntry {
  enrollmentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

/**
 * Create Attendance Data Transfer Object
 * 
 * @interface CreateAttendanceDTO
 */
export interface CreateAttendanceDTO {
  enrollmentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

/**
 * Bulk Attendance Data Transfer Object
 * 
 * @interface BulkAttendanceDTO
 */
export interface BulkAttendanceDTO {
  sectionId: string;
  attendanceDate: string;
  entries: BulkAttendanceEntry[];
}

/**
 * Attendance Report Interface
 * 
 * Represents an attendance report with detailed statistics.
 * 
 * @interface AttendanceReport
 */
export interface AttendanceReport {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  sectionCode: string;
  attendancePercentage: number;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  status: 'satisfactory' | 'warning' | 'critical';
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

/**
 * Attendance Management API Client
 * 
 * Provides methods for all attendance management operations.
 */
const attendanceAPI = {
  // ==================== Individual Attendance ====================

  /**
   * Get all attendance records with pagination and filters
   * 
   * Retrieves attendance records with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.enrollmentId] - Filter by enrollment ID
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.courseId] - Filter by course ID
   * @param {string} [params.sectionId] - Filter by section ID
   * @param {string} [params.startDate] - Filter by start date
   * @param {string} [params.endDate] - Filter by end date
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Records array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await attendanceAPI.getAttendanceRecords({
   *   sectionId: 'section123',
   *   attendanceDate: '2024-10-15',
   *   status: 'present',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAttendanceRecords: async (params?: {
    enrollmentId?: string;
    studentId?: string;
    courseId?: string;
    sectionId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/attendance/records', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance records');
    }
    return response.data.data;
  },

  /**
   * Get attendance record by ID
   * 
   * Retrieves a specific attendance record by its ID.
   * 
   * @param {string} id - Attendance record ID
   * @returns {Promise<AttendanceRecord>} Attendance record object
   * @throws {Error} If request fails or record not found
   * 
   * @example
   * const record = await attendanceAPI.getAttendanceRecordById('record123');
   * console.log(record.status); // 'present'
   */
  getAttendanceRecordById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance record');
    }
    return response.data.data;
  },

  /**
   * Create a new attendance record
   * 
   * Creates a new attendance record.
   * Requires attendance.create permission.
   * 
   * @param {CreateAttendanceDTO} data - Attendance creation data
   * @returns {Promise<AttendanceRecord>} Created attendance record
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const record = await attendanceAPI.createAttendanceRecord({
   *   enrollmentId: 'enrollment123',
   *   attendanceDate: '2024-10-15',
   *   status: 'present',
   *   remarks: 'On time'
   * });
   */
  createAttendanceRecord: async (data: CreateAttendanceDTO) => {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/records', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create attendance record');
    }
    return response.data.data;
  },

  /**
   * Update an attendance record
   * 
   * Updates an existing attendance record.
   * Requires attendance.update permission.
   * 
   * @param {string} id - Attendance record ID
   * @param {Partial<CreateAttendanceDTO>} data - Partial attendance data to update
   * @returns {Promise<AttendanceRecord>} Updated attendance record
   * @throws {Error} If request fails or record not found
   * 
   * @example
   * const record = await attendanceAPI.updateAttendanceRecord('record123', {
   *   status: 'late',
   *   remarks: 'Arrived 10 minutes late'
   * });
   */
  updateAttendanceRecord: async (id: string, data: Partial<CreateAttendanceDTO>) => {
    const response = await apiClient.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update attendance record');
    }
    return response.data.data;
  },

  /**
   * Delete an attendance record
   * 
   * Deletes an attendance record.
   * Requires attendance.delete permission.
   * 
   * @param {string} id - Attendance record ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or record not found
   * 
   * @example
   * await attendanceAPI.deleteAttendanceRecord('record123');
   */
  deleteAttendanceRecord: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/attendance/records/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete attendance record');
    }
  },

  // ==================== Bulk Attendance ====================

  /**
   * Create bulk attendance records
   * 
   * Creates multiple attendance records for a section in a single operation.
   * Requires attendance.create permission.
   * 
   * @param {BulkAttendanceDTO} data - Bulk attendance creation data
   * @returns {Promise<any>} Array of created attendance records
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const records = await attendanceAPI.createBulkAttendance({
   *   sectionId: 'section123',
   *   attendanceDate: '2024-10-15',
   *   entries: [
   *     { enrollmentId: 'enrollment1', status: 'present' },
   *     { enrollmentId: 'enrollment2', status: 'absent', remarks: 'Sick' }
   *   ]
   * });
   */
  createBulkAttendance: async (data: BulkAttendanceDTO) => {
    const response = await apiClient.post<ApiResponse<any>>('/attendance/records/bulk', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create bulk attendance');
    }
    return response.data.data;
  },

  // ==================== Attendance Summary ====================

  /**
   * Get attendance summary
   * 
   * Retrieves attendance summary statistics.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.enrollmentId] - Filter by enrollment ID
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.courseId] - Filter by course ID
   * @param {string} [params.sectionId] - Filter by section ID
   * @returns {Promise<AttendanceSummary>} Attendance summary
   * @throws {Error} If request fails
   * 
   * @example
   * const summary = await attendanceAPI.getAttendanceSummary({
   *   enrollmentId: 'enrollment123'
   * });
   * console.log(summary.attendancePercentage); // 85.5
   */
  getAttendanceSummary: async (params?: {
    enrollmentId?: string;
    studentId?: string;
    courseId?: string;
    sectionId?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>('/attendance/summary', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance summary');
    }
    return response.data.data;
  },

  // ==================== Attendance Reports ====================

  /**
   * Get attendance report
   * 
   * Retrieves attendance reports with optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.sectionId] - Filter by section ID
   * @param {string} [params.courseId] - Filter by course ID
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.startDate] - Filter by start date
   * @param {string} [params.endDate] - Filter by end date
   * @param {number} [params.minPercentage] - Minimum attendance percentage
   * @returns {Promise<AttendanceReport[]>} Array of attendance reports
   * @throws {Error} If request fails
   * 
   * @example
   * const reports = await attendanceAPI.getAttendanceReport({
   *   sectionId: 'section123',
   *   startDate: '2024-09-01',
   *   endDate: '2024-10-31',
   *   minPercentage: 75
   * });
   */
  getAttendanceReport: async (params?: {
    sectionId?: string;
    courseId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
    minPercentage?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<AttendanceReport[]>>('/attendance/reports', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance report');
    }
    return response.data.data;
  },
};

export default attendanceAPI;
