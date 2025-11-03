export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  sectionId: string;
  studentId: string;
  attendanceDate: string; // ISO date string
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy?: string;
  remarks?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  enrollmentId: string;
  sectionId: string;
  studentId: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
  lastUpdated: string;
}

export interface BulkAttendanceEntry {
  enrollmentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface CreateAttendanceDTO {
  enrollmentId: string;
  sectionId: string;
  studentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface BulkCreateAttendanceDTO {
  sectionId: string;
  attendanceDate: string;
  entries: BulkAttendanceEntry[];
}

export interface AttendanceReport {
  sectionId: string;
  attendanceDate: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

export interface StudentAttendanceReport {
  studentId: string;
  sectionId: string;
  startDate: string;
  endDate: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

