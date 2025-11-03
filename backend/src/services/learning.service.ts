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

