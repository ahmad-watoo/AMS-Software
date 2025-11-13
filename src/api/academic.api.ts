/**
 * Academic Management API Client
 * 
 * Frontend API client for academic management endpoints.
 * Provides typed functions for all academic operations including:
 * - Program management (CRUD)
 * - Course management (CRUD)
 * - Course section management (CRUD)
 * 
 * @module api/academic.api
 */

import apiClient from './client';

/**
 * Program Interface
 * 
 * Represents an academic program (e.g., BS Computer Science, MS Data Science).
 * 
 * @interface Program
 */
export interface Program {
  id: string;
  code: string;
  name: string;
  degreeLevel: 'undergraduate' | 'graduate' | 'doctoral';
  duration: number;
  totalCreditHours: number;
  departmentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Interface
 * 
 * Represents a course (e.g., Data Structures, Algorithms).
 * 
 * @interface Course
 */
export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId?: string;
  creditHours: number;
  theoryHours: number;
  labHours: number;
  description?: string;
  prerequisiteCourseIds: string[];
  isElective: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Section Interface
 * 
 * Represents a section of a course (e.g., Section A, Fall 2024).
 * 
 * @interface CourseSection
 */
export interface CourseSection {
  id: string;
  courseId: string;
  sectionCode: string;
  semester: string;
  facultyId?: string;
  maxCapacity: number;
  currentEnrollment: number;
  roomId?: string;
  scheduleId?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Create Program Data Transfer Object
 * 
 * @interface CreateProgramDTO
 */
export interface CreateProgramDTO {
  code: string;
  name: string;
  degreeLevel: 'undergraduate' | 'graduate' | 'doctoral';
  duration: number;
  totalCreditHours: number;
  departmentId?: string;
  description?: string;
}

/**
 * Create Course Data Transfer Object
 * 
 * @interface CreateCourseDTO
 */
export interface CreateCourseDTO {
  code: string;
  title: string;
  departmentId?: string;
  creditHours: number;
  theoryHours: number;
  labHours: number;
  description?: string;
  prerequisiteCourseIds?: string[];
  isElective?: boolean;
}

/**
 * Create Section Data Transfer Object
 * 
 * @interface CreateSectionDTO
 */
export interface CreateSectionDTO {
  courseId: string;
  sectionCode: string;
  semester: string;
  facultyId?: string;
  maxCapacity: number;
  roomId?: string;
  scheduleId?: string;
}

/**
 * Curriculum course mapping
 *
 * Represents the relationship between a program, course, and semester sequence.
 */
export interface CurriculumCourse {
  id: string;
  programId: string;
  courseId: string;
  semesterNumber: number;
  isCore: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

export interface CurriculumResponse {
  programId: string;
  curriculum: CurriculumCourse[];
}

export interface UpsertCurriculumDTO {
  courseId: string;
  semesterNumber: number;
  isCore: boolean;
  notes?: string;
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
 * Programs Response with Pagination
 * 
 * @interface ProgramsResponse
 */
export interface ProgramsResponse {
  programs: Program[];
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
 * Courses Response with Pagination
 * 
 * @interface CoursesResponse
 */
export interface CoursesResponse {
  courses: Course[];
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
 * Sections Response with Pagination
 * 
 * @interface SectionsResponse
 */
export interface SectionsResponse {
  sections: CourseSection[];
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
 * Academic Management API Client
 * 
 * Provides methods for all academic management operations.
 */
export const academicAPI = {
  // ==================== Programs ====================

  /**
   * Get all programs with pagination and filters
   * 
   * Retrieves programs with pagination and optional filters.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.departmentId] - Filter by department ID
   * @param {string} [filters.degreeLevel] - Filter by degree level
   * @param {boolean} [filters.isActive] - Filter by active status
   * @param {string} [filters.search] - Search by program code or name
   * @returns {Promise<ProgramsResponse>} Programs array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await academicAPI.getPrograms(1, 20, {
   *   degreeLevel: 'undergraduate',
   *   search: 'CS'
   * });
   */
  getPrograms: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      departmentId?: string;
      degreeLevel?: string;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<ProgramsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.degreeLevel) params.append('degreeLevel', filters.degreeLevel);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<ProgramsResponse>>(
      `/academic/programs?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch programs');
    }
    return response.data.data;
  },

  /**
   * Get program by ID
   * 
   * Retrieves a specific program by its ID.
   * 
   * @param {string} id - Program ID
   * @returns {Promise<Program>} Program object
   * @throws {Error} If request fails or program not found
   * 
   * @example
   * const program = await academicAPI.getProgram('prog123');
   * console.log(program.name); // 'Bachelor of Science in Computer Science'
   */
  getProgram: async (id: string): Promise<Program> => {
    const response = await apiClient.get<ApiResponse<Program>>(`/academic/programs/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch program');
    }
    return response.data.data;
  },

