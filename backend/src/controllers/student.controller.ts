import { Request, Response, NextFunction } from 'express';
import { StudentService } from '@/services/student.service';
import { CreateStudentDTO, UpdateStudentDTO, StudentSearchFilters } from '@/models/Student.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  getAllStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters: StudentSearchFilters = {
        search: req.query.search as string,
        programId: req.query.programId as string,
        batch: req.query.batch as string,
        enrollmentStatus: req.query.enrollmentStatus as string,
        currentSemester: req.query.currentSemester ? parseInt(req.query.currentSemester as string) : undefined,
      };

      const result = await this.studentService.getAllStudents(limit, offset, filters);

      sendSuccess(res, {
        students: result.students,
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
      logger.error('Get all students error:', error);
      next(error);
    }
  };

  getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const student = await this.studentService.getStudentById(id);
      sendSuccess(res, student);
    } catch (error) {
      logger.error('Get student by ID error:', error);
      next(error);
    }
  };

  getStudentByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const student = await this.studentService.getStudentByUserId(userId);
      sendSuccess(res, student);
    } catch (error) {
      logger.error('Get student by user ID error:', error);
      next(error);
    }
  };

  createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentData: CreateStudentDTO = {
        userId: req.body.userId,
        rollNumber: req.body.rollNumber,
        registrationNumber: req.body.registrationNumber,
        programId: req.body.programId,
        batch: req.body.batch,
        admissionDate: req.body.admissionDate,
        currentSemester: req.body.currentSemester || 1,
        bloodGroup: req.body.bloodGroup,
        emergencyContactName: req.body.emergencyContactName,
        emergencyContactPhone: req.body.emergencyContactPhone,
        guardianId: req.body.guardianId,
      };

      if (!studentData.userId || !studentData.rollNumber || !studentData.programId || !studentData.batch) {
        throw new ValidationError('userId, rollNumber, programId, and batch are required');
      }

      const student = await this.studentService.createStudent(studentData);
      sendSuccess(res, student, 'Student created successfully', 201);
    } catch (error) {
      logger.error('Create student error:', error);
      next(error);
    }
  };

  updateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const studentData: UpdateStudentDTO = {
        rollNumber: req.body.rollNumber,
        registrationNumber: req.body.registrationNumber,
        programId: req.body.programId,
        batch: req.body.batch,
        currentSemester: req.body.currentSemester,
        enrollmentStatus: req.body.enrollmentStatus,
        bloodGroup: req.body.bloodGroup,
        emergencyContactName: req.body.emergencyContactName,
        emergencyContactPhone: req.body.emergencyContactPhone,
        guardianId: req.body.guardianId,
      };

      const student = await this.studentService.updateStudent(id, studentData);
      sendSuccess(res, student, 'Student updated successfully');
    } catch (error) {
      logger.error('Update student error:', error);
      next(error);
    }
  };

  deleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.studentService.deleteStudent(id);
      sendSuccess(res, null, 'Student deleted successfully');
    } catch (error) {
      logger.error('Delete student error:', error);
      next(error);
    }
  };

  getStudentEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const semester = req.query.semester as string | undefined;
      const enrollments = await this.studentService.getStudentEnrollments(id, semester);
      sendSuccess(res, enrollments);
    } catch (error) {
      logger.error('Get student enrollments error:', error);
      next(error);
    }
  };

  getStudentResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const semester = req.query.semester as string | undefined;
      const results = await this.studentService.getStudentResults(id, semester);
      sendSuccess(res, results);
    } catch (error) {
      logger.error('Get student results error:', error);
      next(error);
    }
  };

  getStudentCGPA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const cgpa = await this.studentService.calculateCGPA(id);
      sendSuccess(res, { cgpa });
    } catch (error) {
      logger.error('Get student CGPA error:', error);
      next(error);
    }
  };
}

