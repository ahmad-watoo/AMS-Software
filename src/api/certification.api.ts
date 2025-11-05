/**
 * Certification Management API Client
 * 
 * Frontend API client for certification management endpoints.
 * Provides typed functions for all certification operations including:
 * - Certificate request management (create, approve, fee payment)
 * - Certificate processing and generation
 * - Certificate verification (public endpoint)
 * - Certificate template management
 * 
 * @module api/certification.api
 */

import apiClient from './client';

/**
 * Certificate Request Interface
 * 
 * Represents a certificate request submitted by a student.
 * 
 * @interface CertificateRequest
 */
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

/**
 * Certificate Interface
 * 
 * Represents an issued certificate.
 * 
 * @interface Certificate
 */
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

/**
 * Certificate Template Interface
 * 
 * Represents a certificate template used for generating certificates.
 * 
 * @interface CertificateTemplate
 */
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

/**
 * Create Certificate Request Data Transfer Object
 * 
 * @interface CreateCertificateRequestDTO
 */
export interface CreateCertificateRequestDTO {
  studentId: string;
  certificateType: 'degree' | 'transcript' | 'character' | 'bonafide' | 'course_completion' | 'attendance' | 'other';
  purpose: string;
  feeAmount?: number;
  deliveryMethod: 'pickup' | 'email' | 'postal';
  deliveryAddress?: string;
  remarks?: string;
}

/**
 * Approve Certificate Request Data Transfer Object
 * 
 * @interface ApproveCertificateRequestDTO
 */
export interface ApproveCertificateRequestDTO {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  remarks?: string;
}

/**
 * Process Certificate Data Transfer Object
 * 
 * @interface ProcessCertificateDTO
 */
export interface ProcessCertificateDTO {
  certificateRequestId: string;
  certificateNumber?: string;
  issueDate: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

/**
 * Verify Certificate Data Transfer Object
 * 
 * @interface VerifyCertificateDTO
 */
export interface VerifyCertificateDTO {
  verificationCode?: string;
  certificateNumber?: string;
}

/**
 * Certificate Verification Result Interface
 * 
 * Represents the result of certificate verification.
 * 
 * @interface CertificateVerificationResult
 */
export interface CertificateVerificationResult {
  isValid: boolean;
  certificate?: Certificate;
  studentName?: string;
  issueDate?: string;
  certificateType?: string;
  message: string;
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

/**
 * Certification Management API Client
 * 
 * Provides methods for all certification management operations.
 */
const certificationAPI = {
  // ==================== Certificate Requests ====================

  /**
   * Get all certificate requests with pagination and filters
   * 
   * Retrieves certificate requests with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.certificateType] - Filter by certificate type
   * @param {string} [params.status] - Filter by request status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Certificate requests array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await certificationAPI.getAllCertificateRequests({
   *   studentId: 'student123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
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

  /**
   * Get certificate request by ID
   * 
   * Retrieves a specific certificate request by its ID.
   * 
   * @param {string} id - Certificate request ID
   * @returns {Promise<CertificateRequest>} Certificate request object
   * @throws {Error} If request fails or request not found
   * 
   * @example
   * const request = await certificationAPI.getCertificateRequestById('request123');
   * console.log(request.status); // "pending"
   */
  getCertificateRequestById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CertificateRequest>>(`/certification/requests/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificate request');
    }
    return response.data.data;
  },

  /**
   * Create a certificate request
   * 
   * Creates a new certificate request.
   * 
   * @param {CreateCertificateRequestDTO} data - Certificate request creation data
   * @returns {Promise<CertificateRequest>} Created certificate request
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const request = await certificationAPI.createCertificateRequest({
   *   studentId: 'student123',
   *   certificateType: 'degree',
   *   purpose: 'Job application',
   *   deliveryMethod: 'postal',
   *   deliveryAddress: '123 Main St, City, Country'
   * });
   */
  createCertificateRequest: async (data: CreateCertificateRequestDTO) => {
    const response = await apiClient.post<ApiResponse<CertificateRequest>>('/certification/requests', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create certificate request');
    }
    return response.data.data;
  },

  /**
   * Approve or reject a certificate request
   * 
   * Approves or rejects a certificate request.
   * Requires certification.approve permission.
   * 
   * @param {string} id - Certificate request ID
   * @param {ApproveCertificateRequestDTO} data - Approval/rejection data
   * @returns {Promise<CertificateRequest>} Updated certificate request
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const request = await certificationAPI.approveCertificateRequest('request123', {
   *   status: 'approved',
   *   remarks: 'Approved for processing'
   * });
   */
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

  /**
   * Mark certificate request fee as paid
   * 
   * Marks the fee for a certificate request as paid.
   * Requires certification.update permission.
   * 
   * @param {string} id - Certificate request ID
   * @returns {Promise<CertificateRequest>} Updated certificate request
   * @throws {Error} If request fails
   * 
   * @example
   * const request = await certificationAPI.markFeeAsPaid('request123');
   */
  markFeeAsPaid: async (id: string) => {
    const response = await apiClient.post<ApiResponse<CertificateRequest>>(`/certification/requests/${id}/mark-fee-paid`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to mark fee as paid');
    }
    return response.data.data;
  },

  // ==================== Certificates ====================

  /**
   * Get all certificates with pagination and filters
   * 
   * Retrieves certificates with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.certificateType] - Filter by certificate type
   * @param {boolean} [params.isVerified] - Filter by verification status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Certificates array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await certificationAPI.getAllCertificates({
   *   studentId: 'student123',
   *   certificateType: 'degree',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllCertificates: async (params?: {
    studentId?: string;
    certificateType?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/certification/certificates', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificates');
    }
    return response.data.data;
  },

  /**
   * Get certificate by ID
   * 
   * Retrieves a specific certificate by its ID.
   * 
   * @param {string} id - Certificate ID
   * @returns {Promise<Certificate>} Certificate object
   * @throws {Error} If request fails or certificate not found
   * 
   * @example
   * const certificate = await certificationAPI.getCertificateById('cert123');
   * console.log(certificate.certificateNumber); // "CERT-2024-0115-12345"
   */
  getCertificateById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Certificate>>(`/certification/certificates/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch certificate');
    }
    return response.data.data;
  },