  /**
   * Create a new program
   * 
   * Creates a new academic program.
   * Requires academic.create permission.
   * 
   * @param {CreateProgramDTO} data - Program creation data
   * @returns {Promise<Program>} Created program
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const program = await academicAPI.createProgram({
   *   code: 'BS-CS',
   *   name: 'Bachelor of Science in Computer Science',
   *   degreeLevel: 'undergraduate',
   *   duration: 4,
   *   totalCreditHours: 130,
   *   departmentId: 'dept123'
   * });
   */
  createProgram: async (data: CreateProgramDTO): Promise<Program> => {
    const response = await apiClient.post<ApiResponse<Program>>('/academic/programs', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create program');
    }
    return response.data.data;
  },

  /**
   * Update a program
   * 
   * Updates an existing program.
   * Requires academic.update permission.
   * 
   * @param {string} id - Program ID
   * @param {Partial<CreateProgramDTO>} data - Partial program data to update
   * @returns {Promise<Program>} Updated program
   * @throws {Error} If request fails or program not found
   * 
   * @example
   * const program = await academicAPI.updateProgram('prog123', {
   *   name: 'Updated Program Name',
   *   totalCreditHours: 135
   * });
   */
  updateProgram: async (id: string, data: Partial<CreateProgramDTO>): Promise<Program> => {
    const response = await apiClient.put<ApiResponse<Program>>(`/academic/programs/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update program');
    }
    return response.data.data;
  },

  // ==================== Courses ====================

  /**
   * Get all courses with pagination and filters
   * 
   * Retrieves courses with pagination and optional filters.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.departmentId] - Filter by department ID
   * @param {boolean} [filters.isElective] - Filter by elective status
   * @param {boolean} [filters.isActive] - Filter by active status
   * @param {string} [filters.search] - Search by course code or title
   * @returns {Promise<CoursesResponse>} Courses array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await academicAPI.getCourses(1, 20, {
   *   departmentId: 'dept123',
   *   isElective: false,
   *   search: 'CS'
   * });
   */
  getCourses: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      departmentId?: string;
      isElective?: boolean;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<CoursesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.isElective !== undefined) params.append('isElective', filters.isElective.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<CoursesResponse>>(
      `/academic/courses?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch courses');
    }
    return response.data.data;
  },

  /**
   * Get course by ID
   * 
   * Retrieves a specific course by its ID.
   * 
   * @param {string} id - Course ID
   * @returns {Promise<Course>} Course object
   * @throws {Error} If request fails or course not found
   * 
   * @example
   * const course = await academicAPI.getCourse('course123');
   * console.log(course.title); // 'Introduction to Computer Science'
   */
  getCourse: async (id: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/academic/courses/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch course');
    }
    return response.data.data;
  },

  /**
   * Create a new course
   * 
   * Creates a new course.
   * Requires academic.create permission.
   * 
   * @param {CreateCourseDTO} data - Course creation data
   * @returns {Promise<Course>} Created course
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const course = await academicAPI.createCourse({
   *   code: 'CS-101',
   *   title: 'Introduction to Computer Science',
   *   creditHours: 3,
   *   theoryHours: 3,
   *   labHours: 0,
   *   departmentId: 'dept123',
   *   isElective: false
   * });
   */
  createCourse: async (data: CreateCourseDTO): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<Course>>('/academic/courses', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create course');
    }
    return response.data.data;
  },

