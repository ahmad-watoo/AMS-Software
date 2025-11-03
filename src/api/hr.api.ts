import apiClient from './client';

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

export interface CreateLeaveRequestDTO {
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'casual' | 'emergency' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
}

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

export interface CreateJobApplicationDTO {
  jobPostingId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCNIC: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApproveLeaveDTO {
  status: 'approved' | 'rejected';
  remarks?: string;
  rejectionReason?: string;
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

const hrAPI = {
  // Employees
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

  getEmployeeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Employee>>(`/hr/employees/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch employee');
    }
    return response.data.data;
  },

  createEmployee: async (data: CreateEmployeeDTO) => {
    const response = await apiClient.post<ApiResponse<Employee>>('/hr/employees', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create employee');
    }
    return response.data.data;
  },

  updateEmployee: async (id: string, data: Partial<CreateEmployeeDTO>) => {
    const response = await apiClient.put<ApiResponse<Employee>>(`/hr/employees/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update employee');
    }
    return response.data.data;
  },

  // Leave Requests
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

  getLeaveRequestById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<LeaveRequest>>(`/hr/leave-requests/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch leave request');
    }
    return response.data.data;
  },

  createLeaveRequest: async (data: CreateLeaveRequestDTO) => {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>('/hr/leave-requests', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create leave request');
    }
    return response.data.data;
  },

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

  getLeaveBalance: async (employeeId: string) => {
    const response = await apiClient.get<ApiResponse<LeaveBalance>>(
      `/hr/employees/${employeeId}/leave-balance`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch leave balance');
    }
    return response.data.data;
  },

  // Job Postings
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

  getJobPostingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<JobPosting>>(`/hr/job-postings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch job posting');
    }
    return response.data.data;
  },

  createJobPosting: async (data: CreateJobPostingDTO) => {
    const response = await apiClient.post<ApiResponse<JobPosting>>('/hr/job-postings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create job posting');
    }
    return response.data.data;
  },

  // Job Applications
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

  createJobApplication: async (data: CreateJobApplicationDTO) => {
    const response = await apiClient.post<ApiResponse<JobApplication>>('/hr/job-applications', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create job application');
    }
    return response.data.data;
  },
};

export default hrAPI;

