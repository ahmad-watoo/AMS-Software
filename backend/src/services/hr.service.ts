/**
 * HR Service
 * 
 * This service handles all Human Resources management business logic including:
 * - Employee management (CRUD operations)
 * - Leave request processing and approval
 * - Leave balance tracking
 * - Job posting management
 * - Job application processing
 * 
 * The HR system manages:
 * - Employee records with department and designation
 * - Leave request workflow (application, approval, rejection)
 * - Leave balance calculations by type
 * - Job postings and recruitment
 * - Job application submissions
 * 
 * @module services/hr.service
 */

import { HRRepository } from '@/repositories/hr.repository';
import {
  Employee,
  LeaveRequest,
  LeaveBalance,
  JobPosting,
  JobApplication,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  CreateLeaveRequestDTO,
  CreateJobPostingDTO,
  CreateJobApplicationDTO,
  ApproveLeaveDTO,
} from '@/models/HR.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class HRService {
  private hrRepository: HRRepository;

  constructor() {
    this.hrRepository = new HRRepository();
  }

  // ==================== Employees ====================

  /**
   * Get all employees with pagination and filters
   * 
   * Retrieves employees with optional filtering by department, designation,
   * employment type, and active status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of employees to return
   * @param {number} [offset=0] - Number of employees to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.departmentId] - Filter by department ID
   * @param {string} [filters.designation] - Filter by designation
   * @param {string} [filters.employmentType] - Filter by employment type
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<{employees: Employee[], total: number}>} Employees and total count
   * 
   * @example
   * const { employees, total } = await hrService.getAllEmployees(20, 0, {
   *   departmentId: 'dept123',
   *   employmentType: 'permanent',
   *   isActive: true
   * });
   */
  async getAllEmployees(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      designation?: string;
      employmentType?: string;
      isActive?: boolean;
    }
  ): Promise<{
    employees: Employee[];
    total: number;
  }> {
    try {
      const allEmployees = await this.hrRepository.findAllEmployees(limit * 10, 0, filters);
      const paginatedEmployees = allEmployees.slice(offset, offset + limit);

      return {
        employees: paginatedEmployees,
        total: allEmployees.length,
      };
    } catch (error) {
      logger.error('Error getting all employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  /**
   * Get employee by ID
   * 
   * Retrieves a specific employee by their ID.
   * 
   * @param {string} id - Employee ID
   * @returns {Promise<Employee>} Employee object
   * @throws {NotFoundError} If employee not found
   */
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const employee = await this.hrRepository.findEmployeeById(id);
      if (!employee) {
        throw new NotFoundError('Employee');
      }
      return employee;
    } catch (error) {
      logger.error('Error getting employee by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch employee');
    }
  }

  /**
   * Create a new employee
   * 
   * Creates a new employee record with validation.
   * Checks for duplicate employee IDs.
   * 
   * @param {CreateEmployeeDTO} employeeData - Employee creation data
   * @returns {Promise<Employee>} Created employee
   * @throws {ValidationError} If employee data is invalid
   * @throws {ConflictError} If employee ID already exists
   * 
   * @example
   * const employee = await hrService.createEmployee({
   *   userId: 'user123',
   *   employeeId: 'EMP001',
   *   designation: 'Assistant Professor',
   *   joiningDate: '2024-01-15',
   *   employmentType: 'permanent'
   * });
   */
  async createEmployee(employeeData: CreateEmployeeDTO): Promise<Employee> {
    try {
      if (!employeeData.userId || !employeeData.employeeId || !employeeData.designation || !employeeData.joiningDate) {
        throw new ValidationError('User ID, employee ID, designation, and joining date are required');
      }

      // Check if employee ID already exists
      const existingEmployee = await this.hrRepository.findEmployeeByEmployeeId(employeeData.employeeId);
      if (existingEmployee) {
        throw new ConflictError('Employee with this employee ID already exists');
      }

      return await this.hrRepository.createEmployee(employeeData);
    } catch (error) {
      logger.error('Error creating employee:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create employee');
    }
  }

  /**
   * Update an employee
   * 
   * Updates an existing employee's information.
   * 
   * @param {string} id - Employee ID
   * @param {UpdateEmployeeDTO} employeeData - Partial employee data to update
   * @returns {Promise<Employee>} Updated employee
   * @throws {NotFoundError} If employee not found
   */
  async updateEmployee(id: string, employeeData: UpdateEmployeeDTO): Promise<Employee> {
    try {
      const existingEmployee = await this.hrRepository.findEmployeeById(id);
      if (!existingEmployee) {
        throw new NotFoundError('Employee');
      }

      return await this.hrRepository.updateEmployee(id, employeeData);
    } catch (error) {
      logger.error('Error updating employee:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update employee');
    }
  }

  // ==================== Leave Requests ====================

  /**
   * Get all leave requests with pagination and filters
   * 
   * Retrieves leave requests with optional filtering by employee, status,
   * and leave type. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of requests to return
   * @param {number} [offset=0] - Number of requests to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.employeeId] - Filter by employee ID
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.leaveType] - Filter by leave type
   * @returns {Promise<{leaveRequests: LeaveRequest[], total: number}>} Leave requests and total count
   * 
   * @example
   * const { leaveRequests, total } = await hrService.getAllLeaveRequests(20, 0, {
   *   employeeId: 'employee123',
   *   status: 'pending'
   * });
   */
  async getAllLeaveRequests(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      employeeId?: string;
      status?: string;
      leaveType?: string;
    }
  ): Promise<{
    leaveRequests: LeaveRequest[];
    total: number;
  }> {
    try {
      const allRequests = await this.hrRepository.findAllLeaveRequests(limit * 10, 0, filters);
      const paginatedRequests = allRequests.slice(offset, offset + limit);

      return {
        leaveRequests: paginatedRequests,
        total: allRequests.length,
      };
    } catch (error) {
      logger.error('Error getting all leave requests:', error);
      throw new Error('Failed to fetch leave requests');
    }
  }

  /**
   * Get leave request by ID
   * 
   * Retrieves a specific leave request by its ID.
   * 
   * @param {string} id - Leave request ID
   * @returns {Promise<LeaveRequest>} Leave request object
   * @throws {NotFoundError} If leave request not found
   */
  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    try {
      const request = await this.hrRepository.findLeaveRequestById(id);
      if (!request) {
        throw new NotFoundError('Leave request');
      }
      return request;
    } catch (error) {
      logger.error('Error getting leave request by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch leave request');
    }
  }

  /**
   * Create a leave request
   * 
   * Creates a new leave request with validation.
   * Validates dates and ensures start date is not in the past.
   * 
   * @param {CreateLeaveRequestDTO} leaveData - Leave request creation data
   * @returns {Promise<LeaveRequest>} Created leave request
   * @throws {ValidationError} If leave data is invalid
   * 
   * @example
   * const leaveRequest = await hrService.createLeaveRequest({
   *   employeeId: 'employee123',
   *   leaveType: 'annual',
   *   startDate: '2024-11-01',
   *   endDate: '2024-11-05',
   *   reason: 'Family vacation'
   * });
   */
  async createLeaveRequest(leaveData: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      if (!leaveData.employeeId || !leaveData.leaveType || !leaveData.startDate || !leaveData.endDate) {
        throw new ValidationError('Employee ID, leave type, start date, and end date are required');
      }

      // Validate dates
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid date format');
      }

      if (startDate > endDate) {
        throw new ValidationError('Start date must be before or equal to end date');
      }

      if (startDate < new Date()) {
        throw new ValidationError('Start date cannot be in the past');
      }

      return await this.hrRepository.createLeaveRequest(leaveData);
    } catch (error) {
      logger.error('Error creating leave request:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create leave request');
    }
  }

  /**
   * Approve or reject a leave request
   * 
   * Processes a leave request approval or rejection.
   * Only pending requests can be processed.
   * 
   * @param {string} id - Leave request ID
   * @param {ApproveLeaveDTO} approveData - Approval/rejection data
   * @param {string} [approvedBy] - ID of user approving/rejecting
   * @returns {Promise<LeaveRequest>} Updated leave request
   * @throws {NotFoundError} If leave request not found
   * @throws {ValidationError} If request is not pending
   * 
   * @example
   * const leaveRequest = await hrService.approveLeaveRequest('request123', {
   *   status: 'approved',
   *   remarks: 'Approved for annual leave'
   * }, 'manager456');
   */
  async approveLeaveRequest(id: string, approveData: ApproveLeaveDTO, approvedBy?: string): Promise<LeaveRequest> {
    try {
      const request = await this.hrRepository.findLeaveRequestById(id);
      if (!request) {
        throw new NotFoundError('Leave request');
      }

      if (request.status !== 'pending') {
        throw new ValidationError('Only pending leave requests can be approved or rejected');
      }

      return await this.hrRepository.updateLeaveRequestStatus(
        id,
        approveData.status,
        approvedBy,
        approveData.remarks,
        approveData.rejectionReason
      );
    } catch (error) {
      logger.error('Error approving leave request:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to approve leave request');
    }
  }

  /**
   * Get leave balance for an employee
   * 
   * Calculates leave balance for an employee by type.
   * Includes used and remaining leaves for annual, sick, and casual leave.
   * 
   * @param {string} employeeId - Employee ID
   * @returns {Promise<LeaveBalance>} Leave balance with used and remaining leaves
   * 
   * @example
   * const balance = await hrService.getLeaveBalance('employee123');
   * console.log(balance.remainingAnnualLeave); // 10
   * console.log(balance.usedSickLeave); // 3
   */
  async getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
    try {
      // Get all approved leave requests
      const approvedLeaves = await this.hrRepository.findAllLeaveRequests(1000, 0, {
        employeeId,
        status: 'approved',
      });

      // Calculate used leaves by type
      const usedAnnualLeave = approvedLeaves
        .filter((l) => l.leaveType === 'annual')
        .reduce((sum, l) => sum + l.numberOfDays, 0);

      const usedSickLeave = approvedLeaves
        .filter((l) => l.leaveType === 'sick')
        .reduce((sum, l) => sum + l.numberOfDays, 0);

      const usedCasualLeave = approvedLeaves
        .filter((l) => l.leaveType === 'casual')
        .reduce((sum, l) => sum + l.numberOfDays, 0);

      // Default leave quotas (can be configured per employee)
      const annualLeave = 15; // 15 days annual leave
      const sickLeave = 10; // 10 days sick leave
      const casualLeave = 5; // 5 days casual leave

      return {
        employeeId,
        annualLeave,
        sickLeave,
        casualLeave,
        usedAnnualLeave,
        usedSickLeave,
        usedCasualLeave,
        remainingAnnualLeave: Math.max(0, annualLeave - usedAnnualLeave),
        remainingSickLeave: Math.max(0, sickLeave - usedSickLeave),
        remainingCasualLeave: Math.max(0, casualLeave - usedCasualLeave),
      };
    } catch (error) {
      logger.error('Error getting leave balance:', error);
      throw new Error('Failed to fetch leave balance');
    }
  }

  // ==================== Job Postings ====================

  /**
   * Get all job postings with pagination and filters
   * 
   * Retrieves job postings with optional filtering by department, status,
   * and employment type. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of postings to return
   * @param {number} [offset=0] - Number of postings to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.departmentId] - Filter by department ID
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.employmentType] - Filter by employment type
   * @returns {Promise<{jobPostings: JobPosting[], total: number}>} Job postings and total count
   * 
   * @example
   * const { jobPostings, total } = await hrService.getAllJobPostings(20, 0, {
   *   departmentId: 'dept123',
   *   status: 'published'
   * });
   */
  async getAllJobPostings(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      status?: string;
      employmentType?: string;
    }
  ): Promise<{
    jobPostings: JobPosting[];
    total: number;
  }> {
    try {
      const allPostings = await this.hrRepository.findAllJobPostings(limit * 10, 0, filters);
      const paginatedPostings = allPostings.slice(offset, offset + limit);

      return {
        jobPostings: paginatedPostings,
        total: allPostings.length,
      };
    } catch (error) {
      logger.error('Error getting all job postings:', error);
      throw new Error('Failed to fetch job postings');
    }
  }

  /**
   * Get job posting by ID
   * 
   * Retrieves a specific job posting by its ID.
   * 
   * @param {string} id - Job posting ID
   * @returns {Promise<JobPosting>} Job posting object
   * @throws {NotFoundError} If job posting not found
   */
  async getJobPostingById(id: string): Promise<JobPosting> {
    try {
      const posting = await this.hrRepository.findJobPostingById(id);
      if (!posting) {
        throw new NotFoundError('Job posting');
      }
      return posting;
    } catch (error) {
      logger.error('Error getting job posting by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch job posting');
    }
  }

  /**
   * Create a job posting
   * 
   * Creates a new job posting with validation.
   * Validates deadline is in the future.
   * 
   * @param {CreateJobPostingDTO} jobData - Job posting creation data
   * @param {string} [createdBy] - ID of user creating the posting
   * @returns {Promise<JobPosting>} Created job posting
   * @throws {ValidationError} If job data is invalid
   * 
   * @example
   * const jobPosting = await hrService.createJobPosting({
   *   title: 'Assistant Professor - Computer Science',
   *   departmentId: 'dept123',
   *   description: 'Teaching and research position',
   *   deadline: '2024-12-31',
   *   employmentType: 'permanent'
   * }, 'hr123');
   */
  async createJobPosting(jobData: CreateJobPostingDTO, createdBy?: string): Promise<JobPosting> {
    try {
      if (!jobData.title || !jobData.description || !jobData.deadline) {
        throw new ValidationError('Title, description, and deadline are required');
      }

      // Validate deadline is in the future
      const deadline = new Date(jobData.deadline);
      if (deadline < new Date()) {
        throw new ValidationError('Deadline must be in the future');
      }

      return await this.hrRepository.createJobPosting(jobData, createdBy);
    } catch (error) {
      logger.error('Error creating job posting:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create job posting');
    }
  }

  // ==================== Job Applications ====================

  /**
   * Get all job applications with pagination and filters
   * 
   * Retrieves job applications with optional filtering by job posting and status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of applications to return
   * @param {number} [offset=0] - Number of applications to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.jobPostingId] - Filter by job posting ID
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<{applications: JobApplication[], total: number}>} Applications and total count
   * 
   * @example
   * const { applications, total } = await hrService.getAllJobApplications(20, 0, {
   *   jobPostingId: 'posting123',
   *   status: 'pending'
   * });
   */
  async getAllJobApplications(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      jobPostingId?: string;
      status?: string;
    }
  ): Promise<{
    applications: JobApplication[];
    total: number;
  }> {
    try {
      const allApplications = await this.hrRepository.findAllJobApplications(limit * 10, 0, filters);
      const paginatedApplications = allApplications.slice(offset, offset + limit);

      return {
        applications: paginatedApplications,
        total: allApplications.length,
      };
    } catch (error) {
      logger.error('Error getting all job applications:', error);
      throw new Error('Failed to fetch job applications');
    }
  }

  /**
   * Create a job application
   * 
   * Creates a new job application with validation.
   * Validates CNIC format, checks job posting exists and is accepting applications.
   * 
   * @param {CreateJobApplicationDTO} applicationData - Job application creation data
   * @returns {Promise<JobApplication>} Created job application
   * @throws {ValidationError} If application data is invalid
   * @throws {NotFoundError} If job posting not found
   * 
   * @example
   * const application = await hrService.createJobApplication({
   *   jobPostingId: 'posting123',
   *   applicantName: 'John Doe',
   *   applicantEmail: 'john@example.com',
   *   applicantCNIC: '12345-1234567-1',
   *   resumeUrl: 'https://example.com/resume.pdf'
   * });
   */
  async createJobApplication(applicationData: CreateJobApplicationDTO): Promise<JobApplication> {
    try {
      if (!applicationData.jobPostingId || !applicationData.applicantName || !applicationData.applicantEmail || !applicationData.applicantCNIC) {
        throw new ValidationError('Job posting ID, applicant name, email, and CNIC are required');
      }

      // Validate CNIC format (Pakistan CNIC: XXXXX-XXXXXXX-X)
      const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
      if (!cnicPattern.test(applicationData.applicantCNIC)) {
        throw new ValidationError('Invalid CNIC format. Expected format: XXXXX-XXXXXXX-X');
      }

      // Check if job posting exists and is open
      const jobPosting = await this.hrRepository.findJobPostingById(applicationData.jobPostingId);
      if (!jobPosting) {
        throw new NotFoundError('Job posting');
      }

      if (jobPosting.status !== 'published') {
        throw new ValidationError('Job posting is not accepting applications');
      }

      // Check deadline
      const deadline = new Date(jobPosting.deadline);
      if (deadline < new Date()) {
        throw new ValidationError('Application deadline has passed');
      }

      return await this.hrRepository.createJobApplication(applicationData);
    } catch (error) {
      logger.error('Error creating job application:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create job application');
    }
  }
}
