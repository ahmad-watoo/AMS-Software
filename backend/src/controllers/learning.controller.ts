/**
 * Learning Management Controller
 * 
 * Handles HTTP requests for learning management endpoints.
 * Manages course materials, assignments, and submissions.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/learning.controller
 */

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

  /**
   * Get All Course Materials Endpoint Handler
   * 
   * Retrieves all course materials with pagination and optional filters.
   * 
   * @route GET /api/v1/learning/materials
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [sectionId] - Filter by section ID
   * @query {string} [courseId] - Filter by course ID
   * @query {string} [materialType] - Filter by material type
   * @query {boolean} [isVisible] - Filter by visibility status
   * @returns {Object} Materials array and pagination info
   * 
   * @example
   * GET /api/v1/learning/materials?page=1&limit=20&sectionId=section123&materialType=document
   */
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

  /**
   * Get Course Material By ID Endpoint Handler
   * 
   * Retrieves a specific course material by ID.
   * 
   * @route GET /api/v1/learning/materials/:id
   * @access Private
   * @param {string} id - Course material ID
   * @returns {CourseMaterial} Course material object
   */
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

  /**
   * Create Course Material Endpoint Handler
   * 
   * Creates a new course material.
   * 
   * @route POST /api/v1/learning/materials
   * @access Private (Requires learning.create permission)
   * @body {CreateCourseMaterialDTO} Material creation data
   * @returns {CourseMaterial} Created course material
   * 
   * @example
   * POST /api/v1/learning/materials
   * Body: {
   *   sectionId: "section123",
   *   courseId: "course456",
   *   title: "Introduction to Data Structures",
   *   materialType: "document",
   *   fileUrl: "https://example.com/file.pdf",
   *   fileName: "lecture1.pdf"
   * }
   */
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

  /**
   * Update Course Material Endpoint Handler
   * 
   * Updates an existing course material.
   * 
   * @route PUT /api/v1/learning/materials/:id
   * @access Private (Requires learning.update permission)
   * @param {string} id - Course material ID
   * @body {UpdateCourseMaterialDTO} Partial material data to update
   * @returns {CourseMaterial} Updated course material
   * 
   * @example
   * PUT /api/v1/learning/materials/material123
   * Body: {
   *   title: "Updated Material Title",
   *   isVisible: false
   * }
   */
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

  /**
   * Get All Assignments Endpoint Handler
   * 
   * Retrieves all assignments with pagination and optional filters.
   * 
   * @route GET /api/v1/learning/assignments
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [sectionId] - Filter by section ID
   * @query {string} [courseId] - Filter by course ID
   * @query {boolean} [isPublished] - Filter by publication status
   * @returns {Object} Assignments array and pagination info
   * 
   * @example
   * GET /api/v1/learning/assignments?page=1&limit=20&sectionId=section123&isPublished=true
   */
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

  /**
   * Get Assignment By ID Endpoint Handler
   * 
   * Retrieves a specific assignment by ID.
   * 
   * @route GET /api/v1/learning/assignments/:id
   * @access Private
   * @param {string} id - Assignment ID
   * @returns {Assignment} Assignment object
   */
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

  /**
   * Create Assignment Endpoint Handler
   * 
   * Creates a new assignment.
   * 
   * @route POST /api/v1/learning/assignments
   * @access Private (Requires learning.create permission)
   * @body {CreateAssignmentDTO} Assignment creation data
   * @returns {Assignment} Created assignment
   * 
   * @example
   * POST /api/v1/learning/assignments
   * Body: {
   *   sectionId: "section123",
   *   courseId: "course456",
   *   title: "Data Structures Assignment 1",
   *   dueDate: "2024-11-15",
   *   maxMarks: 100,
   *   assignmentType: "individual",
   *   isPublished: true
   * }
   */
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

  /**
   * Update Assignment Endpoint Handler
   * 
   * Updates an existing assignment.
   * 
   * @route PUT /api/v1/learning/assignments/:id
   * @access Private (Requires learning.update permission)
   * @param {string} id - Assignment ID
   * @body {UpdateAssignmentDTO} Partial assignment data to update
   * @returns {Assignment} Updated assignment
   * 
   * @example
   * PUT /api/v1/learning/assignments/assignment123
   * Body: {
   *   title: "Updated Assignment Title",
   *   maxMarks: 120,
   *   isPublished: true
   * }
   */
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

  /**
   * Get All Submissions Endpoint Handler
   * 
   * Retrieves all assignment submissions with pagination and optional filters.
   * 
   * @route GET /api/v1/learning/submissions
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [assignmentId] - Filter by assignment ID
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [sectionId] - Filter by section ID
   * @query {string} [status] - Filter by status
   * @returns {Object} Submissions array and pagination info
   * 
   * @example
   * GET /api/v1/learning/submissions?page=1&limit=20&assignmentId=assignment123&status=submitted
   */
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

  /**
   * Get Submission By ID Endpoint Handler
   * 
   * Retrieves a specific submission by ID.
   * 
   * @route GET /api/v1/learning/submissions/:id
   * @access Private
   * @param {string} id - Submission ID
   * @returns {AssignmentSubmission} Submission object
   */
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

  /**
   * Create Submission Endpoint Handler
   * 
   * Creates a new assignment submission.
   * 
   * @route POST /api/v1/learning/submissions
   * @access Private
   * @body {CreateAssignmentSubmissionDTO} Submission creation data
   * @returns {AssignmentSubmission} Created submission
   * 
   * @example
   * POST /api/v1/learning/submissions
   * Body: {
   *   assignmentId: "assignment123",
   *   enrollmentId: "enrollment456",
   *   studentId: "student789",
   *   sectionId: "section012",
   *   submissionFiles: [
   *     { fileName: "assignment.pdf", fileUrl: "https://example.com/file.pdf", fileSize: 1024000 }
   *   ],
   *   submittedText: "See attached file for solution"
   * }
   */
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

  /**
   * Grade Submission Endpoint Handler
   * 
   * Grades an assignment submission.
   * 
   * @route POST /api/v1/learning/submissions/:id/grade
   * @access Private (Requires learning.update permission)
   * @param {string} id - Submission ID
   * @body {Object} Grading data
   * @body {number} body.obtainedMarks - Obtained marks
   * @body {string} [body.feedback] - Optional feedback
   * @returns {AssignmentSubmission} Graded submission
   * 
   * @example
   * POST /api/v1/learning/submissions/submission123/grade
   * Body: {
   *   obtainedMarks: 85,
   *   feedback: "Good work! Well structured solution."
   * }
   */
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
