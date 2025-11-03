import apiClient from './client';

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

export interface GradeSubmissionDTO {
  submissionId: string;
  obtainedMarks: number;
  feedback?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

const learningAPI = {
  // Course Materials
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

  getCourseMaterialById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CourseMaterial>>(`/learning/materials/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch course material');
    }
    return response.data.data;
  },

  createCourseMaterial: async (data: CreateCourseMaterialDTO) => {
    const response = await apiClient.post<ApiResponse<CourseMaterial>>('/learning/materials', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create course material');
    }
    return response.data.data;
  },

  updateCourseMaterial: async (id: string, data: Partial<CreateCourseMaterialDTO>) => {
    const response = await apiClient.put<ApiResponse<CourseMaterial>>(`/learning/materials/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update course material');
    }
    return response.data.data;
  },

  // Assignments
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

  getAssignmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Assignment>>(`/learning/assignments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch assignment');
    }
    return response.data.data;
  },

  createAssignment: async (data: CreateAssignmentDTO) => {
    const response = await apiClient.post<ApiResponse<Assignment>>('/learning/assignments', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create assignment');
    }
    return response.data.data;
  },

  updateAssignment: async (id: string, data: Partial<CreateAssignmentDTO>) => {
    const response = await apiClient.put<ApiResponse<Assignment>>(`/learning/assignments/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update assignment');
    }
    return response.data.data;
  },

  // Submissions
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

  getSubmissionById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<AssignmentSubmission>>(`/learning/submissions/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch submission');
    }
    return response.data.data;
  },

  createSubmission: async (data: CreateAssignmentSubmissionDTO) => {
    const response = await apiClient.post<ApiResponse<AssignmentSubmission>>('/learning/submissions', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create submission');
    }
    return response.data.data;
  },

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
};

export default learningAPI;

