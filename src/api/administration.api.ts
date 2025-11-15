/**
 * Administration Management API Client
 * 
 * Frontend API client for administration management endpoints.
 * Provides typed functions for all administration operations including:
 * - System configuration management (key-value settings)
 * - Event management (academic, cultural, sports, etc.)
 * - Notice management (announcements, important notices)
 * - Department management (organizational structure)
 * 
 * @module api/administration.api
 */

import apiClient from './client';

/**
 * System Configuration Interface
 * 
 * Represents a system configuration setting.
 * 
 * @interface SystemConfig
 */
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

/**
 * Event Interface
 * 
 * Represents an institutional event.
 * 
 * @interface Event
 */
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

/**
 * Notice Interface
 * 
 * Represents an institutional notice or announcement.
 * 
 * @interface Notice
 */
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

/**
 * Department Interface
 * 
 * Represents an organizational department.
 * 
 * @interface Department
 */
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

/**
 * Create System Configuration Data Transfer Object
 * 
 * @interface CreateSystemConfigDTO
 */
export interface CreateSystemConfigDTO {
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable?: boolean;
}

/**
 * Create Event Data Transfer Object
 * 
 * @interface CreateEventDTO
 */
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

/**
 * Create Notice Data Transfer Object
 * 
 * @interface CreateNoticeDTO
 */
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

/**
 * Create Department Data Transfer Object
 * 
 * @interface CreateDepartmentDTO
 */
export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentDepartmentId?: string;
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
 * Administration Management API Client
 * 
 * Provides methods for all administration management operations.
 */
