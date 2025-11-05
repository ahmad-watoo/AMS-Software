/**
 * Payroll Controller
 * 
 * Handles HTTP requests for payroll management endpoints.
 * Manages salary structures, salary processing, approvals, and tax calculations.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/payroll.controller
 */

import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '@/services/payroll.service';
import {
  CreateSalaryStructureDTO,
  UpdateSalaryStructureDTO,
  ProcessSalaryDTO,
  ApproveSalaryDTO,
} from '@/models/Payroll.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class PayrollController {
  private payrollService: PayrollService;

  constructor() {
    this.payrollService = new PayrollService();
  }

  // ==================== Salary Structures ====================

  /**
   * Get All Salary Structures Endpoint Handler
   * 
   * Retrieves all salary structures with pagination and optional filters.
   * 
   * @route GET /api/v1/payroll/salary-structures
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [employeeId] - Filter by employee ID
   * @query {boolean} [isActive] - Filter by active status
   * @returns {Object} Salary structures array and pagination info
   * 
   * @example
   * GET /api/v1/payroll/salary-structures?page=1&limit=20&employeeId=employee123&isActive=true
   */
  getAllSalaryStructures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        employeeId: req.query.employeeId as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      };

      const result = await this.payrollService.getAllSalaryStructures(limit, offset, filters);

      sendSuccess(res, {
        structures: result.structures,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all salary structures error:', error);
      next(error);
    }
  };

  /**
   * Get Salary Structure By ID Endpoint Handler
   * 
   * Retrieves a specific salary structure by ID.
   * 
   * @route GET /api/v1/payroll/salary-structures/:id
   * @access Private
   * @param {string} id - Salary structure ID
   * @returns {SalaryStructure} Salary structure object
   */
  getSalaryStructureById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const structure = await this.payrollService.getSalaryStructureById(id);
      sendSuccess(res, structure);
    } catch (error) {
      logger.error('Get salary structure by ID error:', error);
      next(error);
    }
  };

  /**
   * Get Active Salary Structure Endpoint Handler
   * 
   * Retrieves the active salary structure for an employee.
   * 
   * @route GET /api/v1/payroll/employees/:employeeId/salary-structure
   * @access Private
   * @param {string} employeeId - Employee ID
   * @returns {SalaryStructure} Active salary structure
   */
  getActiveSalaryStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const structure = await this.payrollService.getActiveSalaryStructure(employeeId);
      sendSuccess(res, structure);
    } catch (error) {
      logger.error('Get active salary structure error:', error);
      next(error);
    }
  };

  /**
   * Create Salary Structure Endpoint Handler
   * 
   * Creates a new salary structure.
   * 
   * @route POST /api/v1/payroll/salary-structures
   * @access Private (Requires payroll.create permission)
   * @body {CreateSalaryStructureDTO} Salary structure creation data
   * @returns {SalaryStructure} Created salary structure
   * 
   * @example
   * POST /api/v1/payroll/salary-structures
   * Body: {
   *   employeeId: "employee123",
   *   basicSalary: 100000,
   *   houseRentAllowance: 50000,
   *   medicalAllowance: 10000,
   *   effectiveDate: "2024-01-01"
   * }
   */
  createSalaryStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const structureData: CreateSalaryStructureDTO = {
        employeeId: req.body.employeeId,
        basicSalary: req.body.basicSalary,
        houseRentAllowance: req.body.houseRentAllowance,
        medicalAllowance: req.body.medicalAllowance,
        transportAllowance: req.body.transportAllowance,
        otherAllowances: req.body.otherAllowances,
        providentFund: req.body.providentFund,
        taxDeduction: req.body.taxDeduction,
        otherDeductions: req.body.otherDeductions,
        effectiveDate: req.body.effectiveDate,
      };

      if (!structureData.employeeId || !structureData.basicSalary || !structureData.effectiveDate) {
        throw new ValidationError('Employee ID, basic salary, and effective date are required');
      }

      const structure = await this.payrollService.createSalaryStructure(structureData);
      sendSuccess(res, structure, 'Salary structure created successfully', 201);
    } catch (error) {
      logger.error('Create salary structure error:', error);
      next(error);
    }
  };

  /**
   * Update Salary Structure Endpoint Handler
   * 
   * Updates an existing salary structure.
   * 
   * @route PUT /api/v1/payroll/salary-structures/:id
   * @access Private (Requires payroll.update permission)
   * @param {string} id - Salary structure ID
   * @body {UpdateSalaryStructureDTO} Partial structure data to update
   * @returns {SalaryStructure} Updated salary structure
   * 
   * @example
   * PUT /api/v1/payroll/salary-structures/structure123
   * Body: {
   *   basicSalary: 120000,
   *   houseRentAllowance: 60000
   * }
   */
  updateSalaryStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const structureData: UpdateSalaryStructureDTO = {
        basicSalary: req.body.basicSalary,
        houseRentAllowance: req.body.houseRentAllowance,
        medicalAllowance: req.body.medicalAllowance,
        transportAllowance: req.body.transportAllowance,
        otherAllowances: req.body.otherAllowances,
        providentFund: req.body.providentFund,
        taxDeduction: req.body.taxDeduction,
        otherDeductions: req.body.otherDeductions,
        effectiveDate: req.body.effectiveDate,
        isActive: req.body.isActive,
      };

      const structure = await this.payrollService.updateSalaryStructure(id, structureData);
      sendSuccess(res, structure, 'Salary structure updated successfully');
    } catch (error) {
      logger.error('Update salary structure error:', error);
      next(error);
    }
  };

  // ==================== Salary Processing ====================

  /**
   * Get All Salary Processings Endpoint Handler
   * 
   * Retrieves all salary processings with pagination and optional filters.
   * 
   * @route GET /api/v1/payroll/processings
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [employeeId] - Filter by employee ID
   * @query {string} [payrollPeriod] - Filter by payroll period (YYYY-MM)
   * @query {string} [status] - Filter by status
   * @returns {Object} Salary processings array and pagination info
   * 
   * @example
   * GET /api/v1/payroll/processings?page=1&limit=20&payrollPeriod=2024-10&status=processed
   */
  getAllSalaryProcessings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        employeeId: req.query.employeeId as string,
        payrollPeriod: req.query.payrollPeriod as string,
        status: req.query.status as string,
      };

      const result = await this.payrollService.getAllSalaryProcessings(limit, offset, filters);

      sendSuccess(res, {
        processings: result.processings,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all salary processings error:', error);
      next(error);
    }
  };

  /**
   * Get Salary Processing By ID Endpoint Handler
   * 
   * Retrieves a specific salary processing by ID.
   * 
   * @route GET /api/v1/payroll/processings/:id
   * @access Private
   * @param {string} id - Salary processing ID
   * @returns {SalaryProcessing} Salary processing object
   */
  getSalaryProcessingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const processing = await this.payrollService.getSalaryProcessingById(id);
      sendSuccess(res, processing);
    } catch (error) {
      logger.error('Get salary processing by ID error:', error);
      next(error);
    }
  };

  /**
   * Process Salary Endpoint Handler
   * 
   * Processes monthly salary for an employee with comprehensive calculations.
   * 
   * @route POST /api/v1/payroll/processings
   * @access Private (Requires payroll.create permission)
   * @body {ProcessSalaryDTO} Salary processing data
   * @returns {SalaryProcessing} Created salary processing record
   * 
   * @example
   * POST /api/v1/payroll/processings
   * Body: {
   *   employeeId: "employee123",
   *   payrollPeriod: "2024-10",
   *   daysWorked: 25,
   *   bonus: 10000
   * }
   */
  processSalary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processingData: ProcessSalaryDTO = {
        employeeId: req.body.employeeId,
        payrollPeriod: req.body.payrollPeriod,
        daysWorked: req.body.daysWorked,
        bonus: req.body.bonus,
        overtime: req.body.overtime,
        advanceDeduction: req.body.advanceDeduction,
        remarks: req.body.remarks,
      };

      if (!processingData.employeeId || !processingData.payrollPeriod) {
        throw new ValidationError('Employee ID and payroll period are required');
      }

      const user = (req as any).user;
      const processing = await this.payrollService.processSalary(processingData, user?.id);
      sendSuccess(res, processing, 'Salary processed successfully', 201);
    } catch (error) {
      logger.error('Process salary error:', error);
      next(error);
    }
  };

  /**
   * Approve Salary Endpoint Handler
   * 
   * Approves a processed salary and generates a salary slip.
   * 
   * @route POST /api/v1/payroll/processings/:id/approve
   * @access Private (Requires payroll.approve permission)
   * @param {string} id - Salary processing ID
   * @body {ApproveSalaryDTO} Approval data
   * @returns {SalaryProcessing} Updated salary processing
   * 
   * @example
   * POST /api/v1/payroll/processings/processing123/approve
   * Body: {
   *   status: "approved",
   *   remarks: "Approved for payment"
   * }
   */
  approveSalary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approveData: ApproveSalaryDTO = {
        status: req.body.status,
        remarks: req.body.remarks,
      };

      if (!approveData.status || !['approved', 'rejected'].includes(approveData.status)) {
        throw new ValidationError('Status must be either approved or rejected');
      }

      const user = (req as any).user;
      const processing = await this.payrollService.approveSalary(id, approveData, user?.id);
      sendSuccess(res, processing, `Salary ${approveData.status} successfully`);
    } catch (error) {
      logger.error('Approve salary error:', error);
      next(error);
    }
  };

  /**
   * Mark Salary As Paid Endpoint Handler
   * 
   * Marks an approved salary as paid with payment date.
   * 
   * @route POST /api/v1/payroll/processings/:id/mark-paid
   * @access Private (Requires payroll.update permission)
   * @param {string} id - Salary processing ID
   * @body {Object} Payment data
   * @body {string} body.paymentDate - Payment date (YYYY-MM-DD)
   * @returns {SalaryProcessing} Updated salary processing
   * 
   * @example
   * POST /api/v1/payroll/processings/processing123/mark-paid
   * Body: {
   *   paymentDate: "2024-10-31"
   * }
   */
  markAsPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentDate } = req.body;

      if (!paymentDate) {
        throw new ValidationError('Payment date is required');
      }

      const processing = await this.payrollService.markAsPaid(id, paymentDate);
      sendSuccess(res, processing, 'Salary marked as paid successfully');
    } catch (error) {
      logger.error('Mark salary as paid error:', error);
      next(error);
    }
  };

  // ==================== Salary Slips ====================

  /**
   * Get Salary Slips By Employee Endpoint Handler
   * 
   * Retrieves salary slips for a specific employee.
   * 
   * @route GET /api/v1/payroll/employees/:employeeId/salary-slips
   * @access Private
   * @param {string} employeeId - Employee ID
   * @query {number} [limit=12] - Maximum number of slips to return
   * @returns {SalarySlip[]} Array of salary slips
   * 
   * @example
   * GET /api/v1/payroll/employees/employee123/salary-slips?limit=6
   */
  getSalarySlipsByEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const limit = parseInt(req.query.limit as string) || 12;
      const slips = await this.payrollService.getSalarySlipsByEmployee(employeeId, limit);
      sendSuccess(res, slips);
    } catch (error) {
      logger.error('Get salary slips error:', error);
      next(error);
    }
  };

  // ==================== Tax Calculation ====================

  /**
   * Calculate Tax For Employee Endpoint Handler
   * 
   * Calculates annual tax liability for an employee for a tax year.
   * 
   * @route GET /api/v1/payroll/employees/:employeeId/tax
   * @access Private
   * @param {string} employeeId - Employee ID
   * @query {string} taxYear - Tax year (YYYY)
   * @returns {TaxCalculation} Tax calculation with liability and refund
   * 
   * @example
   * GET /api/v1/payroll/employees/employee123/tax?taxYear=2024
   */
  calculateTaxForEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { taxYear } = req.query;

      if (!taxYear) {
        throw new ValidationError('Tax year is required');
      }

      const taxCalculation = await this.payrollService.calculateTaxForEmployee(
        employeeId,
        taxYear as string
      );
      sendSuccess(res, taxCalculation);
    } catch (error) {
      logger.error('Calculate tax error:', error);
      next(error);
    }
  };

  // ==================== Payroll Summary ====================

  /**
   * Get Payroll Summary Endpoint Handler
   * 
   * Generates a comprehensive payroll summary for a payroll period.
   * 
   * @route GET /api/v1/payroll/summary
   * @access Private
   * @query {string} payrollPeriod - Payroll period (YYYY-MM)
   * @returns {PayrollSummary} Payroll summary with totals and statistics
   * 
   * @example
   * GET /api/v1/payroll/summary?payrollPeriod=2024-10
   */
  getPayrollSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { payrollPeriod } = req.query;

      if (!payrollPeriod) {
        throw new ValidationError('Payroll period is required');
      }

      const summary = await this.payrollService.getPayrollSummary(payrollPeriod as string);
      sendSuccess(res, summary);
    } catch (error) {
      logger.error('Get payroll summary error:', error);
      next(error);
    }
  };
}
