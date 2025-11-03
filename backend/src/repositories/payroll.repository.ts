import { supabaseAdmin } from '@/config/supabase';
import {
  SalaryStructure,
  SalaryProcessing,
  SalarySlip,
  TaxCalculation,
  CreateSalaryStructureDTO,
  UpdateSalaryStructureDTO,
  ProcessSalaryDTO,
} from '@/models/Payroll.model';
import { logger } from '@/config/logger';

export class PayrollRepository {
  private salaryStructuresTable = 'salary_structures';
  private salaryProcessingsTable = 'salary_processings';
  private salarySlipsTable = 'salary_slips';

  // ==================== Salary Structures ====================

  async findAllSalaryStructures(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      employeeId?: string;
      isActive?: boolean;
    }
  ): Promise<SalaryStructure[]> {
    try {
      let query = supabaseAdmin
        .from(this.salaryStructuresTable)
        .select('*')
        .order('effective_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapSalaryStructureFromDB) as SalaryStructure[];
    } catch (error) {
      logger.error('Error finding all salary structures:', error);
      throw new Error('Failed to fetch salary structures');
    }
  }

  async findSalaryStructureById(id: string): Promise<SalaryStructure | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.salaryStructuresTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapSalaryStructureFromDB(data) as SalaryStructure;
    } catch (error) {
      logger.error('Error finding salary structure by ID:', error);
      throw error;
    }
  }

  async findActiveSalaryStructure(employeeId: string): Promise<SalaryStructure | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.salaryStructuresTable)
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapSalaryStructureFromDB(data) as SalaryStructure;
    } catch (error) {
      logger.error('Error finding active salary structure:', error);
      throw error;
    }
  }

  async createSalaryStructure(structureData: CreateSalaryStructureDTO): Promise<SalaryStructure> {
    try {
      // Deactivate previous active structure for this employee
      await supabaseAdmin
        .from(this.salaryStructuresTable)
        .update({ is_active: false })
        .eq('employee_id', structureData.employeeId)
        .eq('is_active', true);

      // Calculate gross and net salary
      const allowances =
        (structureData.houseRentAllowance || 0) +
        (structureData.medicalAllowance || 0) +
        (structureData.transportAllowance || 0) +
        (structureData.otherAllowances || 0);

      const deductions =
        (structureData.providentFund || 0) +
        (structureData.taxDeduction || 0) +
        (structureData.otherDeductions || 0);

      const grossSalary = structureData.basicSalary + allowances;
      const netSalary = grossSalary - deductions;

      const { data, error } = await supabaseAdmin
        .from(this.salaryStructuresTable)
        .insert({
          employee_id: structureData.employeeId,
          basic_salary: structureData.basicSalary,
          house_rent_allowance: structureData.houseRentAllowance || null,
          medical_allowance: structureData.medicalAllowance || null,
          transport_allowance: structureData.transportAllowance || null,
          other_allowances: structureData.otherAllowances || null,
          provident_fund: structureData.providentFund || null,
          tax_deduction: structureData.taxDeduction || null,
          other_deductions: structureData.otherDeductions || null,
          gross_salary: grossSalary,
          net_salary: netSalary,
          effective_date: structureData.effectiveDate,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSalaryStructureFromDB(data) as SalaryStructure;
    } catch (error) {
      logger.error('Error creating salary structure:', error);
      throw new Error('Failed to create salary structure');
    }
  }

  async updateSalaryStructure(id: string, structureData: UpdateSalaryStructureDTO): Promise<SalaryStructure> {
    try {
      const existing = await this.findSalaryStructureById(id);
      if (!existing) {
        throw new Error('Salary structure not found');
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (structureData.basicSalary !== undefined) updateData.basic_salary = structureData.basicSalary;
      if (structureData.houseRentAllowance !== undefined) updateData.house_rent_allowance = structureData.houseRentAllowance;
      if (structureData.medicalAllowance !== undefined) updateData.medical_allowance = structureData.medicalAllowance;
      if (structureData.transportAllowance !== undefined) updateData.transport_allowance = structureData.transportAllowance;
      if (structureData.otherAllowances !== undefined) updateData.other_allowances = structureData.otherAllowances;
      if (structureData.providentFund !== undefined) updateData.provident_fund = structureData.providentFund;
      if (structureData.taxDeduction !== undefined) updateData.tax_deduction = structureData.taxDeduction;
      if (structureData.otherDeductions !== undefined) updateData.other_deductions = structureData.otherDeductions;
      if (structureData.effectiveDate !== undefined) updateData.effective_date = structureData.effectiveDate;
      if (structureData.isActive !== undefined) updateData.is_active = structureData.isActive;

      // Recalculate if salary components changed
      if (
        structureData.basicSalary !== undefined ||
        structureData.houseRentAllowance !== undefined ||
        structureData.medicalAllowance !== undefined ||
        structureData.transportAllowance !== undefined ||
        structureData.otherAllowances !== undefined ||
        structureData.providentFund !== undefined ||
        structureData.taxDeduction !== undefined ||
        structureData.otherDeductions !== undefined
      ) {
        const basicSalary = structureData.basicSalary ?? existing.basicSalary;
        const allowances =
          (structureData.houseRentAllowance ?? existing.houseRentAllowance ?? 0) +
          (structureData.medicalAllowance ?? existing.medicalAllowance ?? 0) +
          (structureData.transportAllowance ?? existing.transportAllowance ?? 0) +
          (structureData.otherAllowances ?? existing.otherAllowances ?? 0);

        const deductions =
          (structureData.providentFund ?? existing.providentFund ?? 0) +
          (structureData.taxDeduction ?? existing.taxDeduction ?? 0) +
          (structureData.otherDeductions ?? existing.otherDeductions ?? 0);

        updateData.gross_salary = basicSalary + allowances;
        updateData.net_salary = basicSalary + allowances - deductions;
      }

      const { data, error } = await supabaseAdmin
        .from(this.salaryStructuresTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSalaryStructureFromDB(data) as SalaryStructure;
    } catch (error) {
      logger.error('Error updating salary structure:', error);
      throw new Error('Failed to update salary structure');
    }
  }

  // ==================== Salary Processing ====================

  async findAllSalaryProcessings(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      employeeId?: string;
      payrollPeriod?: string;
      status?: string;
    }
  ): Promise<SalaryProcessing[]> {
    try {
      let query = supabaseAdmin
        .from(this.salaryProcessingsTable)
        .select('*')
        .order('payroll_period', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.payrollPeriod) {
        query = query.eq('payroll_period', filters.payrollPeriod);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapSalaryProcessingFromDB) as SalaryProcessing[];
    } catch (error) {
      logger.error('Error finding all salary processings:', error);
      throw new Error('Failed to fetch salary processings');
    }
  }

  async findSalaryProcessingById(id: string): Promise<SalaryProcessing | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.salaryProcessingsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapSalaryProcessingFromDB(data) as SalaryProcessing;
    } catch (error) {
      logger.error('Error finding salary processing by ID:', error);
      throw error;
    }
  }

  async createSalaryProcessing(processingData: ProcessSalaryDTO, calculatedSalary: any): Promise<SalaryProcessing> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.salaryProcessingsTable)
        .insert({
          employee_id: processingData.employeeId,
          payroll_period: processingData.payrollPeriod,
          basic_salary: calculatedSalary.basicSalary,
          allowances: calculatedSalary.allowances,
          deductions: calculatedSalary.deductions,
          gross_salary: calculatedSalary.grossSalary,
          tax_amount: calculatedSalary.taxAmount,
          provident_fund: calculatedSalary.providentFund,
          net_salary: calculatedSalary.netSalary,
          days_worked: processingData.daysWorked || calculatedSalary.daysInMonth,
          days_in_month: calculatedSalary.daysInMonth,
          bonus: processingData.bonus || null,
          overtime: calculatedSalary.overtime || null,
          advance_deduction: processingData.advanceDeduction || null,
          status: 'pending',
          remarks: processingData.remarks || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSalaryProcessingFromDB(data) as SalaryProcessing;
    } catch (error) {
      logger.error('Error creating salary processing:', error);
      throw new Error('Failed to create salary processing');
    }
  }

  async updateSalaryProcessingStatus(
    id: string,
    status: 'pending' | 'processed' | 'approved' | 'paid',
    processedBy?: string,
    approvedBy?: string,
    paymentDate?: string
  ): Promise<SalaryProcessing> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'processed' && processedBy) {
        updateData.processed_by = processedBy;
        updateData.processed_at = new Date().toISOString();
      }

      if (status === 'approved' && approvedBy) {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      if (status === 'paid' && paymentDate) {
        updateData.payment_date = paymentDate;
      }

      const { data, error } = await supabaseAdmin
        .from(this.salaryProcessingsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSalaryProcessingFromDB(data) as SalaryProcessing;
    } catch (error) {
      logger.error('Error updating salary processing status:', error);
      throw new Error('Failed to update salary processing');
    }
  }

  // ==================== Salary Slips ====================

  async createSalarySlip(slipData: {
    salaryProcessingId: string;
    employeeId: string;
    payrollPeriod: string;
    slipNumber: string;
    pdfUrl?: string;
  }): Promise<SalarySlip> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.salarySlipsTable)
        .insert({
          salary_processing_id: slipData.salaryProcessingId,
          employee_id: slipData.employeeId,
          payroll_period: slipData.payrollPeriod,
          slip_number: slipData.slipNumber,
          issued_date: new Date().toISOString().split('T')[0],
          pdf_url: slipData.pdfUrl || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSalarySlipFromDB(data) as SalarySlip;
    } catch (error) {
      logger.error('Error creating salary slip:', error);
      throw new Error('Failed to create salary slip');
    }
  }

  async findSalarySlipsByEmployee(employeeId: string, limit: number = 12): Promise<SalarySlip[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.salarySlipsTable)
        .select('*')
        .eq('employee_id', employeeId)
        .order('payroll_period', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapSalarySlipFromDB) as SalarySlip[];
    } catch (error) {
      logger.error('Error finding salary slips:', error);
      throw new Error('Failed to fetch salary slips');
    }
  }

  // ==================== Helper Mappers ====================

  private mapSalaryStructureFromDB(data: any): Partial<SalaryStructure> {
    return {
      id: data.id,
      employeeId: data.employee_id,
      basicSalary: data.basic_salary,
      houseRentAllowance: data.house_rent_allowance,
      medicalAllowance: data.medical_allowance,
      transportAllowance: data.transport_allowance,
      otherAllowances: data.other_allowances,
      providentFund: data.provident_fund,
      taxDeduction: data.tax_deduction,
      otherDeductions: data.other_deductions,
      grossSalary: data.gross_salary,
      netSalary: data.net_salary,
      effectiveDate: data.effective_date,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSalaryProcessingFromDB(data: any): Partial<SalaryProcessing> {
    return {
      id: data.id,
      employeeId: data.employee_id,
      payrollPeriod: data.payroll_period,
      basicSalary: data.basic_salary,
      allowances: data.allowances,
      deductions: data.deductions,
      grossSalary: data.gross_salary,
      taxAmount: data.tax_amount,
      providentFund: data.provident_fund,
      netSalary: data.net_salary,
      daysWorked: data.days_worked,
      daysInMonth: data.days_in_month,
      bonus: data.bonus,
      overtime: data.overtime,
      advanceDeduction: data.advance_deduction,
      status: data.status,
      processedBy: data.processed_by,
      processedAt: data.processed_at,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      paymentDate: data.payment_date,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSalarySlipFromDB(data: any): Partial<SalarySlip> {
    return {
      id: data.id,
      salaryProcessingId: data.salary_processing_id,
      employeeId: data.employee_id,
      payrollPeriod: data.payroll_period,
      slipNumber: data.slip_number,
      issuedDate: data.issued_date,
      pdfUrl: data.pdf_url,
      createdAt: data.created_at,
    };
  }
}

