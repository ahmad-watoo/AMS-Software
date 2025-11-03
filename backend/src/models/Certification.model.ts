export interface CertificateRequest {
  id: string;
  studentId: string;
  certificateType: 'degree' | 'transcript' | 'character' | 'bonafide' | 'course_completion' | 'attendance' | 'other';
  purpose: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  feeAmount?: number;
  feePaid?: boolean;
  paymentDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  processedBy?: string;
  processedAt?: string;
  deliveryMethod: 'pickup' | 'email' | 'postal';
  deliveryAddress?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateRequestId: string;
  studentId: string;
  certificateNumber: string;
  certificateType: string;
  issueDate: string;
  expiryDate?: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
  verificationCode: string; // Unique code for verification
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  metadata?: Record<string, any>; // Additional certificate data (grades, program, etc.)
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  certificateType: string;
  templateHtml: string;
  templatePdf?: string;
  signatureUrl?: string;
  sealUrl?: string;
  watermarkUrl?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateRequestDTO {
  studentId: string;
  certificateType: 'degree' | 'transcript' | 'character' | 'bonafide' | 'course_completion' | 'attendance' | 'other';
  purpose: string;
  feeAmount?: number;
  deliveryMethod: 'pickup' | 'email' | 'postal';
  deliveryAddress?: string;
  remarks?: string;
}

export interface ApproveCertificateRequestDTO {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  remarks?: string;
}

export interface ProcessCertificateDTO {
  certificateRequestId: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

export interface VerifyCertificateDTO {
  verificationCode: string;
  certificateNumber?: string;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificate?: Certificate;
  studentName?: string;
  issueDate?: string;
  certificateType?: string;
  message: string;
}

