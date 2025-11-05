/**
 * Learning Management Service
 * 
 * This service handles all learning management business logic including:
 * - Course material management (upload, update, visibility)
 * - Assignment creation and management
 * - Assignment submission handling
 * - Submission grading and feedback
 * 
 * The learning management system manages:
 * - Course materials (documents, videos, links, presentations)
 * - Assignments with deadlines and file uploads
 * - Student submissions with file/text support
 * - Grading workflow with feedback
 * 
 * @module services/learning.service
 */

import { LearningRepository } from '@/repositories/learning.repository';
import {
  CourseMaterial,
  Assignment,
  AssignmentSubmission,
  CreateCourseMaterialDTO,
  UpdateCourseMaterialDTO,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  CreateAssignmentSubmissionDTO,
  GradeSubmissionDTO,
} from '@/models/Learning.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class LearningService {
  private learningRepository: LearningRepository;

  constructor() {
    this.learningRepository = new LearningRepository();
  }

  // ==================== Course Materials ====================

  /**
   * Get all course materials with pagination and filters
   * 
   * Retrieves course materials with optional filtering by section, course,
   * material type, and visibility. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of materials to return
   * @param {number} [offset=0] - Number of materials to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.courseId] - Filter by course ID
   * @param {string} [filters.materialType] - Filter by material type
   * @param {boolean} [filters.isVisible] - Filter by visibility status
   * @returns {Promise<{materials: CourseMaterial[], total: number}>} Materials and total count
   * 
   * @example
   * const { materials, total } = await learningService.getAllCourseMaterials(20, 0, {
   *   sectionId: 'section123',
   *   materialType: 'document',
   *   isVisible: true
   * });
   */
  async getAllCourseMaterials(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      courseId?: string;
      materialType?: string;
      isVisible?: boolean;
    }
  ): Promise<{
    materials: CourseMaterial[];
    total: number;
  }> {
    try {
      const allMaterials = await this.learningRepository.findAllCourseMaterials(limit * 10, 0, filters);
      const paginatedMaterials = allMaterials.slice(offset, offset + limit);

      return {
        materials: paginatedMaterials,
        total: allMaterials.length,
      };
    } catch (error) {
      logger.error('Error getting all course materials:', error);
      throw new Error('Failed to fetch course materials');
    }
  }

  /**
   * Get course material by ID
   * 
   * Retrieves a specific course material by its ID.
   * 
   * @param {string} id - Course material ID
   * @returns {Promise<CourseMaterial>} Course material object
   * @throws {NotFoundError} If material not found
   */
  async getCourseMaterialById(id: string): Promise<CourseMaterial> {
    try {
      const material = await this.learningRepository.findCourseMaterialById(id);
      if (!material) {
        throw new NotFoundError('Course material');
      }
      return material;
    } catch (error) {
      logger.error('Error getting course material by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch course material');
    }
  }

  /**
   * Create a new course material
   * 
   * Creates a new course material with validation.
   * Validates required fields and material type-specific requirements.
   * 
   * @param {CreateCourseMaterialDTO} materialData - Material creation data
   * @param {string} [uploadedBy] - ID of user uploading the material
   * @returns {Promise<CourseMaterial>} Created course material
   * @throws {ValidationError} If material data is invalid
   * 
   * @example
   * const material = await learningService.createCourseMaterial({
   *   sectionId: 'section123',
   *   courseId: 'course456',
   *   title: 'Introduction to Data Structures',
   *   materialType: 'document',
   *   fileUrl: 'https://example.com/file.pdf',
   *   fileName: 'lecture1.pdf'
   * }, 'faculty123');
   */
  async createCourseMaterial(materialData: CreateCourseMaterialDTO, uploadedBy?: string): Promise<CourseMaterial> {
    try {
      if (!materialData.sectionId || !materialData.courseId || !materialData.title) {
        throw new ValidationError('Section ID, course ID, and title are required');
      }

      if (materialData.materialType === 'link' && !materialData.externalUrl) {
        throw new ValidationError('External URL is required for link type materials');
      }

      if (materialData.materialType === 'document' && !materialData.fileUrl) {
        throw new ValidationError('File URL is required for document type materials');
      }

      return await this.learningRepository.createCourseMaterial(materialData, uploadedBy);
    } catch (error) {
      logger.error('Error creating course material:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create course material');
    }
  }

  /**
   * Update a course material
   * 
   * Updates an existing course material's information.
   * 
   * @param {string} id - Course material ID
   * @param {UpdateCourseMaterialDTO} materialData - Partial material data to update
   * @returns {Promise<CourseMaterial>} Updated course material
   * @throws {NotFoundError} If material not found
   */
  async updateCourseMaterial(id: string, materialData: UpdateCourseMaterialDTO): Promise<CourseMaterial> {
    try {
      const existingMaterial = await this.learningRepository.findCourseMaterialById(id);
      if (!existingMaterial) {
        throw new NotFoundError('Course material');
      }

      return await this.learningRepository.updateCourseMaterial(id, materialData);
    } catch (error) {
      logger.error('Error updating course material:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update course material');
    }
  }

  // ==================== Assignments ====================

  /**
   * Get all assignments with pagination and filters
   * 
   * Retrieves assignments with optional filtering by section, course,
   * and publication status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of assignments to return
   * @param {number} [offset=0] - Number of assignments to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.courseId] - Filter by course ID
   * @param {boolean} [filters.isPublished] - Filter by publication status
   * @returns {Promise<{assignments: Assignment[], total: number}>} Assignments and total count
   * 
   * @example
   * const { assignments, total } = await learningService.getAllAssignments(20, 0, {
   *   sectionId: 'section123',
   *   isPublished: true
   * });
   */
  async getAllAssignments(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      courseId?: string;
      isPublished?: boolean;
    }
  ): Promise<{
    assignments: Assignment[];
    total: number;
  }> {
    try {
      const allAssignments = await this.learningRepository.findAllAssignments(limit * 10, 0, filters);
      const paginatedAssignments = allAssignments.slice(offset, offset + limit);

      return {
        assignments: paginatedAssignments,
        total: allAssignments.length,
      };
    } catch (error) {
      logger.error('Error getting all assignments:', error);
      throw new Error('Failed to fetch assignments');
    }
  }

  /**
   * Get assignment by ID
   * 
   * Retrieves a specific assignment by its ID.
   * 
   * @param {string} id - Assignment ID
   * @returns {Promise<Assignment>} Assignment object
   * @throws {NotFoundError} If assignment not found
   */
  async getAssignmentById(id: string): Promise<Assignment> {
    try {
      const assignment = await this.learningRepository.findAssignmentById(id);
      if (!assignment) {
        throw new NotFoundError('Assignment');
      }
      return assignment;
    } catch (error) {
      logger.error('Error getting assignment by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch assignment');
    }
  }

  /**
   * Create a new assignment
   * 
   * Creates a new assignment with validation.
   * Validates required fields, due date, and max marks.
   * 
   * @param {CreateAssignmentDTO} assignmentData - Assignment creation data
   * @returns {Promise<Assignment>} Created assignment
   * @throws {ValidationError} If assignment data is invalid
   * 
   * @example
   * const assignment = await learningService.createAssignment({
   *   sectionId: 'section123',
   *   courseId: 'course456',
   *   title: 'Data Structures Assignment 1',
   *   dueDate: '2024-11-15',
   *   maxMarks: 100,
   *   assignmentType: 'individual',
   *   isPublished: true
   * });
   */
  async createAssignment(assignmentData: CreateAssignmentDTO): Promise<Assignment> {
    try {
      if (!assignmentData.sectionId || !assignmentData.courseId || !assignmentData.title || !assignmentData.dueDate || !assignmentData.maxMarks) {
        throw new ValidationError('Section ID, course ID, title, due date, and max marks are required');
      }

      if (assignmentData.maxMarks <= 0) {
        throw new ValidationError('Max marks must be greater than 0');
      }

      // Validate due date is in the future
      const dueDate = new Date(assignmentData.dueDate);
      if (dueDate < new Date()) {
        throw new ValidationError('Due date must be in the future');
      }

      return await this.learningRepository.createAssignment(assignmentData);
    } catch (error) {
      logger.error('Error creating assignment:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create assignment');
    }
  }

  /**
   * Update an assignment
   * 
   * Updates an existing assignment's information.
   * Validates max marks if being updated.
   * 
   * @param {string} id - Assignment ID
   * @param {UpdateAssignmentDTO} assignmentData - Partial assignment data to update
   * @returns {Promise<Assignment>} Updated assignment
   * @throws {NotFoundError} If assignment not found
   * @throws {ValidationError} If max marks is invalid
   */
  async updateAssignment(id: string, assignmentData: UpdateAssignmentDTO): Promise<Assignment> {
    try {
      const existingAssignment = await this.learningRepository.findAssignmentById(id);
      if (!existingAssignment) {
        throw new NotFoundError('Assignment');
      }

      if (assignmentData.maxMarks !== undefined && assignmentData.maxMarks <= 0) {
        throw new ValidationError('Max marks must be greater than 0');
      }

      return await this.learningRepository.updateAssignment(id, assignmentData);
    } catch (error) {
      logger.error('Error updating assignment:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update assignment');
    }
  }

  // ==================== Assignment Submissions ====================

  /**
   * Get all submissions with pagination and filters
   * 
   * Retrieves assignment submissions with optional filtering by assignment,
   * student, section, and status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of submissions to return
   * @param {number} [offset=0] - Number of submissions to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.assignmentId] - Filter by assignment ID
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<{submissions: AssignmentSubmission[], total: number}>} Submissions and total count
   * 
   * @example
   * const { submissions, total } = await learningService.getAllSubmissions(20, 0, {
   *   assignmentId: 'assignment123',
   *   status: 'submitted'
   * });
   */
  async getAllSubmissions(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      assignmentId?: string;
      studentId?: string;
      sectionId?: string;
      status?: string;
    }
  ): Promise<{
    submissions: AssignmentSubmission[];
    total: number;
  }> {
    try {
      const allSubmissions = await this.learningRepository.findAllSubmissions(limit * 10, 0, filters);
      const paginatedSubmissions = allSubmissions.slice(offset, offset + limit);

      return {
        submissions: paginatedSubmissions,
        total: allSubmissions.length,
      };
    } catch (error) {
      logger.error('Error getting all submissions:', error);
      throw new Error('Failed to fetch submissions');
    }
  }

  /**
   * Get submission by ID
   * 
   * Retrieves a specific submission by its ID.
   * 
   * @param {string} id - Submission ID
   * @returns {Promise<AssignmentSubmission>} Submission object
   * @throws {NotFoundError} If submission not found
   */
  async getSubmissionById(id: string): Promise<AssignmentSubmission> {
    try {
      const submission = await this.learningRepository.findSubmissionById(id);
      if (!submission) {
        throw new NotFoundError('Assignment submission');
      }
      return submission;
    } catch (error) {
      logger.error('Error getting submission by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch submission');
    }
  }

  /**
   * Create a submission
   * 
   * Creates a new assignment submission with validation.
   * Validates assignment exists and is published.
   * 
   * @param {CreateAssignmentSubmissionDTO} submissionData - Submission creation data
   * @returns {Promise<AssignmentSubmission>} Created submission
   * @throws {ValidationError} If submission data is invalid
   * @throws {NotFoundError} If assignment not found
   * 
   * @example
   * const submission = await learningService.createSubmission({
   *   assignmentId: 'assignment123',
   *   enrollmentId: 'enrollment456',
   *   studentId: 'student789',
   *   sectionId: 'section012',
   *   submissionFiles: [
   *     { fileName: 'assignment.pdf', fileUrl: 'https://example.com/file.pdf', fileSize: 1024000 }
   *   ],
   *   submittedText: 'See attached file for solution'
   * });
   */
  async createSubmission(submissionData: CreateAssignmentSubmissionDTO): Promise<AssignmentSubmission> {
    try {
      if (!submissionData.assignmentId || !submissionData.enrollmentId || !submissionData.studentId || !submissionData.sectionId) {
        throw new ValidationError('Assignment ID, enrollment ID, student ID, and section ID are required');
      }

      if (!submissionData.submissionFiles || submissionData.submissionFiles.length === 0) {
        if (!submissionData.submittedText) {
          throw new ValidationError('Either submission files or text is required');
        }
      }

      // Check if assignment exists and is published
      const assignment = await this.learningRepository.findAssignmentById(submissionData.assignmentId);
      if (!assignment) {
        throw new NotFoundError('Assignment');
      }

      if (!assignment.isPublished) {
        throw new ValidationError('Assignment is not published yet');
      }

      return await this.learningRepository.createSubmission(submissionData);
    } catch (error) {
      logger.error('Error creating submission:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create submission');
    }
  }

  /**
   * Grade a submission
   * 
   * Grades an assignment submission with marks and feedback.
   * Validates marks are within valid range.
   * 
   * @param {GradeSubmissionDTO} gradeData - Grading data
   * @param {string} [gradedBy] - ID of user grading the submission
   * @returns {Promise<AssignmentSubmission>} Graded submission
   * @throws {NotFoundError} If submission or assignment not found
   * @throws {ValidationError} If marks are invalid
   * 
   * @example
   * const submission = await learningService.gradeSubmission({
   *   submissionId: 'submission123',
   *   obtainedMarks: 85,
   *   feedback: 'Good work! Well structured solution.'
   * }, 'faculty456');
   */
  async gradeSubmission(gradeData: GradeSubmissionDTO, gradedBy?: string): Promise<AssignmentSubmission> {
    try {
      const submission = await this.learningRepository.findSubmissionById(gradeData.submissionId);
      if (!submission) {
        throw new NotFoundError('Assignment submission');
      }

      // Get assignment to validate marks
      const assignment = await this.learningRepository.findAssignmentById(submission.assignmentId);
      if (!assignment) {
        throw new NotFoundError('Assignment');
      }

      if (gradeData.obtainedMarks < 0 || gradeData.obtainedMarks > assignment.maxMarks) {
        throw new ValidationError(`Obtained marks must be between 0 and ${assignment.maxMarks}`);
      }

      return await this.learningRepository.gradeSubmission(
        gradeData.submissionId,
        gradeData.obtainedMarks,
        gradeData.feedback,
        gradedBy
      );
    } catch (error) {
      logger.error('Error grading submission:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to grade submission');
    }
  }
}