  /**
   * Update a course
   * 
   * Updates an existing course.
   * Requires academic.update permission.
   * 
   * @param {string} id - Course ID
   * @param {Partial<CreateCourseDTO>} data - Partial course data to update
   * @returns {Promise<Course>} Updated course
   * @throws {Error} If request fails or course not found
   * 
   * @example
   * const course = await academicAPI.updateCourse('course123', {
   *   title: 'Updated Course Title',
   *   creditHours: 4
   * });
   */
  updateCourse: async (id: string, data: Partial<CreateCourseDTO>): Promise<Course> => {
    const response = await apiClient.put<ApiResponse<Course>>(`/academic/courses/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update course');
    }
    return response.data.data;
  },

  // ==================== Sections ====================

  /**
   * Get all sections with pagination and filters
   * 
   * Retrieves course sections with pagination and optional filters.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.courseId] - Filter by course ID
   * @param {string} [filters.semester] - Filter by semester
   * @param {string} [filters.facultyId] - Filter by faculty ID
   * @returns {Promise<SectionsResponse>} Sections array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await academicAPI.getSections(1, 20, {
   *   courseId: 'course123',
   *   semester: '2024-Fall'
   * });
   */
  getSections: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      courseId?: string;
      semester?: string;
      facultyId?: string;
    }
  ): Promise<SectionsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.semester) params.append('semester', filters.semester);
    if (filters?.facultyId) params.append('facultyId', filters.facultyId);

    const response = await apiClient.get<ApiResponse<SectionsResponse>>(
      `/academic/sections?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch sections');
    }
    return response.data.data;
  },

  /**
   * Get section by ID
   * 
   * Retrieves a specific course section by its ID.
   * 
   * @param {string} id - Section ID
   * @returns {Promise<CourseSection>} Section object
   * @throws {Error} If request fails or section not found
   * 
   * @example
   * const section = await academicAPI.getSection('section123');
   * console.log(section.sectionCode); // 'A'
   */
  getSection: async (id: string): Promise<CourseSection> => {
    const response = await apiClient.get<ApiResponse<CourseSection>>(`/academic/sections/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch section');
    }
    return response.data.data;
  },

  /**
   * Create a new section
   * 
   * Creates a new course section.
   * Requires academic.create permission.
   * 
   * @param {CreateSectionDTO} data - Section creation data
   * @returns {Promise<CourseSection>} Created section
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const section = await academicAPI.createSection({
   *   courseId: 'course123',
   *   sectionCode: 'A',
   *   semester: '2024-Fall',
   *   maxCapacity: 30,
   *   facultyId: 'faculty456',
   *   roomId: 'room789'
   * });
   */
  createSection: async (data: CreateSectionDTO): Promise<CourseSection> => {
    const response = await apiClient.post<ApiResponse<CourseSection>>('/academic/sections', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create section');
    }
    return response.data.data;
  },

  /**
   * Update a section
   * 
   * Updates an existing course section.
   * Requires academic.update permission.
   * 
   * @param {string} id - Section ID
   * @param {Partial<CreateSectionDTO>} data - Partial section data to update
   * @returns {Promise<CourseSection>} Updated section
   * @throws {Error} If request fails or section not found
   * 
   * @example
   * const section = await academicAPI.updateSection('section123', {
   *   maxCapacity: 35,
   *   facultyId: 'faculty789'
   * });
   */
  updateSection: async (id: string, data: Partial<CreateSectionDTO>): Promise<CourseSection> => {
    const response = await apiClient.put<ApiResponse<CourseSection>>(`/academic/sections/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update section');
    }
    return response.data.data;
  },

  // ==================== Curriculum ====================

  /**
   * Fetch curriculum for a specific program
   */
  getProgramCurriculum: async (programId: string): Promise<CurriculumResponse> => {
    const response = await apiClient.get<ApiResponse<CurriculumResponse>>(
      `/academic/programs/${programId}/curriculum`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch curriculum');
    }
    return response.data.data;
  },

  /**
   * Add course to program curriculum
   */
  addCurriculumCourse: async (
    programId: string,
    data: UpsertCurriculumDTO
  ): Promise<CurriculumCourse> => {
    const response = await apiClient.post<ApiResponse<CurriculumCourse>>(
      `/academic/programs/${programId}/curriculum`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to add course to curriculum');
    }
    return response.data.data;
  },

  /**
   * Update curriculum mapping entry
   */
  updateCurriculumCourse: async (
    curriculumId: string,
    data: Partial<UpsertCurriculumDTO>
  ): Promise<CurriculumCourse> => {
    const response = await apiClient.put<ApiResponse<CurriculumCourse>>(
      `/academic/curriculum/${curriculumId}`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update curriculum course');
    }
    return response.data.data;
  },

  /**
   * Remove course from program curriculum
   */
  deleteCurriculumCourse: async (curriculumId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/academic/curriculum/${curriculumId}`
    );
    if (response.data && !response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete curriculum course');
    }
  },
};
