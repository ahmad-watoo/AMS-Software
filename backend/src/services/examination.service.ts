/**
 * Examination Service
 * 
 * This service handles all examination management business logic including:
 * - Exam CRUD operations
 * - Result management (grading, approval)
 * - Re-evaluation request handling
 * - Grade calculation and validation
 * 
 * The examination system manages:
 * - Exam scheduling (midterm, final, quiz, assignment, practical)
 * - Result entry and grading
 * - Result approval workflow
 * - Re-evaluation requests for disputed results
 * 
 * @module services/examination.service
 */

import { ExaminationRepository } from '@/repositories/examination.repository';
import {
  Exam,
  Result,
  ReEvaluation,
  CreateExamDTO,
  UpdateExamDTO,
  CreateResultDTO,
  UpdateResultDTO,
  CreateReEvaluationDTO,
} from '@/models/Examination.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class ExaminationService {
  private examinationRepository: ExaminationRepository;

  constructor() {
    this.examinationRepository = new ExaminationRepository();
  }

  // ==================== Exams ====================

  /**
   * Get all exams with pagination and filters
   * 
   * Retrieves exams with optional filtering by section, exam type,
   * semester, and exam date. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of exams to return
   * @param {number} [offset=0] - Number of exams to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.examType] - Filter by exam type (midterm, final, quiz, etc.)
   * @param {string} [filters.semester] - Filter by semester
   * @param {string} [filters.examDate] - Filter by exam date
   * @returns {Promise<{exams: Exam[], total: number}>} Exams and total count
   * 
   * @example
   * const { exams, total } = await examinationService.getAllExams(20, 0, {
   *   sectionId: 'section123',
   *   examType: 'midterm',
   *   semester: '2024-Fall'
   * });
   */
  async getAllExams(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      examType?: string;
      semester?: string;
      examDate?: string;
    }
  ): Promise<{
    exams: Exam[];
    total: number;
  }> {
    try {
      const allExams = await this.examinationRepository.findAllExams(limit * 10, 0, filters);
      const paginatedExams = allExams.slice(offset, offset + limit);

      return {
        exams: paginatedExams,
        total: allExams.length,
      };
    } catch (error) {
      logger.error('Error getting all exams:', error);
      throw new Error('Failed to fetch exams');
    }
  }

  /**
   * Get exam by ID
   * 
   * Retrieves a specific exam by its ID.
   * 
   * @param {string} id - Exam ID
   * @returns {Promise<Exam>} Exam object
   * @throws {NotFoundError} If exam not found
   */
  async getExamById(id: string): Promise<Exam> {
    try {
      const exam = await this.examinationRepository.findExamById(id);
      if (!exam) {
        throw new NotFoundError('Exam');
      }
      return exam;
    } catch (error) {
      logger.error('Error getting exam by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch exam');
    }
  }

  /**
   * Create a new exam
   * 
   * Creates a new exam with validation.
   * Validates required fields, time logic, and marks.
   * 
   * @param {CreateExamDTO} examData - Exam creation data
   * @returns {Promise<Exam>} Created exam
   * @throws {ValidationError} If exam data is invalid
   * 
   * @example
   * const exam = await examinationService.createExam({
   *   sectionId: 'section123',
   *   examType: 'midterm',
   *   title: 'Midterm Exam - Data Structures',
   *   examDate: '2024-10-15',
   *   startTime: '09:00',
   *   endTime: '11:00',
   *   totalMarks: 100,
   *   passingMarks: 50,
   *   semester: '2024-Fall'
   * });
   */
  async createExam(examData: CreateExamDTO): Promise<Exam> {
    try {
      // Validate required fields
      if (!examData.sectionId || !examData.examType || !examData.title || !examData.examDate || !examData.semester) {
        throw new ValidationError('Section ID, exam type, title, exam date, and semester are required');
      }

      // Validate time logic
      if (examData.startTime >= examData.endTime) {
        throw new ValidationError('End time must be after start time');
      }

      // Validate marks
      if (examData.totalMarks <= 0) {
        throw new ValidationError('Total marks must be greater than 0');
      }

      if (examData.passingMarks > examData.totalMarks) {
        throw new ValidationError('Passing marks cannot exceed total marks');
      }

      return await this.examinationRepository.createExam(examData);
    } catch (error) {
      logger.error('Error creating exam:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create exam');
    }
  }

  /**
   * Update an exam
   * 
   * Updates an existing exam's information.
   * Validates marks if being updated.
   * 
   * @param {string} id - Exam ID
   * @param {UpdateExamDTO} examData - Partial exam data to update
   * @returns {Promise<Exam>} Updated exam
   * @throws {NotFoundError} If exam not found
   * @throws {ValidationError} If marks are invalid
   */
  async updateExam(id: string, examData: UpdateExamDTO): Promise<Exam> {
    try {
      const existingExam = await this.examinationRepository.findExamById(id);
      if (!existingExam) {
        throw new NotFoundError('Exam');
      }

      // Validate marks if being updated
      const totalMarks = examData.totalMarks ?? existingExam.totalMarks;
      const passingMarks = examData.passingMarks ?? existingExam.passingMarks;

      if (passingMarks > totalMarks) {
        throw new ValidationError('Passing marks cannot exceed total marks');
      }

      return await this.examinationRepository.updateExam(id, examData);
    } catch (error) {
      logger.error('Error updating exam:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update exam');
    }
  }

  // ==================== Results ====================

  /**
   * Get all results with pagination and filters
   * 
   * Retrieves results with optional filtering by exam, student,
   * section, and approval status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of results to return
   * @param {number} [offset=0] - Number of results to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.examId] - Filter by exam ID
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {boolean} [filters.isApproved] - Filter by approval status
   * @returns {Promise<{results: Result[], total: number}>} Results and total count
   * 
   * @example
   * const { results, total } = await examinationService.getAllResults(20, 0, {
   *   examId: 'exam123',
   *   isApproved: false
   * });
   */
  async getAllResults(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      examId?: string;
      studentId?: string;
      sectionId?: string;
      isApproved?: boolean;
    }
  ): Promise<{
    results: Result[];
    total: number;
  }> {
    try {
      const allResults = await this.examinationRepository.findAllResults(limit * 10, 0, filters);
      const paginatedResults = allResults.slice(offset, offset + limit);

      return {
        results: paginatedResults,
        total: allResults.length,
      };
    } catch (error) {
      logger.error('Error getting all results:', error);
      throw new Error('Failed to fetch results');
    }
  }

  /**
   * Get result by ID
   * 
   * Retrieves a specific result by its ID.
   * 
   * @param {string} id - Result ID
   * @returns {Promise<Result>} Result object
   * @throws {NotFoundError} If result not found
   */
  async getResultById(id: string): Promise<Result> {
    try {
      const result = await this.examinationRepository.findResultById(id);
      if (!result) {
        throw new NotFoundError('Result');
      }
      return result;
    } catch (error) {
      logger.error('Error getting result by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch result');
    }
  }

  /**
   * Create a new result
   * 
   * Creates a new exam result entry with validation.
   * Validates marks are within valid range.
   * 
   * @param {CreateResultDTO} resultData - Result creation data
   * @param {string} [enteredBy] - ID of user entering the result
   * @returns {Promise<Result>} Created result
   * @throws {ValidationError} If result data is invalid
   * 
   * @example
   * const result = await examinationService.createResult({
   *   examId: 'exam123',
   *   studentId: 'student456',
   *   sectionId: 'section789',
   *   obtainedMarks: 85,
   *   totalMarks: 100
   * }, 'faculty123');
   */
  async createResult(resultData: CreateResultDTO, enteredBy?: string): Promise<Result> {
    try {
      // Validate required fields
      if (!resultData.examId || !resultData.studentId || !resultData.sectionId) {
        throw new ValidationError('Exam ID, student ID, and section ID are required');
      }

      // Validate marks
      if (resultData.obtainedMarks < 0 || resultData.obtainedMarks > resultData.totalMarks) {
        throw new ValidationError('Obtained marks must be between 0 and total marks');
      }

      if (resultData.totalMarks <= 0) {
        throw new ValidationError('Total marks must be greater than 0');
      }

      return await this.examinationRepository.createResult(resultData);
    } catch (error) {
      logger.error('Error creating result:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create result');
    }
  }

  /**
   * Update a result
   * 
   * Updates an existing result entry with validation.
   * Validates marks if being updated.
   * 
   * @param {string} id - Result ID
   * @param {UpdateResultDTO} resultData - Partial result data to update
   * @param {string} [enteredBy] - ID of user updating the result
   * @returns {Promise<Result>} Updated result
   * @throws {NotFoundError} If result not found
   * @throws {ValidationError} If marks are invalid
   */
  async updateResult(id: string, resultData: UpdateResultDTO, enteredBy?: string): Promise<Result> {
    try {
      const existingResult = await this.examinationRepository.findResultById(id);
      if (!existingResult) {
        throw new NotFoundError('Result');
      }

      // Validate marks if being updated
      const totalMarks = resultData.totalMarks ?? existingResult.totalMarks;
      const obtainedMarks = resultData.obtainedMarks ?? existingResult.obtainedMarks;

      if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
        throw new ValidationError('Obtained marks must be between 0 and total marks');
      }

      return await this.examinationRepository.updateResult(id, resultData, enteredBy);
    } catch (error) {
      logger.error('Error updating result:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update result');
    }
  }

  /**
   * Approve a result
   * 
   * Approves a result entry, marking it as approved.
   * Used in the result approval workflow.
   * 
   * @param {string} id - Result ID
   * @param {string} approvedBy - ID of user approving the result
   * @returns {Promise<Result>} Approved result
   * 
   * @example
   * const result = await examinationService.approveResult('result123', 'faculty456');
   */
  async approveResult(id: string, approvedBy: string): Promise<Result> {
    try {
      return await this.examinationRepository.updateResult(id, { isApproved: true }, approvedBy);
    } catch (error) {
      logger.error('Error approving result:', error);
      throw new Error('Failed to approve result');
    }
  }

  // ==================== Re-Evaluations ====================

  /**
   * Get all re-evaluations with pagination and filters
   * 
   * Retrieves re-evaluation requests with optional filtering by student
   * and status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of re-evaluations to return
   * @param {number} [offset=0] - Number of re-evaluations to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<{reEvaluations: ReEvaluation[], total: number}>} Re-evaluations and total count
   * 
   * @example
   * const { reEvaluations, total } = await examinationService.getAllReEvaluations(20, 0, {
   *   studentId: 'student123',
   *   status: 'pending'
   * });
   */
  async getAllReEvaluations(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      status?: string;
    }
  ): Promise<{
    reEvaluations: ReEvaluation[];
    total: number;
  }> {
    try {
      const allReEvals = await this.examinationRepository.findAllReEvaluations(limit * 10, 0, filters);
      const paginatedReEvals = allReEvals.slice(offset, offset + limit);

      return {
        reEvaluations: paginatedReEvals,
        total: allReEvals.length,
      };
    } catch (error) {
      logger.error('Error getting all re-evaluations:', error);
      throw new Error('Failed to fetch re-evaluations');
    }
  }

  /**
   * Create a re-evaluation request
   * 
   * Creates a new re-evaluation request for a disputed result.
   * 
   * @param {CreateReEvaluationDTO} reEvalData - Re-evaluation creation data
   * @returns {Promise<ReEvaluation>} Created re-evaluation request
   * @throws {ValidationError} If re-evaluation data is invalid
   * 
   * @example
   * const reEval = await examinationService.createReEvaluation({
   *   resultId: 'result123',
   *   studentId: 'student456',
   *   examId: 'exam789',
   *   reason: 'Discrepancy in marks calculation'
   * });
   */
  async createReEvaluation(reEvalData: CreateReEvaluationDTO): Promise<ReEvaluation> {
    try {
      if (!reEvalData.resultId || !reEvalData.studentId || !reEvalData.examId) {
        throw new ValidationError('Result ID, student ID, and exam ID are required');
      }

      return await this.examinationRepository.createReEvaluation(reEvalData);
    } catch (error) {
      logger.error('Error creating re-evaluation:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create re-evaluation');
    }
  }
}
