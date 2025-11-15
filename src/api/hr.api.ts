/**
 * HR Management API Client
 * 
 * Frontend API client for Human Resources management endpoints.
 * Provides typed functions for all HR operations including:
 * - Employee management (CRUD)
 * - Leave request processing and approval
 * - Leave balance tracking
 * - Job posting management
 * - Job application submissions
 * 
 * @module api/hr.api
 */

import apiClient from './client';

/**
 * Employee Interface
 * 
 * Represents an employee record.
 * 
 * @interface Employee
 */
export interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  departmentId?: string;
  designation: string;
  qualification?: string;
  specialization?: string;
  joiningDate: string;
  employmentType: 'permanent' | 'contract' | 'temporary' | 'visiting';
  salary?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Leave Request Interface
 * 
 * Represents a leave request.
 * 
 * @interface LeaveRequest
 */
export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'casual' | 'emergency' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Leave Balance Interface
 * 
 * Represents leave balance for an employee.
 * 
 * @interface LeaveBalance
 */
export interface LeaveBalance {
  employeeId: string;
  annualLeave: number;
  sickLeave: number;
  casualLeave: number;
  usedAnnualLeave: number;
  usedSickLeave: number;
  usedCasualLeave: number;
  remainingAnnualLeave: number;
  remainingSickLeave: number;
  remainingCasualLeave: number;
}

/**
 * Job Posting Interface
 * 
 * Represents a job posting.
 * 
 * @interface JobPosting
 */
export interface JobPosting {
  id: string;
  title: string;
  departmentId?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  employmentType: 'permanent' | 'contract' | 'temporary';
  location?: string;
  postedDate: string;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'filled';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job Application Interface
 * 
 * Represents a job application.
 * 
 * @interface JobApplication
 */
export interface JobApplication {
  id: string;
  jobPostingId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCNIC: string;
  coverLetter?: string;
  resumeUrl?: string;
  appliedDate: string;
  status: 'pending' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted';
  interviewDate?: string;
  interviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Employee Data Transfer Object
 * 
 * @interface CreateEmployeeDTO
 */
export interface CreateEmployeeDTO {
  userId: string;
  employeeId: string;
  departmentId?: string;
  designation: string;
  qualification?: string;
  specialization?: string;
  joiningDate: string;
  employmentType: 'permanent' | 'contract' | 'temporary' | 'visiting';
  salary?: number;
}

/**
 * Create Leave Request Data Transfer Object
 * 
 * @interface CreateLeaveRequestDTO
 */
export interface CreateLeaveRequestDTO {
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'casual' | 'emergency' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
}

/**
 * Create Job Posting Data Transfer Object
 * 
 * @interface CreateJobPostingDTO
 */
export interface CreateJobPostingDTO {
  title: string;
  departmentId?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  employmentType: 'permanent' | 'contract' | 'temporary';
  location?: string;
  deadline: string;
}

/**
 * Create Job Application Data Transfer Object
 * 
 * @interface CreateJobApplicationDTO
 */
export interface CreateJobApplicationDTO {
  jobPostingId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCNIC: string;
  coverLetter?: string;
  resumeUrl?: string;
}

/**
 * Approve Leave Data Transfer Object
 * 
 * @interface ApproveLeaveDTO
 */
export interface ApproveLeaveDTO {
  status: 'approved' | 'rejected';
  remarks?: string;
  rejectionReason?: string;
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
 * HR Management API Client
 * 
 * Provides methods for all HR management operations.
 */
const hrAPI = {
  // ==================== Employees ====================

  /**
   * Get all employees with pagination and filters
   * 
   * Retrieves employees with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.departmentId] - Filter by department ID
   * @param {string} [params.designation] - Filter by designation
   * @param {string} [params.employmentType] - Filter by employment type
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Employees array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await hrAPI.getAllEmployees({
   *   departmentId: 'dept123',
   *   employmentType: 'permanent',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllEmployees: async (params?: {
    departmentId?: string;
    designation?: string;
    employmentType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/hr/employees', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch employees');
    }
    return response.data.data;
  },

  /**
   * Get employee by ID
   * 
   * Retrieves a specific employee by its ID.
   * 
   * @param {string} id - Employee ID
   * @returns {Promise<Employee>} Employee object
   * @throws {Error} If request fails or employee not found
   * 
   * @example
   * const employee = await hrAPI.getEmployeeById('employee123');
   * console.log(employee.designation); // 'Assistant Professor'
   */
  getEmployeeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Employee>>(`/hr/employees/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch employee');
    }
    return response.data.data;
  },

  /**
   * Create a new employee
   * 
   * Creates a new employee record.
   * Requires hr.create permission.
   * 
   * @param {CreateEmployeeDTO} data - Employee creation data
   * @returns {Promise<Employee>} Created employee
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const employee = await hrAPI.createEmployee({
   *   userId: 'user123',
   *   employeeId: 'EMP001',
   *   designation: 'Assistant Professor',
   *   joiningDate: '2024-01-15',
   *   employmentType: 'permanent'
   * });
   */
  createEmployee: async (data: CreateEmployeeDTO) => {
    const response = await apiClient.post<ApiResponse<Employee>>('/hr/employees', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create employee');
    }
    return response.data.data;
  },

  /**
   * Update an employee
   * 
   * Updates an existing employee record.
   * Requires hr.update permission.
   * 
   * @param {string} id - Employee ID
   * @param {Partial<CreateEmployeeDTO>} data - Partial employee data to update
   * @returns {Promise<Employee>} Updated employee
   * @throws {Error} If request fails or employee not found
   * 
   * @example
   * const employee = await hrAPI.updateEmployee('employee123', {
   *   designation: 'Associate Professor',
   *   salary: 150000
   * });
   */
  updateEmployee: async (id: string, data: Partial<CreateEmployeeDTO>) => {
    const response = await apiClient.put<ApiResponse<Employee>>(`/hr/employees/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update employee');
    }
    return response.data.data;
  },

