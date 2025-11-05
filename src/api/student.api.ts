/**
 * Student Management API Client
 * 
 * Frontend API client for student management endpoints.
 * Provides typed functions for all student operations including CRUD,
 * enrollments, results, and CGPA calculation.
 * 
 * @module api/student.api
 */

import apiClient from './client';

/**
 * Student Interface
 * 
 * Represents a student with optional user and program details.
 * 
 * @interface Student
 */
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

/**
 * Create Student Data Transfer Object
 * 
 * @interface CreateStudentDTO
 */
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

/**
 * Update Student Data Transfer Object
 * 
 * @interface UpdateStudentDTO
 */
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

/**
 * Students Response with Pagination
 * 
 * @interface StudentsResponse
 */
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
 * Student Management API Client
 * 
 * Provides methods for all student management operations.
 */
export const studentAPI = {
  /**
   * Get all students with pagination and filters
   * 
   * Retrieves students with pagination and optional filters.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.search] - Search query
   * @param {string} [filters.programId] - Filter by program ID
   * @param {string} [filters.batch] - Filter by batch
   * @param {string} [filters.enrollmentStatus] - Filter by enrollment status
   * @param {number} [filters.currentSemester] - Filter by current semester
   * @returns {Promise<StudentsResponse>} Students array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await studentAPI.getStudents(1, 20, {
   *   search: 'BS2024',
   *   programId: 'prog123',
   *   batch: '2024-Fall'
   * });
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
   * 
   * Retrieves a specific student by their ID with full details.
   * 
   * @param {string} id - Student ID
   * @returns {Promise<Student>} Student with user and program details
   * @throws {Error} If request fails or student not found
   * 
   * @example
   * const student = await studentAPI.getStudent('student123');
   * console.log(student.rollNumber); // 'BS2024-001'
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
   * 
   * Retrieves a student record associated with a user ID.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Student>} Student with user and program details
   * @throws {Error} If request fails or student not found
   * 
   * @example
   * const student = await studentAPI.getStudentByUserId('user123');
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
   * 
   * Creates a new student record.
   * Requires student.create permission.
   * 
   * @param {CreateStudentDTO} data - Student creation data
   * @returns {Promise<Student>} Created student
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const student = await studentAPI.createStudent({
   *   userId: 'user123',
   *   rollNumber: 'BS2024-001',
   *   programId: 'prog456',
   *   batch: '2024-Fall',
   *   admissionDate: '2024-09-01'
   * });
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
   * 
   * Updates an existing student's information.
   * Requires student.update permission.
   * 
   * @param {string} id - Student ID
   * @param {UpdateStudentDTO} data - Partial student data to update
   * @returns {Promise<Student>} Updated student
   * @throws {Error} If request fails or student not found
   * 
   * @example
   * const student = await studentAPI.updateStudent('student123', {
   *   currentSemester: 2,
   *   enrollmentStatus: 'active'
   * });
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
   * 
   * Deletes a student record.
   * Requires student.delete permission.
   * 
   * @param {string} id - Student ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or student not found
   * 
   * @example
   * await studentAPI.deleteStudent('student123');
   */
  deleteStudent: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  /**
   * Get student enrollments
   * 
   * Retrieves all course enrollments for a student.
   * 
   * @param {string} id - Student ID
   * @param {string} [semester] - Optional semester filter
   * @returns {Promise<any[]>} Array of enrollments with course details
   * @throws {Error} If request fails
   * 
   * @example
   * // Get all enrollments
   * const enrollments = await studentAPI.getStudentEnrollments('student123');
   * 
   * @example
   * // Get enrollments for specific semester
   * const fallEnrollments = await studentAPI.getStudentEnrollments('student123', '2024-Fall');
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
   * 
   * Retrieves all exam results for a student.
   * 
   * @param {string} id - Student ID
   * @param {string} [semester] - Optional semester filter
   * @returns {Promise<any[]>} Array of results with course and grade details
   * @throws {Error} If request fails
   * 
   * @example
   * // Get all results
   * const results = await studentAPI.getStudentResults('student123');
   * 
   * @example
   * // Get results for specific semester
   * const fallResults = await studentAPI.getStudentResults('student123', '2024-Fall');
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
   * 
   * Calculates and returns the student's Cumulative Grade Point Average.
   * 
   * @param {string} id - Student ID
   * @returns {Promise<number>} CGPA value (0.0 to 4.0)
   * @throws {Error} If request fails
   * 
   * @example
   * const cgpa = await studentAPI.getStudentCGPA('student123');
   * console.log(`CGPA: ${cgpa.toFixed(2)}`); // e.g., "CGPA: 3.45"
   */
  getStudentCGPA: async (id: string): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ cgpa: number }>>(`/students/${id}/cgpa`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch CGPA');
    }
    return response.data.data.cgpa;
  },
};
