import { Router } from 'express';
import { FinanceController } from '@/controllers/finance.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const financeController = new FinanceController();

// All finance routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/finance/fee-structures
 * @desc    Get all fee structures (with pagination and filters)
 * @access  Private
 */
router.get('/fee-structures', financeController.getAllFeeStructures);

/**
 * @route   GET /api/v1/finance/fee-structures/:id
 * @desc    Get fee structure by ID
 * @access  Private
 */
router.get('/fee-structures/:id', financeController.getFeeStructureById);

/**
 * @route   POST /api/v1/finance/fee-structures
 * @desc    Create a new fee structure
 * @access  Private (Requires finance.create permission)
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
 */
router.put(
  '/fee-structures/:id',
  requirePermission('finance', 'update'),
  financeController.updateFeeStructure
);

/**
 * @route   GET /api/v1/finance/student-fees
 * @desc    Get all student fees (with pagination and filters)
 * @access  Private
 */
router.get('/student-fees', financeController.getAllStudentFees);

/**
 * @route   GET /api/v1/finance/student-fees/:id
 * @desc    Get student fee by ID
 * @access  Private
 */
router.get('/student-fees/:id', financeController.getStudentFeeById);

/**
 * @route   GET /api/v1/finance/students/:studentId/summary
 * @desc    Get student financial summary
 * @access  Private
 */
router.get('/students/:studentId/summary', financeController.getStudentFinancialSummary);

/**
 * @route   GET /api/v1/finance/payments
 * @desc    Get all payments (with pagination and filters)
 * @access  Private
 */
router.get('/payments', financeController.getAllPayments);

/**
 * @route   POST /api/v1/finance/payments
 * @desc    Create a new payment
 * @access  Private (Requires finance.create permission)
 */
router.post(
  '/payments',
  requirePermission('finance', 'create'),
  financeController.createPayment
);

/**
 * @route   GET /api/v1/finance/reports
 * @desc    Get financial report
 * @access  Private (Requires finance.view permission)
 */
router.get(
  '/reports',
  requirePermission('finance', 'view'),
  financeController.getFinancialReport
);

export default router;

