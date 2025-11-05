/**
 * Multi-Campus Management API Client
 * 
 * Frontend API client for multi-campus management endpoints.
 * Provides typed functions for all multi-campus operations including:
 * - Campus management (CRUD)
 * - Student transfer requests and approvals
 * - Staff transfer requests and approvals
 * - Campus reports and analytics
 * 
 * @module api/multicampus.api
 */

import apiClient from './client';

/**
 * Campus Interface
 * 
 * Represents an institutional campus.
 * 
 * @interface Campus
 */
export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  campusHeadId?: string;
  isActive: boolean;
  establishedDate?: string;
  capacity?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Student Transfer Interface
 * 
 * Represents a student transfer request between campuses.
 * 
 * @interface StudentTransfer
 */
export interface StudentTransfer {
  id: string;
  studentId: string;
  fromCampusId: string;
  toCampusId: string;
  transferType: 'permanent' | 'temporary' | 'exchange';
  reason: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  transferDate?: string;
  effectiveDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Staff Transfer Interface
 * 
 * Represents a staff transfer request between campuses.
 * 
 * @interface StaffTransfer
 */
export interface StaffTransfer {
  id: string;
  staffId: string;
  fromCampusId: string;
  toCampusId: string;
  transferType: 'permanent' | 'temporary' | 'deputation';
  reason: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  transferDate?: string;
  effectiveDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Campus Report Interface
 * 
 * Represents a campus analytics report.
 * 
 * @interface CampusReport
 */
export interface CampusReport {
  campusId: string;
  campusName: string;
  totalStudents: number;
  totalStaff: number;
  totalFaculty: number;
  totalPrograms: number;
  totalCourses: number;
  activeEnrollments: number;
  totalRevenue?: number;
  reportPeriod: string;
}

/**
 * Create Campus Data Transfer Object
 * 
 * @interface CreateCampusDTO
 */
export interface CreateCampusDTO {
  name: string;
  code: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  campusHeadId?: string;
  establishedDate?: string;
  capacity?: number;
  description?: string;
}

/**
 * Create Student Transfer Data Transfer Object
 * 
 * @interface CreateStudentTransferDTO
 */
export interface CreateStudentTransferDTO {
  studentId: string;
  fromCampusId: string;
  toCampusId: string;
  transferType: 'permanent' | 'temporary' | 'exchange';
  reason: string;
  effectiveDate?: string;
  remarks?: string;
}

/**
 * Create Staff Transfer Data Transfer Object
 * 
 * @interface CreateStaffTransferDTO
 */
export interface CreateStaffTransferDTO {
  staffId: string;
  fromCampusId: string;
  toCampusId: string;
  transferType: 'permanent' | 'temporary' | 'deputation';
  reason: string;
  effectiveDate?: string;
  remarks?: string;
}

/**
 * Approve Transfer Data Transfer Object
 * 
 * @interface ApproveTransferDTO
 */
export interface ApproveTransferDTO {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  transferDate?: string;
  effectiveDate?: string;
  remarks?: string;
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
 * Multi-Campus Management API Client
 * 
 * Provides methods for all multi-campus management operations.
 */
const multicampusAPI = {
  // ==================== Campuses ====================

  /**
   * Get all campuses with pagination and filters
   * 
   * Retrieves campuses with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.province] - Filter by province
   * @param {string} [params.city] - Filter by city
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Campuses array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await multicampusAPI.getAllCampuses({
   *   province: 'Punjab',
   *   isActive: true,
   *   page: 1,
   *   limit: 50
   * });
   */
  getAllCampuses: async (params?: {
    province?: string;
    city?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/multicampus/campuses', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch campuses');
    }
    return response.data.data;
  },

