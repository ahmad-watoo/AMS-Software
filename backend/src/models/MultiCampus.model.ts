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

export interface CampusDepartment {
  id: string;
  campusId: string;
  departmentId: string;
  headId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface UpdateCampusDTO {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  campusHeadId?: string;
  isActive?: boolean;
  capacity?: number;
  description?: string;
}

export interface CreateStudentTransferDTO {
  studentId: string;
  fromCampusId: string;
  toCampusId: string;
  transferType: 'permanent' | 'temporary' | 'exchange';
  reason: string;
  effectiveDate?: string;
  remarks?: string;
}

export interface CreateStaffTransferDTO {
  staffId: string;
  fromCampusId: string;
  toCampusId: string;
  transferType: 'permanent' | 'temporary' | 'deputation';
  reason: string;
  effectiveDate?: string;
  remarks?: string;
}

export interface ApproveTransferDTO {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  transferDate?: string;
  effectiveDate?: string;
  remarks?: string;
}

