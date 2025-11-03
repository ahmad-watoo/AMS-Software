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

