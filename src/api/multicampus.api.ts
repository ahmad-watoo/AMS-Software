import apiClient from './client';

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

const multicampusAPI = {
  // Campuses
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

  getCampusById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Campus>>(`/multicampus/campuses/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch campus');
    }
    return response.data.data;
  },

  createCampus: async (data: CreateCampusDTO) => {
    const response = await apiClient.post<ApiResponse<Campus>>('/multicampus/campuses', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create campus');
    }
    return response.data.data;
  },

  updateCampus: async (id: string, data: Partial<CreateCampusDTO>) => {
    const response = await apiClient.put<ApiResponse<Campus>>(`/multicampus/campuses/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update campus');
    }
    return response.data.data;
  },

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

  // Student Transfers
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

  getStudentTransferById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StudentTransfer>>(`/multicampus/student-transfers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student transfer');
    }
    return response.data.data;
  },

  createStudentTransfer: async (data: CreateStudentTransferDTO) => {
    const response = await apiClient.post<ApiResponse<StudentTransfer>>('/multicampus/student-transfers', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create student transfer');
    }
    return response.data.data;
  },

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

  // Staff Transfers
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

  getStaffTransferById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StaffTransfer>>(`/multicampus/staff-transfers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch staff transfer');
    }
    return response.data.data;
  },

  createStaffTransfer: async (data: CreateStaffTransferDTO) => {
    const response = await apiClient.post<ApiResponse<StaffTransfer>>('/multicampus/staff-transfers', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create staff transfer');
    }
    return response.data.data;
  },

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

