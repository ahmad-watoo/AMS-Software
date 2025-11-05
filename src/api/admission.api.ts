/**
 * Admission Management API Client
 * 
 * Frontend API client for admission management endpoints.
 * Provides typed functions for all admission operations including application CRUD,
 * eligibility checking, merit list generation, and document management.
 * 
 * @module api/admission.api
 */

import apiClient from './client';

/**
 * Admission Application Interface
 * 
 * Represents an admission application with optional user and program details.
 * 
 * @interface AdmissionApplication
 */
export interface AdmissionApplication {
  id: string;
  userId: string;
  programId: string;
  applicationNumber: string;
  applicationDate: string;
  status: 'submitted' | 'under_review' | 'eligible' | 'interview_scheduled' | 'selected' | 'waitlisted' | 'rejected' | 'fee_submitted' | 'enrolled';
  eligibilityStatus?: 'eligible' | 'not_eligible' | 'pending';
  eligibilityScore?: number;
  meritRank?: number;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  remarks?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    cnic?: string;
  };
  program?: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * Admission Document Interface
 * 
 * @interface AdmissionDocument
 */
export interface AdmissionDocument {
  id: string;
  applicationId: string;
  documentType: 'matric' | 'intermediate' | 'cnic' | 'photo' | 'other';
  documentName: string;
  documentUrl: string;
  verified: boolean;
}

/**
 * Create Application Data Transfer Object
 * 
 * @interface CreateApplicationDTO
 */
export interface CreateApplicationDTO {
  userId: string;
  programId: string;
  documents?: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
  }>;
}

/**
 * Eligibility Check Data Transfer Object
 * 
 * @interface EligibilityCheckDTO
 */
export interface EligibilityCheckDTO {
  applicationId: string;
  programId: string;
  academicHistory: Array<{
    degree: string;
    marks: number;
    cgpa?: number;
    year: number;
  }>;
  testScores?: {
    entryTest?: number;
    interview?: number;
  };
}

/**
 * Eligibility Check Result Interface
 * 
 * @interface EligibilityResult
 */
export interface EligibilityResult {
  eligible: boolean;
  score: number;
  criteria: any;
  reasons: string[];
}

/**
 * Merit List Interface
 * 
 * @interface MeritList
 */
export interface MeritList {
  id: string;
  programId: string;
  batch: string;
  semester: string;
  publishedDate: string;
  totalSeats: number;
  applications: Array<{
    applicationId: string;
    applicationNumber: string;
    applicantName: string;
    meritScore: number;
    rank: number;
    status: 'selected' | 'waitlisted' | 'rejected';
  }>;
}

/**
 * Applications Response with Pagination
 * 
 * @interface ApplicationsResponse
 */
