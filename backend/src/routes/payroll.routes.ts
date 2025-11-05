/**
 * Payroll Routes
 * 
 * Defines all payroll management API endpoints.
 * 
 * Routes:
 * - Salary Structures: CRUD operations for salary structures
 * - Salary Processing: Salary calculation, approval, and payment tracking
 * - Salary Slips: Salary slip generation and retrieval
 * - Tax Calculation: Annual tax calculations and certificates
 * - Payroll Summary: Period-based payroll summaries
 * 
 * All routes require authentication.
 * Create, update, and approve routes require specific permissions.
 * 
 * @module routes/payroll.routes
 */

import { Router } from 'express';
import { PayrollController } from '@/controllers/payroll.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const payrollController = new PayrollController();

// All payroll routes require authentication
router.use(authenticate);

// ==================== Salary Structures ====================

/**
 * @route   GET /api/v1/payroll/salary-structures
 * @desc    Get all salary structures with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [employeeId] - Filter by employee ID
 * @query  {boolean} [isActive] - Filter by active status
 * @returns {Object} Salary structures array and pagination info
 */
router.get('/salary-structures', payrollController.getAllSalaryStructures);

/**
 * @route   GET /api/v1/payroll/salary-structures/:id
 * @desc    Get salary structure by ID
 * @access  Private
 * @param  {string} id - Salary structure ID
 * @returns {SalaryStructure} Salary structure object
 */
router.get('/salary-structures/:id', payrollController.getSalaryStructureById);

/**
 * @route   GET /api/v1/payroll/employees/:employeeId/salary-structure
 * @desc    Get active salary structure for an employee
 * @access  Private
 * @param  {string} employeeId - Employee ID
 * @returns {SalaryStructure} Active salary structure
 */
router.get('/employees/:employeeId/salary-structure', payrollController.getActiveSalaryStructure);

/**
 * @route   POST /api/v1/payroll/salary-structures
 * @desc    Create a new salary structure
 * @access  Private (Requires payroll.create permission)
 * @body   {CreateSalaryStructureDTO} Salary structure creation data
 * @returns {SalaryStructure} Created salary structure
 */
router.post(
  '/salary-structures',
  requirePermission('payroll', 'create'),
  payrollController.createSalaryStructure
);

/**
 * @route   PUT /api/v1/payroll/salary-structures/:id
 * @desc    Update a salary structure
 * @access  Private (Requires payroll.update permission)
 * @param  {string} id - Salary structure ID
 * @body   {UpdateSalaryStructureDTO} Partial structure data to update
 * @returns {SalaryStructure} Updated salary structure
 */
router.put(
  '/salary-structures/:id',
  requirePermission('payroll', 'update'),
  payrollController.updateSalaryStructure
);

// ==================== Salary Processing ====================

/**
 * @route   GET /api/v1/payroll/processings
 * @desc    Get all salary processings with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [employeeId] - Filter by employee ID
 * @query  {string} [payrollPeriod] - Filter by payroll period (YYYY-MM)
 * @query  {string} [status] - Filter by status
 * @returns {Object} Salary processings array and pagination info
 */
router.get('/processings', payrollController.getAllSalaryProcessings);

/**
 * @route   GET /api/v1/payroll/processings/:id
 * @desc    Get salary processing by ID
 * @access  Private
 * @param  {string} id - Salary processing ID
 * @returns {SalaryProcessing} Salary processing object
 */
router.get('/processings/:id', payrollController.getSalaryProcessingById);

/**
 * @route   POST /api/v1/payroll/processings
 * @desc    Process salary for an employee
 * @access  Private (Requires payroll.create permission)
 * @body   {ProcessSalaryDTO} Salary processing data
 * @returns {SalaryProcessing} Created salary processing record
 */
router.post(
  '/processings',
  requirePermission('payroll', 'create'),
  payrollController.processSalary
);

/**
 * @route   POST /api/v1/payroll/processings/:id/approve
 * @desc    Approve a processed salary
 * @access  Private (Requires payroll.approve permission)
 * @param  {string} id - Salary processing ID
 * @body   {ApproveSalaryDTO} Approval data
 * @returns {SalaryProcessing} Updated salary processing
 */
router.post(
  '/processings/:id/approve',
  requirePermission('payroll', 'approve'),
  payrollController.approveSalary
);

/**
 * @route   POST /api/v1/payroll/processings/:id/mark-paid
 * @desc    Mark salary as paid
 * @access  Private (Requires payroll.update permission)
 * @param  {string} id - Salary processing ID
 * @body   {Object} Payment data (paymentDate)
 * @returns {SalaryProcessing} Updated salary processing
 */
router.post(
  '/processings/:id/mark-paid',
  requirePermission('payroll', 'update'),
  payrollController.markAsPaid
);

// ==================== Salary Slips ====================

/**
 * @route   GET /api/v1/payroll/employees/:employeeId/salary-slips
 * @desc    Get salary slips for an employee
 * @access  Private
 * @param  {string} employeeId - Employee ID
 * @query  {number} [limit=12] - Maximum number of slips to return
 * @returns {SalarySlip[]} Array of salary slips
 */
router.get('/employees/:employeeId/salary-slips', payrollController.getSalarySlipsByEmployee);

// ==================== Tax Calculation ====================

/**
 * @route   GET /api/v1/payroll/employees/:employeeId/tax
 * @desc    Calculate tax for an employee for a tax year
 * @access  Private
 * @param  {string} employeeId - Employee ID
 * @query  {string} taxYear - Tax year (YYYY)
 * @returns {TaxCalculation} Tax calculation with liability and refund
 */
router.get('/employees/:employeeId/tax', payrollController.calculateTaxForEmployee);

// ==================== Payroll Summary ====================

/**
 * @route   GET /api/v1/payroll/summary
 * @desc    Get payroll summary for a period
 * @access  Private
 * @query  {string} payrollPeriod - Payroll period (YYYY-MM)
 * @returns {PayrollSummary} Payroll summary with totals and statistics
 */
router.get('/summary', payrollController.getPayrollSummary);

export default router;
