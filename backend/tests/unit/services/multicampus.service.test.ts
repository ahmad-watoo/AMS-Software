import { MultiCampusService } from '@/services/multicampus.service';
import { MultiCampusRepository } from '@/repositories/multicampus.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

jest.mock('@/repositories/multicampus.repository');

describe('MultiCampusService', () => {
  let multiCampusService: MultiCampusService;
  let mockRepository: jest.Mocked<MultiCampusRepository>;

  beforeEach(() => {
    mockRepository = new MultiCampusRepository() as jest.Mocked<MultiCampusRepository>;
    multiCampusService = new MultiCampusService();
    (multiCampusService as any).multiCampusRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampus', () => {
    it('should create a campus successfully', async () => {
      const campusData = {
        name: 'Main Campus',
        code: 'MC001',
        address: '123 Main St',
        city: 'Karachi',
        province: 'Sindh',
      };

      const mockCampus = {
        id: 'campus-123',
        ...campusData,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findAllCampuses = jest.fn().mockResolvedValue([]);
      mockRepository.createCampus = jest.fn().mockResolvedValue(mockCampus);

      const result = await multiCampusService.createCampus(campusData);

      expect(result).toEqual(mockCampus);
      expect(mockRepository.createCampus).toHaveBeenCalledWith(campusData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const campusData = {
        name: '',
        code: '',
        address: '',
        city: '',
        province: '',
      };

      await expect(multiCampusService.createCampus(campusData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if campus code already exists', async () => {
      const campusData = {
        name: 'Main Campus',
        code: 'MC001',
        address: '123 Main St',
        city: 'Karachi',
        province: 'Sindh',
      };

      const existingCampus = {
        id: 'campus-123',
        code: 'MC001',
        name: 'Existing Campus',
        address: '456 Other St',
        city: 'Lahore',
        province: 'Punjab',
        isActive: true,
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      };

      mockRepository.findAllCampuses = jest.fn().mockResolvedValue([existingCampus]);

      await expect(multiCampusService.createCampus(campusData)).rejects.toThrow(ConflictError);
    });
  });

  describe('createStudentTransfer', () => {
    it('should create a student transfer successfully', async () => {
      const transferData = {
        studentId: 'student-123',
        fromCampusId: 'campus-1',
        toCampusId: 'campus-2',
        transferType: 'permanent' as const,
        reason: 'Family relocation',
      };

      const mockFromCampus = {
        id: 'campus-1',
        name: 'Campus A',
        code: 'CA001',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      const mockToCampus = {
        id: 'campus-2',
        name: 'Campus B',
        code: 'CB001',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      const mockTransfer = {
        id: 'transfer-123',
        ...transferData,
        requestedDate: '2024-01-15',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findCampusById = jest
        .fn()
        .mockResolvedValueOnce(mockFromCampus)
        .mockResolvedValueOnce(mockToCampus);
      mockRepository.createStudentTransfer = jest.fn().mockResolvedValue(mockTransfer);

      const result = await multiCampusService.createStudentTransfer(transferData);

      expect(result).toEqual(mockTransfer);
      expect(mockRepository.createStudentTransfer).toHaveBeenCalledWith(transferData);
    });

    it('should throw ValidationError if from and to campuses are same', async () => {
      const transferData = {
        studentId: 'student-123',
        fromCampusId: 'campus-1',
        toCampusId: 'campus-1',
        transferType: 'permanent' as const,
        reason: 'Test',
      };

      await expect(multiCampusService.createStudentTransfer(transferData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if campus is not active', async () => {
      const transferData = {
        studentId: 'student-123',
        fromCampusId: 'campus-1',
        toCampusId: 'campus-2',
        transferType: 'permanent' as const,
        reason: 'Test',
      };

      const mockFromCampus = {
        id: 'campus-1',
        name: 'Campus A',
        code: 'CA001',
        isActive: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      mockRepository.findCampusById = jest.fn().mockResolvedValue(mockFromCampus);

      await expect(multiCampusService.createStudentTransfer(transferData)).rejects.toThrow(ValidationError);
    });
  });

  describe('approveStudentTransfer', () => {
    it('should approve a student transfer successfully', async () => {
      const mockTransfer = {
        id: 'transfer-123',
        studentId: 'student-123',
        fromCampusId: 'campus-1',
        toCampusId: 'campus-2',
        transferType: 'permanent' as const,
        reason: 'Family relocation',
        requestedDate: '2024-01-15',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const approvedTransfer = {
        ...mockTransfer,
        status: 'approved' as const,
        approvedBy: 'admin-123',
        approvedAt: '2024-01-16T10:00:00Z',
        effectiveDate: '2024-02-01',
      };

      mockRepository.findStudentTransferById = jest.fn().mockResolvedValue(mockTransfer);
      mockRepository.updateStudentTransferStatus = jest.fn().mockResolvedValue(approvedTransfer);

      const result = await multiCampusService.approveStudentTransfer(
        'transfer-123',
        { status: 'approved', effectiveDate: '2024-02-01' },
        'admin-123'
      );

      expect(result.status).toBe('approved');
      expect(mockRepository.updateStudentTransferStatus).toHaveBeenCalled();
    });

    it('should throw ValidationError if effective date not provided for approval', async () => {
      const mockTransfer = {
        id: 'transfer-123',
        studentId: 'student-123',
        fromCampusId: 'campus-1',
        toCampusId: 'campus-2',
        transferType: 'permanent' as const,
        reason: 'Family relocation',
        requestedDate: '2024-01-15',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findStudentTransferById = jest.fn().mockResolvedValue(mockTransfer);

      await expect(
        multiCampusService.approveStudentTransfer('transfer-123', { status: 'approved' })
      ).rejects.toThrow(ValidationError);
    });
  });
});