  /**
   * Get campus by ID
   * 
   * Retrieves a specific campus by its ID.
   * 
   * @param {string} id - Campus ID
   * @returns {Promise<Campus>} Campus object
   * @throws {Error} If request fails or campus not found
   * 
   * @example
   * const campus = await multicampusAPI.getCampusById('campus123');
   * console.log(campus.name); // "Main Campus"
   */
  getCampusById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Campus>>(`/multicampus/campuses/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch campus');
    }
    return response.data.data;
  },

  /**
   * Create a campus
   * 
   * Creates a new campus.
   * Requires admin.create permission.
   * 
   * @param {CreateCampusDTO} data - Campus creation data
   * @returns {Promise<Campus>} Created campus
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const campus = await multicampusAPI.createCampus({
   *   name: 'Main Campus',
   *   code: 'MC',
   *   address: '123 University Road',
   *   city: 'Lahore',
   *   province: 'Punjab'
   * });
   */
  createCampus: async (data: CreateCampusDTO) => {
    const response = await apiClient.post<ApiResponse<Campus>>('/multicampus/campuses', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create campus');
    }
    return response.data.data;
  },

  /**
   * Update a campus
   * 
   * Updates an existing campus.
   * Requires admin.update permission.
   * 
   * @param {string} id - Campus ID
   * @param {Partial<CreateCampusDTO>} data - Partial campus data to update
   * @returns {Promise<Campus>} Updated campus
   * @throws {Error} If request fails or campus not found
   * 
   * @example
   * const campus = await multicampusAPI.updateCampus('campus123', {
   *   name: 'Updated Campus Name',
   *   isActive: false
   * });
   */
  updateCampus: async (id: string, data: Partial<CreateCampusDTO>) => {
    const response = await apiClient.put<ApiResponse<Campus>>(`/multicampus/campuses/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update campus');
    }
    return response.data.data;
  },

  /**
   * Get campus report/analytics
   * 
   * Retrieves a comprehensive report for a specific campus.
   * 
   * @param {string} campusId - Campus ID
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.period] - Report period (YYYY-MM-DD)
   * @returns {Promise<CampusReport>} Campus report
   * @throws {Error} If request fails
   * 
   * @example
   * const report = await multicampusAPI.getCampusReport('campus123', {
   *   period: '2024-01-31'
   * });
   * console.log(report.totalStudents); // 500
   */
  getCampusReport: async (campusId: string, params?: { period?: string }) => {
    const response = await apiClient.get<ApiResponse<CampusReport>>(
      `/multicampus/campuses/${campusId}/report`,
      { params }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch campus report');
    }
    return response.data.data;
  },

  // ==================== Student Transfers ====================