const administrationAPI = {
  // ==================== System Configs ====================

  /**
   * Get all system configurations with pagination and filters
   * 
   * Retrieves system configurations with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.category] - Filter by category
   * @param {boolean} [params.isEditable] - Filter by editable status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} System configs array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await administrationAPI.getAllSystemConfigs({
   *   category: 'email',
   *   isEditable: true,
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllSystemConfigs: async (params?: {
    category?: string;
    isEditable?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/administration/system-configs', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch system configs');
    }
    return response.data.data;
  },

  /**
   * Get system configuration by key
   * 
   * Retrieves a specific system configuration by its unique key.
   * 
   * @param {string} key - Configuration key
   * @returns {Promise<SystemConfig>} System configuration object
   * @throws {Error} If request fails or config not found
   * 
   * @example
   * const config = await administrationAPI.getSystemConfigByKey('max_file_size');
   * console.log(config.value); // "10"
   */
  getSystemConfigByKey: async (key: string) => {
    const response = await apiClient.get<ApiResponse<SystemConfig>>(`/administration/system-configs/${key}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch system config');
    }
    return response.data.data;
  },

  /**
   * Create a system configuration
   * 
   * Creates a new system configuration.
   * Requires admin.create permission.
   * 
   * @param {CreateSystemConfigDTO} data - System configuration creation data
   * @returns {Promise<SystemConfig>} Created system configuration
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const config = await administrationAPI.createSystemConfig({
   *   key: 'max_file_size',
   *   value: '10',
   *   category: 'upload',
   *   dataType: 'number',
   *   description: 'Maximum file size in MB'
   * });
   */
  createSystemConfig: async (data: CreateSystemConfigDTO) => {
    const response = await apiClient.post<ApiResponse<SystemConfig>>('/administration/system-configs', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create system config');
    }
    return response.data.data;
  },

  /**
   * Update a system configuration
   * 
   * Updates an existing system configuration.
   * Requires admin.update permission.
   * 
   * @param {string} key - Configuration key
   * @param {Partial<CreateSystemConfigDTO>} data - Partial configuration data to update
   * @returns {Promise<SystemConfig>} Updated system configuration
   * @throws {Error} If request fails or config not found
   * 
   * @example
   * const config = await administrationAPI.updateSystemConfig('max_file_size', {
   *   value: '20',
   *   description: 'Updated maximum file size'
   * });
   */
  updateSystemConfig: async (key: string, data: Partial<CreateSystemConfigDTO>) => {
    const response = await apiClient.put<ApiResponse<SystemConfig>>(`/administration/system-configs/${key}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update system config');
    }
    return response.data.data;
  },

  // ==================== Events ====================

  /**
   * Get all events with pagination and filters
   * 
   * Retrieves events with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.eventType] - Filter by event type
   * @param {string} [params.targetAudience] - Filter by target audience
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {string} [params.startDate] - Filter by start date (YYYY-MM-DD)
   * @param {string} [params.endDate] - Filter by end date (YYYY-MM-DD)
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Events array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await administrationAPI.getAllEvents({
   *   eventType: 'academic',
   *   isActive: true,
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllEvents: async (params?: {
    eventType?: string;
    targetAudience?: string;
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

  /**
   * Get event by ID
   * 
   * Retrieves a specific event by its ID.
   * 
   * @param {string} id - Event ID
   * @returns {Promise<Event>} Event object
   * @throws {Error} If request fails or event not found
   * 
   * @example
   * const event = await administrationAPI.getEventById('event123');
   * console.log(event.title); // "Annual Sports Day"
   */
  getEventById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Event>>(`/administration/events/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch event');
    }
    return response.data.data;
  },

  /**
   * Create an event
   * 
   * Creates a new event.
   * Requires admin.create permission.
   * 
   * @param {CreateEventDTO} data - Event creation data
   * @returns {Promise<Event>} Created event
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const event = await administrationAPI.createEvent({
   *   title: 'Annual Sports Day',
   *   eventType: 'sports',
   *   startDate: '2024-03-15',
   *   endDate: '2024-03-16',
   *   targetAudience: ['students', 'faculty']
   * });
   */
  createEvent: async (data: CreateEventDTO) => {
    const response = await apiClient.post<ApiResponse<Event>>('/administration/events', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create event');
    }
    return response.data.data;
  },

  /**
   * Update an event
   * 
   * Updates an existing event.
   * Requires admin.update permission.
   * 
   * @param {string} id - Event ID
   * @param {Partial<CreateEventDTO>} data - Partial event data to update
   * @returns {Promise<Event>} Updated event
   * @throws {Error} If request fails or event not found
   * 
   * @example
   * const event = await administrationAPI.updateEvent('event123', {
   *   title: 'Updated Event Title',
   *   isActive: false
   * });
   */
  updateEvent: async (id: string, data: Partial<CreateEventDTO & { isActive?: boolean }>) => {
    const response = await apiClient.put<ApiResponse<Event>>(`/administration/events/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update event');
    }
    return response.data.data;
  },

  // ==================== Notices ====================

  /**
   * Get all notices with pagination and filters
   * 
   * Retrieves notices with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.noticeType] - Filter by notice type
   * @param {string} [params.priority] - Filter by priority
   * @param {string} [params.targetAudience] - Filter by target audience
   * @param {boolean} [params.isPublished] - Filter by published status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Notices array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await administrationAPI.getAllNotices({
   *   noticeType: 'important',
   *   priority: 'high',
   *   isPublished: true,
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllNotices: async (params?: {
    noticeType?: string;
    priority?: string;
    targetAudience?: string;
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

  /**
   * Get notice by ID
   * 
   * Retrieves a specific notice by its ID.
   * 
   * @param {string} id - Notice ID
   * @returns {Promise<Notice>} Notice object
   * @throws {Error} If request fails or notice not found
   * 
   * @example
   * const notice = await administrationAPI.getNoticeById('notice123');
   * console.log(notice.title); // "Fee Payment Deadline"
   */
  getNoticeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Notice>>(`/administration/notices/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch notice');
    }
    return response.data.data;
  },

  /**
   * Create a notice
   * 
   * Creates a new notice.
   * Requires admin.create permission.
   * 
   * @param {CreateNoticeDTO} data - Notice creation data
   * @returns {Promise<Notice>} Created notice
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const notice = await administrationAPI.createNotice({
   *   title: 'Fee Payment Deadline',
   *   content: 'Fee payment deadline is approaching...',
   *   noticeType: 'fee',
   *   priority: 'urgent',
   *   targetAudience: ['students'],
   *   publishedDate: '2024-01-15',
   *   expiryDate: '2024-02-15'
   * });
   */
  createNotice: async (data: CreateNoticeDTO) => {
    const response = await apiClient.post<ApiResponse<Notice>>('/administration/notices', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create notice');
    }
    return response.data.data;
  },

  /**
   * Update a notice
   * 
   * Updates an existing notice.
   * Requires admin.update permission.
   * 
   * @param {string} id - Notice ID
   * @param {Partial<CreateNoticeDTO>} data - Partial notice data to update
   * @returns {Promise<Notice>} Updated notice
   * @throws {Error} If request fails or notice not found
   * 
   * @example
   * const notice = await administrationAPI.updateNotice('notice123', {
   *   title: 'Updated Notice Title',
   *   isPublished: true
   * });
   */
  updateNotice: async (id: string, data: Partial<CreateNoticeDTO>) => {
    const response = await apiClient.put<ApiResponse<Notice>>(`/administration/notices/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update notice');
    }
    return response.data.data;
  },

  // ==================== Departments ====================

  /**
   * Get all departments with pagination and filters
   * 
   * Retrieves departments with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Departments array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await administrationAPI.getAllDepartments({
   *   isActive: true,
   *   page: 1,
   *   limit: 50
   * });
   */
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

  /**
   * Get department by ID
   * 
   * Retrieves a specific department by its ID.
   * 
   * @param {string} id - Department ID
   * @returns {Promise<Department>} Department object
   * @throws {Error} If request fails or department not found
   * 
   * @example
   * const department = await administrationAPI.getDepartmentById('dept123');
   * console.log(department.name); // "Computer Science"
   */
  getDepartmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Department>>(`/administration/departments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch department');
    }
    return response.data.data;
  },

  /**
   * Create a department
   * 
   * Creates a new department.
   * Requires admin.create permission.
   * 
   * @param {CreateDepartmentDTO} data - Department creation data
   * @returns {Promise<Department>} Created department
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const department = await administrationAPI.createDepartment({
   *   name: 'Computer Science',
   *   code: 'CS',
   *   description: 'Department of Computer Science',
   *   headId: 'faculty123'
   * });
   */
  createDepartment: async (data: CreateDepartmentDTO) => {
    const response = await apiClient.post<ApiResponse<Department>>('/administration/departments', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create department');
    }
    return response.data.data;
  },

  /**
   * Update a department
   * 
   * Updates an existing department.
   * Requires admin.update permission.
   * 
   * @param {string} id - Department ID
   * @param {Partial<CreateDepartmentDTO>} data - Partial department data to update
   * @returns {Promise<Department>} Updated department
   * @throws {Error} If request fails or department not found
   * 
   * @example
   * const department = await administrationAPI.updateDepartment('dept123', {
   *   name: 'Updated Department Name',
   *   isActive: false
   * });
   */
  updateDepartment: async (id: string, data: Partial<CreateDepartmentDTO>) => {
    const response = await apiClient.put<ApiResponse<Department>>(`/administration/departments/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update department');
    }
    return response.data.data;
  },

  /**
   * Delete an event
   * 
   * Deletes an event from the system.
   * Requires admin.delete permission.
   * 
   * @param {string} id - Event ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or event not found
   */
  deleteEvent: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/administration/events/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete event');
    }
  },

  /**
   * Delete a notice
   * 
   * Deletes a notice from the system.
   * Requires admin.delete permission.
   * 
   * @param {string} id - Notice ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or notice not found
   */
  deleteNotice: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/administration/notices/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete notice');
    }
  },

  /**
   * Delete a department
   * 
   * Deletes a department from the system.
   * Requires admin.delete permission.
   * 
   * @param {string} id - Department ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or department not found
   */
  deleteDepartment: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/administration/departments/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete department');
    }
  },
};

export default administrationAPI;
