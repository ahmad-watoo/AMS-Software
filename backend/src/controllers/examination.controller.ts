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

