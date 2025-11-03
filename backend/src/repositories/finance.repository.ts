import { supabaseAdmin } from '@/config/supabase';
import {
  FeeStructure,
  StudentFee,
  Payment,
  CreateFeeStructureDTO,
  UpdateFeeStructureDTO,
  CreatePaymentDTO,
} from '@/models/Finance.model';
import { logger } from '@/config/logger';

export class FinanceRepository {
  private feeStructuresTable = 'fee_structures';
  private studentFeesTable = 'student_fees';
  private paymentsTable = 'payments';

  // ==================== Fee Structures ====================

  async findAllFeeStructures(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      programId?: string;
      semester?: string;
      feeType?: string;
      isMandatory?: boolean;
    }
  ): Promise<FeeStructure[]> {
    try {
      let query = supabaseAdmin
        .from(this.feeStructuresTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.feeType) {
        query = query.eq('fee_type', filters.feeType);
      }
      if (filters?.isMandatory !== undefined) {
        query = query.eq('is_mandatory', filters.isMandatory);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapFeeStructureFromDB) as FeeStructure[];
    } catch (error) {
      logger.error('Error finding all fee structures:', error);
      throw new Error('Failed to fetch fee structures');
    }
  }

  async findFeeStructureById(id: string): Promise<FeeStructure | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.feeStructuresTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapFeeStructureFromDB(data) as FeeStructure;
    } catch (error) {
      logger.error('Error finding fee structure by ID:', error);
      throw error;
    }
  }

  async createFeeStructure(feeStructureData: CreateFeeStructureDTO): Promise<FeeStructure> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.feeStructuresTable)
        .insert({
          program_id: feeStructureData.programId || null,
          semester: feeStructureData.semester,
          fee_type: feeStructureData.feeType,
          amount: feeStructureData.amount,
          is_mandatory: feeStructureData.isMandatory ?? true,
          effective_from: feeStructureData.effectiveFrom,
          effective_to: feeStructureData.effectiveTo || null,
          description: feeStructureData.description || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapFeeStructureFromDB(data) as FeeStructure;
    } catch (error) {
      logger.error('Error creating fee structure:', error);
      throw new Error('Failed to create fee structure');
    }
  }

  async updateFeeStructure(id: string, feeStructureData: UpdateFeeStructureDTO): Promise<FeeStructure> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (feeStructureData.amount !== undefined) updateData.amount = feeStructureData.amount;
      if (feeStructureData.isMandatory !== undefined) updateData.is_mandatory = feeStructureData.isMandatory;
      if (feeStructureData.effectiveFrom !== undefined) updateData.effective_from = feeStructureData.effectiveFrom;
      if (feeStructureData.effectiveTo !== undefined) updateData.effective_to = feeStructureData.effectiveTo;
      if (feeStructureData.description !== undefined) updateData.description = feeStructureData.description;

      const { data, error } = await supabaseAdmin
        .from(this.feeStructuresTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapFeeStructureFromDB(data) as FeeStructure;
    } catch (error) {
      logger.error('Error updating fee structure:', error);
      throw new Error('Failed to update fee structure');
    }
  }

  // ==================== Student Fees ====================

  async findAllStudentFees(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      semester?: string;
      paymentStatus?: string;
    }
  ): Promise<StudentFee[]> {
    try {
      let query = supabaseAdmin
        .from(this.studentFeesTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapStudentFeeFromDB) as StudentFee[];
    } catch (error) {
      logger.error('Error finding all student fees:', error);
      throw new Error('Failed to fetch student fees');
    }
  }

  async findStudentFeeById(id: string): Promise<StudentFee | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.studentFeesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapStudentFeeFromDB(data) as StudentFee;
    } catch (error) {
      logger.error('Error finding student fee by ID:', error);
      throw error;
    }
  }

  async updateStudentFeeStatus(id: string, amountPaid: number): Promise<StudentFee> {
    try {
      const existingFee = await this.findStudentFeeById(id);
      if (!existingFee) {
        throw new Error('Student fee not found');
      }

      const newAmountPaid = existingFee.amountPaid + amountPaid;
      const balance = existingFee.amountDue - newAmountPaid;

      let paymentStatus: StudentFee['paymentStatus'] = 'pending';
      if (balance <= 0) {
        paymentStatus = 'paid';
      } else if (newAmountPaid > 0) {
        paymentStatus = 'partial';
      }

      // Check if overdue
      const dueDate = new Date(existingFee.dueDate);
      const today = new Date();
      if (dueDate < today && paymentStatus !== 'paid') {
        paymentStatus = 'overdue';
      }

      const { data, error } = await supabaseAdmin
        .from(this.studentFeesTable)
        .update({
          amount_paid: newAmountPaid,
          payment_status: paymentStatus,
          paid_date: paymentStatus === 'paid' ? new Date().toISOString() : existingFee.paidDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStudentFeeFromDB(data) as StudentFee;
    } catch (error) {
      logger.error('Error updating student fee status:', error);
      throw new Error('Failed to update student fee status');
    }
  }

  // ==================== Payments ====================

  async findAllPayments(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      studentFeeId?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Payment[]> {
    try {
      let query = supabaseAdmin
        .from(this.paymentsTable)
        .select('*')
        .order('payment_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.studentFeeId) {
        query = query.eq('student_fee_id', filters.studentFeeId);
      }
      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }
      if (filters?.startDate) {
        query = query.gte('payment_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('payment_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapPaymentFromDB) as Payment[];
    } catch (error) {
      logger.error('Error finding all payments:', error);
      throw new Error('Failed to fetch payments');
    }
  }

  async createPayment(paymentData: CreatePaymentDTO, receivedBy?: string): Promise<Payment> {
    try {
      const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { data, error } = await supabaseAdmin
        .from(this.paymentsTable)
        .insert({
          student_fee_id: paymentData.studentFeeId,
          student_id: paymentData.studentId,
          amount: paymentData.amount,
          payment_date: paymentData.paymentDate,
          payment_method: paymentData.paymentMethod,
          transaction_id: paymentData.transactionId || null,
          receipt_number: receiptNumber,
          received_by: receivedBy || null,
          remarks: paymentData.remarks || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapPaymentFromDB(data) as Payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  // ==================== Helper Mappers ====================

  private mapFeeStructureFromDB(data: any): Partial<FeeStructure> {
    return {
      id: data.id,
      programId: data.program_id,
      semester: data.semester,
      feeType: data.fee_type,
      amount: data.amount,
      isMandatory: data.is_mandatory,
      effectiveFrom: data.effective_from,
      effectiveTo: data.effective_to,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapStudentFeeFromDB(data: any): Partial<StudentFee> {
    return {
      id: data.id,
      studentId: data.student_id,
      feeStructureId: data.fee_structure_id,
      semester: data.semester,
      amountDue: data.amount_due,
      amountPaid: data.amount_paid,
      dueDate: data.due_date,
      paymentStatus: data.payment_status,
      paidDate: data.paid_date,
      paymentMethod: data.payment_method,
      transactionId: data.transaction_id,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPaymentFromDB(data: any): Partial<Payment> {
    return {
      id: data.id,
      studentFeeId: data.student_fee_id,
      studentId: data.student_id,
      amount: data.amount,
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method,
      transactionId: data.transaction_id,
      receiptNumber: data.receipt_number,
      receivedBy: data.received_by,
      remarks: data.remarks,
      createdAt: data.created_at,
    };
  }
}

