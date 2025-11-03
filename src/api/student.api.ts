import apiClient from './client';

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  registrationNumber?: string;
  programId: string;
  batch: string;
  admissionDate: string;
  enrollmentStatus: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'transfer';
  currentSemester: number;
  cgpa?: number;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianId?: string;
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

export interface CreateStudentDTO {
  userId: string;
  rollNumber: string;
  registrationNumber?: string;
  programId: string;
  batch: string;
  admissionDate: string;
  currentSemester?: number;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianId?: string;
}

export interface UpdateStudentDTO {
  rollNumber?: string;
  registrationNumber?: string;
  programId?: string;
  batch?: string;
  currentSemester?: number;
  enrollmentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'transfer';
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianId?: string;
}

export interface StudentsResponse {
  students: Student[];
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

export const studentAPI = {
  /**
   * Get all students with pagination and filters
   */
  getStudents: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      programId?: string;
      batch?: string;
      enrollmentStatus?: string;
      currentSemester?: number;
    }
  ): Promise<StudentsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.search) params.append('search', filters.search);
    if (filters?.programId) params.append('programId', filters.programId);
    if (filters?.batch) params.append('batch', filters.batch);
    if (filters?.enrollmentStatus) params.append('enrollmentStatus', filters.enrollmentStatus);
    if (filters?.currentSemester) params.append('currentSemester', filters.currentSemester.toString());

    const response = await apiClient.get<ApiResponse<StudentsResponse>>(`/students?${params.toString()}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch students');
    }
    return response.data.data;
  },

  /**
   * Get student by ID
   */
  getStudent: async (id: string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student');
    }
    return response.data.data;
  },

  /**
   * Get student by user ID
   */
  getStudentByUserId: async (userId: string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/user/${userId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student');
    }
    return response.data.data;
  },

  /**
   * Create a new student
   */
  createStudent: async (data: CreateStudentDTO): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<Student>>('/students', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create student');
    }
    return response.data.data;
  },

  /**
   * Update a student
   */
  updateStudent: async (id: string, data: UpdateStudentDTO): Promise<Student> => {
    const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update student');
    }
    return response.data.data;
  },

  /**
   * Delete a student
   */
  deleteStudent: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  /**
   * Get student enrollments
   */
  getStudentEnrollments: async (id: string, semester?: string): Promise<any[]> => {
    const params = semester ? `?semester=${semester}` : '';
    const response = await apiClient.get<ApiResponse<any[]>>(`/students/${id}/enrollments${params}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch enrollments');
    }
    return response.data.data;
  },

  /**
   * Get student results
   */
  getStudentResults: async (id: string, semester?: string): Promise<any[]> => {
    const params = semester ? `?semester=${semester}` : '';
    const response = await apiClient.get<ApiResponse<any[]>>(`/students/${id}/results${params}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch results');
    }
    return response.data.data;
  },

  /**
   * Get student CGPA
   */
  getStudentCGPA: async (id: string): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ cgpa: number }>>(`/students/${id}/cgpa`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch CGPA');
    }
    return response.data.data.cgpa;
  },
};

