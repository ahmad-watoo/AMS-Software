export interface CourseMaterial {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  materialType: 'document' | 'video' | 'link' | 'presentation' | 'other';
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: number;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  assignmentType: 'individual' | 'group' | 'project';
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  studentId: string;
  sectionId: string;
  submittedAt: string;
  submissionFiles: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
  submittedText?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  obtainedMarks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeBook {
  id: string;
  sectionId: string;
  courseId: string;
  enrollmentId: string;
  studentId: string;
  assignmentId?: string;
  examId?: string;
  obtainedMarks: number;
  totalMarks: number;
  weightage: number; // Percentage weight in final grade
  gradeCategory: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
  remarks?: string;
  enteredBy?: string;
  enteredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseMaterialDTO {
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  materialType: 'document' | 'video' | 'link' | 'presentation' | 'other';
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: number;
  fileName?: string;
  isVisible?: boolean;
  displayOrder?: number;
}

export interface CreateAssignmentDTO {
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  assignmentType: 'individual' | 'group' | 'project';
  allowedFileTypes?: string[];
  maxFileSize?: number;
  isPublished?: boolean;
}

export interface CreateAssignmentSubmissionDTO {
  assignmentId: string;
  enrollmentId: string;
  studentId: string;
  sectionId: string;
  submissionFiles: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
  submittedText?: string;
}

export interface GradeSubmissionDTO {
  submissionId: string;
  obtainedMarks: number;
  feedback?: string;
}

export interface UpdateCourseMaterialDTO {
  title?: string;
  description?: string;
  isVisible?: boolean;
  displayOrder?: number;
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  maxMarks?: number;
  isPublished?: boolean;
}

