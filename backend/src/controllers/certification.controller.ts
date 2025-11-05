/**
 * Certification Controller
 * 
 * Handles HTTP requests for certification endpoints.
 * Manages certificate requests, certificates, verification, and templates.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/certification.controller
 */

import { Request, Response, NextFunction } from 'express';
import { CertificationService } from '@/services/certification.service';
import {
  CreateCertificateRequestDTO,
  ApproveCertificateRequestDTO,
  ProcessCertificateDTO,
  VerifyCertificateDTO,
} from '@/models/Certification.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class CertificationController {
  private certificationService: CertificationService;

  constructor() {
    this.certificationService = new CertificationService();
  }

  // ==================== Certificate Requests ====================

  /**
   * Get All Certificate Requests Endpoint Handler
   * 
   * Retrieves all certificate requests with pagination and optional filters.
   * 
   * @route GET /api/v1/certification/requests
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [certificateType] - Filter by certificate type
   * @query {string} [status] - Filter by request status
   * @returns {Object} Certificate requests array and pagination info
   * 
   * @example
   * GET /api/v1/certification/requests?page=1&limit=20&studentId=student123&status=pending
   */
  getAllCertificateRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        studentId: req.query.studentId as string,
        certificateType: req.query.certificateType as string,
        status: req.query.status as string,
      };

      const result = await this.certificationService.getAllCertificateRequests(limit, offset, filters);

      sendSuccess(res, {
        requests: result.requests,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all certificate requests error:', error);
      next(error);
    }
  };

  /**
   * Get Certificate Request By ID Endpoint Handler
   * 
   * Retrieves a specific certificate request by ID.
   * 
   * @route GET /api/v1/certification/requests/:id
   * @access Private
   * @param {string} id - Certificate request ID
   * @returns {CertificateRequest} Certificate request object
   */
  getCertificateRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this.certificationService.getCertificateRequestById(id);
      sendSuccess(res, request);
    } catch (error) {
      logger.error('Get certificate request by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Certificate Request Endpoint Handler
   * 
   * Creates a new certificate request.
   * 
   * @route POST /api/v1/certification/requests
   * @access Private
   * @body {CreateCertificateRequestDTO} Certificate request creation data
   * @returns {CertificateRequest} Created certificate request
   * 
   * @example
   * POST /api/v1/certification/requests
   * Body: {
   *   studentId: "student123",
   *   certificateType: "degree",
   *   purpose: "Job application",
   *   deliveryMethod: "postal",
   *   deliveryAddress: "123 Main St, City, Country"
   * }
   */
  createCertificateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestData: CreateCertificateRequestDTO = {
        studentId: req.body.studentId,
        certificateType: req.body.certificateType,
        purpose: req.body.purpose,
        feeAmount: req.body.feeAmount,
        deliveryMethod: req.body.deliveryMethod,
        deliveryAddress: req.body.deliveryAddress,
        remarks: req.body.remarks,
      };

      if (!requestData.studentId || !requestData.certificateType || !requestData.purpose || !requestData.deliveryMethod) {
        throw new ValidationError('Student ID, certificate type, purpose, and delivery method are required');
      }

      const request = await this.certificationService.createCertificateRequest(requestData);
      sendSuccess(res, request, 'Certificate request created successfully', 201);
    } catch (error) {
      logger.error('Create certificate request error:', error);
      next(error);
    }
  };

  /**
   * Approve Certificate Request Endpoint Handler
   * 
   * Approves or rejects a certificate request.
   * 
   * @route POST /api/v1/certification/requests/:id/approve
   * @access Private (Requires certification.approve permission)
   * @param {string} id - Certificate request ID
   * @body {ApproveCertificateRequestDTO} Approval/rejection data
   * @returns {CertificateRequest} Updated certificate request
   * 
   * @example
   * POST /api/v1/certification/requests/request123/approve
   * Body: {
   *   status: "approved",
   *   remarks: "Approved for processing"
   * }
   */
  approveCertificateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approveData: ApproveCertificateRequestDTO = {
        status: req.body.status,
        rejectionReason: req.body.rejectionReason,
        remarks: req.body.remarks,
      };

      if (!approveData.status || !['approved', 'rejected'].includes(approveData.status)) {
        throw new ValidationError('Status must be either approved or rejected');
      }

      if (approveData.status === 'rejected' && !approveData.rejectionReason) {
        throw new ValidationError('Rejection reason is required when rejecting a request');
      }

      const user = (req as any).user;
      const request = await this.certificationService.approveCertificateRequest(id, approveData, user?.id);
      sendSuccess(res, request, `Certificate request ${approveData.status} successfully`);
    } catch (error) {
      logger.error('Approve certificate request error:', error);
      next(error);
    }
  };

  /**
   * Mark Fee As Paid Endpoint Handler
   * 
   * Marks the fee for a certificate request as paid.
   * 
   * @route POST /api/v1/certification/requests/:id/mark-fee-paid
   * @access Private (Requires certification.update permission)
   * @param {string} id - Certificate request ID
   * @returns {CertificateRequest} Updated certificate request
   * 
   * @example
   * POST /api/v1/certification/requests/request123/mark-fee-paid
   */
  markFeeAsPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this.certificationService.markFeeAsPaid(id);
      sendSuccess(res, request, 'Fee marked as paid successfully');
    } catch (error) {
      logger.error('Mark fee as paid error:', error);
      next(error);
    }
  };

  // ==================== Certificates ====================

  /**
   * Get All Certificates Endpoint Handler
   * 
   * Retrieves all certificates with pagination and optional filters.
   * 
   * @route GET /api/v1/certification/certificates
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [certificateType] - Filter by certificate type
   * @query {boolean} [isVerified] - Filter by verification status
   * @returns {Object} Certificates array and pagination info
   * 
   * @example
   * GET /api/v1/certification/certificates?page=1&limit=20&studentId=student123&certificateType=degree
   */
  getAllCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        studentId: req.query.studentId as string,
        certificateType: req.query.certificateType as string,
        isVerified: req.query.isVerified ? req.query.isVerified === 'true' : undefined,
      };

      const result = await this.certificationService.getAllCertificates(limit, offset, filters);

      sendSuccess(res, {
        certificates: result.certificates,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all certificates error:', error);
      next(error);
    }
  };

  /**
   * Get Certificate By ID Endpoint Handler
   * 
   * Retrieves a specific certificate by ID.
   * 
   * @route GET /api/v1/certification/certificates/:id
   * @access Private
   * @param {string} id - Certificate ID
   * @returns {Certificate} Certificate object
   */
  getCertificateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const certificate = await this.certificationService.getCertificateById(id);
      sendSuccess(res, certificate);
    } catch (error) {
      logger.error('Get certificate by ID error:', error);
      next(error);
    }
  };

  /**
   * Process Certificate Endpoint Handler
   * 
   * Processes an approved certificate request and generates a certificate.
   * 
   * @route POST /api/v1/certification/certificates/process
   * @access Private (Requires certification.create permission)
   * @body {ProcessCertificateDTO} Certificate processing data
   * @returns {Certificate} Created certificate
   * 
   * @example
   * POST /api/v1/certification/certificates/process
   * Body: {
   *   certificateRequestId: "request123",
   *   certificateNumber: "CERT-2024-0115-12345",
   *   issueDate: "2024-01-15",
   *   metadata: { studentName: "John Doe", degree: "BS Computer Science" }
   * }
   */
  processCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certificateData: ProcessCertificateDTO = {
        certificateRequestId: req.body.certificateRequestId,
        certificateNumber: req.body.certificateNumber,
        issueDate: req.body.issueDate,
        expiryDate: req.body.expiryDate,
        metadata: req.body.metadata,
      };

      if (!certificateData.certificateRequestId || !certificateData.issueDate) {
        throw new ValidationError('Certificate request ID and issue date are required');
      }

      const user = (req as any).user;
      const certificate = await this.certificationService.processCertificate(certificateData, user?.id);
      sendSuccess(res, certificate, 'Certificate processed successfully', 201);
    } catch (error) {
      logger.error('Process certificate error:', error);
      next(error);
    }
  };

  /**
   * Mark Certificate As Ready Endpoint Handler
   * 
   * Marks a certificate as ready for delivery.
   * 
   * @route POST /api/v1/certification/certificates/:id/mark-ready
   * @access Private (Requires certification.update permission)
   * @param {string} id - Certificate ID
   * @returns {Certificate} Certificate object
   * 
   * @example
   * POST /api/v1/certification/certificates/cert123/mark-ready
   */
  markCertificateAsReady = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const certificate = await this.certificationService.markCertificateAsReady(id);
      sendSuccess(res, certificate, 'Certificate marked as ready successfully');
    } catch (error) {
      logger.error('Mark certificate as ready error:', error);
      next(error);
    }
  };

  /**
   * Update Certificate URLs Endpoint Handler
   * 
   * Updates the QR code and/or PDF URLs for a certificate.
   * 
   * @route PUT /api/v1/certification/certificates/:id/urls
   * @access Private (Requires certification.update permission)
   * @param {string} id - Certificate ID
   * @body {Object} URL data
   * @body {string} [body.qrCodeUrl] - QR code URL
   * @body {string} [body.pdfUrl] - PDF URL
   * @returns {Certificate} Updated certificate
   * 
   * @example
   * PUT /api/v1/certification/certificates/cert123/urls
   * Body: {
   *   qrCodeUrl: "https://example.com/qr/cert123.png",
   *   pdfUrl: "https://example.com/pdf/cert123.pdf"
   * }
   */
  updateCertificateUrls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { qrCodeUrl, pdfUrl } = req.body;

      const certificate = await this.certificationService.updateCertificateUrls(id, qrCodeUrl, pdfUrl);
      sendSuccess(res, certificate, 'Certificate URLs updated successfully');
    } catch (error) {
      logger.error('Update certificate URLs error:', error);
      next(error);
    }
  };

  // ==================== Certificate Verification ====================

  /**
   * Verify Certificate Endpoint Handler (Public)
   * 
   * Verifies a certificate using verification code or certificate number.
   * This is a public endpoint that doesn't require authentication.
   * 
   * @route POST /api/v1/certification/verify
   * @route GET /api/v1/certification/verify
   * @access Public
   * @query {string} [verificationCode] - Verification code
   * @query {string} [certificateNumber] - Certificate number
   * @body {VerifyCertificateDTO} Verification data (POST only)
   * @returns {CertificateVerificationResult} Verification result
   * 
   * @example
   * GET /api/v1/certification/verify?verificationCode=VER-ABC123DEF456
   * POST /api/v1/certification/verify
   * Body: { verificationCode: "VER-ABC123DEF456" }
   */
  verifyCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData: VerifyCertificateDTO = {
        verificationCode: req.body.verificationCode || req.query.verificationCode as string,
        certificateNumber: req.body.certificateNumber || req.query.certificateNumber as string,
      };

      if (!verifyData.verificationCode && !verifyData.certificateNumber) {
        throw new ValidationError('Verification code or certificate number is required');
      }

      const result = await this.certificationService.verifyCertificate(verifyData);
      
      if (result.isValid) {
        sendSuccess(res, result, 'Certificate verified successfully');
      } else {
        sendError(res, result.message, 404);
      }
    } catch (error) {
      logger.error('Verify certificate error:', error);
      next(error);
    }
  };

  // ==================== Certificate Templates ====================

  /**
   * Get All Certificate Templates Endpoint Handler
   * 
   * Retrieves all certificate templates with pagination and optional filters.
   * 
   * @route GET /api/v1/certification/templates
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [certificateType] - Filter by certificate type
   * @query {boolean} [isActive] - Filter by active status
   * @returns {Object} Certificate templates array and pagination info
   * 
   * @example
   * GET /api/v1/certification/templates?page=1&limit=20&certificateType=degree&isActive=true
   */
  getAllCertificateTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        certificateType: req.query.certificateType as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      };

      const result = await this.certificationService.getAllCertificateTemplates(limit, offset, filters);

      sendSuccess(res, {
        templates: result.templates,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all certificate templates error:', error);
      next(error);
    }
  };

  /**
   * Get Active Certificate Template Endpoint Handler
   * 
   * Retrieves the active certificate template for a specific certificate type.
   * 
   * @route GET /api/v1/certification/templates/:certificateType/active
   * @access Private
   * @param {string} certificateType - Certificate type
   * @returns {CertificateTemplate} Active certificate template
   * 
   * @example
   * GET /api/v1/certification/templates/degree/active
   */
  getActiveCertificateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { certificateType } = req.params;
      const template = await this.certificationService.getActiveCertificateTemplate(certificateType);
      sendSuccess(res, template);
    } catch (error) {
      logger.error('Get active certificate template error:', error);
      next(error);
    }
  };
}
