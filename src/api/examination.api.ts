/**
 * Examination Management API Client
 * 
 * Frontend API client for examination management endpoints.
 * Provides typed functions for all examination operations including:
 * - Exam management (CRUD)
 * - Result management (CRUD, approval)
 * - Re-evaluation request management
 * 
 * @module api/examination.api
 */

import apiClient from './client';

/**
 * Exam Interface
 * 
 * Represents an exam (midterm, final, quiz, assignment, practical).
 * 
 * @interface Exam
 */
export interface Exam {
  id: string;
  title: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment' | 'practical';
  courseId: string;
  sectionId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  location?: string;
  instructions?: string;
  roomId?: string;
  questionPaperUrl?: string;
  answerKeyUrl?: string;
  secureAccessEnabled?: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ExamsResponse {
  exams: Exam[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Exam Result Interface
 * 
 * Represents a student's result for an exam.
 * 
 * @interface ExamResult
 */
export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string;
  gpa?: number;
  status: 'pending' | 'graded' | 'approved' | 're_evaluation';
  gradedBy?: string;
  gradedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Exam Data Transfer Object
 * 
 * @interface CreateExamDTO
 */
export interface CreateExamDTO {
  title: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment' | 'practical';
  courseId: string;
  sectionId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  location?: string;
  instructions?: string;
  roomId?: string;
  questionPaperUrl?: string;
}

/**
 * Create Result Data Transfer Object
 * 
 * @interface CreateResultDTO
 */
export interface CreateResultDTO {
  examId: string;
  studentId: string;
  obtainedMarks: number;
  remarks?: string;
}

/**
 * Update Result Data Transfer Object
 * 
 * @interface UpdateResultDTO
 */
export interface UpdateResultDTO {
  obtainedMarks?: number;
  remarks?: string;
  status?: 'pending' | 'graded' | 'approved';
}

/**
 * Re-Evaluation Request Data Transfer Object
 * 
 * @interface ReEvaluationRequestDTO
 */
export interface ReEvaluationRequestDTO {
  resultId: string;
  reason: string;
  requestedBy: string;
}

export interface ReEvaluation {
  id: string;
  resultId: string;
  reason: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  requestedBy: string;
  remarks?: string;
  decisionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReEvaluationResponse {
  reEvaluations: ReEvaluation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuestionPaper {
  id: string;
  examId: string;
  version: string;
  notes?: string;
  isActive: boolean;
  fileUrl: string;
  secureToken?: string;
  secureUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPaperDTO {
  examId: string;
  version: string;
  notes?: string;
  isActive?: boolean;
  secureUntil?: string;
  fileName: string;
  fileBase64: string;
}

export interface UpdateQuestionPaperDTO {
  version?: string;
  notes?: string;
  isActive?: boolean;
  secureUntil?: string;
  fileName?: string;
  fileBase64?: string;
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
 * Examination Management API Client
 * 
 * Provides methods for all examination management operations.
 */
const examinationAPI = {
  // ==================== Exams ====================

  /**
   * Get all exams with pagination and filters
   * 
   * Retrieves exams with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.courseId] - Filter by course ID
   * @param {string} [params.sectionId] - Filter by section ID
   * @param {string} [params.examType] - Filter by exam type
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Exams array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await examinationAPI.getAllExams({
   *   sectionId: 'section123',
   *   examType: 'midterm',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllExams: async (params?: {
    courseId?: string;
    sectionId?: string;
    examType?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ExamsResponse> => {
    const response = await apiClient.get<ApiResponse<any>>('/examination/exams', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch exams');
    }
    return response.data.data;
  },

  /**
   * Get exam by ID
   * 
   * Retrieves a specific exam by its ID.
   * 
   * @param {string} id - Exam ID
   * @returns {Promise<Exam>} Exam object
   * @throws {Error} If request fails or exam not found
   * 
   * @example
   * const exam = await examinationAPI.getExamById('exam123');
   * console.log(exam.title); // 'Midterm Exam - Data Structures'
   */
  getExamById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Exam>>(`/examination/exams/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch exam');
    }
    return response.data.data;
  },

  /**
   * Create a new exam
   * 
   * Creates a new exam.
   * Requires examination.create permission.
   * 
   * @param {CreateExamDTO} data - Exam creation data
   * @returns {Promise<Exam>} Created exam
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const exam = await examinationAPI.createExam({
   *   sectionId: 'section123',
   *   examType: 'midterm',
   *   title: 'Midterm Exam - Data Structures',
   *   examDate: '2024-10-15',
   *   startTime: '09:00',
   *   endTime: '11:00',
   *   totalMarks: 100,
   *   passingMarks: 50
   * });
   */
  createExam: async (data: CreateExamDTO) => {
    const response = await apiClient.post<ApiResponse<Exam>>('/examination/exams', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create exam');
    }
    return response.data.data;
  },

  /**
   * Update an exam
   * 
   * Updates an existing exam.
   * Requires examination.update permission.
   * 
   * @param {string} id - Exam ID
   * @param {Partial<CreateExamDTO>} data - Partial exam data to update
   * @returns {Promise<Exam>} Updated exam
   * @throws {Error} If request fails or exam not found
   * 
   * @example
   * const exam = await examinationAPI.updateExam('exam123', {
   *   title: 'Updated Exam Title',
   *   totalMarks: 120,
   *   passingMarks: 60
   * });
   */
  updateExam: async (id: string, data: Partial<CreateExamDTO>) => {
    const response = await apiClient.put<ApiResponse<Exam>>(`/examination/exams/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update exam');
    }
    return response.data.data;
  },

  /**
   * Delete an exam
   * 
   * Deletes an exam.
   * Requires examination.delete permission.
   * 
   * @param {string} id - Exam ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or exam not found
   * 
   * @example
   * await examinationAPI.deleteExam('exam123');
   */
  deleteExam: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/examination/exams/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete exam');
    }
  },

  // ==================== Results ====================

  /**
   * Get all results with pagination and filters
   * 
   * Retrieves results with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.examId] - Filter by exam ID
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Results array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await examinationAPI.getAllResults({
   *   examId: 'exam123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllResults: async (params?: {
    examId?: string;
    studentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/examination/results', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch results');
    }
    return response.data.data;
  },

  /**
   * Get result by ID
   * 
   * Retrieves a specific result by its ID.
   * 
   * @param {string} id - Result ID
   * @returns {Promise<ExamResult>} Result object
   * @throws {Error} If request fails or result not found
   * 
   * @example
   * const result = await examinationAPI.getResultById('result123');
   * console.log(result.obtainedMarks); // 85
   */
  getResultById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ExamResult>>(`/examination/results/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch result');
    }
    return response.data.data;
  },

  /**
   * Create a new result
   * 
   * Creates a new exam result entry.
   * Requires examination.create permission.
   * 
   * @param {CreateResultDTO} data - Result creation data
   * @returns {Promise<ExamResult>} Created result
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const result = await examinationAPI.createResult({
   *   examId: 'exam123',
   *   studentId: 'student456',
   *   obtainedMarks: 85,
   *   remarks: 'Good performance'
   * });
   */
  createResult: async (data: CreateResultDTO) => {
    const response = await apiClient.post<ApiResponse<ExamResult>>('/examination/results', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create result');
    }
    return response.data.data;
  },

  /**
   * Update a result
   * 
   * Updates an existing result entry.
   * Requires examination.update permission.
   * 
   * @param {string} id - Result ID
   * @param {UpdateResultDTO} data - Partial result data to update
   * @returns {Promise<ExamResult>} Updated result
   * @throws {Error} If request fails or result not found
   * 
   * @example
   * const result = await examinationAPI.updateResult('result123', {
   *   obtainedMarks: 90,
   *   remarks: 'Excellent performance'
   * });
   */
  updateResult: async (id: string, data: UpdateResultDTO) => {
    const response = await apiClient.put<ApiResponse<ExamResult>>(`/examination/results/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update result');
    }
    return response.data.data;
  },

  /**
   * Approve a result
   * 
   * Approves a result entry.
   * Requires examination.approve permission.
   * 
   * @param {string} id - Result ID
   * @returns {Promise<ExamResult>} Approved result
   * @throws {Error} If request fails or result not found
   * 
   * @example
   * const result = await examinationAPI.approveResult('result123');
   */
  approveResult: async (id: string) => {
    const response = await apiClient.post<ApiResponse<ExamResult>>(`/examination/results/${id}/approve`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve result');
    }
    return response.data.data;
  },

  // ==================== Re-Evaluations ====================

  /**
   * Create a re-evaluation request
   * 
   * Creates a new re-evaluation request for a disputed result.
   * 
   * @param {ReEvaluationRequestDTO} data - Re-evaluation request data
   * @returns {Promise<any>} Created re-evaluation request
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const reEval = await examinationAPI.createReEvaluationRequest({
   *   resultId: 'result123',
   *   reason: 'Discrepancy in marks calculation',
   *   requestedBy: 'student456'
   * });
   */
  createReEvaluationRequest: async (data: ReEvaluationRequestDTO) => {
    const response = await apiClient.post<ApiResponse<any>>('/examination/re-evaluations', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create re-evaluation request');
    }
    return response.data.data;
  },

  /**
   * Get all re-evaluations with pagination and filters
   * 
   * Retrieves re-evaluation requests with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.resultId] - Filter by result ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Re-evaluations array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await examinationAPI.getAllReEvaluations({
   *   resultId: 'result123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllReEvaluations: async (params?: {
    resultId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ReEvaluationResponse> => {
    const response = await apiClient.get<ApiResponse<any>>('/examination/re-evaluations', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch re-evaluations');
    }
    return response.data.data;
  },

  /**
   * Approve or reject a re-evaluation
   * 
   * Processes a re-evaluation request (approve or reject).
   * Requires examination.approve permission.
   * 
   * @param {string} id - Re-evaluation ID
   * @param {'approved' | 'rejected'} decision - Decision on the re-evaluation
   * @param {string} [remarks] - Optional remarks
   * @returns {Promise<any>} Processed re-evaluation
   * @throws {Error} If request fails
   * 
   * @example
   * const reEval = await examinationAPI.approveReEvaluation('reeval123', 'approved', 'Marks recalculated');
   */
  approveReEvaluation: async (id: string, decision: 'approved' | 'rejected', remarks?: string) => {
    const response = await apiClient.post<ApiResponse<any>>(`/examination/re-evaluations/${id}/approve`, {
      decision,
      remarks,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to process re-evaluation');
    }
    return response.data.data;
  },

  // ==================== Question Papers ====================

  getQuestionPapers: async (params?: { examId?: string; page?: number; limit?: number }): Promise<{
    questionPapers: QuestionPaper[];
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/examination/question-papers', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch question papers');
    }
    return response.data.data;
  },

  uploadQuestionPaper: async (data: CreateQuestionPaperDTO): Promise<QuestionPaper> => {
    const response = await apiClient.post<ApiResponse<QuestionPaper>>('/examination/question-papers', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to upload question paper');
    }
    return response.data.data;
  },

  updateQuestionPaper: async (id: string, data: UpdateQuestionPaperDTO): Promise<QuestionPaper> => {
    const response = await apiClient.put<ApiResponse<QuestionPaper>>(`/examination/question-papers/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update question paper');
    }
    return response.data.data;
  },

  deleteQuestionPaper: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/examination/question-papers/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete question paper');
    }
  },

  generateQuestionPaperLink: async (id: string): Promise<{ signedUrl: string }> => {
    const response = await apiClient.post<ApiResponse<{ signedUrl: string }>>(
      `/examination/question-papers/${id}/link`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to generate secure link');
    }
    return response.data.data;
  },
};

export default examinationAPI;
