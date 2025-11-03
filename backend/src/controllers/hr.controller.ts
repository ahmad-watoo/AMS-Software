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

