/**
 * Payroll Service
 * 
 * This service handles all payroll management business logic including:
 * - Salary structure management (CRUD operations)
 * - Salary processing with tax calculations
 * - Salary approval workflow
 * - Salary slip generation
 * - Tax calculations according to Pakistan tax laws
 * - Payroll summaries and reports
 * 
 * The payroll system manages:
 * - Salary structures with allowances and deductions
 * - Monthly salary processing with attendance-based calculations
 * - Income tax calculations (Pakistan tax brackets FY 2024)
 * - Salary approval and payment tracking
 * - Salary slip generation and history
 * 
 * @module services/payroll.service
 */

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

  /**
   * Get all salary structures with pagination and filters
   * 
   * Retrieves salary structures with optional filtering by employee and active status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of structures to return
   * @param {number} [offset=0] - Number of structures to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.employeeId] - Filter by employee ID
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<{structures: SalaryStructure[], total: number}>} Structures and total count
   * 
   * @example
   * const { structures, total } = await payrollService.getAllSalaryStructures(20, 0, {
   *   employeeId: 'employee123',
   *   isActive: true
   * });
   */
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

  /**
   * Get salary structure by ID
   * 
   * Retrieves a specific salary structure by its ID.
   * 
   * @param {string} id - Salary structure ID
   * @returns {Promise<SalaryStructure>} Salary structure object
   * @throws {NotFoundError} If structure not found
   */
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

  /**
   * Get active salary structure for an employee
   * 
   * Retrieves the currently active salary structure for an employee.
   * 
   * @param {string} employeeId - Employee ID
   * @returns {Promise<SalaryStructure>} Active salary structure
   * @throws {NotFoundError} If active structure not found
   */
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

  /**
   * Create a salary structure
   * 
   * Creates a new salary structure with validation.
   * Validates required fields and basic salary amount.
   * 
   * @param {CreateSalaryStructureDTO} structureData - Salary structure creation data
   * @returns {Promise<SalaryStructure>} Created salary structure
   * @throws {ValidationError} If structure data is invalid
   * 
   * @example
   * const structure = await payrollService.createSalaryStructure({
   *   employeeId: 'employee123',
   *   basicSalary: 100000,
   *   houseRentAllowance: 50000,
   *   medicalAllowance: 10000,
   *   effectiveDate: '2024-01-01'
   * });
   */
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

  /**
   * Update a salary structure
   * 
   * Updates an existing salary structure's information.
   * Validates basic salary if being updated.
   * 
   * @param {string} id - Salary structure ID
   * @param {UpdateSalaryStructureDTO} structureData - Partial structure data to update
   * @returns {Promise<SalaryStructure>} Updated salary structure
   * @throws {NotFoundError} If structure not found
   * @throws {ValidationError} If basic salary is invalid
   */
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
   * 
   * Calculates annual income tax based on Pakistan tax brackets:
   * - Up to PKR 600,000: 0%
   * - PKR 600,001 - 1,200,000: 2.5%
   * - PKR 1,200,001 - 2,400,000: 12.5%
   * - PKR 2,400,001 - 3,600,000: 20%
   * - PKR 3,600,001 - 6,000,000: 25%
   * - Above PKR 6,000,000: 32.5%
   * 
   * @param {number} annualIncome - Annual income in PKR
   * @returns {number} Calculated annual tax amount (rounded)
   * 
   * @example
   * const tax = payrollService.calculateIncomeTax(1500000);
   * console.log(tax); // 112500 (calculated based on tax brackets)
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
   * 
   * Divides annual tax by 12 to get monthly tax deduction.
   * 
   * @param {number} annualTax - Annual tax amount
   * @returns {number} Monthly tax amount (rounded)
   * 
   * @example
   * const monthlyTax = payrollService.calculateMonthlyTax(120000);
   * console.log(monthlyTax); // 10000
   */
  calculateMonthlyTax(annualTax: number): number {
    return Math.round(annualTax / 12);
  }

  // ==================== Salary Processing ====================

  /**
   * Get all salary processings with pagination and filters
   * 
   * Retrieves salary processings with optional filtering by employee, payroll period,
   * and status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of processings to return
   * @param {number} [offset=0] - Number of processings to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.employeeId] - Filter by employee ID
   * @param {string} [filters.payrollPeriod] - Filter by payroll period (YYYY-MM)
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<{processings: SalaryProcessing[], total: number}>} Processings and total count
   * 
   * @example
   * const { processings, total } = await payrollService.getAllSalaryProcessings(20, 0, {
   *   payrollPeriod: '2024-10',
   *   status: 'processed'
   * });
   */
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

  /**
   * Get salary processing by ID
   * 
   * Retrieves a specific salary processing by its ID.
   * 
   * @param {string} id - Salary processing ID
   * @returns {Promise<SalaryProcessing>} Salary processing object
   * @throws {NotFoundError} If processing not found
   */
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

  /**
   * Process salary for an employee
   * 
   * Processes monthly salary with comprehensive calculations including:
   * - Basic salary based on attendance ratio
   * - Allowances (HRA, medical, transport, etc.)
   * - Tax calculations (Pakistan tax brackets)
   * - Deductions (PF, advance, tax, etc.)
   * - Net salary calculation
   * 
   * @param {ProcessSalaryDTO} processingData - Salary processing data
   * @param {string} [processedBy] - ID of user processing the salary
   * @returns {Promise<SalaryProcessing>} Created salary processing record
   * @throws {ValidationError} If processing data is invalid
   * @throws {NotFoundError} If salary structure not found
   * 
   * @example
   * const processing = await payrollService.processSalary({
   *   employeeId: 'employee123',
   *   payrollPeriod: '2024-10',
   *   daysWorked: 25,
   *   bonus: 10000
   * }, 'hr456');
   */
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

  /**
   * Approve a processed salary
   * 
   * Approves a processed salary and generates a salary slip.
   * Only processed salaries can be approved.
   * 
   * @param {string} id - Salary processing ID
   * @param {ApproveSalaryDTO} approveData - Approval data
   * @param {string} [approvedBy] - ID of user approving the salary
   * @returns {Promise<SalaryProcessing>} Updated salary processing
   * @throws {NotFoundError} If processing not found
   * @throws {ValidationError} If salary is not in processed status
   * 
   * @example
   * const processing = await payrollService.approveSalary('processing123', {
   *   status: 'approved',
   *   remarks: 'Approved for payment'
   * }, 'manager456');
   */
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

  /**
   * Mark salary as paid
   * 
   * Marks an approved salary as paid with payment date.
   * Only approved salaries can be marked as paid.
   * 
   * @param {string} id - Salary processing ID
   * @param {string} paymentDate - Payment date (YYYY-MM-DD)
   * @returns {Promise<SalaryProcessing>} Updated salary processing
   * @throws {NotFoundError} If processing not found
   * @throws {ValidationError} If salary is not approved
   */
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

  /**
   * Get salary slips for an employee
   * 
   * Retrieves salary slips for a specific employee, limited to recent slips.
   * 
   * @param {string} employeeId - Employee ID
   * @param {number} [limit=12] - Maximum number of slips to return (default: 12 months)
   * @returns {Promise<SalarySlip[]>} Array of salary slips
   * 
   * @example
   * const slips = await payrollService.getSalarySlipsByEmployee('employee123', 6);
   */
  async getSalarySlipsByEmployee(employeeId: string, limit: number = 12): Promise<SalarySlip[]> {
    try {
      return await this.payrollRepository.findSalarySlipsByEmployee(employeeId, limit);
    } catch (error) {
      logger.error('Error getting salary slips:', error);
      throw new Error('Failed to fetch salary slips');
    }
  }

  // ==================== Tax Calculation ====================

  /**
   * Calculate tax for an employee for a tax year
   * 
   * Calculates annual tax liability based on paid salaries for a tax year.
   * Includes tax paid, tax liability, and potential tax refund.
   * 
   * @param {string} employeeId - Employee ID
   * @param {string} taxYear - Tax year (YYYY)
   * @returns {Promise<TaxCalculation>} Tax calculation with liability and refund
   * 
   * @example
   * const taxCalc = await payrollService.calculateTaxForEmployee('employee123', '2024');
   * console.log(taxCalc.taxLiability); // 120000
   * console.log(taxCalc.taxPaid); // 115000
   */
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

  /**
   * Get payroll summary for a period
   * 
   * Generates a comprehensive payroll summary for a specific payroll period.
   * Includes totals for gross salary, deductions, net salary, tax, and employee counts.
   * 
   * @param {string} payrollPeriod - Payroll period (YYYY-MM)
   * @returns {Promise<PayrollSummary>} Payroll summary with totals and statistics
   * 
   * @example
   * const summary = await payrollService.getPayrollSummary('2024-10');
   * console.log(summary.totalGrossSalary); // 5000000
   * console.log(summary.totalNetSalary); // 4500000
   */
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

  /**
   * Get number of days in a month for a given period
   * 
   * Calculates the number of days in a month based on payroll period.
   * 
   * @private
   * @param {string} period - Payroll period (YYYY-MM)
   * @returns {number} Number of days in the month
   * 
   * @example
   * const days = this.getDaysInMonth('2024-10'); // 31
   */
  private getDaysInMonth(period: string): number {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }
}
