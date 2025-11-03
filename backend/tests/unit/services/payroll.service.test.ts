import { PayrollService } from '@/services/payroll.service';
import { PayrollRepository } from '@/repositories/payroll.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';

jest.mock('@/repositories/payroll.repository');

describe('PayrollService', () => {
  let payrollService: PayrollService;
  let mockRepository: jest.Mocked<PayrollRepository>;

  beforeEach(() => {
    mockRepository = new PayrollRepository() as jest.Mocked<PayrollRepository>;
    payrollService = new PayrollService();
    (payrollService as any).payrollRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateIncomeTax', () => {
    it('should return 0 for income below 600,000 PKR', () => {
      const service = payrollService as any;
      const tax = service.calculateIncomeTax(500000);
      expect(tax).toBe(0);
    });

    it('should calculate tax correctly for 800,000 PKR income', () => {
      const service = payrollService as any;
      const tax = service.calculateIncomeTax(800000);
      // 600,000 exempt + 200,000 @ 2.5% = 5,000
      expect(tax).toBe(5000);
    });

    it('should calculate tax correctly for 1,500,000 PKR income', () => {
      const service = payrollService as any;
      const tax = service.calculateIncomeTax(1500000);
      // 600,000 exempt + 600,000 @ 2.5% = 15,000 + 300,000 @ 12.5% = 37,500
      // Total = 52,500
      expect(tax).toBeGreaterThan(50000);
      expect(tax).toBeLessThan(60000);
    });

    it('should calculate tax for high income correctly', () => {
      const service = payrollService as any;
      const tax = service.calculateIncomeTax(5000000);
      expect(tax).toBeGreaterThan(0);
    });
  });

  describe('createSalaryStructure', () => {
    it('should create a salary structure successfully', async () => {
      const structureData = {
        employeeId: 'emp-123',
        basicSalary: 50000,
        houseRentAllowance: 10000,
        medicalAllowance: 5000,
        effectiveDate: '2024-01-01',
      };

      const mockStructure = {
        id: 'struct-123',
        employeeId: 'emp-123',
        basicSalary: 50000,
        houseRentAllowance: 10000,
        medicalAllowance: 5000,
        grossSalary: 65000,
        netSalary: 65000,
        isActive: true,
        effectiveDate: '2024-01-01',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      mockRepository.createSalaryStructure = jest.fn().mockResolvedValue(mockStructure);

      const result = await payrollService.createSalaryStructure(structureData);

      expect(result).toEqual(mockStructure);
      expect(mockRepository.createSalaryStructure).toHaveBeenCalledWith(structureData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const structureData = {
        employeeId: '',
        basicSalary: 0,
        effectiveDate: '',
      };

      await expect(payrollService.createSalaryStructure(structureData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if basic salary is not positive', async () => {
      const structureData = {
        employeeId: 'emp-123',
        basicSalary: -1000,
        effectiveDate: '2024-01-01',
      };

      await expect(payrollService.createSalaryStructure(structureData)).rejects.toThrow(ValidationError);
    });
  });

  describe('processSalary', () => {
    it('should process salary successfully', async () => {
      const processingData = {
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
      };

      const mockSalaryStructure = {
        id: 'struct-123',
        employeeId: 'emp-123',
        basicSalary: 50000,
        houseRentAllowance: 10000,
        medicalAllowance: 5000,
        grossSalary: 65000,
        netSalary: 65000,
        isActive: true,
        effectiveDate: '2024-01-01',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      const mockProcessing = {
        id: 'proc-123',
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
        basicSalary: 50000,
        allowances: 15000,
        deductions: 5000,
        grossSalary: 65000,
        netSalary: 60000,
        taxAmount: 5000,
        status: 'processed' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findAllSalaryProcessings = jest.fn().mockResolvedValue([]);
      mockRepository.findActiveSalaryStructure = jest.fn().mockResolvedValue(mockSalaryStructure);
      mockRepository.createSalaryProcessing = jest.fn().mockResolvedValue(mockProcessing);
      mockRepository.updateSalaryProcessingStatus = jest.fn().mockResolvedValue(mockProcessing);
      mockRepository.findSalaryProcessingById = jest.fn().mockResolvedValue(mockProcessing);

      const result = await payrollService.processSalary(processingData, 'admin-123');

      expect(result).toBeDefined();
      expect(result.payrollPeriod).toBe('2024-01');
      expect(mockRepository.createSalaryProcessing).toHaveBeenCalled();
    });

    it('should throw ValidationError if payroll period format is invalid', async () => {
      const processingData = {
        employeeId: 'emp-123',
        payrollPeriod: 'invalid',
      };

      await expect(payrollService.processSalary(processingData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if salary already processed for period', async () => {
      const processingData = {
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
      };

      const existingProcessing = {
        id: 'proc-123',
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
        status: 'processed' as const,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      mockRepository.findAllSalaryProcessings = jest.fn().mockResolvedValue([existingProcessing]);

      await expect(payrollService.processSalary(processingData)).rejects.toThrow(ValidationError);
    });
  });

  describe('approveSalary', () => {
    it('should approve salary and generate slip', async () => {
      const mockProcessing = {
        id: 'proc-123',
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
        status: 'processed' as const,
        grossSalary: 65000,
        netSalary: 60000,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const approvedProcessing = {
        ...mockProcessing,
        status: 'approved' as const,
        approvedBy: 'admin-123',
        approvedAt: '2024-01-16T10:00:00Z',
      };

      mockRepository.findSalaryProcessingById = jest
        .fn()
        .mockResolvedValueOnce(mockProcessing)
        .mockResolvedValueOnce(approvedProcessing);
      mockRepository.updateSalaryProcessingStatus = jest.fn().mockResolvedValue(approvedProcessing);
      mockRepository.createSalarySlip = jest.fn().mockResolvedValue({
        id: 'slip-123',
        salaryProcessingId: 'proc-123',
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
        slipNumber: 'SLIP-2024-01-12345678',
        issuedDate: '2024-01-16',
        createdAt: '2024-01-16T10:00:00Z',
      });

      const result = await payrollService.approveSalary(
        'proc-123',
        { status: 'approved' },
        'admin-123'
      );

      expect(result.status).toBe('approved');
      expect(mockRepository.createSalarySlip).toHaveBeenCalled();
    });

    it('should throw ValidationError if salary is not processed', async () => {
      const mockProcessing = {
        id: 'proc-123',
        employeeId: 'emp-123',
        payrollPeriod: '2024-01',
        status: 'pending' as const,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findSalaryProcessingById = jest.fn().mockResolvedValue(mockProcessing);

      await expect(
        payrollService.approveSalary('proc-123', { status: 'approved' })
      ).rejects.toThrow(ValidationError);
    });
  });
});

