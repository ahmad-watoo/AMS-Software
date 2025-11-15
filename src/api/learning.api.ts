/**
 * Learning Management API Client
 * 
 * Frontend API client for learning management endpoints.
 * Provides typed functions for all learning operations including:
 * - Course material management (CRUD)
 * - Assignment management (CRUD)
 * - Assignment submission and grading
 * 
 * @module api/learning.api
 */

import apiClient from './client';

/**
 * Course Material Interface
 * 
 * Represents a course material (document, video, link, presentation).
 * 
 * @interface CourseMaterial
 */
export interface CourseMaterial {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  materialType: 'document' | 'video' | 'link' | 'presentation' | 'other';
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: number;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Assignment Interface
 * 
 * Represents an assignment for a course.
 * 
 * @interface Assignment
 */
export interface Assignment {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  assignmentType: 'individual' | 'group' | 'project';
  allowedFileTypes?: string[];
  maxFileSize?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Assignment Submission Interface
 * 
 * Represents a student's submission for an assignment.
 * 
 * @interface AssignmentSubmission
 */
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  studentId: string;
  sectionId: string;
  submittedAt: string;
  submissionFiles: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
  submittedText?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  obtainedMarks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Grade Book Interface
 * 
 * Represents a grade book entry.
 * 
 * @interface GradeBook
 */
export interface GradeBook {
  id: string;
  sectionId: string;
  courseId: string;
  enrollmentId: string;
  studentId: string;
  assignmentId?: string;
  examId?: string;
  obtainedMarks: number;
  totalMarks: number;
  weightage: number;
  gradeCategory: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
  remarks?: string;
  enteredBy?: string;
  enteredAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Course Material Data Transfer Object
 * 
 * @interface CreateCourseMaterialDTO
 */
export interface CreateCourseMaterialDTO {
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  materialType: 'document' | 'video' | 'link' | 'presentation' | 'other';
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: number;
  fileName?: string;
  isVisible?: boolean;
  displayOrder?: number;
}

/**
 * Create Assignment Data Transfer Object
 * 
 * @interface CreateAssignmentDTO
 */
export interface CreateAssignmentDTO {
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  assignmentType: 'individual' | 'group' | 'project';
  allowedFileTypes?: string[];
  maxFileSize?: number;
  isPublished?: boolean;
}

/**
 * Create Assignment Submission Data Transfer Object
 * 
 * @interface CreateAssignmentSubmissionDTO
 */
export interface CreateAssignmentSubmissionDTO {
  assignmentId: string;
  enrollmentId: string;
  studentId: string;
  sectionId: string;
  submissionFiles: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
  submittedText?: string;
}

/**
 * Grade Submission Data Transfer Object
 * 
 * @interface GradeSubmissionDTO
 */
export interface GradeSubmissionDTO {
  submissionId: string;
  obtainedMarks: number;
  feedback?: string;
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

/**
 * Learning Management API Client
 * 
 * Provides methods for all learning management operations.
 */
const learningAPI = {
  // ==================== Course Materials ====================

  /**
   * Get all course materials with pagination and filters
   * 
   * Retrieves course materials with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.sectionId] - Filter by section ID
   * @param {string} [params.courseId] - Filter by course ID
   * @param {string} [params.materialType] - Filter by material type
   * @param {boolean} [params.isVisible] - Filter by visibility status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Materials array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await learningAPI.getAllCourseMaterials({
   *   sectionId: 'section123',
   *   materialType: 'document',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllCourseMaterials: async (params?: {
    sectionId?: string;
    courseId?: string;
    materialType?: string;
    isVisible?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/learning/materials', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch course materials');
    }
    return response.data.data;
  },

  /**
   * Get course material by ID
   * 
   * Retrieves a specific course material by its ID.
   * 
   * @param {string} id - Course material ID
   * @returns {Promise<CourseMaterial>} Course material object
   * @throws {Error} If request fails or material not found
   * 
   * @example
   * const material = await learningAPI.getCourseMaterialById('material123');
   * console.log(material.title); // 'Introduction to Data Structures'
   */
  getCourseMaterialById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CourseMaterial>>(`/learning/materials/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch course material');
    }
    return response.data.data;
  },

  /**
   * Create a new course material
   * 
   * Creates a new course material.
   * Requires learning.create permission.
   * 
   * @param {CreateCourseMaterialDTO} data - Material creation data
   * @returns {Promise<CourseMaterial>} Created course material
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const material = await learningAPI.createCourseMaterial({
   *   sectionId: 'section123',
   *   courseId: 'course456',
   *   title: 'Introduction to Data Structures',
   *   materialType: 'document',
   *   fileUrl: 'https://example.com/file.pdf',
   *   fileName: 'lecture1.pdf'
   * });
   */
  createCourseMaterial: async (data: CreateCourseMaterialDTO) => {
    const response = await apiClient.post<ApiResponse<CourseMaterial>>('/learning/materials', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create course material');
    }
    return response.data.data;
  },

  /**
   * Update a course material
   * 
   * Updates an existing course material.
   * Requires learning.update permission.
   * 
   * @param {string} id - Course material ID
   * @param {Partial<CreateCourseMaterialDTO>} data - Partial material data to update
   * @returns {Promise<CourseMaterial>} Updated course material
   * @throws {Error} If request fails or material not found
   * 
   * @example
   * const material = await learningAPI.updateCourseMaterial('material123', {
   *   title: 'Updated Material Title',
   *   isVisible: false
   * });
   */
  updateCourseMaterial: async (id: string, data: Partial<CreateCourseMaterialDTO>) => {
    const response = await apiClient.put<ApiResponse<CourseMaterial>>(`/learning/materials/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update course material');
    }
    return response.data.data;
  },

