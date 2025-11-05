/**
 * Examination Controller
 * 
 * Handles HTTP requests for examination management endpoints.
 * Manages exams, results, and re-evaluation requests.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/examination.controller
 */

import { Request, Response, NextFunction } from 'express';
import { ExaminationService } from '@/services/examination.service';
import {
  CreateExamDTO,
  UpdateExamDTO,
  CreateResultDTO,
  UpdateResultDTO,
  CreateReEvaluationDTO,
} from '@/models/Examination.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class ExaminationController {
  private examinationService: ExaminationService;

  constructor() {
    this.examinationService = new ExaminationService();
  }

  // ==================== Exams ====================

  /**
   * Get All Exams Endpoint Handler
   * 
   * Retrieves all exams with pagination and optional filters.
   * 
   * @route GET /api/v1/examination/exams
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [sectionId] - Filter by section ID
   * @query {string} [examType] - Filter by exam type
   * @query {string} [semester] - Filter by semester
   * @query {string} [examDate] - Filter by exam date
   * @returns {Object} Exams array and pagination info
   * 
   * @example
   * GET /api/v1/examination/exams?page=1&limit=20&sectionId=section123&examType=midterm
   */
  getAllExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        sectionId: req.query.sectionId as string,
        examType: req.query.examType as string,
        semester: req.query.semester as string,
        examDate: req.query.examDate as string,
      };

      const result = await this.examinationService.getAllExams(limit, offset, filters);

      sendSuccess(res, {
        exams: result.exams,
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
      logger.error('Get all exams error:', error);
      next(error);
    }
  };

  /**
   * Get Exam By ID Endpoint Handler
   * 
   * Retrieves a specific exam by ID.
   * 
   * @route GET /api/v1/examination/exams/:id
   * @access Private
   * @param {string} id - Exam ID
   * @returns {Exam} Exam object
   */
  getExamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const exam = await this.examinationService.getExamById(id);
      sendSuccess(res, exam);
    } catch (error) {
      logger.error('Get exam by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Exam Endpoint Handler
   * 
   * Creates a new exam.
   * 
   * @route POST /api/v1/examination/exams
   * @access Private (Requires examination.create permission)
   * @body {CreateExamDTO} Exam creation data
   * @returns {Exam} Created exam
   * 
   * @example
   * POST /api/v1/examination/exams
   * Body: {
   *   sectionId: "section123",
   *   examType: "midterm",
   *   title: "Midterm Exam - Data Structures",
   *   examDate: "2024-10-15",
   *   startTime: "09:00",
   *   endTime: "11:00",
   *   totalMarks: 100,
   *   passingMarks: 50,
   *   semester: "2024-Fall"
   * }
   */
  createExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examData: CreateExamDTO = {
        sectionId: req.body.sectionId,
        examType: req.body.examType,
        title: req.body.title,
        examDate: req.body.examDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        duration: req.body.duration,
        totalMarks: req.body.totalMarks,
        passingMarks: req.body.passingMarks,
        roomId: req.body.roomId,
        instructions: req.body.instructions,
        semester: req.body.semester,
      };

      if (!examData.sectionId || !examData.examType || !examData.title || !examData.examDate || !examData.semester) {
        throw new ValidationError('Section ID, exam type, title, exam date, and semester are required');
      }

      const exam = await this.examinationService.createExam(examData);
      sendSuccess(res, exam, 'Exam created successfully', 201);
    } catch (error) {
      logger.error('Create exam error:', error);
      next(error);
    }
  };

  /**
   * Update Exam Endpoint Handler
   * 
   * Updates an existing exam.
   * 
   * @route PUT /api/v1/examination/exams/:id
   * @access Private (Requires examination.update permission)
   * @param {string} id - Exam ID
   * @body {UpdateExamDTO} Partial exam data to update
   * @returns {Exam} Updated exam
   * 
   * @example
   * PUT /api/v1/examination/exams/exam123
   * Body: {
   *   title: "Updated Exam Title",
   *   totalMarks: 120,
   *   passingMarks: 60
   * }
   */
  updateExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const examData: UpdateExamDTO = {
        title: req.body.title,
        examDate: req.body.examDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        duration: req.body.duration,
        totalMarks: req.body.totalMarks,
        passingMarks: req.body.passingMarks,
        roomId: req.body.roomId,
        instructions: req.body.instructions,
      };

      const exam = await this.examinationService.updateExam(id, examData);
      sendSuccess(res, exam, 'Exam updated successfully');
    } catch (error) {
      logger.error('Update exam error:', error);
      next(error);
    }
  };

  // ==================== Results ====================

  /**
   * Get All Results Endpoint Handler
   * 
   * Retrieves all results with pagination and optional filters.
   * 
   * @route GET /api/v1/examination/results
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [examId] - Filter by exam ID
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [sectionId] - Filter by section ID
   * @query {boolean} [isApproved] - Filter by approval status
   * @returns {Object} Results array and pagination info
   * 
   * @example
   * GET /api/v1/examination/results?page=1&limit=20&examId=exam123&isApproved=false
   */
  getAllResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        examId: req.query.examId as string,
        studentId: req.query.studentId as string,
        sectionId: req.query.sectionId as string,
        isApproved: req.query.isApproved ? req.query.isApproved === 'true' : undefined,
      };

      const result = await this.examinationService.getAllResults(limit, offset, filters);

      sendSuccess(res, {
        results: result.results,
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
      logger.error('Get all results error:', error);
      next(error);
    }
  };

  /**
   * Get Result By ID Endpoint Handler
   * 
   * Retrieves a specific result by ID.
   * 
   * @route GET /api/v1/examination/results/:id
   * @access Private
   * @param {string} id - Result ID
   * @returns {Result} Result object
   */
  getResultById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.examinationService.getResultById(id);
      sendSuccess(res, result);
    } catch (error) {
      logger.error('Get result by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Result Endpoint Handler
   * 
   * Creates a new exam result entry.
   * 
   * @route POST /api/v1/examination/results
   * @access Private (Requires examination.create permission)
   * @body {CreateResultDTO} Result creation data
   * @returns {Result} Created result
   * 
   * @example
   * POST /api/v1/examination/results
   * Body: {
   *   examId: "exam123",
   *   studentId: "student456",
   *   sectionId: "section789",
   *   obtainedMarks: 85,
   *   totalMarks: 100,
   *   remarks: "Good performance"
   * }
   */
  createResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resultData: CreateResultDTO = {
        enrollmentId: req.body.enrollmentId,
        examId: req.body.examId,
        studentId: req.body.studentId,
        sectionId: req.body.sectionId,
        obtainedMarks: req.body.obtainedMarks,
        totalMarks: req.body.totalMarks,
        remarks: req.body.remarks,
      };

      if (!resultData.examId || !resultData.studentId || !resultData.sectionId) {
        throw new ValidationError('Exam ID, student ID, and section ID are required');
      }

      const enteredBy = req.user?.userId;
      const result = await this.examinationService.createResult(resultData, enteredBy);
      sendSuccess(res, result, 'Result created successfully', 201);
    } catch (error) {
      logger.error('Create result error:', error);
      next(error);
    }
  };

  /**
   * Update Result Endpoint Handler
   * 
   * Updates an existing result entry.
   * 
   * @route PUT /api/v1/examination/results/:id
   * @access Private (Requires examination.update permission)
   * @param {string} id - Result ID
   * @body {UpdateResultDTO} Partial result data to update
   * @returns {Result} Updated result
   * 
   * @example
   * PUT /api/v1/examination/results/result123
   * Body: {
   *   obtainedMarks: 90,
   *   remarks: "Excellent performance"
   * }
   */
  updateResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resultData: UpdateResultDTO = {
        obtainedMarks: req.body.obtainedMarks,
        totalMarks: req.body.totalMarks,
        remarks: req.body.remarks,
        isApproved: req.body.isApproved,
      };

      const enteredBy = req.user?.userId;
      const result = await this.examinationService.updateResult(id, resultData, enteredBy);
      sendSuccess(res, result, 'Result updated successfully');
    } catch (error) {
      logger.error('Update result error:', error);
      next(error);
    }
  };

  /**
   * Approve Result Endpoint Handler
   * 
   * Approves a result entry.
   * 
   * @route POST /api/v1/examination/results/:id/approve
   * @access Private (Requires examination.approve permission)
   * @param {string} id - Result ID
   * @returns {Result} Approved result
   */
  approveResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approvedBy = req.user?.userId;
      if (!approvedBy) {
        throw new ValidationError('User ID is required');
      }

      const result = await this.examinationService.approveResult(id, approvedBy);
      sendSuccess(res, result, 'Result approved successfully');
    } catch (error) {
      logger.error('Approve result error:', error);
      next(error);
    }
  };

  // ==================== Re-Evaluations ====================

  /**
   * Get All Re-Evaluations Endpoint Handler
   * 
   * Retrieves all re-evaluation requests with pagination and optional filters.
   * 
   * @route GET /api/v1/examination/re-evaluations
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [status] - Filter by status
   * @returns {Object} Re-evaluations array and pagination info
   * 
   * @example
   * GET /api/v1/examination/re-evaluations?page=1&limit=20&studentId=student123&status=pending
   */
  getAllReEvaluations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        studentId: req.query.studentId as string,
        status: req.query.status as string,
      };

      const result = await this.examinationService.getAllReEvaluations(limit, offset, filters);

      sendSuccess(res, {
        reEvaluations: result.reEvaluations,
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
      logger.error('Get all re-evaluations error:', error);
      next(error);
    }
  };

  /**
   * Create Re-Evaluation Endpoint Handler
   * 
   * Creates a new re-evaluation request for a disputed result.
   * 
   * @route POST /api/v1/examination/re-evaluations
   * @access Private
   * @body {CreateReEvaluationDTO} Re-evaluation creation data
   * @returns {ReEvaluation} Created re-evaluation request
   * 
   * @example
   * POST /api/v1/examination/re-evaluations
   * Body: {
   *   resultId: "result123",
   *   studentId: "student456",
   *   examId: "exam789",
   *   reason: "Discrepancy in marks calculation"
   * }
   */
  createReEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reEvalData: CreateReEvaluationDTO = {
        resultId: req.body.resultId,
        studentId: req.body.studentId,
        examId: req.body.examId,
        reason: req.body.reason,
      };

      if (!reEvalData.resultId || !reEvalData.studentId || !reEvalData.examId) {
        throw new ValidationError('Result ID, student ID, and exam ID are required');
      }

      const reEval = await this.examinationService.createReEvaluation(reEvalData);
      sendSuccess(res, reEval, 'Re-evaluation request created successfully', 201);
    } catch (error) {
      logger.error('Create re-evaluation error:', error);
      next(error);
    }
  };
}
