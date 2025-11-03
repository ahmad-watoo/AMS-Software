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

