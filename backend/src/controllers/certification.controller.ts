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

