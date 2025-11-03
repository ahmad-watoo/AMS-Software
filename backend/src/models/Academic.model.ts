export interface Program {
  id: string;
  code: string;
  name: string;
  degreeLevel: 'undergraduate' | 'graduate' | 'doctoral';
  duration: number; // in years
  totalCreditHours: number;
  departmentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId?: string;
  creditHours: number;
  theoryHours: number;
  labHours: number;
  description?: string;
  prerequisiteCourseIds: string[];
  isElective: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  sectionCode: string; // A, B, C, etc.
  semester: string; // e.g., "2024-Fall"
  facultyId?: string;
  maxCapacity: number;
  currentEnrollment: number;
  roomId?: string;
  scheduleId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Curriculum {
  id: string;
  programId: string;
  courseId: string;
  semesterNumber: number;
  isCore: boolean;
  isPrerequisite: boolean;
  createdAt: string;
}

export interface CreateProgramDTO {
  code: string;
  name: string;
  degreeLevel: 'undergraduate' | 'graduate' | 'doctoral';
  duration: number;
  totalCreditHours: number;
  departmentId?: string;
  description?: string;
}

export interface UpdateProgramDTO {
  name?: string;
  degreeLevel?: 'undergraduate' | 'graduate' | 'doctoral';
  duration?: number;
  totalCreditHours?: number;
  departmentId?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCourseDTO {
  code: string;
  title: string;
  departmentId?: string;
  creditHours: number;
  theoryHours: number;
  labHours: number;
  description?: string;
  prerequisiteCourseIds?: string[];
  isElective?: boolean;
}

export interface UpdateCourseDTO {
  title?: string;
  departmentId?: string;
  creditHours?: number;
  theoryHours?: number;
  labHours?: number;
  description?: string;
  prerequisiteCourseIds?: string[];
  isElective?: boolean;
  isActive?: boolean;
}

export interface CreateSectionDTO {
  courseId: string;
  sectionCode: string;
  semester: string;
  facultyId?: string;
  maxCapacity: number;
  roomId?: string;
  scheduleId?: string;
}

export interface UpdateSectionDTO {
  sectionCode?: string;
  facultyId?: string;
  maxCapacity?: number;
  currentEnrollment?: number;
  roomId?: string;
  scheduleId?: string;
  isActive?: boolean;
}

export interface AddCourseToCurriculumDTO {
  programId: string;
  courseId: string;
  semesterNumber: number;
  isCore: boolean;
  isPrerequisite?: boolean;
}

