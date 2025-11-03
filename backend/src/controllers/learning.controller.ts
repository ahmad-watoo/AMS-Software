import { Request, Response, NextFunction } from 'express';
import { LearningService } from '@/services/learning.service';
import {
  CreateCourseMaterialDTO,
  UpdateCourseMaterialDTO,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  CreateAssignmentSubmissionDTO,
  GradeSubmissionDTO,
} from '@/models/Learning.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class LearningController {
  private learningService: LearningService;

  constructor() {
    this.learningService = new LearningService();
  }

  // ==================== Course Materials ====================

  getAllCourseMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        sectionId: req.query.sectionId as string,
        courseId: req.query.courseId as string,
        materialType: req.query.materialType as string,
        isVisible: req.query.isVisible ? req.query.isVisible === 'true' : undefined,
      };

      const result = await this.learningService.getAllCourseMaterials(limit, offset, filters);

      sendSuccess(res, {
        materials: result.materials,
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
      logger.error('Get all course materials error:', error);
      next(error);
    }
  };

  getCourseMaterialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const material = await this.learningService.getCourseMaterialById(id);
      sendSuccess(res, material);
    } catch (error) {
      logger.error('Get course material by ID error:', error);
      next(error);
    }
  };

  createCourseMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materialData: CreateCourseMaterialDTO = {
        sectionId: req.body.sectionId,
        courseId: req.body.courseId,
        title: req.body.title,
        description: req.body.description,
        materialType: req.body.materialType,
        fileUrl: req.body.fileUrl,
        externalUrl: req.body.externalUrl,
        fileSize: req.body.fileSize,
        fileName: req.body.fileName,
        isVisible: req.body.isVisible,
        displayOrder: req.body.displayOrder,
      };

      if (!materialData.sectionId || !materialData.courseId || !materialData.title) {
        throw new ValidationError('Section ID, course ID, and title are required');
      }

      const uploadedBy = req.user?.userId;
      const material = await this.learningService.createCourseMaterial(materialData, uploadedBy);
      sendSuccess(res, material, 'Course material uploaded successfully', 201);
    } catch (error) {
      logger.error('Create course material error:', error);
      next(error);
    }
  };

  updateCourseMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const materialData: UpdateCourseMaterialDTO = {
        title: req.body.title,
        description: req.body.description,
        isVisible: req.body.isVisible,
        displayOrder: req.body.displayOrder,
      };

      const material = await this.learningService.updateCourseMaterial(id, materialData);
      sendSuccess(res, material, 'Course material updated successfully');
    } catch (error) {
      logger.error('Update course material error:', error);
      next(error);
    }
  };

  // ==================== Assignments ====================

  getAllAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        sectionId: req.query.sectionId as string,
        courseId: req.query.courseId as string,
        isPublished: req.query.isPublished ? req.query.isPublished === 'true' : undefined,
      };

      const result = await this.learningService.getAllAssignments(limit, offset, filters);

      sendSuccess(res, {
        assignments: result.assignments,
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
      logger.error('Get all assignments error:', error);
      next(error);
    }
  };

  getAssignmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const assignment = await this.learningService.getAssignmentById(id);
      sendSuccess(res, assignment);
    } catch (error) {
      logger.error('Get assignment by ID error:', error);
      next(error);
    }
  };

  createAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignmentData: CreateAssignmentDTO = {
        sectionId: req.body.sectionId,
        courseId: req.body.courseId,
        title: req.body.title,
        description: req.body.description,
        instructions: req.body.instructions,
        dueDate: req.body.dueDate,
        maxMarks: req.body.maxMarks,
        assignmentType: req.body.assignmentType,
        allowedFileTypes: req.body.allowedFileTypes,
        maxFileSize: req.body.maxFileSize,
        isPublished: req.body.isPublished,
      };

      if (!assignmentData.sectionId || !assignmentData.courseId || !assignmentData.title || !assignmentData.dueDate || !assignmentData.maxMarks) {
        throw new ValidationError('Section ID, course ID, title, due date, and max marks are required');
      }

      const assignment = await this.learningService.createAssignment(assignmentData);
      sendSuccess(res, assignment, 'Assignment created successfully', 201);
    } catch (error) {
      logger.error('Create assignment error:', error);
      next(error);
    }
  };

  updateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const assignmentData: UpdateAssignmentDTO = {
        title: req.body.title,
        description: req.body.description,
        instructions: req.body.instructions,
        dueDate: req.body.dueDate,
        maxMarks: req.body.maxMarks,
        isPublished: req.body.isPublished,
      };

      const assignment = await this.learningService.updateAssignment(id, assignmentData);
      sendSuccess(res, assignment, 'Assignment updated successfully');
    } catch (error) {
      logger.error('Update assignment error:', error);
      next(error);
    }
  };

  // ==================== Assignment Submissions ====================

  getAllSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        assignmentId: req.query.assignmentId as string,
        studentId: req.query.studentId as string,
        sectionId: req.query.sectionId as string,
        status: req.query.status as string,
      };

      const result = await this.learningService.getAllSubmissions(limit, offset, filters);

      sendSuccess(res, {
        submissions: result.submissions,
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
      logger.error('Get all submissions error:', error);
      next(error);
    }
  };

  getSubmissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const submission = await this.learningService.getSubmissionById(id);
      sendSuccess(res, submission);
    } catch (error) {
      logger.error('Get submission by ID error:', error);
      next(error);
    }
  };

  createSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissionData: CreateAssignmentSubmissionDTO = {
        assignmentId: req.body.assignmentId,
        enrollmentId: req.body.enrollmentId,
        studentId: req.body.studentId,
        sectionId: req.body.sectionId,
        submissionFiles: req.body.submissionFiles,
        submittedText: req.body.submittedText,
      };

      if (!submissionData.assignmentId || !submissionData.enrollmentId || !submissionData.studentId || !submissionData.sectionId) {
        throw new ValidationError('Assignment ID, enrollment ID, student ID, and section ID are required');
      }

      const submission = await this.learningService.createSubmission(submissionData);
      sendSuccess(res, submission, 'Assignment submitted successfully', 201);
    } catch (error) {
      logger.error('Create submission error:', error);
      next(error);
    }
  };

  gradeSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const gradeData: GradeSubmissionDTO = {
        submissionId: id,
        obtainedMarks: req.body.obtainedMarks,
        feedback: req.body.feedback,
      };

      if (!gradeData.obtainedMarks) {
        throw new ValidationError('Obtained marks are required');
      }

      const gradedBy = req.user?.userId;
      const submission = await this.learningService.gradeSubmission(gradeData, gradedBy);
      sendSuccess(res, submission, 'Submission graded successfully');
    } catch (error) {
      logger.error('Grade submission error:', error);
      next(error);
    }
  };
}

