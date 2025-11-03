import { PayrollRepository } from '@/repositories/payroll.repository';
import {
  SalaryStructure,
  SalaryProcessing,
  SalarySlip,
  TaxCalculation,
  CreateSalaryStructureDTO,
  UpdateSalaryStructureDTO,
  ProcessSalaryDTO,
  ApproveSalaryDTO,
  PayrollSummary,
  EmployeePayrollHistory,
} from '@/models/Payroll.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class PayrollService {
  private payrollRepository: PayrollRepository;

  constructor() {
    this.payrollRepository = new PayrollRepository();
  }

  // ==================== Salary Structures ====================

  async getAllSalaryStructures(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      employeeId?: string;
      isActive?: boolean;
    }
  ): Promise<{
    structures: SalaryStructure[];
    total: number;
  }> {
    try {
      const allStructures = await this.payrollRepository.findAllSalaryStructures(limit * 10, 0, filters);
      const paginatedStructures = allStructures.slice(offset, offset + limit);

      return {
        structures: paginatedStructures,
        total: allStructures.length,
      };
    } catch (error) {
      logger.error('Error getting all salary structures:', error);
      throw new Error('Failed to fetch salary structures');
    }
  }

  async getSalaryStructureById(id: string): Promise<SalaryStructure> {
    try {
      const structure = await this.payrollRepository.findSalaryStructureById(id);
      if (!structure) {
        throw new NotFoundError('Salary structure');
      }
      return structure;
    } catch (error) {
      logger.error('Error getting salary structure by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch salary structure');
    }
  }

  async getActiveSalaryStructure(employeeId: string): Promise<SalaryStructure> {
    try {
      const structure = await this.payrollRepository.findActiveSalaryStructure(employeeId);
      if (!structure) {
        throw new NotFoundError('Active salary structure');
      }
      return structure;
    } catch (error) {
      logger.error('Error getting active salary structure:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch active salary structure');
    }
  }

  async createSalaryStructure(structureData: CreateSalaryStructureDTO): Promise<SalaryStructure> {
    try {
      if (!structureData.employeeId || !structureData.basicSalary || !structureData.effectiveDate) {
        throw new ValidationError('Employee ID, basic salary, and effective date are required');
      }

      if (structureData.basicSalary <= 0) {
        throw new ValidationError('Basic salary must be greater than 0');
      }

      return await this.payrollRepository.createSalaryStructure(structureData);
    } catch (error) {
      logger.error('Error creating salary structure:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create salary structure');
    }
  }

  async updateSalaryStructure(id: string, structureData: UpdateSalaryStructureDTO): Promise<SalaryStructure> {
    try {
      const existing = await this.payrollRepository.findSalaryStructureById(id);
      if (!existing) {
        throw new NotFoundError('Salary structure');
      }

      if (structureData.basicSalary !== undefined && structureData.basicSalary <= 0) {
        throw new ValidationError('Basic salary must be greater than 0');
      }

      return await this.payrollRepository.updateSalaryStructure(id, structureData);
    } catch (error) {
      logger.error('Error updating salary structure:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update salary structure');
    }
  }

  // ==================== Tax Calculation (Pakistan Tax Laws) ====================

  /**
   * Calculate income tax according to Pakistan tax laws (FY 2024)
   * Tax brackets:
   * - Up to PKR 600,000: 0%
   * - PKR 600,001 - 1,200,000: 2.5%
   * - PKR 1,200,001 - 2,400,000: 12.5%
   * - PKR 2,400,001 - 3,600,000: 20%
   * - PKR 3,600,001 - 6,000,000: 25%
   * - Above PKR 6,000,000: 32.5%
   */
  calculateIncomeTax(annualIncome: number): number {
    let tax = 0;
    let remainingIncome = annualIncome;

    if (remainingIncome <= 600000) {
      return 0;
    }

    // 600,001 - 1,200,000: 2.5%
    if (remainingIncome > 600000) {
      const taxable = Math.min(remainingIncome - 600000, 600000);
      tax += taxable * 0.025;
      remainingIncome -= taxable + 600000;
    }

    // 1,200,001 - 2,400,000: 12.5%
    if (remainingIncome > 0) {
      const taxable = Math.min(remainingIncome, 1200000);
      tax += taxable * 0.125;
      remainingIncome -= taxable;
    }

    // 2,400,001 - 3,600,000: 20%
    if (remainingIncome > 0) {
      const taxable = Math.min(remainingIncome, 1200000);
      tax += taxable * 0.2;
      remainingIncome -= taxable;
    }

    // 3,600,001 - 6,000,000: 25%
    if (remainingIncome > 0) {
      const taxable = Math.min(remainingIncome, 2400000);
      tax += taxable * 0.25;
      remainingIncome -= taxable;
    }

    // Above 6,000,000: 32.5%
    if (remainingIncome > 0) {
      tax += remainingIncome * 0.325;
    }

    return Math.round(tax);
  }

  /**
   * Calculate monthly tax from annual tax
   */
  calculateMonthlyTax(annualTax: number): number {
    return Math.round(annualTax / 12);
  }

  // ==================== Salary Processing ====================

  async getAllSalaryProcessings(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      employeeId?: string;
      payrollPeriod?: string;
      status?: string;
    }
  ): Promise<{
    processings: SalaryProcessing[];
    total: number;
  }> {
    try {
      const allProcessings = await this.payrollRepository.findAllSalaryProcessings(limit * 10, 0, filters);
      const paginatedProcessings = allProcessings.slice(offset, offset + limit);

      return {
        processings: paginatedProcessings,
        total: allProcessings.length,
      };
    } catch (error) {
      logger.error('Error getting all salary processings:', error);
      throw new Error('Failed to fetch salary processings');
    }
  }

  async getSalaryProcessingById(id: string): Promise<SalaryProcessing> {
    try {
      const processing = await this.payrollRepository.findSalaryProcessingById(id);
      if (!processing) {
        throw new NotFoundError('Salary processing');
      }
      return processing;
    } catch (error) {
      logger.error('Error getting salary processing by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch salary processing');
    }
  }

  async processSalary(processingData: ProcessSalaryDTO, processedBy?: string): Promise<SalaryProcessing> {
    try {
      if (!processingData.employeeId || !processingData.payrollPeriod) {
        throw new ValidationError('Employee ID and payroll period are required');
      }

      // Validate payroll period format (YYYY-MM)
      const periodPattern = /^\d{4}-\d{2}$/;
      if (!periodPattern.test(processingData.payrollPeriod)) {
        throw new ValidationError('Payroll period must be in YYYY-MM format');
      }

      // Check if salary already processed for this period
      const existingProcessings = await this.payrollRepository.findAllSalaryProcessings(1, 0, {
        employeeId: processingData.employeeId,
        payrollPeriod: processingData.payrollPeriod,
      });

      if (existingProcessings.length > 0) {
        throw new ValidationError('Salary already processed for this period');
      }

      // Get active salary structure
      const salaryStructure = await this.payrollRepository.findActiveSalaryStructure(processingData.employeeId);
      if (!salaryStructure) {
        throw new NotFoundError('Active salary structure');
      }

      // Calculate salary components
      const daysInMonth = this.getDaysInMonth(processingData.payrollPeriod);
      const daysWorked = processingData.daysWorked || daysInMonth;
      const attendanceRatio = daysWorked / daysInMonth;

      // Calculate basic salary based on days worked
      const basicSalary = Math.round((salaryStructure.basicSalary * attendanceRatio));

      // Calculate allowances
      const houseRentAllowance = salaryStructure.houseRentAllowance
        ? Math.round(salaryStructure.houseRentAllowance * attendanceRatio)
        : 0;
      const medicalAllowance = salaryStructure.medicalAllowance
        ? Math.round(salaryStructure.medicalAllowance * attendanceRatio)
        : 0;
      const transportAllowance = salaryStructure.transportAllowance
        ? Math.round(salaryStructure.transportAllowance * attendanceRatio)
        : 0;
      const otherAllowances = salaryStructure.otherAllowances
        ? Math.round(salaryStructure.otherAllowances * attendanceRatio)
        : 0;

      const totalAllowances =
        houseRentAllowance + medicalAllowance + transportAllowance + otherAllowances;
      const bonus = processingData.bonus || 0;
      const overtime = 0; // Can be calculated separately

      const grossSalary = basicSalary + totalAllowances + bonus + overtime;

      // Calculate annual income for tax calculation
      const monthlyGross = grossSalary;
      const annualIncome = monthlyGross * 12;

      // Calculate tax
      const annualTax = this.calculateIncomeTax(annualIncome);
      const monthlyTax = this.calculateMonthlyTax(annualTax);

      // Calculate deductions
      const providentFund = salaryStructure.providentFund
        ? Math.round(salaryStructure.providentFund * attendanceRatio)
        : 0;
      const advanceDeduction = processingData.advanceDeduction || 0;
      const taxAmount = monthlyTax;
      const otherDeductions = salaryStructure.otherDeductions
        ? Math.round(salaryStructure.otherDeductions * attendanceRatio)
        : 0;

      const totalDeductions = providentFund + taxAmount + advanceDeduction + otherDeductions;

      // Calculate net salary
      const netSalary = grossSalary - totalDeductions;

      // Create salary processing record
      const calculatedSalary = {
        basicSalary,
        allowances: totalAllowances,
        deductions: totalDeductions,
        grossSalary,
        taxAmount,
        providentFund,
        netSalary,
        daysInMonth,
        overtime,
      };

      const processing = await this.payrollRepository.createSalaryProcessing(
        processingData,
        calculatedSalary
      );

      // Update status to processed
      if (processedBy) {
        await this.payrollRepository.updateSalaryProcessingStatus(
          processing.id,
          'processed',
          processedBy
        );
      }

      return await this.payrollRepository.findSalaryProcessingById(processing.id) as SalaryProcessing;
    } catch (error) {
      logger.error('Error processing salary:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to process salary');
    }
  }

  async approveSalary(id: string, approveData: ApproveSalaryDTO, approvedBy?: string): Promise<SalaryProcessing> {
    try {
      const processing = await this.payrollRepository.findSalaryProcessingById(id);
      if (!processing) {
        throw new NotFoundError('Salary processing');
      }

      if (processing.status !== 'processed') {
        throw new ValidationError('Only processed salaries can be approved');
      }

      if (approveData.status === 'approved') {
        await this.payrollRepository.updateSalaryProcessingStatus(
          id,
          'approved',
          undefined,
          approvedBy
        );

        // Generate salary slip
        const slipNumber = `SLIP-${processing.payrollPeriod}-${processing.employeeId.slice(0, 8)}`;
        await this.payrollRepository.createSalarySlip({
          salaryProcessingId: id,
          employeeId: processing.employeeId,
          payrollPeriod: processing.payrollPeriod,
          slipNumber,
        });
      } else {
        await this.payrollRepository.updateSalaryProcessingStatus(id, 'pending');
      }

      return await this.payrollRepository.findSalaryProcessingById(id) as SalaryProcessing;
    } catch (error) {
      logger.error('Error approving salary:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to approve salary');
    }
  }

  async markAsPaid(id: string, paymentDate: string): Promise<SalaryProcessing> {
    try {
      const processing = await this.payrollRepository.findSalaryProcessingById(id);
      if (!processing) {
        throw new NotFoundError('Salary processing');
      }

      if (processing.status !== 'approved') {
        throw new ValidationError('Only approved salaries can be marked as paid');
      }

      return await this.payrollRepository.updateSalaryProcessingStatus(
        id,
        'paid',
        undefined,
        undefined,
        paymentDate
      );
    } catch (error) {
      logger.error('Error marking salary as paid:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to mark salary as paid');
    }
  }

  // ==================== Salary Slips ====================

  async getSalarySlipsByEmployee(employeeId: string, limit: number = 12): Promise<SalarySlip[]> {
    try {
      return await this.payrollRepository.findSalarySlipsByEmployee(employeeId, limit);
    } catch (error) {
      logger.error('Error getting salary slips:', error);
      throw new Error('Failed to fetch salary slips');
    }
  }

  // ==================== Tax Calculation ====================

  async calculateTaxForEmployee(employeeId: string, taxYear: string): Promise<TaxCalculation> {
    try {
      // Get all salary processings for the tax year
      const startPeriod = `${taxYear}-01`;
      const endPeriod = `${taxYear}-12`;

      const allProcessings = await this.payrollRepository.findAllSalaryProcessings(1000, 0, {
        employeeId,
      });

      const yearlyProcessings = allProcessings.filter(
        (p) => p.payrollPeriod >= startPeriod && p.payrollPeriod <= endPeriod && p.status === 'paid'
      );

      const annualSalary = yearlyProcessings.reduce((sum, p) => sum + p.grossSalary, 0) * 12;
      const taxPaid = yearlyProcessings.reduce((sum, p) => sum + p.taxAmount, 0);
      const taxLiability = this.calculateIncomeTax(annualSalary);
      const taxRefund = taxPaid > taxLiability ? taxPaid - taxLiability : 0;

      return {
        employeeId,
        annualSalary,
        taxYear,
        taxableIncome: annualSalary,
        taxLiability,
        taxPaid,
        taxRefund: taxRefund > 0 ? taxRefund : undefined,
      };
    } catch (error) {
      logger.error('Error calculating tax:', error);
      throw new Error('Failed to calculate tax');
    }
  }

  // ==================== Payroll Summary ====================

  async getPayrollSummary(payrollPeriod: string): Promise<PayrollSummary> {
    try {
      const allProcessings = await this.payrollRepository.findAllSalaryProcessings(1000, 0, {
        payrollPeriod,
      });

      const processedEmployees = allProcessings.filter((p) => p.status === 'processed' || p.status === 'approved' || p.status === 'paid');
      const pendingEmployees = allProcessings.filter((p) => p.status === 'pending');

      const totalGrossSalary = allProcessings.reduce((sum, p) => sum + p.grossSalary, 0);
      const totalDeductions = allProcessings.reduce((sum, p) => sum + p.deductions, 0);
      const totalNetSalary = allProcessings.reduce((sum, p) => sum + p.netSalary, 0);
      const totalTax = allProcessings.reduce((sum, p) => sum + p.taxAmount, 0);

      return {
        totalEmployees: allProcessings.length,
        totalGrossSalary,
        totalDeductions,
        totalNetSalary,
        totalTax,
        processedEmployees: processedEmployees.length,
        pendingEmployees: pendingEmployees.length,
      };
    } catch (error) {
      logger.error('Error getting payroll summary:', error);
      throw new Error('Failed to fetch payroll summary');
    }
  }

  // ==================== Helper Methods ====================

  private getDaysInMonth(period: string): number {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }
}

