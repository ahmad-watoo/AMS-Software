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

      // Generate certificate number (format: CERT-YYYY-MMDD-NNNNN)
      const certificateNumber = this.generateCertificateNumber(certificateData.issueDate);

      // Create certificate
      const certificate = await this.certificationRepository.createCertificate(certificateData, verificationCode);

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
   * Generate unique verification code (format: VER-XXXXXXXX where X is alphanumeric)
   */
  private generateVerificationCode(): string {
    const randomBytes = crypto.randomBytes(8);
    const code = randomBytes.toString('hex').toUpperCase();
    return `VER-${code}`;
  }

  /**
   * Generate certificate number (format: CERT-YYYY-MMDD-NNNNN)
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

