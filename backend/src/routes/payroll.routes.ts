import { Router } from 'express';
import { PayrollController } from '@/controllers/payroll.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const payrollController = new PayrollController();

// All payroll routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/payroll/salary-structures
 * @desc    Get all salary structures (with pagination and filters)
 * @access  Private
 */
router.get('/salary-structures', payrollController.getAllSalaryStructures);

/**
 * @route   GET /api/v1/payroll/salary-structures/:id
 * @desc    Get salary structure by ID
 * @access  Private
 */
router.get('/salary-structures/:id', payrollController.getSalaryStructureById);

/**
 * @route   GET /api/v1/payroll/employees/:employeeId/salary-structure
 * @desc    Get active salary structure for an employee
 * @access  Private
 */
router.get('/employees/:employeeId/salary-structure', payrollController.getActiveSalaryStructure);

/**
 * @route   POST /api/v1/payroll/salary-structures
 * @desc    Create a new salary structure
 * @access  Private (Requires payroll.create permission)
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
 */
router.put(
  '/salary-structures/:id',
  requirePermission('payroll', 'update'),
  payrollController.updateSalaryStructure
);

/**
 * @route   GET /api/v1/payroll/processings
 * @desc    Get all salary processings (with pagination and filters)
 * @access  Private
 */
router.get('/processings', payrollController.getAllSalaryProcessings);

/**
 * @route   GET /api/v1/payroll/processings/:id
 * @desc    Get salary processing by ID
 * @access  Private
 */
router.get('/processings/:id', payrollController.getSalaryProcessingById);

/**
 * @route   POST /api/v1/payroll/processings
 * @desc    Process salary for an employee
 * @access  Private (Requires payroll.create permission)
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
 */
router.post(
  '/processings/:id/mark-paid',
  requirePermission('payroll', 'update'),
  payrollController.markAsPaid
);

/**
 * @route   GET /api/v1/payroll/employees/:employeeId/salary-slips
 * @desc    Get salary slips for an employee
 * @access  Private
 */
router.get('/employees/:employeeId/salary-slips', payrollController.getSalarySlipsByEmployee);

/**
 * @route   GET /api/v1/payroll/employees/:employeeId/tax
 * @desc    Calculate tax for an employee for a tax year
 * @access  Private
 */
router.get('/employees/:employeeId/tax', payrollController.calculateTaxForEmployee);

/**
 * @route   GET /api/v1/payroll/summary
 * @desc    Get payroll summary for a period
 * @access  Private
 */
router.get('/summary', payrollController.getPayrollSummary);

export default router;

