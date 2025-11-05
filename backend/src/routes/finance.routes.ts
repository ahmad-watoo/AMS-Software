/**
 * Finance Routes
 * 
 * Defines all finance management API endpoints.
 * 
 * Routes:
 * - Fee Structures: CRUD operations for fee structures
 * - Student Fees: View and manage student fee records
 * - Payments: Payment processing and recording
 * - Reports: Financial reports and summaries
 * 
 * All routes require authentication.
 * Create, update, and view routes require specific permissions.
 * 
 * @module routes/finance.routes
 */

import { Router } from 'express';
import { FinanceController } from '@/controllers/finance.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const financeController = new FinanceController();

// All finance routes require authentication
router.use(authenticate);

// ==================== Fee Structures ====================

/**
 * @route   GET /api/v1/finance/fee-structures
 * @desc    Get all fee structures with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [programId] - Filter by program ID
 * @query  {string} [semester] - Filter by semester
 * @query  {string} [feeType] - Filter by fee type
 * @query  {boolean} [isMandatory] - Filter by mandatory status
 * @returns {Object} Fee structures array and pagination info
 */
router.get('/fee-structures', financeController.getAllFeeStructures);

/**
 * @route   GET /api/v1/finance/fee-structures/:id
 * @desc    Get fee structure by ID
 * @access  Private
 * @param  {string} id - Fee structure ID
 * @returns {FeeStructure} Fee structure object
 */
router.get('/fee-structures/:id', financeController.getFeeStructureById);

/**
 * @route   POST /api/v1/finance/fee-structures
 * @desc    Create a new fee structure
 * @access  Private (Requires finance.create permission)
 * @body   {CreateFeeStructureDTO} Fee structure creation data
 * @returns {FeeStructure} Created fee structure
 */
router.post(
  '/fee-structures',
  requirePermission('finance', 'create'),
  financeController.createFeeStructure
);

/**
 * @route   PUT /api/v1/finance/fee-structures/:id
 * @desc    Update a fee structure
 * @access  Private (Requires finance.update permission)
 * @param  {string} id - Fee structure ID
 * @body   {UpdateFeeStructureDTO} Partial fee structure data to update
 * @returns {FeeStructure} Updated fee structure
 */
router.put(
  '/fee-structures/:id',
  requirePermission('finance', 'update'),
  financeController.updateFeeStructure
);

// ==================== Student Fees ====================

/**
 * @route   GET /api/v1/finance/student-fees
 * @desc    Get all student fees with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [semester] - Filter by semester
 * @query  {string} [paymentStatus] - Filter by payment status
 * @returns {Object} Student fees array and pagination info
 */
router.get('/student-fees', financeController.getAllStudentFees);

/**
 * @route   GET /api/v1/finance/student-fees/:id
 * @desc    Get student fee by ID
 * @access  Private
 * @param  {string} id - Student fee ID
 * @returns {StudentFee} Student fee object
 */
router.get('/student-fees/:id', financeController.getStudentFeeById);

/**
 * @route   GET /api/v1/finance/students/:studentId/summary
 * @desc    Get student financial summary
 * @access  Private
 * @param  {string} studentId - Student ID
 * @query  {string} semester - Semester identifier
 * @returns {StudentFinancialSummary} Student financial summary
 */
router.get('/students/:studentId/summary', financeController.getStudentFinancialSummary);

// ==================== Payments ====================

/**
 * @route   GET /api/v1/finance/payments
 * @desc    Get all payments with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [studentFeeId] - Filter by student fee ID
 * @query  {string} [paymentMethod] - Filter by payment method
 * @query  {string} [startDate] - Filter by start date
 * @query  {string} [endDate] - Filter by end date
 * @returns {Object} Payments array and pagination info
 */
router.get('/payments', financeController.getAllPayments);

/**
 * @route   POST /api/v1/finance/payments
 * @desc    Create a new payment
 * @access  Private (Requires finance.create permission)
 * @body   {CreatePaymentDTO} Payment creation data
 * @returns {Object} Created payment and updated fee
 */
router.post(
  '/payments',
  requirePermission('finance', 'create'),
  financeController.createPayment
);

// ==================== Financial Reports ====================

/**
 * @route   GET /api/v1/finance/reports
 * @desc    Get financial report for a date range
 * @access  Private (Requires finance.view permission)
 * @query  {string} startDate - Start date for the report (YYYY-MM-DD)
 * @query  {string} endDate - End date for the report (YYYY-MM-DD)
 * @query  {string} [semester] - Optional semester filter
 * @returns {FinancialReport} Financial report
 */
router.get(
  '/reports',
  requirePermission('finance', 'view'),
  financeController.getFinancialReport
);

export default router;
