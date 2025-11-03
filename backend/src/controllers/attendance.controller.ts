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

