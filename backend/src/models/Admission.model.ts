export interface AdmissionApplication {
  id: string;
  userId: string;
  programId: string;
  applicationNumber: string;
  applicationDate: string;
  status: 'submitted' | 'under_review' | 'eligible' | 'interview_scheduled' | 'selected' | 'waitlisted' | 'rejected' | 'fee_submitted' | 'enrolled';
  eligibilityStatus?: 'eligible' | 'not_eligible' | 'pending';
  eligibilityScore?: number;
  meritRank?: number;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  remarks?: string;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionDocument {
  id: string;
  applicationId: string;
  documentType: 'matric' | 'intermediate' | 'cnic' | 'photo' | 'other';
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface EligibilityCriteria {
  id: string;
  programId: string;
  minimumMarks?: number;
  minimumCGPA?: number;
  requiredSubjects?: string[];
  ageLimit?: number;
  otherRequirements?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeritList {
  id: string;
  programId: string;
  batch: string;
  semester: string;
  publishedDate: string;
  totalSeats: number;
  applications: MeritApplication[];
  createdAt: string;
}

export interface MeritApplication {
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  meritScore: number;
  rank: number;
  status: 'selected' | 'waitlisted' | 'rejected';
}

export interface CreateApplicationDTO {
  userId: string;
  programId: string;
  documents?: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
  }>;
}

export interface UpdateApplicationDTO {
  status?: AdmissionApplication['status'];
  eligibilityStatus?: AdmissionApplication['eligibilityStatus'];
  eligibilityScore?: number;
  meritRank?: number;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  remarks?: string;
}

export interface EligibilityCheckDTO {
  applicationId: string;
  programId: string;
  academicHistory: Array<{
    degree: string;
    marks: number;
    cgpa?: number;
    year: number;
  }>;
  testScores?: {
    entryTest?: number;
    interview?: number;
  };
}

export interface MeritListGenerateDTO {
  programId: string;
  batch: string;
  semester: string;
  totalSeats: number;
  selectionCriteria: {
    weightage: {
      academic: number;
      entryTest?: number;
      interview?: number;
      experience?: number;
    };
  };
}

