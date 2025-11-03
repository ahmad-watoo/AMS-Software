import { Router } from 'express';
import { HRController } from '@/controllers/hr.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const hrController = new HRController();

// All HR routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/hr/employees
 * @desc    Get all employees (with pagination and filters)
 * @access  Private
 */
router.get('/employees', hrController.getAllEmployees);

/**
 * @route   GET /api/v1/hr/employees/:id
 * @desc    Get employee by ID
 * @access  Private
 */
router.get('/employees/:id', hrController.getEmployeeById);

/**
 * @route   POST /api/v1/hr/employees
 * @desc    Create a new employee record
 * @access  Private (Requires hr.create permission)
 */
router.post(
  '/employees',
  requirePermission('hr', 'create'),
  hrController.createEmployee
);

/**
 * @route   PUT /api/v1/hr/employees/:id
 * @desc    Update an employee record
 * @access  Private (Requires hr.update permission)
 */
router.put(
  '/employees/:id',
  requirePermission('hr', 'update'),
  hrController.updateEmployee
);

/**
 * @route   GET /api/v1/hr/leave-requests
 * @desc    Get all leave requests (with pagination and filters)
 * @access  Private
 */
router.get('/leave-requests', hrController.getAllLeaveRequests);

/**
 * @route   GET /api/v1/hr/leave-requests/:id
 * @desc    Get leave request by ID
 * @access  Private
 */
router.get('/leave-requests/:id', hrController.getLeaveRequestById);

/**
 * @route   POST /api/v1/hr/leave-requests
 * @desc    Create a new leave request
 * @access  Private
 */
router.post('/leave-requests', hrController.createLeaveRequest);

/**
 * @route   POST /api/v1/hr/leave-requests/:id/approve
 * @desc    Approve or reject a leave request
 * @access  Private (Requires hr.approve permission)
 */
router.post(
  '/leave-requests/:id/approve',
  requirePermission('hr', 'approve'),
  hrController.approveLeaveRequest
);

/**
 * @route   GET /api/v1/hr/employees/:employeeId/leave-balance
 * @desc    Get leave balance for an employee
 * @access  Private
 */
router.get('/employees/:employeeId/leave-balance', hrController.getLeaveBalance);

/**
 * @route   GET /api/v1/hr/job-postings
 * @desc    Get all job postings (with pagination and filters)
 * @access  Private
 */
router.get('/job-postings', hrController.getAllJobPostings);

/**
 * @route   GET /api/v1/hr/job-postings/:id
 * @desc    Get job posting by ID
 * @access  Private
 */
router.get('/job-postings/:id', hrController.getJobPostingById);

/**
 * @route   POST /api/v1/hr/job-postings
 * @desc    Create a new job posting
 * @access  Private (Requires hr.create permission)
 */
router.post(
  '/job-postings',
  requirePermission('hr', 'create'),
  hrController.createJobPosting
);

/**
 * @route   GET /api/v1/hr/job-applications
 * @desc    Get all job applications (with pagination and filters)
 * @access  Private
 */
router.get('/job-applications', hrController.getAllJobApplications);

/**
 * @route   POST /api/v1/hr/job-applications
 * @desc    Submit a job application
 * @access  Private
 */
router.post('/job-applications', hrController.createJobApplication);

export default router;

