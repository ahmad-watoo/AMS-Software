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

