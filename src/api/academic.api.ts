import apiClient from './client';

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

export interface CreateProgramDTO {
  code: string;
  name: string;
  degreeLevel: 'undergraduate' | 'graduate' | 'doctoral';
  duration: number;
  totalCreditHours: number;
  departmentId?: string;
  description?: string;
}

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

export interface CreateSectionDTO {
  courseId: string;
  sectionCode: string;
  semester: string;
  facultyId?: string;
  maxCapacity: number;
  roomId?: string;
  scheduleId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

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

export const academicAPI = {
  // ==================== Programs ====================

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

  getProgram: async (id: string): Promise<Program> => {
    const response = await apiClient.get<ApiResponse<Program>>(`/academic/programs/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch program');
    }
    return response.data.data;
  },

  createProgram: async (data: CreateProgramDTO): Promise<Program> => {
    const response = await apiClient.post<ApiResponse<Program>>('/academic/programs', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create program');
    }
    return response.data.data;
  },

  updateProgram: async (id: string, data: Partial<CreateProgramDTO>): Promise<Program> => {
    const response = await apiClient.put<ApiResponse<Program>>(`/academic/programs/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update program');
    }
    return response.data.data;
  },

  // ==================== Courses ====================

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

  getCourse: async (id: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/academic/courses/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch course');
    }
    return response.data.data;
  },

  createCourse: async (data: CreateCourseDTO): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<Course>>('/academic/courses', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create course');
    }
    return response.data.data;
  },

  updateCourse: async (id: string, data: Partial<CreateCourseDTO>): Promise<Course> => {
    const response = await apiClient.put<ApiResponse<Course>>(`/academic/courses/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update course');
    }
    return response.data.data;
  },

  // ==================== Sections ====================

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

  getSection: async (id: string): Promise<CourseSection> => {
    const response = await apiClient.get<ApiResponse<CourseSection>>(`/academic/sections/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch section');
    }
    return response.data.data;
  },

  createSection: async (data: CreateSectionDTO): Promise<CourseSection> => {
    const response = await apiClient.post<ApiResponse<CourseSection>>('/academic/sections', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create section');
    }
    return response.data.data;
  },

  updateSection: async (id: string, data: Partial<CreateSectionDTO>): Promise<CourseSection> => {
    const response = await apiClient.put<ApiResponse<CourseSection>>(`/academic/sections/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update section');
    }
    return response.data.data;
  },
};

