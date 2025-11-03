import { CertificationService } from '@/services/certification.service';
import { CertificationRepository } from '@/repositories/certification.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';

// Mock the repository
jest.mock('@/repositories/certification.repository');

describe('CertificationService', () => {
  let certificationService: CertificationService;
  let mockRepository: jest.Mocked<CertificationRepository>;

  beforeEach(() => {
    mockRepository = new CertificationRepository() as jest.Mocked<CertificationRepository>;
    certificationService = new CertificationService();
    (certificationService as any).certificationRepository = mockRepository;
  });

  describe('createCertificateRequest', () => {
    it('should create a certificate request successfully', async () => {
      const requestData = {
        studentId: 'student-123',
        certificateType: 'degree' as const,
        purpose: 'Job application',
        deliveryMethod: 'pickup' as const,
      };

      const mockRequest = {
        id: 'req-123',
        ...requestData,
        requestedDate: '2024-01-15',
        status: 'pending' as const,
        feePaid: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.createCertificateRequest = jest.fn().mockResolvedValue(mockRequest);

      const result = await certificationService.createCertificateRequest(requestData);

      expect(result).toEqual(mockRequest);
      expect(mockRepository.createCertificateRequest).toHaveBeenCalledWith(requestData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const requestData = {
        studentId: '',
        certificateType: 'degree' as const,
        purpose: '',
        deliveryMethod: 'pickup' as const,
      };

      await expect(certificationService.createCertificateRequest(requestData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if postal delivery without address', async () => {
      const requestData = {
        studentId: 'student-123',
        certificateType: 'degree' as const,
        purpose: 'Job application',
        deliveryMethod: 'postal' as const,
      };

      await expect(certificationService.createCertificateRequest(requestData)).rejects.toThrow(ValidationError);
    });
  });

  describe('approveCertificateRequest', () => {
    it('should approve a certificate request successfully', async () => {
      const mockRequest = {
        id: 'req-123',
        studentId: 'student-123',
        certificateType: 'degree' as const,
        purpose: 'Job application',
        requestedDate: '2024-01-15',
        status: 'pending' as const,
        feeAmount: 0,
        feePaid: true,
        deliveryMethod: 'pickup' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const approvedRequest = {
        ...mockRequest,
        status: 'approved' as const,
        approvedBy: 'admin-123',
        approvedAt: '2024-01-16T10:00:00Z',
      };

      mockRepository.findCertificateRequestById = jest.fn().mockResolvedValue(mockRequest);
      mockRepository.updateCertificateRequestStatus = jest.fn().mockResolvedValue(approvedRequest);

      const result = await certificationService.approveCertificateRequest(
        'req-123',
        { status: 'approved' },
        'admin-123'
      );

      expect(result.status).toBe('approved');
      expect(mockRepository.updateCertificateRequestStatus).toHaveBeenCalledWith(
        'req-123',
        'approved',
        'admin-123',
        undefined,
        undefined,
        undefined
      );
    });

    it('should throw NotFoundError if request does not exist', async () => {
      mockRepository.findCertificateRequestById = jest.fn().mockResolvedValue(null);

      await expect(
        certificationService.approveCertificateRequest('req-123', { status: 'approved' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if request is not pending', async () => {
      const mockRequest = {
        id: 'req-123',
        studentId: 'student-123',
        certificateType: 'degree' as const,
        purpose: 'Job application',
        requestedDate: '2024-01-15',
        status: 'approved' as const,
        feeAmount: 0,
        feePaid: true,
        deliveryMethod: 'pickup' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findCertificateRequestById = jest.fn().mockResolvedValue(mockRequest);

      await expect(
        certificationService.approveCertificateRequest('req-123', { status: 'rejected' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('processCertificate', () => {
    it('should process a certificate successfully', async () => {
      const mockRequest = {
        id: 'req-123',
        studentId: 'student-123',
        certificateType: 'degree' as const,
        purpose: 'Job application',
        requestedDate: '2024-01-15',
        status: 'approved' as const,
        feeAmount: 0,
        feePaid: true,
        deliveryMethod: 'pickup' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const certificateData = {
        certificateRequestId: 'req-123',
        issueDate: '2024-01-20',
        certificateNumber: 'CERT-2024-0120-12345',
      };

      const mockCertificate = {
        id: 'cert-123',
        certificateRequestId: 'req-123',
        studentId: 'student-123',
        certificateNumber: 'CERT-2024-0120-12345',
        certificateType: 'degree',
        issueDate: '2024-01-20',
        verificationCode: 'VER-ABCD1234',
        isVerified: false,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      };

      mockRepository.findCertificateRequestById = jest.fn().mockResolvedValue(mockRequest);
      mockRepository.createCertificate = jest.fn().mockResolvedValue(mockCertificate);
      mockRepository.updateCertificateRequestStatus = jest.fn().mockResolvedValue(mockRequest);
      mockRepository.findCertificateById = jest.fn().mockResolvedValue(mockCertificate);

      const result = await certificationService.processCertificate(certificateData, 'admin-123');

      expect(result).toBeDefined();
      expect(mockRepository.createCertificate).toHaveBeenCalled();
      expect(mockRepository.updateCertificateRequestStatus).toHaveBeenCalledWith(
        'req-123',
        'processing',
        undefined,
        'admin-123'
      );
    });

    it('should throw ValidationError if request is not approved', async () => {
      const mockRequest = {
        id: 'req-123',
        studentId: 'student-123',
        certificateType: 'degree' as const,
        purpose: 'Job application',
        requestedDate: '2024-01-15',
        status: 'pending' as const,
        feeAmount: 0,
        feePaid: true,
        deliveryMethod: 'pickup' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findCertificateRequestById = jest.fn().mockResolvedValue(mockRequest);

      const certificateData = {
        certificateRequestId: 'req-123',
        issueDate: '2024-01-20',
      };

      await expect(certificationService.processCertificate(certificateData)).rejects.toThrow(ValidationError);
    });
  });

  describe('verifyCertificate', () => {
    it('should verify a certificate by verification code', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificateRequestId: 'req-123',
        studentId: 'student-123',
        certificateNumber: 'CERT-2024-0120-12345',
        certificateType: 'degree',
        issueDate: '2024-01-20',
        verificationCode: 'VER-ABCD1234',
        isVerified: false,
        metadata: { studentName: 'John Doe' },
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      };

      mockRepository.findCertificateByVerificationCode = jest.fn().mockResolvedValue(mockCertificate);
      mockRepository.updateCertificate = jest.fn().mockResolvedValue({
        ...mockCertificate,
        isVerified: true,
        verifiedAt: '2024-01-21T10:00:00Z',
      });

      const result = await certificationService.verifyCertificate({ verificationCode: 'VER-ABCD1234' });

      expect(result.isValid).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.message).toContain('valid');
    });

    it('should return invalid result if certificate not found', async () => {
      mockRepository.findCertificateByVerificationCode = jest.fn().mockResolvedValue(null);

      const result = await certificationService.verifyCertificate({ verificationCode: 'VER-INVALID' });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should return invalid result if no verification code or certificate number provided', async () => {
      const result = await certificationService.verifyCertificate({});

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate a unique verification code', () => {
      const service = certificationService as any;
      const code1 = service.generateVerificationCode();
      const code2 = service.generateVerificationCode();

      expect(code1).toMatch(/^VER-[A-Z0-9]{16}$/);
      expect(code2).toMatch(/^VER-[A-Z0-9]{16}$/);
      expect(code1).not.toBe(code2);
    });
  });

  describe('generateCertificateNumber', () => {
    it('should generate certificate number in correct format', () => {
      const service = certificationService as any;
      const number = service.generateCertificateNumber('2024-01-20');

      expect(number).toMatch(/^CERT-2024-0120-\d{5}$/);
    });
  });
});

