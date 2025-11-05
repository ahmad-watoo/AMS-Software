/**
 * HR Controller
 * 
 * Handles HTTP requests for Human Resources management endpoints.
 * Manages employees, leave requests, job postings, and applications.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/hr.controller
 */

import { Request, Response, NextFunction } from 'express';
import { HRService } from '@/services/hr.service';
import {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  CreateLeaveRequestDTO,
  CreateJobPostingDTO,
  CreateJobApplicationDTO,
  ApproveLeaveDTO,
} from '@/models/HR.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class HRController {
  private hrService: HRService;

  constructor() {
    this.hrService = new HRService();
  }

  // ==================== Employees ====================

  /**
   * Get All Employees Endpoint Handler
   * 
   * Retrieves all employees with pagination and optional filters.
   * 
   * @route GET /api/v1/hr/employees
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [departmentId] - Filter by department ID
   * @query {string} [designation] - Filter by designation
   * @query {string} [employmentType] - Filter by employment type
   * @query {boolean} [isActive] - Filter by active status
   * @returns {Object} Employees array and pagination info
   * 
   * @example
   * GET /api/v1/hr/employees?page=1&limit=20&departmentId=dept123&employmentType=permanent
   */
  getAllEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        departmentId: req.query.departmentId as string,
        designation: req.query.designation as string,
        employmentType: req.query.employmentType as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      };

      const result = await this.hrService.getAllEmployees(limit, offset, filters);

      sendSuccess(res, {
        employees: result.employees,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all employees error:', error);
      next(error);
    }
  };

  /**
   * Get Employee By ID Endpoint Handler
   * 
   * Retrieves a specific employee by ID.
   * 
   * @route GET /api/v1/hr/employees/:id
   * @access Private
   * @param {string} id - Employee ID
   * @returns {Employee} Employee object
   */
  getEmployeeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employee = await this.hrService.getEmployeeById(id);
      sendSuccess(res, employee);
    } catch (error) {
      logger.error('Get employee by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Employee Endpoint Handler
   * 
   * Creates a new employee record.
   * 
   * @route POST /api/v1/hr/employees
   * @access Private (Requires hr.create permission)
   * @body {CreateEmployeeDTO} Employee creation data
   * @returns {Employee} Created employee
   * 
   * @example
   * POST /api/v1/hr/employees
   * Body: {
   *   userId: "user123",
   *   employeeId: "EMP001",
   *   designation: "Assistant Professor",
   *   joiningDate: "2024-01-15",
   *   employmentType: "permanent"
   * }
   */
  createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeData: CreateEmployeeDTO = {
        userId: req.body.userId,
        employeeId: req.body.employeeId,
        departmentId: req.body.departmentId,
        designation: req.body.designation,
        qualification: req.body.qualification,
        specialization: req.body.specialization,
        joiningDate: req.body.joiningDate,
        employmentType: req.body.employmentType,
        salary: req.body.salary,
      };

      if (!employeeData.userId || !employeeData.employeeId || !employeeData.designation || !employeeData.joiningDate) {
        throw new ValidationError('User ID, employee ID, designation, and joining date are required');
      }

      const employee = await this.hrService.createEmployee(employeeData);
      sendSuccess(res, employee, 'Employee created successfully', 201);
    } catch (error) {
      logger.error('Create employee error:', error);
      next(error);
    }
  };

  /**
   * Update Employee Endpoint Handler
   * 
   * Updates an existing employee record.
   * 
   * @route PUT /api/v1/hr/employees/:id
   * @access Private (Requires hr.update permission)
   * @param {string} id - Employee ID
   * @body {UpdateEmployeeDTO} Partial employee data to update
   * @returns {Employee} Updated employee
   * 
   * @example
   * PUT /api/v1/hr/employees/employee123
   * Body: {
   *   designation: "Associate Professor",
   *   salary: 150000
   * }
   */
  updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employeeData: UpdateEmployeeDTO = {
        departmentId: req.body.departmentId,
        designation: req.body.designation,
        qualification: req.body.qualification,
        specialization: req.body.specialization,
        employmentType: req.body.employmentType,
        salary: req.body.salary,
        isActive: req.body.isActive,
      };

      const employee = await this.hrService.updateEmployee(id, employeeData);
      sendSuccess(res, employee, 'Employee updated successfully');
    } catch (error) {
      logger.error('Update employee error:', error);
      next(error);
    }
  };

  // ==================== Leave Requests ====================

  /**
   * Get All Leave Requests Endpoint Handler
   * 
   * Retrieves all leave requests with pagination and optional filters.
   * 
   * @route GET /api/v1/hr/leave-requests
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [employeeId] - Filter by employee ID
   * @query {string} [status] - Filter by status
   * @query {string} [leaveType] - Filter by leave type
   * @returns {Object} Leave requests array and pagination info
   * 
   * @example
   * GET /api/v1/hr/leave-requests?page=1&limit=20&employeeId=employee123&status=pending
   */
  getAllLeaveRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        employeeId: req.query.employeeId as string,
        status: req.query.status as string,
        leaveType: req.query.leaveType as string,
      };

      const result = await this.hrService.getAllLeaveRequests(limit, offset, filters);

      sendSuccess(res, {
        leaveRequests: result.leaveRequests,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all leave requests error:', error);
      next(error);
    }
  };

  /**
   * Get Leave Request By ID Endpoint Handler
   * 
   * Retrieves a specific leave request by ID.
   * 
   * @route GET /api/v1/hr/leave-requests/:id
   * @access Private
   * @param {string} id - Leave request ID
   * @returns {LeaveRequest} Leave request object
   */
  getLeaveRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const leaveRequest = await this.hrService.getLeaveRequestById(id);
      sendSuccess(res, leaveRequest);
    } catch (error) {
      logger.error('Get leave request by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Leave Request Endpoint Handler
   * 
   * Creates a new leave request.
   * 
   * @route POST /api/v1/hr/leave-requests
   * @access Private
   * @body {CreateLeaveRequestDTO} Leave request creation data
   * @returns {LeaveRequest} Created leave request
   * 
   * @example
   * POST /api/v1/hr/leave-requests
   * Body: {
   *   employeeId: "employee123",
   *   leaveType: "annual",
   *   startDate: "2024-11-01",
   *   endDate: "2024-11-05",
   *   reason: "Family vacation"
   * }
   */
  createLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leaveData: CreateLeaveRequestDTO = {
        employeeId: req.body.employeeId,
        leaveType: req.body.leaveType,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        reason: req.body.reason,
      };

      if (!leaveData.employeeId || !leaveData.leaveType || !leaveData.startDate || !leaveData.endDate) {
        throw new ValidationError('Employee ID, leave type, start date, and end date are required');
      }

      const leaveRequest = await this.hrService.createLeaveRequest(leaveData);
      sendSuccess(res, leaveRequest, 'Leave request submitted successfully', 201);
    } catch (error) {
      logger.error('Create leave request error:', error);
      next(error);
    }
  };

  /**
   * Approve Leave Request Endpoint Handler
   * 
   * Approves or rejects a leave request.
   * 
   * @route POST /api/v1/hr/leave-requests/:id/approve
   * @access Private (Requires hr.approve permission)
   * @param {string} id - Leave request ID
   * @body {ApproveLeaveDTO} Approval/rejection data
   * @returns {LeaveRequest} Updated leave request
   * 
   * @example
   * POST /api/v1/hr/leave-requests/request123/approve
   * Body: {
   *   status: "approved",
   *   remarks: "Approved for annual leave"
   * }
   */
  approveLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approveData: ApproveLeaveDTO = {
        status: req.body.status,
        remarks: req.body.remarks,
        rejectionReason: req.body.rejectionReason,
      };

      if (!approveData.status || !['approved', 'rejected'].includes(approveData.status)) {
        throw new ValidationError('Status must be either approved or rejected');
      }

      const user = (req as any).user;
      const leaveRequest = await this.hrService.approveLeaveRequest(id, approveData, user?.id);
      sendSuccess(res, leaveRequest, `Leave request ${approveData.status} successfully`);
    } catch (error) {
      logger.error('Approve leave request error:', error);
      next(error);
    }
  };

  /**
   * Get Leave Balance Endpoint Handler
   * 
   * Retrieves leave balance for a specific employee.
   * 
   * @route GET /api/v1/hr/employees/:employeeId/leave-balance
   * @access Private
   * @param {string} employeeId - Employee ID
   * @returns {LeaveBalance} Leave balance with used and remaining leaves
   * 
   * @example
   * GET /api/v1/hr/employees/employee123/leave-balance
   */
  getLeaveBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const leaveBalance = await this.hrService.getLeaveBalance(employeeId);
      sendSuccess(res, leaveBalance);
    } catch (error) {
      logger.error('Get leave balance error:', error);
      next(error);
    }
  };

  // ==================== Job Postings ====================

  /**
   * Get All Job Postings Endpoint Handler
   * 
   * Retrieves all job postings with pagination and optional filters.
   * 
   * @route GET /api/v1/hr/job-postings
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [departmentId] - Filter by department ID
   * @query {string} [status] - Filter by status
   * @query {string} [employmentType] - Filter by employment type
   * @returns {Object} Job postings array and pagination info
   * 
   * @example
   * GET /api/v1/hr/job-postings?page=1&limit=20&departmentId=dept123&status=published
   */
  getAllJobPostings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        employmentType: req.query.employmentType as string,
      };

      const result = await this.hrService.getAllJobPostings(limit, offset, filters);

      sendSuccess(res, {
        jobPostings: result.jobPostings,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all job postings error:', error);
      next(error);
    }
  };

  /**
   * Get Job Posting By ID Endpoint Handler
   * 
   * Retrieves a specific job posting by ID.
   * 
   * @route GET /api/v1/hr/job-postings/:id
   * @access Private
   * @param {string} id - Job posting ID
   * @returns {JobPosting} Job posting object
   */
  getJobPostingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const jobPosting = await this.hrService.getJobPostingById(id);
      sendSuccess(res, jobPosting);
    } catch (error) {
      logger.error('Get job posting by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Job Posting Endpoint Handler
   * 
   * Creates a new job posting.
   * 
   * @route POST /api/v1/hr/job-postings
   * @access Private (Requires hr.create permission)
   * @body {CreateJobPostingDTO} Job posting creation data
   * @returns {JobPosting} Created job posting
   * 
   * @example
   * POST /api/v1/hr/job-postings
   * Body: {
   *   title: "Assistant Professor - Computer Science",
   *   departmentId: "dept123",
   *   description: "Teaching and research position",
   *   deadline: "2024-12-31",
   *   employmentType: "permanent"
   * }
   */
  createJobPosting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobData: CreateJobPostingDTO = {
        title: req.body.title,
        departmentId: req.body.departmentId,
        description: req.body.description,
        requirements: req.body.requirements,
        responsibilities: req.body.responsibilities,
        employmentType: req.body.employmentType,
        location: req.body.location,
        deadline: req.body.deadline,
      };

      if (!jobData.title || !jobData.description || !jobData.deadline) {
        throw new ValidationError('Title, description, and deadline are required');
      }

      const user = (req as any).user;
      const jobPosting = await this.hrService.createJobPosting(jobData, user?.id);
      sendSuccess(res, jobPosting, 'Job posting created successfully', 201);
    } catch (error) {
      logger.error('Create job posting error:', error);
      next(error);
    }
  };

  // ==================== Job Applications ====================

  /**
   * Get All Job Applications Endpoint Handler
   * 
   * Retrieves all job applications with pagination and optional filters.
   * 
   * @route GET /api/v1/hr/job-applications
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [jobPostingId] - Filter by job posting ID
   * @query {string} [status] - Filter by status
   * @returns {Object} Applications array and pagination info
   * 
   * @example
   * GET /api/v1/hr/job-applications?page=1&limit=20&jobPostingId=posting123&status=pending
   */
  getAllJobApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        jobPostingId: req.query.jobPostingId as string,
        status: req.query.status as string,
      };

      const result = await this.hrService.getAllJobApplications(limit, offset, filters);

      sendSuccess(res, {
        applications: result.applications,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all job applications error:', error);
      next(error);
    }
  };

  /**
   * Create Job Application Endpoint Handler
   * 
   * Submits a new job application.
   * 
   * @route POST /api/v1/hr/job-applications
   * @access Private
   * @body {CreateJobApplicationDTO} Job application creation data
   * @returns {JobApplication} Created job application
   * 
   * @example
   * POST /api/v1/hr/job-applications
   * Body: {
   *   jobPostingId: "posting123",
   *   applicantName: "John Doe",
   *   applicantEmail: "john@example.com",
   *   applicantCNIC: "12345-1234567-1",
   *   resumeUrl: "https://example.com/resume.pdf"
   * }
   */
  createJobApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationData: CreateJobApplicationDTO = {
        jobPostingId: req.body.jobPostingId,
        applicantName: req.body.applicantName,
        applicantEmail: req.body.applicantEmail,
        applicantPhone: req.body.applicantPhone,
        applicantCNIC: req.body.applicantCNIC,
        coverLetter: req.body.coverLetter,
        resumeUrl: req.body.resumeUrl,
      };

      if (!applicationData.jobPostingId || !applicationData.applicantName || !applicationData.applicantEmail || !applicationData.applicantCNIC) {
        throw new ValidationError('Job posting ID, applicant name, email, and CNIC are required');
      }

      const application = await this.hrService.createJobApplication(applicationData);
      sendSuccess(res, application, 'Job application submitted successfully', 201);
    } catch (error) {
      logger.error('Create job application error:', error);
      next(error);
    }
  };
}
