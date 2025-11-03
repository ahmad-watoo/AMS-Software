import apiClient from './client';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'conference' | 'holiday' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerId?: string;
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  isActive: boolean;
  imageUrl?: string;
  registrationRequired?: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  noticeType: 'announcement' | 'important' | 'general' | 'exam' | 'fee' | 'holiday';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  publishedDate: string;
  expiryDate?: string;
  publishedBy?: string;
  isPublished: boolean;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentDepartmentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemConfigDTO {
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable?: boolean;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  eventType: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'conference' | 'holiday' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerId?: string;
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  imageUrl?: string;
  registrationRequired?: boolean;
  maxParticipants?: number;
}

export interface CreateNoticeDTO {
  title: string;
  content: string;
  noticeType: 'announcement' | 'important' | 'general' | 'exam' | 'fee' | 'holiday';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  publishedDate: string;
  expiryDate?: string;
  attachmentUrl?: string;
  isPublished?: boolean;
}

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentDepartmentId?: string;
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

const administrationAPI = {
  // System Configs
  getAllSystemConfigs: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/administration/system-configs', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch system configs');
    }
    return response.data.data;
  },

  getSystemConfigByKey: async (key: string) => {
    const response = await apiClient.get<ApiResponse<SystemConfig>>(`/administration/system-configs/${key}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch system config');
    }
    return response.data.data;
  },

  createSystemConfig: async (data: CreateSystemConfigDTO) => {
    const response = await apiClient.post<ApiResponse<SystemConfig>>('/administration/system-configs', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create system config');
    }
    return response.data.data;
  },

  updateSystemConfig: async (key: string, data: Partial<CreateSystemConfigDTO>) => {
    const response = await apiClient.put<ApiResponse<SystemConfig>>(`/administration/system-configs/${key}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update system config');
    }
    return response.data.data;
  },

  // Events
  getAllEvents: async (params?: {
    eventType?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/administration/events', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch events');
    }
    return response.data.data;
  },

  getEventById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Event>>(`/administration/events/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch event');
    }
    return response.data.data;
  },

  createEvent: async (data: CreateEventDTO) => {
    const response = await apiClient.post<ApiResponse<Event>>('/administration/events', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create event');
    }
    return response.data.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventDTO>) => {
    const response = await apiClient.put<ApiResponse<Event>>(`/administration/events/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update event');
    }
    return response.data.data;
  },

  // Notices
  getAllNotices: async (params?: {
    noticeType?: string;
    priority?: string;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/administration/notices', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch notices');
    }
    return response.data.data;
  },

  getNoticeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Notice>>(`/administration/notices/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch notice');
    }
    return response.data.data;
  },

  createNotice: async (data: CreateNoticeDTO) => {
    const response = await apiClient.post<ApiResponse<Notice>>('/administration/notices', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create notice');
    }
    return response.data.data;
  },

  updateNotice: async (id: string, data: Partial<CreateNoticeDTO>) => {
    const response = await apiClient.put<ApiResponse<Notice>>(`/administration/notices/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update notice');
    }
    return response.data.data;
  },

  // Departments
  getAllDepartments: async (params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/administration/departments', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch departments');
    }
    return response.data.data;
  },

  getDepartmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Department>>(`/administration/departments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch department');
    }
    return response.data.data;
  },

  createDepartment: async (data: CreateDepartmentDTO) => {
    const response = await apiClient.post<ApiResponse<Department>>('/administration/departments', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create department');
    }
    return response.data.data;
  },

  updateDepartment: async (id: string, data: Partial<CreateDepartmentDTO>) => {
    const response = await apiClient.put<ApiResponse<Department>>(`/administration/departments/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update department');
    }
    return response.data.data;
  },
};

export default administrationAPI;

