/**
 * Finance Service
 * 
 * This service handles all finance management business logic including:
 * - Fee structure management (creation, updates)
 * - Student fee tracking and calculations
 * - Payment processing and recording
 * - Financial reporting and summaries
 * 
 * The finance system manages:
 * - Fee structures for different programs and semesters
 * - Student fee assignments and tracking
 * - Payment processing with multiple payment methods
 * - Financial summaries and reports
 * 
 * @module services/finance.service
 */

import { FinanceRepository } from '@/repositories/finance.repository';
import {
  FeeStructure,
  StudentFee,
  Payment,
  CreateFeeStructureDTO,
  UpdateFeeStructureDTO,
  CreatePaymentDTO,
  FinancialReport,
  StudentFinancialSummary,
} from '@/models/Finance.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class FinanceService {
  private financeRepository: FinanceRepository;

  constructor() {
    this.financeRepository = new FinanceRepository();
  }

  // ==================== Fee Structures ====================

  /**
   * Get all fee structures with pagination and filters
   * 
   * Retrieves fee structures with optional filtering by program, semester,
   * fee type, and mandatory status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of structures to return
   * @param {number} [offset=0] - Number of structures to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.programId] - Filter by program ID
   * @param {string} [filters.semester] - Filter by semester
   * @param {string} [filters.feeType] - Filter by fee type
   * @param {boolean} [filters.isMandatory] - Filter by mandatory status
   * @returns {Promise<{feeStructures: FeeStructure[], total: number}>} Fee structures and total count
   * 
   * @example
   * const { feeStructures, total } = await financeService.getAllFeeStructures(20, 0, {
   *   programId: 'program123',
   *   semester: '2024-Fall',
   *   feeType: 'tuition'
   * });
   */
  async getAllFeeStructures(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      programId?: string;
      semester?: string;
      feeType?: string;
      isMandatory?: boolean;
    }
  ): Promise<{
    feeStructures: FeeStructure[];
    total: number;
  }> {
    try {
      const allStructures = await this.financeRepository.findAllFeeStructures(limit * 10, 0, filters);
      const paginatedStructures = allStructures.slice(offset, offset + limit);

      return {
        feeStructures: paginatedStructures,
        total: allStructures.length,
      };
    } catch (error) {
      logger.error('Error getting all fee structures:', error);
      throw new Error('Failed to fetch fee structures');
    }
  }

  /**
   * Get fee structure by ID
   * 
   * Retrieves a specific fee structure by its ID.
   * 
   * @param {string} id - Fee structure ID
   * @returns {Promise<FeeStructure>} Fee structure object
   * @throws {NotFoundError} If fee structure not found
   */
  async getFeeStructureById(id: string): Promise<FeeStructure> {
    try {
      const structure = await this.financeRepository.findFeeStructureById(id);
      if (!structure) {
        throw new NotFoundError('Fee structure');
      }
      return structure;
    } catch (error) {
      logger.error('Error getting fee structure by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch fee structure');
    }
  }

  /**
   * Create a new fee structure
   * 
   * Creates a new fee structure with validation.
   * Validates required fields and amount.
   * 
   * @param {CreateFeeStructureDTO} feeStructureData - Fee structure creation data
   * @returns {Promise<FeeStructure>} Created fee structure
   * @throws {ValidationError} If fee structure data is invalid
   * 
   * @example
   * const structure = await financeService.createFeeStructure({
   *   programId: 'program123',
   *   semester: '2024-Fall',
   *   feeType: 'tuition',
   *   amount: 50000,
   *   description: 'Tuition fee for Fall 2024'
   * });
   */
  async createFeeStructure(feeStructureData: CreateFeeStructureDTO): Promise<FeeStructure> {
    try {
      if (!feeStructureData.semester || !feeStructureData.feeType || !feeStructureData.amount) {
        throw new ValidationError('Semester, fee type, and amount are required');
      }

      if (feeStructureData.amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      return await this.financeRepository.createFeeStructure(feeStructureData);
    } catch (error) {
      logger.error('Error creating fee structure:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create fee structure');
    }
  }

  /**
   * Update a fee structure
   * 
   * Updates an existing fee structure's information.
   * Validates amount if being updated.
   * 
   * @param {string} id - Fee structure ID
   * @param {UpdateFeeStructureDTO} feeStructureData - Partial fee structure data to update
   * @returns {Promise<FeeStructure>} Updated fee structure
   * @throws {NotFoundError} If fee structure not found
   * @throws {ValidationError} If amount is invalid
   */
  async updateFeeStructure(id: string, feeStructureData: UpdateFeeStructureDTO): Promise<FeeStructure> {
    try {
      const existingStructure = await this.financeRepository.findFeeStructureById(id);
      if (!existingStructure) {
        throw new NotFoundError('Fee structure');
      }

      if (feeStructureData.amount !== undefined && feeStructureData.amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      return await this.financeRepository.updateFeeStructure(id, feeStructureData);
    } catch (error) {
      logger.error('Error updating fee structure:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update fee structure');
    }
  }

  // ==================== Student Fees ====================

  /**
   * Get all student fees with pagination and filters
   * 
   * Retrieves student fees with optional filtering by student, semester,
   * and payment status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of fees to return
   * @param {number} [offset=0] - Number of fees to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.semester] - Filter by semester
   * @param {string} [filters.paymentStatus] - Filter by payment status
   * @returns {Promise<{fees: StudentFee[], total: number}>} Student fees and total count
   * 
   * @example
   * const { fees, total } = await financeService.getAllStudentFees(20, 0, {
   *   studentId: 'student123',
   *   paymentStatus: 'pending'
   * });
   */
  async getAllStudentFees(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      semester?: string;
      paymentStatus?: string;
    }
  ): Promise<{
    fees: StudentFee[];
    total: number;
  }> {
    try {
      const allFees = await this.financeRepository.findAllStudentFees(limit * 10, 0, filters);
      const paginatedFees = allFees.slice(offset, offset + limit);

      return {
        fees: paginatedFees,
        total: allFees.length,
      };
    } catch (error) {
      logger.error('Error getting all student fees:', error);
      throw new Error('Failed to fetch student fees');
    }
  }

  /**
   * Get student fee by ID
   * 
   * Retrieves a specific student fee by its ID.
   * 
   * @param {string} id - Student fee ID
   * @returns {Promise<StudentFee>} Student fee object
   * @throws {NotFoundError} If student fee not found
   */
  async getStudentFeeById(id: string): Promise<StudentFee> {
    try {
      const fee = await this.financeRepository.findStudentFeeById(id);
      if (!fee) {
        throw new NotFoundError('Student fee');
      }
      return fee;
    } catch (error) {
      logger.error('Error getting student fee by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch student fee');
    }
  }

  /**
   * Get student financial summary
   * 
   * Calculates comprehensive financial summary for a student in a specific semester.
   * Includes total fees due, paid, balance, and payment status.
   * 
   * @param {string} studentId - Student ID
   * @param {string} semester - Semester identifier
   * @returns {Promise<StudentFinancialSummary>} Student financial summary
   * 
   * @example
   * const summary = await financeService.getStudentFinancialSummary('student123', '2024-Fall');
   * console.log(summary.balance); // 15000
   * console.log(summary.paymentStatus); // 'partial'
   */
  async getStudentFinancialSummary(
    studentId: string,
    semester: string
  ): Promise<StudentFinancialSummary> {
    try {
      const fees = await this.financeRepository.findAllStudentFees(1000, 0, {
        studentId,
        semester,
      });

      const payments = await this.financeRepository.findAllPayments(1000, 0, {
        studentId,
      });

      const totalFeesDue = fees.reduce((sum, fee) => sum + fee.amountDue, 0);
      const totalFeesPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
      const balance = totalFeesDue - totalFeesPaid;

      let paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
      if (balance <= 0) {
        paymentStatus = 'paid';
      } else if (totalFeesPaid > 0) {
        paymentStatus = 'partial';
      }

      // Check for overdue
      const hasOverdue = fees.some(
        (fee) =>
          fee.paymentStatus === 'overdue' ||
          (new Date(fee.dueDate) < new Date() && fee.paymentStatus !== 'paid')
      );
      if (hasOverdue) {
        paymentStatus = 'overdue';
      }

      return {
        studentId,
        semester,
        totalFeesDue,
        totalFeesPaid,
        balance,
        fees,
        payments: payments.filter((p) => fees.some((f) => f.id === p.studentFeeId)),
        paymentStatus,
      };
    } catch (error) {
      logger.error('Error getting student financial summary:', error);
      throw new Error('Failed to fetch student financial summary');
    }
  }

  // ==================== Payments ====================

  /**
   * Get all payments with pagination and filters
   * 
   * Retrieves payments with optional filtering by student, fee, payment method,
   * and date range. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of payments to return
   * @param {number} [offset=0] - Number of payments to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.studentFeeId] - Filter by student fee ID
   * @param {string} [filters.paymentMethod] - Filter by payment method
   * @param {string} [filters.startDate] - Filter by start date
   * @param {string} [filters.endDate] - Filter by end date
   * @returns {Promise<{payments: Payment[], total: number}>} Payments and total count
   * 
   * @example
   * const { payments, total } = await financeService.getAllPayments(20, 0, {
   *   studentId: 'student123',
   *   startDate: '2024-09-01',
   *   endDate: '2024-10-31'
   * });
   */
  async getAllPayments(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      studentFeeId?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    payments: Payment[];
    total: number;
  }> {
    try {
      const allPayments = await this.financeRepository.findAllPayments(limit * 10, 0, filters);
      const paginatedPayments = allPayments.slice(offset, offset + limit);

      return {
        payments: paginatedPayments,
        total: allPayments.length,
      };
    } catch (error) {
      logger.error('Error getting all payments:', error);
      throw new Error('Failed to fetch payments');
    }
  }

  /**
   * Create a payment
   * 
   * Creates a new payment record and updates the associated student fee.
   * Validates payment amount doesn't exceed remaining balance.
   * 
   * @param {CreatePaymentDTO} paymentData - Payment creation data
   * @param {string} [receivedBy] - ID of user receiving the payment
   * @returns {Promise<{payment: Payment, updatedFee: StudentFee}>} Created payment and updated fee
   * @throws {ValidationError} If payment data is invalid
   * @throws {NotFoundError} If student fee not found
   * 
   * @example
   * const { payment, updatedFee } = await financeService.createPayment({
   *   studentFeeId: 'fee123',
   *   studentId: 'student456',
   *   amount: 25000,
   *   paymentDate: '2024-10-15',
   *   paymentMethod: 'bank_transfer',
   *   transactionId: 'TXN789'
   * }, 'faculty123');
   */
  async createPayment(paymentData: CreatePaymentDTO, receivedBy?: string): Promise<{ payment: Payment; updatedFee: StudentFee }> {
    try {
      // Validate payment data
      if (!paymentData.studentFeeId || !paymentData.studentId || !paymentData.amount || !paymentData.paymentDate) {
        throw new ValidationError('Student fee ID, student ID, amount, and payment date are required');
      }

      if (paymentData.amount <= 0) {
        throw new ValidationError('Payment amount must be greater than 0');
      }

      // Check if student fee exists
      const studentFee = await this.financeRepository.findStudentFeeById(paymentData.studentFeeId);
      if (!studentFee) {
        throw new NotFoundError('Student fee');
      }

      // Validate payment amount doesn't exceed balance
      const balance = studentFee.amountDue - studentFee.amountPaid;
      if (paymentData.amount > balance) {
        throw new ValidationError('Payment amount cannot exceed the remaining balance');
      }

      // Create payment
      const payment = await this.financeRepository.createPayment(paymentData, receivedBy);

      // Update student fee status
      const updatedFee = await this.financeRepository.updateStudentFeeStatus(
        paymentData.studentFeeId,
        paymentData.amount
      );

      return { payment, updatedFee };
    } catch (error) {
      logger.error('Error creating payment:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Get financial report
   * 
   * Generates a comprehensive financial report for a date range.
   * Includes total fees due, paid, pending, overdue, and payment method breakdown.
   * 
   * @param {string} startDate - Start date for the report (YYYY-MM-DD)
   * @param {string} endDate - End date for the report (YYYY-MM-DD)
   * @param {string} [semester] - Optional semester filter
   * @returns {Promise<FinancialReport>} Financial report
   * 
   * @example
   * const report = await financeService.getFinancialReport(
   *   '2024-09-01',
   *   '2024-10-31',
   *   '2024-Fall'
   * );
   * console.log(report.totalFeesPaid); // 5000000
   * console.log(report.totalPending); // 500000
   */
  async getFinancialReport(
    startDate: string,
    endDate: string,
    semester?: string
  ): Promise<FinancialReport> {
    try {
      const fees = await this.financeRepository.findAllStudentFees(10000, 0, {
        semester,
      });

      const payments = await this.financeRepository.findAllPayments(10000, 0, {
        startDate,
        endDate,
      });

      const totalFeesDue = fees.reduce((sum, fee) => sum + fee.amountDue, 0);
      const totalFeesPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
      const totalPending = fees
        .filter((f) => f.paymentStatus === 'pending')
        .reduce((sum, fee) => sum + (fee.amountDue - fee.amountPaid), 0);
      const totalOverdue = fees
        .filter((f) => f.paymentStatus === 'overdue')
        .reduce((sum, fee) => sum + (fee.amountDue - fee.amountPaid), 0);

      // Payment method breakdown
      const paymentMethodMap = new Map<string, { amount: number; count: number }>();
      payments.forEach((payment) => {
        const existing = paymentMethodMap.get(payment.paymentMethod) || { amount: 0, count: 0 };
        paymentMethodMap.set(payment.paymentMethod, {
          amount: existing.amount + payment.amount,
          count: existing.count + 1,
        });
      });

      // Fee type breakdown (would need to join with fee structures)
      const feeTypeBreakdown: { feeType: string; amount: number }[] = [];

      return {
        period: `${startDate} to ${endDate}`,
        totalFeesDue,
        totalFeesPaid,
        totalPending,
        totalOverdue,
        paymentBreakdown: Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
          paymentMethod: method,
          ...data,
        })),
        feeTypeBreakdown,
      };
    } catch (error) {
      logger.error('Error getting financial report:', error);
      throw new Error('Failed to fetch financial report');
    }
  }
}