  // ==================== Assignments ====================

  /**
   * Get all assignments with pagination and filters
   * 
   * Retrieves assignments with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.sectionId] - Filter by section ID
   * @param {string} [params.courseId] - Filter by course ID
   * @param {string} [params.assignmentType] - Filter by assignment type
   * @param {boolean} [params.isPublished] - Filter by publication status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Assignments array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await learningAPI.getAllAssignments({
   *   sectionId: 'section123',
   *   isPublished: true,
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllAssignments: async (params?: {
    sectionId?: string;
    courseId?: string;
    assignmentType?: string;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/learning/assignments', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch assignments');
    }
    return response.data.data;
  },

  /**
   * Get assignment by ID
   * 
   * Retrieves a specific assignment by its ID.
   * 
   * @param {string} id - Assignment ID
   * @returns {Promise<Assignment>} Assignment object
   * @throws {Error} If request fails or assignment not found
   * 
   * @example
   * const assignment = await learningAPI.getAssignmentById('assignment123');
   * console.log(assignment.title); // 'Data Structures Assignment 1'
   */
  getAssignmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Assignment>>(`/learning/assignments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch assignment');
    }
    return response.data.data;
  },

  /**
   * Create a new assignment
   * 
   * Creates a new assignment.
   * Requires learning.create permission.
   * 
   * @param {CreateAssignmentDTO} data - Assignment creation data
   * @returns {Promise<Assignment>} Created assignment
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const assignment = await learningAPI.createAssignment({
   *   sectionId: 'section123',
   *   courseId: 'course456',
   *   title: 'Data Structures Assignment 1',
   *   dueDate: '2024-11-15',
   *   maxMarks: 100,
   *   assignmentType: 'individual',
   *   isPublished: true
   * });
   */
  createAssignment: async (data: CreateAssignmentDTO) => {
    const response = await apiClient.post<ApiResponse<Assignment>>('/learning/assignments', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create assignment');
    }
    return response.data.data;
  },

  /**
   * Update an assignment
   * 
   * Updates an existing assignment.
   * Requires learning.update permission.
   * 
   * @param {string} id - Assignment ID
   * @param {Partial<CreateAssignmentDTO>} data - Partial assignment data to update
   * @returns {Promise<Assignment>} Updated assignment
   * @throws {Error} If request fails or assignment not found
   * 
   * @example
   * const assignment = await learningAPI.updateAssignment('assignment123', {
   *   title: 'Updated Assignment Title',
   *   maxMarks: 120,
   *   isPublished: true
   * });
   */
  updateAssignment: async (id: string, data: Partial<CreateAssignmentDTO>) => {
    const response = await apiClient.put<ApiResponse<Assignment>>(`/learning/assignments/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update assignment');
    }
    return response.data.data;
  },

  // ==================== Submissions ====================

  /**
   * Get all submissions with pagination and filters
   * 
   * Retrieves assignment submissions with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.assignmentId] - Filter by assignment ID
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.sectionId] - Filter by section ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Submissions array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await learningAPI.getAllSubmissions({
   *   assignmentId: 'assignment123',
   *   status: 'submitted',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllSubmissions: async (params?: {
    assignmentId?: string;
    studentId?: string;
    sectionId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/learning/submissions', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch submissions');
    }
    return response.data.data;
  },

  /**
   * Get submission by ID
   * 
   * Retrieves a specific submission by its ID.
   * 
   * @param {string} id - Submission ID
   * @returns {Promise<AssignmentSubmission>} Submission object
   * @throws {Error} If request fails or submission not found
   * 
   * @example
   * const submission = await learningAPI.getSubmissionById('submission123');
   * console.log(submission.status); // 'submitted'
   */
  getSubmissionById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<AssignmentSubmission>>(`/learning/submissions/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch submission');
    }
    return response.data.data;
  },

  /**
   * Create a submission
   * 
   * Creates a new assignment submission.
   * 
   * @param {CreateAssignmentSubmissionDTO} data - Submission creation data
   * @returns {Promise<AssignmentSubmission>} Created submission
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const submission = await learningAPI.createSubmission({
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
  createSubmission: async (data: CreateAssignmentSubmissionDTO) => {
    const response = await apiClient.post<ApiResponse<AssignmentSubmission>>('/learning/submissions', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create submission');
    }
    return response.data.data;
  },

  /**
   * Grade a submission
   * 
   * Grades an assignment submission.
   * Requires learning.update permission.
   * 
   * @param {string} submissionId - Submission ID
   * @param {GradeSubmissionDTO} data - Grading data
   * @returns {Promise<AssignmentSubmission>} Graded submission
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const submission = await learningAPI.gradeSubmission('submission123', {
   *   submissionId: 'submission123',
   *   obtainedMarks: 85,
   *   feedback: 'Good work! Well structured solution.'
   * });
   */
  gradeSubmission: async (submissionId: string, data: GradeSubmissionDTO) => {
    const response = await apiClient.post<ApiResponse<AssignmentSubmission>>(
      `/learning/submissions/${submissionId}/grade`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to grade submission');
    }
    return response.data.data;
  },

  /**
   * Delete an assignment
   * 
   * Deletes an assignment from the system.
   * Requires learning.delete permission.
   * 
   * @param {string} id - Assignment ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or assignment not found
   */
  deleteAssignment: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/learning/assignments/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete assignment');
    }
  },

  /**
   * Delete a course material
   * 
   * Deletes a course material from the system.
   * Requires learning.delete permission.
   * 
   * @param {string} id - Course material ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or material not found
   */
  deleteCourseMaterial: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/learning/materials/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete course material');
    }
  },
};

export default learningAPI;
