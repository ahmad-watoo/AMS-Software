/**
 * Finance Service Unit Tests
 * 
 * Comprehensive test suite for FinanceService covering:
 * - Fee structure management (CRUD operations)
 * - Student fee tracking
 * - Payment processing
 * - Financial reporting
 * 
 * @module tests/unit/services/finance.service.test
 */

import { FinanceService } from '@/services/finance.service';
import { FinanceRepository } from '@/repositories/finance.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';

jest.mock('@/repositories/finance.repository');

describe('FinanceService', () => {
  let financeService: FinanceService;
  let mockRepository: jest.Mocked<FinanceRepository>;

  beforeEach(() => {
    mockRepository = new FinanceRepository() as jest.Mocked<FinanceRepository>;
    financeService = new FinanceService();
    (financeService as any).financeRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Fee Structures', () => {
    describe('getAllFeeStructures', () => {
      it('should retrieve all fee structures with pagination', async () => {
        const mockStructures = [
          {
            id: 'fee-1',
            programId: 'prog-1',
            semester: '2024-Fall',
            feeType: 'tuition',
            amount: 50000,
            description: 'Tuition fee',
            isMandatory: true,
            createdAt: '2024-09-01T10:00:00Z',
            updatedAt: '2024-09-01T10:00:00Z',
          },
        ];

        mockRepository.findAllFeeStructures = jest.fn().mockResolvedValue(mockStructures);

        const result = await financeService.getAllFeeStructures(10, 0);

        expect(result.feeStructures).toEqual(mockStructures);
        expect(result.total).toBe(1);
      });

      it('should apply filters when provided', async () => {
        const filters = { programId: 'prog-1', semester: '2024-Fall' };
        mockRepository.findAllFeeStructures = jest.fn().mockResolvedValue([]);

        await financeService.getAllFeeStructures(10, 0, filters);

        expect(mockRepository.findAllFeeStructures).toHaveBeenCalledWith(100, 0, filters);
      });
    });

    describe('getFeeStructureById', () => {
      it('should retrieve fee structure by ID', async () => {
        const mockStructure = {
          id: 'fee-1',
          programId: 'prog-1',
          semester: '2024-Fall',
          feeType: 'tuition',
          amount: 50000,
          description: 'Tuition fee',
          isMandatory: true,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        mockRepository.findFeeStructureById = jest.fn().mockResolvedValue(mockStructure);

        const result = await financeService.getFeeStructureById('fee-1');

        expect(result).toEqual(mockStructure);
      });

      it('should throw NotFoundError when structure not found', async () => {
        mockRepository.findFeeStructureById = jest.fn().mockResolvedValue(null);

        await expect(financeService.getFeeStructureById('fee-999')).rejects.toThrow(NotFoundError);
      });
    });

    describe('createFeeStructure', () => {
      it('should create fee structure successfully', async () => {
        const feeData = {
          programId: 'prog-1',
          semester: '2024-Fall',
          feeType: 'tuition',
          amount: 50000,
          description: 'Tuition fee',
        };

        const mockStructure = {
          id: 'fee-1',
          ...feeData,
          isMandatory: true,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        mockRepository.createFeeStructure = jest.fn().mockResolvedValue(mockStructure);

        const result = await financeService.createFeeStructure(feeData);

        expect(result).toEqual(mockStructure);
      });

      it('should throw ValidationError if required fields are missing', async () => {
        const feeData = {
          semester: '',
          feeType: '',
          amount: 0,
        };

        await expect(financeService.createFeeStructure(feeData)).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError if amount is less than or equal to 0', async () => {
        const feeData = {
          semester: '2024-Fall',
          feeType: 'tuition',
          amount: -100,
        };

        await expect(financeService.createFeeStructure(feeData)).rejects.toThrow(ValidationError);
      });
    });

    describe('updateFeeStructure', () => {
      it('should update fee structure successfully', async () => {
        const existingStructure = {
          id: 'fee-1',
          programId: 'prog-1',
          semester: '2024-Fall',
          feeType: 'tuition',
          amount: 50000,
          description: 'Tuition fee',
          isMandatory: true,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        const updateData = { amount: 55000 };
        const updatedStructure = { ...existingStructure, ...updateData };

        mockRepository.findFeeStructureById = jest.fn().mockResolvedValue(existingStructure);
        mockRepository.updateFeeStructure = jest.fn().mockResolvedValue(updatedStructure);

        const result = await financeService.updateFeeStructure('fee-1', updateData);

        expect(result.amount).toBe(55000);
      });

      it('should throw NotFoundError when structure not found', async () => {
        mockRepository.findFeeStructureById = jest.fn().mockResolvedValue(null);

        await expect(financeService.updateFeeStructure('fee-999', { amount: 60000 })).rejects.toThrow(NotFoundError);
      });

      it('should throw ValidationError if amount is invalid', async () => {
        const existingStructure = {
          id: 'fee-1',
          programId: 'prog-1',
          semester: '2024-Fall',
          feeType: 'tuition',
          amount: 50000,
          description: 'Tuition fee',
          isMandatory: true,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        mockRepository.findFeeStructureById = jest.fn().mockResolvedValue(existingStructure);

        await expect(financeService.updateFeeStructure('fee-1', { amount: -100 })).rejects.toThrow(ValidationError);
      });
    });
  });

  describe('Student Fees', () => {
    describe('getAllStudentFees', () => {
      it('should retrieve all student fees with pagination', async () => {
        const mockFees = [
          {
            id: 'student-fee-1',
            studentId: 'student-1',
            feeStructureId: 'fee-1',
            semester: '2024-Fall',
            amountDue: 50000,
            amountPaid: 25000,
            dueDate: '2024-10-01',
            paymentStatus: 'partial' as const,
            createdAt: '2024-09-01T10:00:00Z',
            updatedAt: '2024-09-01T10:00:00Z',
          },
        ];

        mockRepository.findAllStudentFees = jest.fn().mockResolvedValue(mockFees);

        const result = await financeService.getAllStudentFees(10, 0);

        expect(result.fees).toEqual(mockFees);
        expect(result.total).toBe(1);
      });
    });

    describe('getStudentFeeById', () => {
      it('should retrieve student fee by ID', async () => {
        const mockFee = {
          id: 'student-fee-1',
          studentId: 'student-1',
          feeStructureId: 'fee-1',
          semester: '2024-Fall',
          amountDue: 50000,
          amountPaid: 25000,
          dueDate: '2024-10-01',
          paymentStatus: 'partial' as const,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        mockRepository.findStudentFeeById = jest.fn().mockResolvedValue(mockFee);

        const result = await financeService.getStudentFeeById('student-fee-1');

        expect(result).toEqual(mockFee);
      });

      it('should throw NotFoundError when fee not found', async () => {
        mockRepository.findStudentFeeById = jest.fn().mockResolvedValue(null);

        await expect(financeService.getStudentFeeById('student-fee-999')).rejects.toThrow(NotFoundError);
      });
    });

    describe('getStudentFinancialSummary', () => {
      it('should calculate financial summary correctly', async () => {
        const mockFees = [
          {
            id: 'student-fee-1',
            studentId: 'student-1',
            feeStructureId: 'fee-1',
            semester: '2024-Fall',
            amountDue: 50000,
            amountPaid: 25000,
            dueDate: '2024-10-01',
            paymentStatus: 'partial' as const,
            createdAt: '2024-09-01T10:00:00Z',
            updatedAt: '2024-09-01T10:00:00Z',
          },
        ];

        const mockPayments = [
          {
            id: 'payment-1',
            studentId: 'student-1',
            studentFeeId: 'student-fee-1',
            amount: 25000,
            paymentMethod: 'bank_transfer' as const,
            paymentDate: '2024-09-15',
            transactionId: 'TXN-001',
            status: 'completed' as const,
            createdAt: '2024-09-15T10:00:00Z',
            updatedAt: '2024-09-15T10:00:00Z',
          },
        ];

        mockRepository.findAllStudentFees = jest.fn().mockResolvedValue(mockFees);
        mockRepository.findAllPayments = jest.fn().mockResolvedValue(mockPayments);

        const result = await financeService.getStudentFinancialSummary('student-1', '2024-Fall');

        expect(result.studentId).toBe('student-1');
        expect(result.semester).toBe('2024-Fall');
        expect(result.totalFeesDue).toBe(50000);
        expect(result.totalFeesPaid).toBe(25000);
        expect(result.balance).toBe(25000);
        expect(result.paymentStatus).toBe('partial');
      });

      it('should set paymentStatus to paid when balance is zero', async () => {
        const mockFees = [
          {
            id: 'student-fee-1',
            studentId: 'student-1',
            feeStructureId: 'fee-1',
            semester: '2024-Fall',
            amountDue: 50000,
            amountPaid: 50000,
            dueDate: '2024-10-01',
            paymentStatus: 'paid' as const,
            createdAt: '2024-09-01T10:00:00Z',
            updatedAt: '2024-09-01T10:00:00Z',
          },
        ];

        mockRepository.findAllStudentFees = jest.fn().mockResolvedValue(mockFees);
        mockRepository.findAllPayments = jest.fn().mockResolvedValue([]);

        const result = await financeService.getStudentFinancialSummary('student-1', '2024-Fall');

        expect(result.paymentStatus).toBe('paid');
      });
    });
  });

  describe('Payments', () => {
    describe('getAllPayments', () => {
      it('should retrieve all payments with pagination', async () => {
        const mockPayments = [
          {
            id: 'payment-1',
            studentId: 'student-1',
            studentFeeId: 'student-fee-1',
            amount: 25000,
            paymentMethod: 'bank_transfer' as const,
            paymentDate: '2024-09-15',
            transactionId: 'TXN-001',
            status: 'completed' as const,
            createdAt: '2024-09-15T10:00:00Z',
            updatedAt: '2024-09-15T10:00:00Z',
          },
        ];

        mockRepository.findAllPayments = jest.fn().mockResolvedValue(mockPayments);

        const result = await financeService.getAllPayments(10, 0);

        expect(result.payments).toEqual(mockPayments);
        expect(result.total).toBe(1);
      });
    });

    describe('createPayment', () => {
      it('should create payment successfully', async () => {
        const paymentData = {
          studentId: 'student-1',
          studentFeeId: 'student-fee-1',
          amount: 25000,
          paymentMethod: 'bank_transfer' as const,
          transactionId: 'TXN-001',
        };

        const mockPayment = {
          id: 'payment-1',
          ...paymentData,
          paymentDate: '2024-09-15',
          status: 'completed' as const,
          createdAt: '2024-09-15T10:00:00Z',
          updatedAt: '2024-09-15T10:00:00Z',
        };

        const mockStudentFee = {
          id: 'student-fee-1',
          studentId: 'student-1',
          feeStructureId: 'fee-1',
          semester: '2024-Fall',
          amountDue: 50000,
          amountPaid: 0,
          dueDate: '2024-10-01',
          paymentStatus: 'pending' as const,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        mockRepository.findStudentFeeById = jest.fn().mockResolvedValue(mockStudentFee);
        mockRepository.createPayment = jest.fn().mockResolvedValue(mockPayment);

        const result = await financeService.createPayment(paymentData);

        expect(result).toEqual(mockPayment);
      });

      it('should throw ValidationError if required fields are missing', async () => {
        const paymentData = {
          studentId: '',
          studentFeeId: '',
          amount: 0,
          paymentMethod: 'bank_transfer' as const,
        };

        await expect(financeService.createPayment(paymentData)).rejects.toThrow(ValidationError);
      });

      it('should throw NotFoundError if student fee not found', async () => {
        const paymentData = {
          studentId: 'student-1',
          studentFeeId: 'student-fee-999',
          amount: 25000,
          paymentMethod: 'bank_transfer' as const,
        };

        mockRepository.findStudentFeeById = jest.fn().mockResolvedValue(null);

        await expect(financeService.createPayment(paymentData)).rejects.toThrow(NotFoundError);
      });

      it('should throw ValidationError if payment amount exceeds balance', async () => {
        const paymentData = {
          studentId: 'student-1',
          studentFeeId: 'student-fee-1',
          amount: 60000,
          paymentMethod: 'bank_transfer' as const,
        };

        const mockStudentFee = {
          id: 'student-fee-1',
          studentId: 'student-1',
          feeStructureId: 'fee-1',
          semester: '2024-Fall',
          amountDue: 50000,
          amountPaid: 0,
          dueDate: '2024-10-01',
          paymentStatus: 'pending' as const,
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z',
        };

        mockRepository.findStudentFeeById = jest.fn().mockResolvedValue(mockStudentFee);

        await expect(financeService.createPayment(paymentData)).rejects.toThrow(ValidationError);
      });
    });
  });
});

