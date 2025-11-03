export interface Exam {
  id: string;
  sectionId: string;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  title: string;
  examDate: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  roomId?: string;
  instructions?: string;
  semester: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSchedule {
  id: string;
  examId: string;
  studentId: string;
  roomSeat?: string;
  seatNumber?: string;
  status: 'scheduled' | 'attended' | 'absent' | 'postponed';
  createdAt: string;
}

export interface Result {
  id: string;
  enrollmentId: string;
  examId: string;
  studentId: string;
  sectionId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string; // A+, A, B+, B, C+, C, D, F
  gpa: number; // 0.0 to 4.0
  remarks?: string;
  enteredBy?: string;
  enteredAt: string;
  approvedBy?: string;
  approvedAt?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GradeEntry {
  id: string;
  resultId: string;
  oldMarks?: number;
  newMarks: number;
  reason: string;
  modifiedBy: string;
  modifiedAt: string;
}

export interface ReEvaluation {
  id: string;
  resultId: string;
  studentId: string;
  examId: string;
  requestDate: string;
  feePaid: boolean;
  feeAmount?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  oldMarks: number;
  newMarks?: number;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateExamDTO {
  sectionId: string;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  roomId?: string;
  instructions?: string;
  semester: string;
}

export interface UpdateExamDTO {
  title?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  roomId?: string;
  instructions?: string;
}

export interface CreateResultDTO {
  enrollmentId: string;
  examId: string;
  studentId: string;
  sectionId: string;
  obtainedMarks: number;
  totalMarks: number;
  remarks?: string;
}

export interface UpdateResultDTO {
  obtainedMarks?: number;
  totalMarks?: number;
  remarks?: string;
  isApproved?: boolean;
}

export interface CreateReEvaluationDTO {
  resultId: string;
  studentId: string;
  examId: string;
  reason: string;
}

export interface GradeScale {
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  gpa: number;
}

// Default HEC grading scale
export const DEFAULT_GRADE_SCALE: GradeScale[] = [
  { minPercentage: 85, maxPercentage: 100, grade: 'A+', gpa: 4.0 },
  { minPercentage: 80, maxPercentage: 84.99, grade: 'A', gpa: 3.7 },
  { minPercentage: 75, maxPercentage: 79.99, grade: 'B+', gpa: 3.3 },
  { minPercentage: 70, maxPercentage: 74.99, grade: 'B', gpa: 3.0 },
  { minPercentage: 65, maxPercentage: 69.99, grade: 'C+', gpa: 2.7 },
  { minPercentage: 60, maxPercentage: 64.99, grade: 'C', gpa: 2.3 },
  { minPercentage: 50, maxPercentage: 59.99, grade: 'D', gpa: 1.7 },
  { minPercentage: 0, maxPercentage: 49.99, grade: 'F', gpa: 0.0 },
];

export function calculateGrade(percentage: number, gradeScale: GradeScale[] = DEFAULT_GRADE_SCALE): { grade: string; gpa: number } {
  for (const scale of gradeScale) {
    if (percentage >= scale.minPercentage && percentage <= scale.maxPercentage) {
      return { grade: scale.grade, gpa: scale.gpa };
    }
  }
  return { grade: 'F', gpa: 0.0 };
}

