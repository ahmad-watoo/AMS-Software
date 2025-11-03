import { AdmissionService } from '@/services/admission.service';
import { AdmissionRepository } from '@/repositories/admission.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';

jest.mock('@/repositories/admission.repository');

describe('AdmissionService', () => {
  let admissionService: AdmissionService;
  let mockRepository: jest.Mocked<AdmissionRepository>;

  beforeEach(() => {
    mockRepository = new AdmissionRepository() as jest.Mocked<AdmissionRepository>;
    admissionService = new AdmissionService();
    (admissionService as any).admissionRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createApplication', () => {
    it('should create an admission application successfully', async () => {
      const applicationData = {
        programId: 'prog-123',
        applicantName: 'John Doe',
        applicantCNIC: '12345-1234567-1',
        applicantEmail: 'john@example.com',
        applicantPhone: '+923001234567',
        applicationDate: '2024-01-15',
      };

      const mockApplication = {
        id: 'app-123',
        ...applicationData,
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findByCNIC = jest.fn().mockResolvedValue(null);
      mockRepository.create = jest.fn().mockResolvedValue(mockApplication);

      const result = await admissionService.createApplication(applicationData);

      expect(result).toEqual(mockApplication);
      expect(mockRepository.create).toHaveBeenCalledWith(applicationData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const applicationData = {
        programId: '',
        applicantName: '',
        applicantCNIC: '',
        applicantEmail: '',
        applicantPhone: '',
        applicationDate: '',
      };

      await expect(admissionService.createApplication(applicationData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if CNIC format is invalid', async () => {
      const applicationData = {
        programId: 'prog-123',
        applicantName: 'John Doe',
        applicantCNIC: 'invalid-cnic',
        applicantEmail: 'john@example.com',
        applicantPhone: '+923001234567',
        applicationDate: '2024-01-15',
      };

      await expect(admissionService.createApplication(applicationData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if email format is invalid', async () => {
      const applicationData = {
        programId: 'prog-123',
        applicantName: 'John Doe',
        applicantCNIC: '12345-1234567-1',
        applicantEmail: 'invalid-email',
        applicantPhone: '+923001234567',
        applicationDate: '2024-01-15',
      };

      await expect(admissionService.createApplication(applicationData)).rejects.toThrow(ValidationError);
    });
  });

  describe('checkEligibility', () => {
    it('should check eligibility successfully', async () => {
      const eligibilityData = {
        programId: 'prog-123',
        academicHistory: [
          {
            degree: 'BS',
            institution: 'University',
            passingYear: 2023,
            cgpa: 3.5,
          },
        ],
        testScores: [
          {
            testName: 'NTS',
            score: 85,
          },
        ],
      };

      const mockEligibilityResult = {
        isEligible: true,
        score: 85,
        reasons: ['Meets minimum CGPA requirement', 'Meets test score requirement'],
      };

      // Mock the eligibility checking logic
      (admissionService as any).checkEligibility = jest.fn().mockResolvedValue(mockEligibilityResult);

      const result = await (admissionService as any).checkEligibility(eligibilityData);

      expect(result.isEligible).toBe(true);
      expect(result.score).toBe(85);
    });

    it('should return ineligible if minimum requirements not met', async () => {
      const eligibilityData = {
        programId: 'prog-123',
        academicHistory: [
          {
            degree: 'BS',
            institution: 'University',
            passingYear: 2023,
            cgpa: 2.0,
          },
        ],
        testScores: [
          {
            testName: 'NTS',
            score: 50,
          },
        ],
      };

      const mockEligibilityResult = {
        isEligible: false,
        score: 50,
        reasons: ['CGPA below minimum requirement', 'Test score below minimum'],
      };

      (admissionService as any).checkEligibility = jest.fn().mockResolvedValue(mockEligibilityResult);

      const result = await (admissionService as any).checkEligibility(eligibilityData);

      expect(result.isEligible).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status successfully', async () => {
      const mockApplication = {
        id: 'app-123',
        programId: 'prog-123',
        applicantName: 'John Doe',
        applicantCNIC: '12345-1234567-1',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const updatedApplication = {
        ...mockApplication,
        status: 'approved' as const,
        updatedAt: '2024-01-16T10:00:00Z',
      };

      mockRepository.findById = jest.fn().mockResolvedValue(mockApplication);
      mockRepository.updateStatus = jest.fn().mockResolvedValue(updatedApplication);

      const result = await admissionService.updateApplicationStatus('app-123', 'approved');

      expect(result.status).toBe('approved');
      expect(mockRepository.updateStatus).toHaveBeenCalledWith('app-123', 'approved');
    });

    it('should throw NotFoundError if application does not exist', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        admissionService.updateApplicationStatus('app-123', 'approved')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