  /**
   * Get all student transfers with pagination and filters
   * 
   * Retrieves student transfers with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.fromCampusId] - Filter by source campus ID
   * @param {string} [params.toCampusId] - Filter by destination campus ID
   * @param {string} [params.status] - Filter by transfer status
   * @param {string} [params.transferType] - Filter by transfer type
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Student transfers array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await multicampusAPI.getAllStudentTransfers({
   *   fromCampusId: 'campus123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllStudentTransfers: async (params?: {
    studentId?: string;
    fromCampusId?: string;
    toCampusId?: string;
    status?: string;
    transferType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/multicampus/student-transfers', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student transfers');
    }
    return response.data.data;
  },

  /**
   * Get student transfer by ID
   * 
   * Retrieves a specific student transfer by its ID.
   * 
   * @param {string} id - Student transfer ID
   * @returns {Promise<StudentTransfer>} Student transfer object
   * @throws {Error} If request fails or transfer not found
   * 
   * @example
   * const transfer = await multicampusAPI.getStudentTransferById('transfer123');
   * console.log(transfer.status); // "pending"
   */
  getStudentTransferById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StudentTransfer>>(`/multicampus/student-transfers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student transfer');
    }
    return response.data.data;
  },

  /**
   * Create a student transfer request
   * 
   * Creates a new student transfer request.
   * 
   * @param {CreateStudentTransferDTO} data - Student transfer creation data
   * @returns {Promise<StudentTransfer>} Created student transfer
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const transfer = await multicampusAPI.createStudentTransfer({
   *   studentId: 'student123',
   *   fromCampusId: 'campus1',
   *   toCampusId: 'campus2',
   *   transferType: 'permanent',
   *   reason: 'Family relocation'
   * });
   */
  createStudentTransfer: async (data: CreateStudentTransferDTO) => {
    const response = await apiClient.post<ApiResponse<StudentTransfer>>('/multicampus/student-transfers', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create student transfer');
    }
    return response.data.data;
  },

  /**
   * Approve or reject a student transfer
   * 
   * Approves or rejects a student transfer request.
   * Requires admin.approve permission.
   * 
   * @param {string} id - Student transfer ID
   * @param {ApproveTransferDTO} data - Approval/rejection data
   * @returns {Promise<StudentTransfer>} Updated student transfer
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const transfer = await multicampusAPI.approveStudentTransfer('transfer123', {
   *   status: 'approved',
   *   effectiveDate: '2024-02-01',
   *   remarks: 'Transfer approved'
   * });
   */
  approveStudentTransfer: async (id: string, data: ApproveTransferDTO) => {
    const response = await apiClient.post<ApiResponse<StudentTransfer>>(
      `/multicampus/student-transfers/${id}/approve`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve/reject student transfer');
    }
    return response.data.data;
  },

  // ==================== Staff Transfers ====================

  /**
   * Get all staff transfers with pagination and filters
   * 
   * Retrieves staff transfers with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.staffId] - Filter by staff ID
   * @param {string} [params.fromCampusId] - Filter by source campus ID
   * @param {string} [params.toCampusId] - Filter by destination campus ID
   * @param {string} [params.status] - Filter by transfer status
   * @param {string} [params.transferType] - Filter by transfer type
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Staff transfers array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await multicampusAPI.getAllStaffTransfers({
   *   fromCampusId: 'campus123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllStaffTransfers: async (params?: {
    staffId?: string;
    fromCampusId?: string;
    toCampusId?: string;
    status?: string;
    transferType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/multicampus/staff-transfers', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch staff transfers');
    }
    return response.data.data;
  },

  /**
   * Get staff transfer by ID
   * 
   * Retrieves a specific staff transfer by its ID.
   * 
   * @param {string} id - Staff transfer ID
   * @returns {Promise<StaffTransfer>} Staff transfer object
   * @throws {Error} If request fails or transfer not found
   * 
   * @example
   * const transfer = await multicampusAPI.getStaffTransferById('transfer123');
   * console.log(transfer.status); // "pending"
   */
  getStaffTransferById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StaffTransfer>>(`/multicampus/staff-transfers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch staff transfer');
    }
    return response.data.data;
  },

  /**
   * Create a staff transfer request
   * 
   * Creates a new staff transfer request.
   * 
   * @param {CreateStaffTransferDTO} data - Staff transfer creation data
   * @returns {Promise<StaffTransfer>} Created staff transfer
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const transfer = await multicampusAPI.createStaffTransfer({
   *   staffId: 'staff123',
   *   fromCampusId: 'campus1',
   *   toCampusId: 'campus2',
   *   transferType: 'permanent',
   *   reason: 'Organizational restructuring'
   * });
   */
  createStaffTransfer: async (data: CreateStaffTransferDTO) => {
    const response = await apiClient.post<ApiResponse<StaffTransfer>>('/multicampus/staff-transfers', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create staff transfer');
    }
    return response.data.data;
  },

  /**
   * Approve or reject a staff transfer
   * 
   * Approves or rejects a staff transfer request.
   * Requires admin.approve permission.
   * 
   * @param {string} id - Staff transfer ID
   * @param {ApproveTransferDTO} data - Approval/rejection data
   * @returns {Promise<StaffTransfer>} Updated staff transfer
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const transfer = await multicampusAPI.approveStaffTransfer('transfer123', {
   *   status: 'approved',
   *   effectiveDate: '2024-02-01',
   *   remarks: 'Transfer approved'
   * });
   */
  approveStaffTransfer: async (id: string, data: ApproveTransferDTO) => {
    const response = await apiClient.post<ApiResponse<StaffTransfer>>(
      `/multicampus/staff-transfers/${id}/approve`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve/reject staff transfer');
    }
    return response.data.data;
  },
};

export default multicampusAPI;