  // ==================== Leave Requests ====================

  /**
   * Get all leave requests with pagination and filters
   * 
   * Retrieves leave requests with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.employeeId] - Filter by employee ID
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.leaveType] - Filter by leave type
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Leave requests array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await hrAPI.getAllLeaveRequests({
   *   employeeId: 'employee123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllLeaveRequests: async (params?: {
    employeeId?: string;
    status?: string;
    leaveType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/hr/leave-requests', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch leave requests');
    }
    return response.data.data;
  },

  /**
   * Get leave request by ID
   * 
   * Retrieves a specific leave request by its ID.
   * 
   * @param {string} id - Leave request ID
   * @returns {Promise<LeaveRequest>} Leave request object
   * @throws {Error} If request fails or leave request not found
   * 
   * @example
   * const leaveRequest = await hrAPI.getLeaveRequestById('request123');
   * console.log(leaveRequest.status); // 'pending'
   */
  getLeaveRequestById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<LeaveRequest>>(`/hr/leave-requests/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch leave request');
    }
    return response.data.data;
  },

  /**
   * Create a leave request
   * 
   * Creates a new leave request.
   * 
   * @param {CreateLeaveRequestDTO} data - Leave request creation data
   * @returns {Promise<LeaveRequest>} Created leave request
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const leaveRequest = await hrAPI.createLeaveRequest({
   *   employeeId: 'employee123',
   *   leaveType: 'annual',
   *   startDate: '2024-11-01',
   *   endDate: '2024-11-05',
   *   reason: 'Family vacation'
   * });
   */
  createLeaveRequest: async (data: CreateLeaveRequestDTO) => {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>('/hr/leave-requests', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create leave request');
    }
    return response.data.data;
  },

  /**
   * Approve or reject a leave request
   * 
   * Approves or rejects a leave request.
   * Requires hr.approve permission.
   * 
   * @param {string} id - Leave request ID
   * @param {ApproveLeaveDTO} data - Approval/rejection data
   * @returns {Promise<LeaveRequest>} Updated leave request
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const leaveRequest = await hrAPI.approveLeaveRequest('request123', {
   *   status: 'approved',
   *   remarks: 'Approved for annual leave'
   * });
   */
  approveLeaveRequest: async (id: string, data: ApproveLeaveDTO) => {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>(
      `/hr/leave-requests/${id}/approve`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve/reject leave request');
    }
    return response.data.data;
  },

  /**
   * Get leave balance for an employee
   * 
   * Retrieves leave balance for a specific employee.
   * 
   * @param {string} employeeId - Employee ID
   * @returns {Promise<LeaveBalance>} Leave balance
   * @throws {Error} If request fails
   * 
   * @example
   * const balance = await hrAPI.getLeaveBalance('employee123');
   * console.log(balance.remainingAnnualLeave); // 10
   */
  getLeaveBalance: async (employeeId: string) => {
    const response = await apiClient.get<ApiResponse<LeaveBalance>>(
      `/hr/employees/${employeeId}/leave-balance`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch leave balance');
    }
    return response.data.data;
  },

  // ==================== Job Postings ====================

  /**
   * Get all job postings with pagination and filters
   * 
   * Retrieves job postings with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.departmentId] - Filter by department ID
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.employmentType] - Filter by employment type
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Job postings array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await hrAPI.getAllJobPostings({
   *   departmentId: 'dept123',
   *   status: 'published',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllJobPostings: async (params?: {
    departmentId?: string;
    status?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/hr/job-postings', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch job postings');
    }
    return response.data.data;
  },

  /**
   * Get job posting by ID
   * 
   * Retrieves a specific job posting by its ID.
   * 
   * @param {string} id - Job posting ID
   * @returns {Promise<JobPosting>} Job posting object
   * @throws {Error} If request fails or job posting not found
   * 
   * @example
   * const jobPosting = await hrAPI.getJobPostingById('posting123');
   * console.log(jobPosting.title); // 'Assistant Professor - Computer Science'
   */
  getJobPostingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<JobPosting>>(`/hr/job-postings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch job posting');
    }
    return response.data.data;
  },

