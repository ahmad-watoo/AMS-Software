import { Request, Response, NextFunction } from 'express';
import { FinanceService } from '@/services/finance.service';
import {
  CreateFeeStructureDTO,
  UpdateFeeStructureDTO,
  CreatePaymentDTO,
} from '@/models/Finance.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class FinanceController {
  private financeService: FinanceService;

  constructor() {
    this.financeService = new FinanceService();
  }

  // ==================== Fee Structures ====================

  getAllFeeStructures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        programId: req.query.programId as string,
        semester: req.query.semester as string,
        feeType: req.query.feeType as string,
        isMandatory: req.query.isMandatory ? req.query.isMandatory === 'true' : undefined,
      };

      const result = await this.financeService.getAllFeeStructures(limit, offset, filters);

      sendSuccess(res, {
        feeStructures: result.feeStructures,
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
      logger.error('Get all fee structures error:', error);
      next(error);
    }
  };

  getFeeStructureById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const structure = await this.financeService.getFeeStructureById(id);
      sendSuccess(res, structure);
    } catch (error) {
      logger.error('Get fee structure by ID error:', error);
      next(error);
    }
  };

  createFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feeStructureData: CreateFeeStructureDTO = {
        programId: req.body.programId,
        semester: req.body.semester,
        feeType: req.body.feeType,
        amount: req.body.amount,
        isMandatory: req.body.isMandatory,
        effectiveFrom: req.body.effectiveFrom,
        effectiveTo: req.body.effectiveTo,
        description: req.body.description,
      };

      if (!feeStructureData.semester || !feeStructureData.feeType || !feeStructureData.amount) {
        throw new ValidationError('Semester, fee type, and amount are required');
      }

      const structure = await this.financeService.createFeeStructure(feeStructureData);
      sendSuccess(res, structure, 'Fee structure created successfully', 201);
    } catch (error) {
      logger.error('Create fee structure error:', error);
      next(error);
    }
  };

  updateFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const feeStructureData: UpdateFeeStructureDTO = {
        amount: req.body.amount,
        isMandatory: req.body.isMandatory,
        effectiveFrom: req.body.effectiveFrom,
        effectiveTo: req.body.effectiveTo,
        description: req.body.description,
      };

      const structure = await this.financeService.updateFeeStructure(id, feeStructureData);
      sendSuccess(res, structure, 'Fee structure updated successfully');
    } catch (error) {
      logger.error('Update fee structure error:', error);
      next(error);
    }
  };

  // ==================== Student Fees ====================

  getAllStudentFees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        studentId: req.query.studentId as string,
        semester: req.query.semester as string,
        paymentStatus: req.query.paymentStatus as string,
      };

      const result = await this.financeService.getAllStudentFees(limit, offset, filters);

      sendSuccess(res, {
        fees: result.fees,
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
      logger.error('Get all student fees error:', error);
      next(error);
    }
  };

  getStudentFeeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const fee = await this.financeService.getStudentFeeById(id);
      sendSuccess(res, fee);
    } catch (error) {
      logger.error('Get student fee by ID error:', error);
      next(error);
    }
  };

  getStudentFinancialSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { semester } = req.query;

      if (!semester) {
        throw new ValidationError('Semester is required');
      }

      const summary = await this.financeService.getStudentFinancialSummary(studentId, semester as string);
      sendSuccess(res, summary);
    } catch (error) {
      logger.error('Get student financial summary error:', error);
      next(error);
    }
  };

  // ==================== Payments ====================

  getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        studentId: req.query.studentId as string,
        studentFeeId: req.query.studentFeeId as string,
        paymentMethod: req.query.paymentMethod as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await this.financeService.getAllPayments(limit, offset, filters);

      sendSuccess(res, {
        payments: result.payments,
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
      logger.error('Get all payments error:', error);
      next(error);
    }
  };

  createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentData: CreatePaymentDTO = {
        studentFeeId: req.body.studentFeeId,
        studentId: req.body.studentId,
        amount: req.body.amount,
        paymentDate: req.body.paymentDate,
        paymentMethod: req.body.paymentMethod,
        transactionId: req.body.transactionId,
        receiptNumber: req.body.receiptNumber,
        remarks: req.body.remarks,
      };

      if (!paymentData.studentFeeId || !paymentData.studentId || !paymentData.amount || !paymentData.paymentDate) {
        throw new ValidationError('Student fee ID, student ID, amount, and payment date are required');
      }

      const receivedBy = req.user?.userId;
      const result = await this.financeService.createPayment(paymentData, receivedBy);
      sendSuccess(res, result, 'Payment recorded successfully', 201);
    } catch (error) {
      logger.error('Create payment error:', error);
      next(error);
    }
  };

  getFinancialReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, semester } = req.query;

      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date are required');
      }

      const report = await this.financeService.getFinancialReport(
        startDate as string,
        endDate as string,
        semester as string
      );
      sendSuccess(res, report);
    } catch (error) {
      logger.error('Get financial report error:', error);
      next(error);
    }
  };
}

