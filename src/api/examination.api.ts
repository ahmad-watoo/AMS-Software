import apiClient from './client';

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
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

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
}

export interface CreateResultDTO {
  examId: string;
  studentId: string;
  obtainedMarks: number;
  remarks?: string;
}

export interface UpdateResultDTO {
  obtainedMarks?: number;
  remarks?: string;
  status?: 'pending' | 'graded' | 'approved';
}

export interface ReEvaluationRequestDTO {
  resultId: string;
  reason: string;
  requestedBy: string;
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

const examinationAPI = {
  // Exams
  getAllExams: async (params?: {
    courseId?: string;
    sectionId?: string;
    examType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/examination/exams', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch exams');
    }
    return response.data.data;
  },

  getExamById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Exam>>(`/examination/exams/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch exam');
    }
    return response.data.data;
  },

  createExam: async (data: CreateExamDTO) => {
    const response = await apiClient.post<ApiResponse<Exam>>('/examination/exams', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create exam');
    }
    return response.data.data;
  },

  updateExam: async (id: string, data: Partial<CreateExamDTO>) => {
    const response = await apiClient.put<ApiResponse<Exam>>(`/examination/exams/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update exam');
    }
    return response.data.data;
  },

  deleteExam: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/examination/exams/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete exam');
    }
  },

  // Results
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

  getResultById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ExamResult>>(`/examination/results/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch result');
    }
    return response.data.data;
  },

  createResult: async (data: CreateResultDTO) => {
    const response = await apiClient.post<ApiResponse<ExamResult>>('/examination/results', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create result');
    }
    return response.data.data;
  },

  updateResult: async (id: string, data: UpdateResultDTO) => {
    const response = await apiClient.put<ApiResponse<ExamResult>>(`/examination/results/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update result');
    }
    return response.data.data;
  },

  approveResult: async (id: string) => {
    const response = await apiClient.post<ApiResponse<ExamResult>>(`/examination/results/${id}/approve`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve result');
    }
    return response.data.data;
  },

  // Re-evaluation
  createReEvaluationRequest: async (data: ReEvaluationRequestDTO) => {
    const response = await apiClient.post<ApiResponse<any>>('/examination/re-evaluations', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create re-evaluation request');
    }
    return response.data.data;
  },

  getAllReEvaluations: async (params?: {
    resultId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/examination/re-evaluations', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch re-evaluations');
    }
    return response.data.data;
  },

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
};

export default examinationAPI;

