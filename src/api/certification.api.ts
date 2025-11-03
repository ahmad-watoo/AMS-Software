import apiClient from './client';

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
  verificationCode: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  metadata?: Record<string, any>;
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

const certificationAPI = {
  // Certificate Requests
  getAllCertificateRequests: async (params?: {
    studentId?: string;
    certificateType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/certification/requests', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificate requests');
    }
    return response.data.data;
  },

  getCertificateRequestById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CertificateRequest>>(`/certification/requests/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificate request');
    }
    return response.data.data;
  },

  createCertificateRequest: async (data: CreateCertificateRequestDTO) => {
    const response = await apiClient.post<ApiResponse<CertificateRequest>>('/certification/requests', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create certificate request');
    }
    return response.data.data;
  },

  approveCertificateRequest: async (id: string, data: ApproveCertificateRequestDTO) => {
    const response = await apiClient.post<ApiResponse<CertificateRequest>>(
      `/certification/requests/${id}/approve`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve/reject certificate request');
    }
    return response.data.data;
  },

  markFeeAsPaid: async (id: string) => {
    const response = await apiClient.post<ApiResponse<CertificateRequest>>(`/certification/requests/${id}/mark-fee-paid`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to mark fee as paid');
    }
    return response.data.data;
  },

  // Certificates
  getAllCertificates: async (params?: {
    studentId?: string;
    certificateType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/certification/certificates', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificates');
    }
    return response.data.data;
  },

  getCertificateById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Certificate>>(`/certification/certificates/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificate');
    }
    return response.data.data;
  },

  processCertificate: async (data: ProcessCertificateDTO) => {
    const response = await apiClient.post<ApiResponse<Certificate>>('/certification/certificates/process', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to process certificate');
    }
    return response.data.data;
  },

  markCertificateAsReady: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Certificate>>(`/certification/certificates/${id}/mark-ready`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to mark certificate as ready');
    }
    return response.data.data;
  },

  // Verification (Public)
  verifyCertificate: async (data: VerifyCertificateDTO) => {
    const response = await apiClient.post<ApiResponse<CertificateVerificationResult>>('/certification/verify', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to verify certificate');
    }
    return response.data.data;
  },
};

export default certificationAPI;

