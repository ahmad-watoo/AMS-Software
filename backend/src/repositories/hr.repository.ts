import { supabaseAdmin } from '@/config/supabase';
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
} from '@/models/HR.model';
import { logger } from '@/config/logger';

export class HRRepository {
  private employeesTable = 'staff'; // Using 'staff' table from schema
  private leaveRequestsTable = 'leaves';
  private jobPostingsTable = 'job_postings';
  private jobApplicationsTable = 'job_applications';

  // ==================== Employees ====================

  async findAllEmployees(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      designation?: string;
      employmentType?: string;
      isActive?: boolean;
    }
  ): Promise<Employee[]> {
    try {
      let query = supabaseAdmin
        .from(this.employeesTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.designation) {
        query = query.ilike('designation', `%${filters.designation}%`);
      }
      if (filters?.employmentType) {
        query = query.eq('employment_type', filters.employmentType);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapEmployeeFromDB) as Employee[];
    } catch (error) {
      logger.error('Error finding all employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  async findEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.employeesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapEmployeeFromDB(data) as Employee;
    } catch (error) {
      logger.error('Error finding employee by ID:', error);
      throw error;
    }
  }

  async findEmployeeByEmployeeId(employeeId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.employeesTable)
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapEmployeeFromDB(data) as Employee;
    } catch (error) {
      logger.error('Error finding employee by employee ID:', error);
      throw error;
    }
  }

  async createEmployee(employeeData: CreateEmployeeDTO): Promise<Employee> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.employeesTable)
        .insert({
          user_id: employeeData.userId,
          employee_id: employeeData.employeeId,
          department_id: employeeData.departmentId || null,
          designation: employeeData.designation,
          joining_date: employeeData.joiningDate,
          employment_type: employeeData.employmentType,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapEmployeeFromDB(data) as Employee;
    } catch (error) {
      logger.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  async updateEmployee(id: string, employeeData: UpdateEmployeeDTO): Promise<Employee> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (employeeData.departmentId !== undefined) updateData.department_id = employeeData.departmentId;
      if (employeeData.designation !== undefined) updateData.designation = employeeData.designation;
      if (employeeData.employmentType !== undefined) updateData.employment_type = employeeData.employmentType;
      if (employeeData.isActive !== undefined) updateData.is_active = employeeData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.employeesTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapEmployeeFromDB(data) as Employee;
    } catch (error) {
      logger.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  // ==================== Leave Requests ====================

  async findAllLeaveRequests(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      employeeId?: string;
      status?: string;
      leaveType?: string;
    }
  ): Promise<LeaveRequest[]> {
    try {
      let query = supabaseAdmin
        .from(this.leaveRequestsTable)
        .select('*')
        .order('applied_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.leaveType) {
        query = query.eq('leave_type', filters.leaveType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapLeaveRequestFromDB) as LeaveRequest[];
    } catch (error) {
      logger.error('Error finding all leave requests:', error);
      throw new Error('Failed to fetch leave requests');
    }
  }

  async findLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.leaveRequestsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapLeaveRequestFromDB(data) as LeaveRequest;
    } catch (error) {
      logger.error('Error finding leave request by ID:', error);
      throw error;
    }
  }

  async createLeaveRequest(leaveData: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      // Calculate number of days
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { data, error } = await supabaseAdmin
        .from(this.leaveRequestsTable)
        .insert({
          employee_id: leaveData.employeeId,
          leave_type: leaveData.leaveType,
          start_date: leaveData.startDate,
          end_date: leaveData.endDate,
          days_count: daysCount,
          reason: leaveData.reason || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapLeaveRequestFromDB(data) as LeaveRequest;
    } catch (error) {
      logger.error('Error creating leave request:', error);
      throw new Error('Failed to create leave request');
    }
  }

  async updateLeaveRequestStatus(
    id: string,
    status: 'approved' | 'rejected' | 'cancelled',
    approvedBy?: string,
    remarks?: string,
    rejectionReason?: string
  ): Promise<LeaveRequest> {
    try {
      const updateData: any = {
        status,
      };

      if (status === 'approved' || status === 'rejected') {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }
      if (remarks) updateData.remarks = remarks;
      if (rejectionReason) updateData.rejection_reason = rejectionReason;

      const { data, error } = await supabaseAdmin
        .from(this.leaveRequestsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapLeaveRequestFromDB(data) as LeaveRequest;
    } catch (error) {
      logger.error('Error updating leave request status:', error);
      throw new Error('Failed to update leave request');
    }
  }

  // ==================== Job Postings ====================

  async findAllJobPostings(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      status?: string;
      employmentType?: string;
    }
  ): Promise<JobPosting[]> {
    try {
      let query = supabaseAdmin
        .from(this.jobPostingsTable)
        .select('*')
        .order('posted_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employmentType) {
        query = query.eq('employment_type', filters.employmentType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapJobPostingFromDB) as JobPosting[];
    } catch (error) {
      logger.error('Error finding all job postings:', error);
      throw new Error('Failed to fetch job postings');
    }
  }

  async findJobPostingById(id: string): Promise<JobPosting | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.jobPostingsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapJobPostingFromDB(data) as JobPosting;
    } catch (error) {
      logger.error('Error finding job posting by ID:', error);
      throw error;
    }
  }

  async createJobPosting(jobData: CreateJobPostingDTO, createdBy?: string): Promise<JobPosting> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.jobPostingsTable)
        .insert({
          title: jobData.title,
          department_id: jobData.departmentId || null,
          description: jobData.description,
          requirements: jobData.requirements || null,
          responsibilities: jobData.responsibilities || null,
          employment_type: jobData.employmentType,
          location: jobData.location || null,
          posted_date: new Date().toISOString().split('T')[0],
          deadline: jobData.deadline,
          status: 'published',
          created_by: createdBy || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapJobPostingFromDB(data) as JobPosting;
    } catch (error) {
      logger.error('Error creating job posting:', error);
      throw new Error('Failed to create job posting');
    }
  }

  // ==================== Job Applications ====================

  async findAllJobApplications(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      jobPostingId?: string;
      status?: string;
    }
  ): Promise<JobApplication[]> {
    try {
      let query = supabaseAdmin
        .from(this.jobApplicationsTable)
        .select('*')
        .order('applied_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.jobPostingId) {
        query = query.eq('job_posting_id', filters.jobPostingId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapJobApplicationFromDB) as JobApplication[];
    } catch (error) {
      logger.error('Error finding all job applications:', error);
      throw new Error('Failed to fetch job applications');
    }
  }

  async createJobApplication(applicationData: CreateJobApplicationDTO): Promise<JobApplication> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.jobApplicationsTable)
        .insert({
          job_posting_id: applicationData.jobPostingId,
          applicant_name: applicationData.applicantName,
          applicant_email: applicationData.applicantEmail,
          applicant_phone: applicationData.applicantPhone,
          applicant_cnic: applicationData.applicantCNIC,
          cover_letter: applicationData.coverLetter || null,
          resume_url: applicationData.resumeUrl || null,
          applied_date: new Date().toISOString().split('T')[0],
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapJobApplicationFromDB(data) as JobApplication;
    } catch (error) {
      logger.error('Error creating job application:', error);
      throw new Error('Failed to create job application');
    }
  }

  // ==================== Helper Mappers ====================

  private mapEmployeeFromDB(data: any): Partial<Employee> {
    return {
      id: data.id,
      userId: data.user_id,
      employeeId: data.employee_id,
      departmentId: data.department_id,
      designation: data.designation,
      qualification: data.qualification || undefined,
      specialization: data.specialization || undefined,
      joiningDate: data.joining_date,
      employmentType: data.employment_type,
      salary: data.salary || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapLeaveRequestFromDB(data: any): Partial<LeaveRequest> {
    return {
      id: data.id,
      employeeId: data.employee_id,
      leaveType: data.leave_type,
      startDate: data.start_date,
      endDate: data.end_date,
      numberOfDays: data.days_count || data.number_of_days,
      reason: data.reason,
      appliedDate: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: data.status,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      rejectionReason: data.rejection_reason || undefined,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };
  }

  private mapJobPostingFromDB(data: any): Partial<JobPosting> {
    return {
      id: data.id,
      title: data.title,
      departmentId: data.department_id,
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      employmentType: data.employment_type,
      location: data.location,
      postedDate: data.posted_date,
      deadline: data.deadline,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapJobApplicationFromDB(data: any): Partial<JobApplication> {
    return {
      id: data.id,
      jobPostingId: data.job_posting_id,
      applicantName: data.applicant_name,
      applicantEmail: data.applicant_email,
      applicantPhone: data.applicant_phone,
      applicantCNIC: data.applicant_cnic,
      coverLetter: data.cover_letter,
      resumeUrl: data.resume_url,
      appliedDate: data.applied_date,
      status: data.status,
      interviewDate: data.interview_date,
      interviewNotes: data.interview_notes,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

