import apiClient from './client';

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

export interface AdmissionDocument {
  id: string;
  applicationId: string;
  documentType: 'matric' | 'intermediate' | 'cnic' | 'photo' | 'other';
  documentName: string;
  documentUrl: string;
  verified: boolean;
}

export interface CreateApplicationDTO {
  userId: string;
  programId: string;
  documents?: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
  }>;
}

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

export interface EligibilityResult {
  eligible: boolean;
  score: number;
  criteria: any;
  reasons: string[];
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const admissionAPI = {
  /**
   * Get all applications with pagination and filters
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
   */
  updateApplicationStatus: async (id: string, status: AdmissionApplication['status']): Promise<void> => {
    await apiClient.post(`/admission/applications/${id}/status`, { status });
  },

  /**
   * Generate merit list
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

