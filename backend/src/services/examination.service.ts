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

  async createExam(examData: CreateExamDTO): Promise<Exam> {
    try {
      // Validate required fields
      if (!examData.sectionId || !examData.examType || !examData.title || !examData.examDate || !examData.semester) {
        throw new ValidationError('Section ID, exam type, title, exam date, and semester are required');
      }

      // Validate time
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

  async approveResult(id: string, approvedBy: string): Promise<Result> {
    try {
      return await this.examinationRepository.updateResult(id, { isApproved: true }, approvedBy);
    } catch (error) {
      logger.error('Error approving result:', error);
      throw new Error('Failed to approve result');
    }
  }

  // ==================== Re-Evaluations ====================

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

