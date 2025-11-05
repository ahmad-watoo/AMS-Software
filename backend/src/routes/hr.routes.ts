/**
 * HR Routes
 * 
 * Defines all Human Resources management API endpoints.
 * 
 * Routes:
 * - Employees: CRUD operations for employee records
 * - Leave Requests: Leave application, approval, and balance tracking
 * - Job Postings: Job posting management
 * - Job Applications: Job application submissions
 * 
 * All routes require authentication.
 * Create, update, and approve routes require specific permissions.
 * 
 * @module routes/hr.routes
 */

import { Router } from 'express';
import { HRController } from '@/controllers/hr.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const hrController = new HRController();

// All HR routes require authentication
router.use(authenticate);

// ==================== Employees ====================

/**
 * @route   GET /api/v1/hr/employees
 * @desc    Get all employees with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [departmentId] - Filter by department ID
 * @query  {string} [designation] - Filter by designation
 * @query  {string} [employmentType] - Filter by employment type
 * @query  {boolean} [isActive] - Filter by active status
 * @returns {Object} Employees array and pagination info
 */
router.get('/employees', hrController.getAllEmployees);

/**
 * @route   GET /api/v1/hr/employees/:id
 * @desc    Get employee by ID
 * @access  Private
 * @param  {string} id - Employee ID
 * @returns {Employee} Employee object
 */
router.get('/employees/:id', hrController.getEmployeeById);

/**
 * @route   POST /api/v1/hr/employees
 * @desc    Create a new employee record
 * @access  Private (Requires hr.create permission)
 * @body   {CreateEmployeeDTO} Employee creation data
 * @returns {Employee} Created employee
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
 * @param  {string} id - Employee ID
 * @body   {UpdateEmployeeDTO} Partial employee data to update
 * @returns {Employee} Updated employee
 */
router.put(
  '/employees/:id',
  requirePermission('hr', 'update'),
  hrController.updateEmployee
);

// ==================== Leave Requests ====================

/**
 * @route   GET /api/v1/hr/leave-requests
 * @desc    Get all leave requests with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [employeeId] - Filter by employee ID
 * @query  {string} [status] - Filter by status
 * @query  {string} [leaveType] - Filter by leave type
 * @returns {Object} Leave requests array and pagination info
 */
router.get('/leave-requests', hrController.getAllLeaveRequests);

/**
 * @route   GET /api/v1/hr/leave-requests/:id
 * @desc    Get leave request by ID
 * @access  Private
 * @param  {string} id - Leave request ID
 * @returns {LeaveRequest} Leave request object
 */
router.get('/leave-requests/:id', hrController.getLeaveRequestById);

/**
 * @route   POST /api/v1/hr/leave-requests
 * @desc    Create a new leave request
 * @access  Private
 * @body   {CreateLeaveRequestDTO} Leave request creation data
 * @returns {LeaveRequest} Created leave request
 */
router.post('/leave-requests', hrController.createLeaveRequest);

/**
 * @route   POST /api/v1/hr/leave-requests/:id/approve
 * @desc    Approve or reject a leave request
 * @access  Private (Requires hr.approve permission)
 * @param  {string} id - Leave request ID
 * @body   {ApproveLeaveDTO} Approval/rejection data
 * @returns {LeaveRequest} Updated leave request
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
 * @param  {string} employeeId - Employee ID
 * @returns {LeaveBalance} Leave balance with used and remaining leaves
 */
router.get('/employees/:employeeId/leave-balance', hrController.getLeaveBalance);

// ==================== Job Postings ====================

/**
 * @route   GET /api/v1/hr/job-postings
 * @desc    Get all job postings with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [departmentId] - Filter by department ID
 * @query  {string} [status] - Filter by status
 * @query  {string} [employmentType] - Filter by employment type
 * @returns {Object} Job postings array and pagination info
 */
router.get('/job-postings', hrController.getAllJobPostings);

/**
 * @route   GET /api/v1/hr/job-postings/:id
 * @desc    Get job posting by ID
 * @access  Private
 * @param  {string} id - Job posting ID
 * @returns {JobPosting} Job posting object
 */
router.get('/job-postings/:id', hrController.getJobPostingById);

/**
 * @route   POST /api/v1/hr/job-postings
 * @desc    Create a new job posting
 * @access  Private (Requires hr.create permission)
 * @body   {CreateJobPostingDTO} Job posting creation data
 * @returns {JobPosting} Created job posting
 */
router.post(
  '/job-postings',
  requirePermission('hr', 'create'),
  hrController.createJobPosting
);

// ==================== Job Applications ====================

/**
 * @route   GET /api/v1/hr/job-applications
 * @desc    Get all job applications with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [jobPostingId] - Filter by job posting ID
 * @query  {string} [status] - Filter by status
 * @returns {Object} Applications array and pagination info
 */
router.get('/job-applications', hrController.getAllJobApplications);

/**
 * @route   POST /api/v1/hr/job-applications
 * @desc    Submit a job application
 * @access  Private
 * @body   {CreateJobApplicationDTO} Job application creation data
 * @returns {JobApplication} Created job application
 */
router.post('/job-applications', hrController.createJobApplication);

export default router;