  /**
   * Process a certificate (generate from approved request)
   * 
   * Processes an approved certificate request and generates a certificate.
   * Requires certification.create permission.
   * 
   * @param {ProcessCertificateDTO} data - Certificate processing data
   * @returns {Promise<Certificate>} Created certificate
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const certificate = await certificationAPI.processCertificate({
   *   certificateRequestId: 'request123',
   *   certificateNumber: 'CERT-2024-0115-12345',
   *   issueDate: '2024-01-15',
   *   metadata: { studentName: 'John Doe', degree: 'BS Computer Science' }
   * });
   */
  processCertificate: async (data: ProcessCertificateDTO) => {
    const response = await apiClient.post<ApiResponse<Certificate>>('/certification/certificates/process', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to process certificate');
    }
    return response.data.data;
  },

  /**
   * Mark certificate as ready for delivery
   * 
   * Marks a certificate as ready for delivery.
   * Requires certification.update permission.
   * 
   * @param {string} id - Certificate ID
   * @returns {Promise<Certificate>} Certificate object
   * @throws {Error} If request fails
   * 
   * @example
   * const certificate = await certificationAPI.markCertificateAsReady('cert123');
   */
  markCertificateAsReady: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Certificate>>(`/certification/certificates/${id}/mark-ready`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to mark certificate as ready');
    }
    return response.data.data;
  },

  /**
   * Update certificate QR code and PDF URLs
   * 
   * Updates the QR code and/or PDF URLs for a certificate.
   * Requires certification.update permission.
   * 
   * @param {string} id - Certificate ID
   * @param {Object} data - URL data
   * @param {string} [data.qrCodeUrl] - QR code URL
   * @param {string} [data.pdfUrl] - PDF URL
   * @returns {Promise<Certificate>} Updated certificate
   * @throws {Error} If request fails
   * 
   * @example
   * const certificate = await certificationAPI.updateCertificateUrls('cert123', {
   *   qrCodeUrl: 'https://example.com/qr/cert123.png',
   *   pdfUrl: 'https://example.com/pdf/cert123.pdf'
   * });
   */
  updateCertificateUrls: async (id: string, data: { qrCodeUrl?: string; pdfUrl?: string }) => {
    const response = await apiClient.put<ApiResponse<Certificate>>(`/certification/certificates/${id}/urls`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update certificate URLs');
    }
    return response.data.data;
  },

  // ==================== Verification (Public) ====================

  /**
   * Verify a certificate (public endpoint)
   * 
   * Verifies a certificate using verification code or certificate number.
   * This is a public endpoint that doesn't require authentication.
   * 
   * @param {VerifyCertificateDTO} data - Verification data
   * @returns {Promise<CertificateVerificationResult>} Verification result
   * @throws {Error} If request fails
   * 
   * @example
   * const result = await certificationAPI.verifyCertificate({
   *   verificationCode: 'VER-ABC123DEF456'
   * });
   * if (result.isValid) {
   *   console.log(result.studentName); // "John Doe"
   *   console.log(result.certificate.issueDate); // "2024-01-15"
   * }
   */
  verifyCertificate: async (data: VerifyCertificateDTO) => {
    const response = await apiClient.post<ApiResponse<CertificateVerificationResult>>('/certification/verify', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to verify certificate');
    }
    return response.data.data;
  },
};

export default certificationAPI;
