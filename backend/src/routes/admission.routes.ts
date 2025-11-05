/**
 * Admission Routes
 * 
 * Defines all admission management API endpoints.
 * 
 * Routes:
 * - GET /applications - Get all applications (with pagination and filters)
 * - GET /applications/:id - Get application by ID
 * - GET /users/:userId/applications - Get user's applications
 * - POST /applications - Create new application
 * - PUT /applications/:id - Update application
 * - POST /eligibility-check - Check application eligibility
 * - POST /merit-list - Generate merit list
 * - GET /applications/:id/documents - Get application documents
 * - POST /applications/:id/status - Update application status
 * 
 * All routes require authentication.
 * Most routes require specific permissions.
 * 
 * @module routes/admission.routes
 */

import { Router } from 'express';
import { AdmissionController } from '@/controllers/admission.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const admissionController = new AdmissionController();

// All admission routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/admission/applications
 * @desc    Get all applications with pagination and filters
 * @access  Private (Requires admission.view permission)
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [programId] - Filter by program ID
 * @query  {string} [status] - Filter by application status
 * @query  {string} [batch] - Filter by batch
 * @query  {string} [search] - Search by application number
 * @returns {Object} Applications array and pagination info
 */
router.get(
  '/applications',
  requirePermission('admission', 'view'),
  admissionController.getAllApplications
);

/**
 * @route   GET /api/v1/admission/applications/:id
 * @desc    Get application by ID with full details
 * @access  Private
 * @param  {string} id - Application ID
 * @returns {Object} Application with user and program details
 */
router.get('/applications/:id', admissionController.getApplicationById);

/**
 * @route   GET /api/v1/admission/users/:userId/applications
 * @desc    Get all applications submitted by a user
 * @access  Private
 * @param  {string} userId - User ID
 * @returns {Array} Array of user's applications
 */
router.get('/users/:userId/applications', admissionController.getUserApplications);

/**
 * @route   POST /api/v1/admission/applications
 * @desc    Create a new admission application
 * @access  Private
 * @body   {CreateApplicationDTO} Application creation data
 * @returns {AdmissionApplication} Created application
 */
router.post('/applications', admissionController.createApplication);

/**
 * @route   PUT /api/v1/admission/applications/:id
 * @desc    Update an application
 * @access  Private (Requires admission.approve permission)
 * @param  {string} id - Application ID
 * @body   {UpdateApplicationDTO} Partial application data to update
 * @returns {AdmissionApplication} Updated application
 */
router.put(
  '/applications/:id',
  requirePermission('admission', 'approve'),
  admissionController.updateApplication
);

/**
 * @route   POST /api/v1/admission/eligibility-check
 * @desc    Check if an application meets eligibility criteria
 * @access  Private (Requires admission.view permission)
 * @body   {EligibilityCheckDTO} Eligibility check data
 * @returns {Object} Eligibility result with score and reasons
 */
router.post(
  '/eligibility-check',
  requirePermission('admission', 'view'),
  admissionController.checkEligibility
);

/**
 * @route   POST /api/v1/admission/merit-list
 * @desc    Generate merit list for a program
 * @access  Private (Requires admission.approve permission)
 * @body   {MeritListGenerateDTO} Merit list generation data
 * @returns {MeritList} Generated merit list with ranked applications
 */
router.post(
  '/merit-list',
  requirePermission('admission', 'approve'),
  admissionController.generateMeritList
);

/**
 * @route   GET /api/v1/admission/applications/:id/documents
 * @desc    Get all documents uploaded for an application
 * @access  Private
 * @param  {string} id - Application ID
 * @returns {Array} Array of application documents
 */
router.get('/applications/:id/documents', admissionController.getApplicationDocuments);

/**
 * @route   POST /api/v1/admission/applications/:id/status
 * @desc    Update application status (e.g., selected, rejected, enrolled)
 * @access  Private (Requires admission.approve permission)
 * @param  {string} id - Application ID
 * @body   {string} status - New application status
 * @returns {message: "Application status updated successfully"}
 */
router.post(
  '/applications/:id/status',
  requirePermission('admission', 'approve'),
  admissionController.updateApplicationStatus
);

export default router;
