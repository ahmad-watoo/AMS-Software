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
 * @desc    Get all applications (with pagination and filters)
 * @access  Private (Requires admission.view permission)
 */
router.get(
  '/applications',
  requirePermission('admission', 'view'),
  admissionController.getAllApplications
);

/**
 * @route   GET /api/v1/admission/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
router.get('/applications/:id', admissionController.getApplicationById);

/**
 * @route   GET /api/v1/admission/users/:userId/applications
 * @desc    Get all applications for a user
 * @access  Private
 */
router.get('/users/:userId/applications', admissionController.getUserApplications);

/**
 * @route   POST /api/v1/admission/applications
 * @desc    Create a new application
 * @access  Private
 */
router.post('/applications', admissionController.createApplication);

/**
 * @route   PUT /api/v1/admission/applications/:id
 * @desc    Update an application
 * @access  Private (Requires admission.approve permission)
 */
router.put(
  '/applications/:id',
  requirePermission('admission', 'approve'),
  admissionController.updateApplication
);

/**
 * @route   POST /api/v1/admission/eligibility-check
 * @desc    Check application eligibility
 * @access  Private (Requires admission.view permission)
 */
router.post(
  '/eligibility-check',
  requirePermission('admission', 'view'),
  admissionController.checkEligibility
);

/**
 * @route   POST /api/v1/admission/merit-list
 * @desc    Generate merit list
 * @access  Private (Requires admission.approve permission)
 */
router.post(
  '/merit-list',
  requirePermission('admission', 'approve'),
  admissionController.generateMeritList
);

/**
 * @route   GET /api/v1/admission/applications/:id/documents
 * @desc    Get application documents
 * @access  Private
 */
router.get('/applications/:id/documents', admissionController.getApplicationDocuments);

/**
 * @route   POST /api/v1/admission/applications/:id/status
 * @desc    Update application status
 * @access  Private (Requires admission.approve permission)
 */
router.post(
  '/applications/:id/status',
  requirePermission('admission', 'approve'),
  admissionController.updateApplicationStatus
);

export default router;

