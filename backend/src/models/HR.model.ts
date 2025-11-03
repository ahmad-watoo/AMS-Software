export interface Employee {
  id: string;
  userId: string;
  employeeId: string; // Unique employee ID
  departmentId?: string;
  designation: string; // Professor, Associate Professor, Assistant Professor, Lecturer, Admin, etc.
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

export interface UpdateEmployeeDTO {
  departmentId?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  employmentType?: 'permanent' | 'contract' | 'temporary' | 'visiting';
  salary?: number;
  isActive?: boolean;
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

