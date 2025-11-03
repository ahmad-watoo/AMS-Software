import { User } from './User.model';

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  registrationNumber?: string;
  programId: string;
  batch: string;
  admissionDate: string;
  enrollmentStatus: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'transfer';
  currentSemester: number;
  cgpa?: number;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDTO {
  userId: string;
  rollNumber: string;
  registrationNumber?: string;
  programId: string;
  batch: string;
  admissionDate: string;
  currentSemester?: number;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianId?: string;
}

export interface UpdateStudentDTO {
  rollNumber?: string;
  registrationNumber?: string;
  programId?: string;
  batch?: string;
  currentSemester?: number;
  enrollmentStatus?: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'transfer';
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianId?: string;
}

export interface StudentWithUser extends Student {
  user: User;
  program?: {
    id: string;
    name: string;
    code: string;
  };
  guardian?: {
    id: string;
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface StudentSearchFilters {
  search?: string;
  programId?: string;
  batch?: string;
  enrollmentStatus?: string;
  currentSemester?: number;
}

