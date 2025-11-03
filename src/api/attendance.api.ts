import apiClient from './client';

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy?: string;
  markedAt?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

export interface BulkAttendanceEntry {
  enrollmentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface CreateAttendanceDTO {
  enrollmentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface BulkAttendanceDTO {
  sectionId: string;
  attendanceDate: string;
  entries: BulkAttendanceEntry[];
}

export interface AttendanceReport {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  sectionCode: string;
  attendancePercentage: number;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  status: 'satisfactory' | 'warning' | 'critical';
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

const attendanceAPI = {
  // Individual Attendance
  getAttendanceRecords: async (params?: {
    enrollmentId?: string;
    studentId?: string;
    courseId?: string;
    sectionId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/attendance/records', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance records');
    }
    return response.data.data;
  },

  getAttendanceRecordById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance record');
    }
    return response.data.data;
  },

  createAttendanceRecord: async (data: CreateAttendanceDTO) => {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/records', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create attendance record');
    }
    return response.data.data;
  },

  updateAttendanceRecord: async (id: string, data: Partial<CreateAttendanceDTO>) => {
    const response = await apiClient.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update attendance record');
    }
    return response.data.data;
  },

  deleteAttendanceRecord: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/attendance/records/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete attendance record');
    }
  },

  // Bulk Attendance
  createBulkAttendance: async (data: BulkAttendanceDTO) => {
    const response = await apiClient.post<ApiResponse<any>>('/attendance/bulk', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create bulk attendance');
    }
    return response.data.data;
  },

  // Attendance Summary
  getAttendanceSummary: async (params?: {
    enrollmentId?: string;
    studentId?: string;
    courseId?: string;
    sectionId?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>('/attendance/summary', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance summary');
    }
    return response.data.data;
  },

  // Attendance Reports
  getAttendanceReport: async (params?: {
    sectionId?: string;
    courseId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
    minPercentage?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<AttendanceReport[]>>('/attendance/reports', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch attendance report');
    }
    return response.data.data;
  },
};

export default attendanceAPI;

