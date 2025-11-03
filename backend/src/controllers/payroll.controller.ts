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