export interface ApplicationsResponse {
  applications: AdmissionApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Admission Management API Client
 * 
 * Provides methods for all admission management operations.
 */
export const admissionAPI = {
  /**
   * Get all applications with pagination and filters
   * 
   * Retrieves applications with pagination and optional filters.
   * Requires admission.view permission.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.programId] - Filter by program ID
   * @param {string} [filters.status] - Filter by application status
   * @param {string} [filters.batch] - Filter by batch
   * @param {string} [filters.search] - Search by application number
   * @returns {Promise<ApplicationsResponse>} Applications array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await admissionAPI.getApplications(1, 20, {
   *   programId: 'prog123',
   *   status: 'eligible',
   *   search: 'APP-2024'
   * });
   */
  getApplications: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      programId?: string;
      status?: string;
      batch?: string;
      search?: string;
    }
  ): Promise<ApplicationsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.programId) params.append('programId', filters.programId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.batch) params.append('batch', filters.batch);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<ApplicationsResponse>>(
      `/admission/applications?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch applications');
    }
    return response.data.data;
  },

  /**
   * Get application by ID
   * 
   * Retrieves a specific application by its ID with full details.
   * 
   * @param {string} id - Application ID
   * @returns {Promise<AdmissionApplication>} Application with user and program details
   * @throws {Error} If request fails or application not found
   * 
   * @example
   * const application = await admissionAPI.getApplication('app123');
   * console.log(application.applicationNumber); // 'APP-2024-001'
   */
  getApplication: async (id: string): Promise<AdmissionApplication> => {
    const response = await apiClient.get<ApiResponse<AdmissionApplication>>(`/admission/applications/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch application');
    }
    return response.data.data;
  },

  /**
   * Get user's applications
   * 
   * Retrieves all applications submitted by a specific user.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<AdmissionApplication[]>} Array of user's applications
   * @throws {Error} If request fails
   * 
   * @example
   * const applications = await admissionAPI.getUserApplications('user123');
   */
  getUserApplications: async (userId: string): Promise<AdmissionApplication[]> => {
    const response = await apiClient.get<ApiResponse<AdmissionApplication[]>>(
      `/admission/users/${userId}/applications`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch applications');
    }
    return response.data.data;
  },

  /**
   * Create a new application
   * 
   * Creates a new admission application.
   * Prevents duplicate active applications for the same program.
   * 
   * @param {CreateApplicationDTO} data - Application creation data
   * @returns {Promise<AdmissionApplication>} Created application
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const application = await admissionAPI.createApplication({
   *   userId: 'user123',
   *   programId: 'prog456',
   *   documents: [
   *     { documentType: 'matric', documentName: 'Matric Certificate', documentUrl: '...' }
   *   ]
   * });
   */
  createApplication: async (data: CreateApplicationDTO): Promise<AdmissionApplication> => {
    const response = await apiClient.post<ApiResponse<AdmissionApplication>>('/admission/applications', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create application');
    }
    return response.data.data;
  },

  /**
   * Check eligibility
   * 
   * Checks if an application meets eligibility criteria for a program.
   * Requires admission.view permission.
   * 
   * Scoring system:
   * - Base score: 50 points (if minimum marks requirement met)
   * - Entry test: 30% weightage (if provided)
   * - Interview: 20% weightage (if provided)
   * 
   * @param {EligibilityCheckDTO} data - Eligibility check data
   * @returns {Promise<EligibilityResult>} Eligibility result with score and reasons
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const result = await admissionAPI.checkEligibility({
   *   applicationId: 'app123',
   *   programId: 'prog456',
   *   academicHistory: [
   *     { degree: 'BS', marks: 85, cgpa: 3.4, year: 2024 }
   *   ],
   *   testScores: {
   *     entryTest: 75,
   *     interview: 80
   *   }
   * });
   * console.log(result.eligible); // true
   * console.log(result.score); // 85.5
   */
  checkEligibility: async (data: EligibilityCheckDTO): Promise<EligibilityResult> => {
    const response = await apiClient.post<ApiResponse<EligibilityResult>>('/admission/eligibility-check', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to check eligibility');
    }
    return response.data.data;
  },

  /**
   * Get application documents
   * 
   * Retrieves all documents uploaded for an application.
   * 
   * @param {string} id - Application ID
   * @returns {Promise<AdmissionDocument[]>} Array of application documents
   * @throws {Error} If request fails
   * 
   * @example
   * const documents = await admissionAPI.getApplicationDocuments('app123');
   */
  getApplicationDocuments: async (id: string): Promise<AdmissionDocument[]> => {
    const response = await apiClient.get<ApiResponse<AdmissionDocument[]>>(
      `/admission/applications/${id}/documents`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch documents');
    }
    return response.data.data;
  },

  /**
   * Update application status
   * 
   * Updates the status of an application (e.g., 'selected', 'rejected', 'enrolled').
   * Requires admission.approve permission.
   * 
   * @param {string} id - Application ID
   * @param {AdmissionApplication['status']} status - New application status
   * @returns {Promise<void>}
   * @throws {Error} If request fails
   * 
   * @example
   * await admissionAPI.updateApplicationStatus('app123', 'selected');
   */
  updateApplicationStatus: async (id: string, status: AdmissionApplication['status']): Promise<void> => {
    await apiClient.post(`/admission/applications/${id}/status`, { status });
  },

  /**
   * Generate merit list
   * 
   * Generates a merit list for a program based on eligibility scores.
   * Requires admission.approve permission.
   * 
   * Process:
   * 1. Gets all eligible applications for the program
   * 2. Calculates merit scores (from eligibility scores)
   * 3. Sorts by merit score (descending)
   * 4. Assigns ranks
   * 5. Marks as 'selected' (top N) or 'waitlisted' (remaining)
   * 
   * @param {Object} data - Merit list generation data
   * @param {string} data.programId - Program ID
   * @param {string} data.batch - Batch (e.g., '2024-Fall')
   * @param {string} data.semester - Semester
   * @param {number} data.totalSeats - Total available seats
   * @param {any} [data.selectionCriteria] - Optional selection criteria
   * @returns {Promise<MeritList>} Generated merit list with ranked applications
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const meritList = await admissionAPI.generateMeritList({
   *   programId: 'prog456',
   *   batch: '2024-Fall',
   *   semester: 'Fall',
   *   totalSeats: 50
   * });
   * console.log(meritList.applications.length); // 50 selected + waitlisted
   */
  generateMeritList: async (data: {
    programId: string;
    batch: string;
    semester: string;
    totalSeats: number;
    selectionCriteria?: any;
  }): Promise<MeritList> => {
    const response = await apiClient.post<ApiResponse<MeritList>>('/admission/merit-list', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to generate merit list');
    }
    return response.data.data;
  },
};
