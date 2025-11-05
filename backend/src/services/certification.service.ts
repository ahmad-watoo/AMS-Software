/**
 * Certification Service
 * 
 * Service for managing certificate requests, certificates, and verification.
 * Handles the complete certificate lifecycle from request to delivery:
 * - Certificate request management (create, approve, reject)
 * - Certificate processing and generation
 * - Certificate verification (public endpoint)
 * - Certificate template management
 * 
 * Features:
 * - Unique verification code generation for certificate authenticity
 * - Certificate number generation with date-based format
 * - Fee payment tracking
 * - Delivery method management (pickup, email, postal)
 * - QR code and PDF URL management
 * 
 * @module services/certification.service
 */

import { CertificationRepository } from '@/repositories/certification.repository';
import {
  CertificateRequest,
  Certificate,
  CertificateTemplate,
  CreateCertificateRequestDTO,
  ApproveCertificateRequestDTO,
  ProcessCertificateDTO,
  VerifyCertificateDTO,
  CertificateVerificationResult,
} from '@/models/Certification.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';
import crypto from 'crypto';

export class CertificationService {
  private certificationRepository: CertificationRepository;

  constructor() {
    this.certificationRepository = new CertificationRepository();
  }

  // ==================== Certificate Requests ====================

  /**
   * Get all certificate requests with pagination and filters
   * 
   * Retrieves certificate requests with optional filtering by student, type, and status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of requests to return
   * @param {number} [offset=0] - Number of requests to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.certificateType] - Filter by certificate type
   * @param {string} [filters.status] - Filter by request status
   * @returns {Promise<{requests: CertificateRequest[], total: number}>} Requests and total count
   * 
   * @example
   * const { requests, total } = await certificationService.getAllCertificateRequests(20, 0, {
   *   studentId: 'student123',
   *   status: 'pending'
   * });
   */
  async getAllCertificateRequests(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      certificateType?: string;
      status?: string;
    }
  ): Promise<{
    requests: CertificateRequest[];
    total: number;
  }> {
    try {
      const allRequests = await this.certificationRepository.findAllCertificateRequests(limit * 10, 0, filters);
      const paginatedRequests = allRequests.slice(offset, offset + limit);

      return {
        requests: paginatedRequests,
        total: allRequests.length,
      };
    } catch (error) {
      logger.error('Error getting all certificate requests:', error);
      throw new Error('Failed to fetch certificate requests');
    }
  }

  /**
   * Get certificate request by ID
   * 
   * Retrieves a specific certificate request by its ID.
   * 
   * @param {string} id - Certificate request ID
   * @returns {Promise<CertificateRequest>} Certificate request object
   * @throws {NotFoundError} If request not found
   */
  async getCertificateRequestById(id: string): Promise<CertificateRequest> {
    try {
      const request = await this.certificationRepository.findCertificateRequestById(id);
      if (!request) {
        throw new NotFoundError('Certificate request');
      }
      return request;
    } catch (error) {
      logger.error('Error getting certificate request by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch certificate request');
    }
  }

  /**
   * Create a certificate request
   * 
   * Creates a new certificate request with validation.
   * Validates required fields and delivery method requirements.
   * 
   * @param {CreateCertificateRequestDTO} requestData - Certificate request creation data
   * @returns {Promise<CertificateRequest>} Created certificate request
   * @throws {ValidationError} If required fields are missing or delivery method is invalid
   * 
   * @example
   * const request = await certificationService.createCertificateRequest({
   *   studentId: 'student123',
   *   certificateType: 'degree',
   *   purpose: 'Job application',
   *   deliveryMethod: 'postal',
   *   deliveryAddress: '123 Main St, City, Country'
   * });
   */
  async createCertificateRequest(requestData: CreateCertificateRequestDTO): Promise<CertificateRequest> {
    try {
      if (!requestData.studentId || !requestData.certificateType || !requestData.purpose || !requestData.deliveryMethod) {
        throw new ValidationError('Student ID, certificate type, purpose, and delivery method are required');
      }

      // Validate delivery method requirements
      if (requestData.deliveryMethod === 'postal' && !requestData.deliveryAddress) {
        throw new ValidationError('Delivery address is required for postal delivery');
      }

      return await this.certificationRepository.createCertificateRequest(requestData);
    } catch (error) {
      logger.error('Error creating certificate request:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create certificate request');
    }
  }

  /**
   * Approve or reject a certificate request
   * 
   * Approves or rejects a pending certificate request.
   * Only pending requests can be approved/rejected.
   * Fee must be paid before approval (if fee is required).
   * 
   * @param {string} id - Certificate request ID
   * @param {ApproveCertificateRequestDTO} approveData - Approval/rejection data
   * @param {string} [approvedBy] - ID of user approving/rejecting the request
   * @returns {Promise<CertificateRequest>} Updated certificate request
   * @throws {NotFoundError} If request not found
   * @throws {ValidationError} If request is not pending or fee is not paid
   * 
   * @example
   * const request = await certificationService.approveCertificateRequest('request123', {
   *   status: 'approved',
   *   remarks: 'Approved for processing'
   * }, 'admin456');
   */
  async approveCertificateRequest(id: string, approveData: ApproveCertificateRequestDTO, approvedBy?: string): Promise<CertificateRequest> {
    try {
      const request = await this.certificationRepository.findCertificateRequestById(id);
      if (!request) {
        throw new NotFoundError('Certificate request');
      }

      if (request.status !== 'pending') {
        throw new ValidationError('Only pending requests can be approved or rejected');
      }

      // Check if fee is paid (if fee is required)
      if (request.feeAmount && request.feeAmount > 0 && !request.feePaid) {
        throw new ValidationError('Fee must be paid before approval');
      }

      if (approveData.status === 'approved') {
        return await this.certificationRepository.updateCertificateRequestStatus(
          id,
          'approved',
          approvedBy,
          undefined,
          undefined,
          approveData.remarks
        );
      } else {
        return await this.certificationRepository.updateCertificateRequestStatus(
          id,
          'rejected',
          approvedBy,
          undefined,
          approveData.rejectionReason,
          approveData.remarks
        );
      }
    } catch (error) {
      logger.error('Error approving certificate request:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to approve certificate request');
    }
  }

  /**
   * Mark certificate request fee as paid
   * 
   * Marks the fee for a certificate request as paid.
   * Cannot mark fee as paid if already marked.
   * 
   * @param {string} id - Certificate request ID
   * @returns {Promise<CertificateRequest>} Updated certificate request
   * @throws {NotFoundError} If request not found
   * @throws {ValidationError} If fee is already marked as paid
   */
  async markFeeAsPaid(id: string): Promise<CertificateRequest> {
    try {
      const request = await this.certificationRepository.findCertificateRequestById(id);
      if (!request) {
        throw new NotFoundError('Certificate request');
      }

      if (request.feePaid) {
        throw new ValidationError('Fee is already marked as paid');
      }

      const paymentDate = new Date().toISOString().split('T')[0];
      return await this.certificationRepository.markFeeAsPaid(id, paymentDate);
    } catch (error) {
      logger.error('Error marking fee as paid:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to mark fee as paid');
    }
  }

  // ==================== Certificates ====================

  /**
   * Get all certificates with pagination and filters
   * 
   * Retrieves certificates with optional filtering by student, type, and verification status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of certificates to return
   * @param {number} [offset=0] - Number of certificates to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.certificateType] - Filter by certificate type
   * @param {boolean} [filters.isVerified] - Filter by verification status
   * @returns {Promise<{certificates: Certificate[], total: number}>} Certificates and total count
   * 
   * @example
   * const { certificates, total } = await certificationService.getAllCertificates(20, 0, {
   *   studentId: 'student123',
   *   certificateType: 'degree'
   * });
   */
  async getAllCertificates(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      certificateType?: string;
      isVerified?: boolean;
    }
  ): Promise<{
    certificates: Certificate[];
    total: number;
  }> {
    try {
      const allCertificates = await this.certificationRepository.findAllCertificates(limit * 10, 0, filters);
      const paginatedCertificates = allCertificates.slice(offset, offset + limit);

      return {
        certificates: paginatedCertificates,
        total: allCertificates.length,
      };
    } catch (error) {
      logger.error('Error getting all certificates:', error);
      throw new Error('Failed to fetch certificates');
    }
  }

  /**
   * Get certificate by ID
   * 
   * Retrieves a specific certificate by its ID.
   * 
   * @param {string} id - Certificate ID
   * @returns {Promise<Certificate>} Certificate object
   * @throws {NotFoundError} If certificate not found
   */
  async getCertificateById(id: string): Promise<Certificate> {
    try {
      const certificate = await this.certificationRepository.findCertificateById(id);
      if (!certificate) {
        throw new NotFoundError('Certificate');
      }
      return certificate;
    } catch (error) {
      logger.error('Error getting certificate by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch certificate');
    }
  }

  /**
   * Process a certificate (generate from approved request)
   * 
   * Processes an approved certificate request and generates a certificate.
   * Generates unique verification code and certificate number.
   * Updates request status to 'processing'.
   * 
   * @param {ProcessCertificateDTO} certificateData - Certificate processing data
   * @param {string} [processedBy] - ID of user processing the certificate
   * @returns {Promise<Certificate>} Created certificate
   * @throws {NotFoundError} If request not found
   * @throws {ValidationError} If request is not approved
   * 
   * @example
   * const certificate = await certificationService.processCertificate({
   *   certificateRequestId: 'request123',
   *   certificateNumber: 'CERT-2024-0115-12345',
   *   issueDate: '2024-01-15',
   *   metadata: { studentName: 'John Doe', degree: 'BS Computer Science' }
   * }, 'admin456');
   */
  async processCertificate(certificateData: ProcessCertificateDTO, processedBy?: string): Promise<Certificate> {
    try {
      const request = await this.certificationRepository.findCertificateRequestById(certificateData.certificateRequestId);
      if (!request) {
        throw new NotFoundError('Certificate request');
      }

      if (request.status !== 'approved') {
        throw new ValidationError('Only approved requests can be processed');
      }

      // Generate unique verification code
      const verificationCode = this.generateVerificationCode();

      // Generate certificate number if not provided (format: CERT-YYYY-MMDD-NNNNN)
      const certificateNumber = certificateData.certificateNumber || this.generateCertificateNumber(certificateData.issueDate);

      // Create certificate with generated verification code and certificate number
      const certificate = await this.certificationRepository.createCertificate({
        ...certificateData,
        certificateNumber,
      }, verificationCode);

      // Update request status to processing
      await this.certificationRepository.updateCertificateRequestStatus(
        certificateData.certificateRequestId,
        'processing',
        undefined,
        processedBy
      );

      return certificate;
    } catch (error) {
      logger.error('Error processing certificate:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to process certificate');
    }
  }

  /**
   * Mark certificate as ready for delivery
   * 
   * Marks a certificate as ready for delivery.
   * Updates the associated certificate request status to 'ready'.
   * 
   * @param {string} id - Certificate ID
   * @returns {Promise<Certificate>} Certificate object
   * @throws {NotFoundError} If certificate not found
   */
  async markCertificateAsReady(id: string): Promise<Certificate> {
    try {
      const certificate = await this.certificationRepository.findCertificateById(id);
      if (!certificate) {
        throw new NotFoundError('Certificate');
      }

      // Update certificate request status to ready
      await this.certificationRepository.updateCertificateRequestStatus(
        certificate.certificateRequestId,
        'ready'
      );

      return certificate;
    } catch (error) {
      logger.error('Error marking certificate as ready:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to mark certificate as ready');
    }
  }

  /**
   * Update certificate QR code and PDF URLs
   * 
   * Updates the QR code URL and/or PDF URL for a certificate.
   * Used after generating QR codes or PDFs for the certificate.
   * 
   * @param {string} id - Certificate ID
   * @param {string} [qrCodeUrl] - QR code URL
   * @param {string} [pdfUrl] - PDF URL
   * @returns {Promise<Certificate>} Updated certificate
   * @throws {NotFoundError} If certificate not found
   * 
   * @example
   * const certificate = await certificationService.updateCertificateUrls('cert123', {
   *   qrCodeUrl: 'https://example.com/qr/cert123.png',
   *   pdfUrl: 'https://example.com/pdf/cert123.pdf'
   * });
   */
  async updateCertificateUrls(id: string, qrCodeUrl?: string, pdfUrl?: string): Promise<Certificate> {
    try {
      const certificate = await this.certificationRepository.findCertificateById(id);
      if (!certificate) {
        throw new NotFoundError('Certificate');
      }

      return await this.certificationRepository.updateCertificate(id, {
        qrCodeUrl,
        pdfUrl,
      });
    } catch (error) {
      logger.error('Error updating certificate URLs:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update certificate URLs');
    }
  }

  // ==================== Certificate Verification ====================

  /**
   * Verify a certificate (public endpoint)
   * 
   * Verifies a certificate using verification code or certificate number.
   * This is a public endpoint that doesn't require authentication.
   * Marks certificate as verified if not already verified.
   * 
   * @param {VerifyCertificateDTO} verifyData - Verification data (verification code or certificate number)
   * @returns {Promise<CertificateVerificationResult>} Verification result with certificate details if valid
   * 
   * @example
   * const result = await certificationService.verifyCertificate({
   *   verificationCode: 'VER-ABC123DEF456'
   * });
   * if (result.isValid) {
   *   console.log(result.studentName); // "John Doe"
   *   console.log(result.certificate.issueDate); // "2024-01-15"
   * }
   */
  async verifyCertificate(verifyData: VerifyCertificateDTO): Promise<CertificateVerificationResult> {
    try {
      let certificate: Certificate | null = null;

      if (verifyData.verificationCode) {
        certificate = await this.certificationRepository.findCertificateByVerificationCode(verifyData.verificationCode);
      } else if (verifyData.certificateNumber) {
        certificate = await this.certificationRepository.findCertificateByNumber(verifyData.certificateNumber);
      } else {
        return {
          isValid: false,
          message: 'Verification code or certificate number is required',
        };
      }

      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found. Please verify the verification code or certificate number.',
        };
      }

      // Mark as verified if not already verified
      if (!certificate.isVerified) {
        await this.certificationRepository.updateCertificate(certificate.id, {
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        });
        certificate.isVerified = true;
        certificate.verifiedAt = new Date().toISOString();
      }

      return {
        isValid: true,
        certificate,
        studentName: certificate.metadata?.studentName || 'Unknown',
        issueDate: certificate.issueDate,
        certificateType: certificate.certificateType,
        message: 'Certificate is valid and authentic.',
      };
    } catch (error) {
      logger.error('Error verifying certificate:', error);
      return {
        isValid: false,
        message: 'Error verifying certificate. Please try again later.',
      };
    }
  }

  // ==================== Certificate Templates ====================

  /**
   * Get all certificate templates with pagination and filters
   * 
   * Retrieves certificate templates with optional filtering by type and active status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of templates to return
   * @param {number} [offset=0] - Number of templates to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.certificateType] - Filter by certificate type
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<{templates: CertificateTemplate[], total: number}>} Templates and total count
   * 
   * @example
   * const { templates, total } = await certificationService.getAllCertificateTemplates(20, 0, {
   *   certificateType: 'degree',
   *   isActive: true
   * });
   */
  async getAllCertificateTemplates(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      certificateType?: string;
      isActive?: boolean;
    }
  ): Promise<{
    templates: CertificateTemplate[];
    total: number;
  }> {
    try {
      const allTemplates = await this.certificationRepository.findAllCertificateTemplates(limit * 10, 0, filters);
      const paginatedTemplates = allTemplates.slice(offset, offset + limit);

      return {
        templates: paginatedTemplates,
        total: allTemplates.length,
      };
    } catch (error) {
      logger.error('Error getting all certificate templates:', error);
      throw new Error('Failed to fetch certificate templates');
    }
  }

  /**
   * Get active certificate template for a certificate type
   * 
   * Retrieves the currently active certificate template for a specific certificate type.
   * 
   * @param {string} certificateType - Certificate type
   * @returns {Promise<CertificateTemplate>} Active certificate template
   * @throws {NotFoundError} If active template not found
   */
  async getActiveCertificateTemplate(certificateType: string): Promise<CertificateTemplate> {
    try {
      const template = await this.certificationRepository.findActiveCertificateTemplate(certificateType);
      if (!template) {
        throw new NotFoundError('Active certificate template');
      }
      return template;
    } catch (error) {
      logger.error('Error getting active certificate template:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch certificate template');
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Generate unique verification code
   * 
   * Generates a cryptographically secure unique verification code.
   * Format: VER-XXXXXXXX where X is hexadecimal (uppercase).
   * 
   * @private
   * @returns {string} Unique verification code
   * 
   * @example
   * const code = this.generateVerificationCode();
   * console.log(code); // "VER-ABC123DEF456"
   */
  private generateVerificationCode(): string {
    const randomBytes = crypto.randomBytes(8);
    const code = randomBytes.toString('hex').toUpperCase();
    return `VER-${code}`;
  }

  /**
   * Generate certificate number
   * 
   * Generates a unique certificate number based on issue date.
   * Format: CERT-YYYY-MMDD-NNNNN where NNNNN is a random 5-digit number.
   * 
   * @private
   * @param {string} issueDate - Certificate issue date (YYYY-MM-DD)
   * @returns {string} Unique certificate number
   * 
   * @example
   * const number = this.generateCertificateNumber('2024-01-15');
   * console.log(number); // "CERT-2024-0115-12345"
   */
  private generateCertificateNumber(issueDate: string): string {
    const date = new Date(issueDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `CERT-${year}-${month}${day}-${random}`;
  }
}
