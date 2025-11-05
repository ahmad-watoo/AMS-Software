/**
 * Student Controller
 * 
 * Handles HTTP requests for student management endpoints.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/student.controller
 */

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

  /**
   * Get All Students Endpoint Handler
   * 
   * Retrieves all students with pagination and optional filters.
   * 
   * @route GET /api/v1/students
   * @access Private (Requires student.read permission)
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [search] - Search query
   * @query {string} [programId] - Filter by program ID
   * @query {string} [batch] - Filter by batch
   * @query {string} [enrollmentStatus] - Filter by enrollment status
   * @query {number} [currentSemester] - Filter by current semester
   * @returns {Object} Students array and pagination info
   * 
   * @example
   * GET /api/v1/students?page=1&limit=20&search=BS2024&programId=prog123
   */
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

  /**
   * Get Student By ID Endpoint Handler
   * 
   * Retrieves a specific student by ID with full details.
   * 
   * @route GET /api/v1/students/:id
   * @access Private
   * @param {string} id - Student ID
   * @returns {StudentWithUser} Student with user and program details
   */
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

  /**
   * Get Student By User ID Endpoint Handler
   * 
   * Retrieves a student record associated with a user ID.
   * 
   * @route GET /api/v1/students/user/:userId
   * @access Private
   * @param {string} userId - User ID
   * @returns {StudentWithUser} Student with user and program details
   */
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

  /**
   * Create Student Endpoint Handler
   * 
   * Creates a new student record.
   * 
   * @route POST /api/v1/students
   * @access Private (Requires student.create permission)
   * @body {CreateStudentDTO} Student creation data
   * @returns {Student} Created student
   * 
   * @example
   * POST /api/v1/students
   * Body: {
   *   userId: "user123",
   *   rollNumber: "BS2024-001",
   *   programId: "prog456",
   *   batch: "2024-Fall",
   *   admissionDate: "2024-09-01"
   * }
   */
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

  /**
   * Update Student Endpoint Handler
   * 
   * Updates an existing student's information.
   * 
   * @route PUT /api/v1/students/:id
   * @access Private (Requires student.update permission)
   * @param {string} id - Student ID
   * @body {UpdateStudentDTO} Partial student data to update
   * @returns {Student} Updated student
   * 
   * @example
   * PUT /api/v1/students/student123
   * Body: {
   *   currentSemester: 2,
   *   enrollmentStatus: "active"
   * }
   */
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

  /**
   * Delete Student Endpoint Handler
   * 
   * Deletes a student record.
   * 
   * @route DELETE /api/v1/students/:id
   * @access Private (Requires student.delete permission)
   * @param {string} id - Student ID
   * @returns {message: "Student deleted successfully"}
   */
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

  /**
   * Get Student Enrollments Endpoint Handler
   * 
   * Retrieves all course enrollments for a student.
   * 
   * @route GET /api/v1/students/:id/enrollments
   * @access Private
   * @param {string} id - Student ID
   * @query {string} [semester] - Optional semester filter
   * @returns {Array} Array of enrollments with course details
   */
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

  /**
   * Get Student Results Endpoint Handler
   * 
   * Retrieves all exam results for a student.
   * 
   * @route GET /api/v1/students/:id/results
   * @access Private
   * @param {string} id - Student ID
   * @query {string} [semester] - Optional semester filter
   * @returns {Array} Array of results with course and grade details
   */
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

  /**
   * Get Student CGPA Endpoint Handler
   * 
   * Calculates and returns the student's CGPA.
   * 
   * @route GET /api/v1/students/:id/cgpa
   * @access Private
   * @param {string} id - Student ID
   * @returns {Object} CGPA value
   */
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
