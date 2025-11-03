import { HRService } from '@/services/hr.service';
import { HRRepository } from '@/repositories/hr.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

jest.mock('@/repositories/hr.repository');

describe('HRService', () => {
  let hrService: HRService;
  let mockRepository: jest.Mocked<HRRepository>;

  beforeEach(() => {
    mockRepository = new HRRepository() as jest.Mocked<HRRepository>;
    hrService = new HRService();
    (hrService as any).hrRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEmployee', () => {
    it('should create an employee successfully', async () => {
      const employeeData = {
        userId: 'user-123',
        employeeId: 'EMP001',
        designation: 'Professor',
        joiningDate: '2024-01-01',
        employmentType: 'permanent' as const,
      };

      const mockEmployee = {
        id: 'emp-123',
        ...employeeData,
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      mockRepository.findEmployeeByEmployeeId = jest.fn().mockResolvedValue(null);
      mockRepository.createEmployee = jest.fn().mockResolvedValue(mockEmployee);

      const result = await hrService.createEmployee(employeeData);

      expect(result).toEqual(mockEmployee);
      expect(mockRepository.createEmployee).toHaveBeenCalledWith(employeeData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const employeeData = {
        userId: '',
        employeeId: '',
        designation: '',
        joiningDate: '',
      };

      await expect(hrService.createEmployee(employeeData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if employee ID already exists', async () => {
      const employeeData = {
        userId: 'user-123',
        employeeId: 'EMP001',
        designation: 'Professor',
        joiningDate: '2024-01-01',
        employmentType: 'permanent' as const,
      };

      const existingEmployee = {
        id: 'emp-123',
        employeeId: 'EMP001',
        userId: 'user-456',
        designation: 'Lecturer',
        joiningDate: '2023-01-01',
        employmentType: 'permanent' as const,
        isActive: true,
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
      };

      mockRepository.findEmployeeByEmployeeId = jest.fn().mockResolvedValue(existingEmployee);

      await expect(hrService.createEmployee(employeeData)).rejects.toThrow(ConflictError);
    });
  });

  describe('createLeaveRequest', () => {
    it('should create a leave request successfully', async () => {
      const leaveData = {
        employeeId: 'emp-123',
        leaveType: 'annual' as const,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        reason: 'Personal',
      };

      const mockLeaveRequest = {
        id: 'leave-123',
        ...leaveData,
        numberOfDays: 5,
        appliedDate: '2024-01-15',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.createLeaveRequest = jest.fn().mockResolvedValue(mockLeaveRequest);

      const result = await hrService.createLeaveRequest(leaveData);

      expect(result).toEqual(mockLeaveRequest);
      expect(mockRepository.createLeaveRequest).toHaveBeenCalledWith(leaveData);
    });

    it('should throw ValidationError if start date is in the past', async () => {
      const leaveData = {
        employeeId: 'emp-123',
        leaveType: 'annual' as const,
        startDate: '2023-01-01',
        endDate: '2023-01-05',
        reason: 'Personal',
      };

      await expect(hrService.createLeaveRequest(leaveData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if end date is before start date', async () => {
      const leaveData = {
        employeeId: 'emp-123',
        leaveType: 'annual' as const,
        startDate: '2024-02-05',
        endDate: '2024-02-01',
        reason: 'Personal',
      };

      await expect(hrService.createLeaveRequest(leaveData)).rejects.toThrow(ValidationError);
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a leave request successfully', async () => {
      const mockLeaveRequest = {
        id: 'leave-123',
        employeeId: 'emp-123',
        leaveType: 'annual' as const,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        numberOfDays: 5,
        appliedDate: '2024-01-15',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const approvedRequest = {
        ...mockLeaveRequest,
        status: 'approved' as const,
        approvedBy: 'admin-123',
        approvedAt: '2024-01-16T10:00:00Z',
      };

      mockRepository.findLeaveRequestById = jest.fn().mockResolvedValue(mockLeaveRequest);
      mockRepository.updateLeaveRequestStatus = jest.fn().mockResolvedValue(approvedRequest);

      const result = await hrService.approveLeaveRequest(
        'leave-123',
        { status: 'approved' },
        'admin-123'
      );

      expect(result.status).toBe('approved');
      expect(mockRepository.updateLeaveRequestStatus).toHaveBeenCalledWith(
        'leave-123',
        'approved',
        'admin-123',
        undefined,
        undefined,
        undefined
      );
    });

    it('should throw ValidationError if request is not pending', async () => {
      const mockLeaveRequest = {
        id: 'leave-123',
        employeeId: 'emp-123',
        leaveType: 'annual' as const,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        numberOfDays: 5,
        appliedDate: '2024-01-15',
        status: 'approved' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findLeaveRequestById = jest.fn().mockResolvedValue(mockLeaveRequest);

      await expect(
        hrService.approveLeaveRequest('leave-123', { status: 'rejected' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getLeaveBalance', () => {
    it('should calculate leave balance correctly', async () => {
      const employeeId = 'emp-123';

      const approvedLeaves = [
        {
          id: 'leave-1',
          employeeId: 'emp-123',
          leaveType: 'annual' as const,
          numberOfDays: 5,
          status: 'approved' as const,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          appliedDate: '2023-12-20',
          createdAt: '2023-12-20T10:00:00Z',
          updatedAt: '2023-12-20T10:00:00Z',
        },
        {
          id: 'leave-2',
          employeeId: 'emp-123',
          leaveType: 'sick' as const,
          numberOfDays: 3,
          status: 'approved' as const,
          startDate: '2024-01-10',
          endDate: '2024-01-12',
          appliedDate: '2024-01-05',
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-05T10:00:00Z',
        },
      ];

      mockRepository.findAllLeaveRequests = jest.fn().mockResolvedValue(approvedLeaves);

      const result = await hrService.getLeaveBalance(employeeId);

      expect(result.employeeId).toBe(employeeId);
      expect(result.annualLeave).toBe(15);
      expect(result.sickLeave).toBe(10);
      expect(result.casualLeave).toBe(5);
      expect(result.usedAnnualLeave).toBe(5);
      expect(result.usedSickLeave).toBe(3);
      expect(result.remainingAnnualLeave).toBe(10);
      expect(result.remainingSickLeave).toBe(7);
    });
  });
});