  /**
   * Create a job posting
   * 
   * Creates a new job posting.
   * Requires hr.create permission.
   * 
   * @param {CreateJobPostingDTO} data - Job posting creation data
   * @returns {Promise<JobPosting>} Created job posting
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const jobPosting = await hrAPI.createJobPosting({
   *   title: 'Assistant Professor - Computer Science',
   *   departmentId: 'dept123',
   *   description: 'Teaching and research position',
   *   deadline: '2024-12-31',
   *   employmentType: 'permanent'
   * });
   */
  createJobPosting: async (data: CreateJobPostingDTO) => {
    const response = await apiClient.post<ApiResponse<JobPosting>>('/hr/job-postings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create job posting');
    }
    return response.data.data;
  },

  // ==================== Job Applications ====================

  /**
   * Get all job applications with pagination and filters
   * 
   * Retrieves job applications with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.jobPostingId] - Filter by job posting ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Applications array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await hrAPI.getAllJobApplications({
   *   jobPostingId: 'posting123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllJobApplications: async (params?: {
    jobPostingId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/hr/job-applications', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch job applications');
    }
    return response.data.data;
  },

  /**
   * Create a job application
   * 
   * Submits a new job application.
   * 
   * @param {CreateJobApplicationDTO} data - Job application creation data
   * @returns {Promise<JobApplication>} Created job application
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const application = await hrAPI.createJobApplication({
   *   jobPostingId: 'posting123',
   *   applicantName: 'John Doe',
   *   applicantEmail: 'john@example.com',
   *   applicantCNIC: '12345-1234567-1',
   *   resumeUrl: 'https://example.com/resume.pdf'
   * });
   */
  createJobApplication: async (data: CreateJobApplicationDTO) => {
    const response = await apiClient.post<ApiResponse<JobApplication>>('/hr/job-applications', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create job application');
    }
    return response.data.data;
  },

  /**
   * Delete an employee
   * 
   * Deletes an employee record.
   * Requires hr.delete permission.
   * 
   * @param {string} id - Employee ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or employee not found
   */
  deleteEmployee: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/hr/employees/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete employee');
    }
  },

  /**
   * Delete a job posting
   * 
   * Deletes a job posting.
   * Requires hr.delete permission.
   * 
   * @param {string} id - Job posting ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or job posting not found
   */
  deleteJobPosting: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/hr/job-postings/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete job posting');
    }
  },
};

export default hrAPI;
