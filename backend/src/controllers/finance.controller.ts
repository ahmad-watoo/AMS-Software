/**
 * Finance Controller
 * 
 * Handles HTTP requests for finance management endpoints.
 * Manages fee structures, student fees, payments, and financial reports.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/finance.controller
 */

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

  /**
   * Get All Fee Structures Endpoint Handler
   * 
   * Retrieves all fee structures with pagination and optional filters.
   * 
   * @route GET /api/v1/finance/fee-structures
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [programId] - Filter by program ID
   * @query {string} [semester] - Filter by semester
   * @query {string} [feeType] - Filter by fee type
   * @query {boolean} [isMandatory] - Filter by mandatory status
   * @returns {Object} Fee structures array and pagination info
   * 
   * @example
   * GET /api/v1/finance/fee-structures?page=1&limit=20&programId=program123&feeType=tuition
   */
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

  /**
   * Get Fee Structure By ID Endpoint Handler
   * 
   * Retrieves a specific fee structure by ID.
   * 
   * @route GET /api/v1/finance/fee-structures/:id
   * @access Private
   * @param {string} id - Fee structure ID
   * @returns {FeeStructure} Fee structure object
   */
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

  /**
   * Create Fee Structure Endpoint Handler
   * 
   * Creates a new fee structure.
   * 
   * @route POST /api/v1/finance/fee-structures
   * @access Private (Requires finance.create permission)
   * @body {CreateFeeStructureDTO} Fee structure creation data
   * @returns {FeeStructure} Created fee structure
   * 
   * @example
   * POST /api/v1/finance/fee-structures
   * Body: {
   *   programId: "program123",
   *   semester: "2024-Fall",
   *   feeType: "tuition",
   *   amount: 50000,
   *   description: "Tuition fee for Fall 2024"
   * }
   */
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

  /**
   * Update Fee Structure Endpoint Handler
   * 
   * Updates an existing fee structure.
   * 
   * @route PUT /api/v1/finance/fee-structures/:id
   * @access Private (Requires finance.update permission)
   * @param {string} id - Fee structure ID
   * @body {UpdateFeeStructureDTO} Partial fee structure data to update
   * @returns {FeeStructure} Updated fee structure
   * 
   * @example
   * PUT /api/v1/finance/fee-structures/structure123
   * Body: {
   *   amount: 55000,
   *   description: "Updated tuition fee"
   * }
   */
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

  /**
   * Get All Student Fees Endpoint Handler
   * 
   * Retrieves all student fees with pagination and optional filters.
   * 
   * @route GET /api/v1/finance/student-fees
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [semester] - Filter by semester
   * @query {string} [paymentStatus] - Filter by payment status
   * @returns {Object} Student fees array and pagination info
   * 
   * @example
   * GET /api/v1/finance/student-fees?page=1&limit=20&studentId=student123&paymentStatus=pending
   */
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

  /**
   * Get Student Fee By ID Endpoint Handler
   * 
   * Retrieves a specific student fee by ID.
   * 
   * @route GET /api/v1/finance/student-fees/:id
   * @access Private
   * @param {string} id - Student fee ID
   * @returns {StudentFee} Student fee object
   */
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

  /**
   * Get Student Financial Summary Endpoint Handler
   * 
   * Retrieves comprehensive financial summary for a student.
   * 
   * @route GET /api/v1/finance/students/:studentId/summary
   * @access Private
   * @param {string} studentId - Student ID
   * @query {string} semester - Semester identifier
   * @returns {StudentFinancialSummary} Student financial summary
   * 
   * @example
   * GET /api/v1/finance/students/student123/summary?semester=2024-Fall
   */
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

  /**
   * Get All Payments Endpoint Handler
   * 
   * Retrieves all payments with pagination and optional filters.
   * 
   * @route GET /api/v1/finance/payments
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [studentFeeId] - Filter by student fee ID
   * @query {string} [paymentMethod] - Filter by payment method
   * @query {string} [startDate] - Filter by start date
   * @query {string} [endDate] - Filter by end date
   * @returns {Object} Payments array and pagination info
   * 
   * @example
   * GET /api/v1/finance/payments?page=1&limit=20&studentId=student123&startDate=2024-09-01&endDate=2024-10-31
   */
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

  /**
   * Create Payment Endpoint Handler
   * 
   * Creates a new payment record and updates the associated student fee.
   * 
   * @route POST /api/v1/finance/payments
   * @access Private (Requires finance.create permission)
   * @body {CreatePaymentDTO} Payment creation data
   * @returns {Object} Created payment and updated fee
   * 
   * @example
   * POST /api/v1/finance/payments
   * Body: {
   *   studentFeeId: "fee123",
   *   studentId: "student456",
   *   amount: 25000,
   *   paymentDate: "2024-10-15",
   *   paymentMethod: "bank_transfer",
   *   transactionId: "TXN789"
   * }
   */
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

  /**
   * Get Financial Report Endpoint Handler
   * 
   * Generates a comprehensive financial report for a date range.
   * 
   * @route GET /api/v1/finance/reports
   * @access Private (Requires finance.view permission)
   * @query {string} startDate - Start date for the report (YYYY-MM-DD)
   * @query {string} endDate - End date for the report (YYYY-MM-DD)
   * @query {string} [semester] - Optional semester filter
   * @returns {FinancialReport} Financial report
   * 
   * @example
   * GET /api/v1/finance/reports?startDate=2024-09-01&endDate=2024-10-31&semester=2024-Fall
   */
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
