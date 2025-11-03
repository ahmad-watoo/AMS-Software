import { Router } from 'express';
import { CertificationController } from '@/controllers/certification.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const certificationController = new CertificationController();

/**
 * @route   POST /api/v1/certification/verify
 * @desc    Verify a certificate (public endpoint, no auth required)
 * @access  Public
 */
router.post('/verify', certificationController.verifyCertificate);
router.get('/verify', certificationController.verifyCertificate);

// All other certification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/certification/requests
 * @desc    Get all certificate requests (with pagination and filters)
 * @access  Private
 */
router.get('/requests', certificationController.getAllCertificateRequests);

/**
 * @route   GET /api/v1/certification/requests/:id
 * @desc    Get certificate request by ID
 * @access  Private
 */
router.get('/requests/:id', certificationController.getCertificateRequestById);

/**
 * @route   POST /api/v1/certification/requests
 * @desc    Create a new certificate request
 * @access  Private
 */
router.post('/requests', certificationController.createCertificateRequest);

/**
 * @route   POST /api/v1/certification/requests/:id/approve
 * @desc    Approve or reject a certificate request
 * @access  Private (Requires certification.approve permission)
 */
router.post(
  '/requests/:id/approve',
  requirePermission('certification', 'approve'),
  certificationController.approveCertificateRequest
);

/**
 * @route   POST /api/v1/certification/requests/:id/mark-fee-paid
 * @desc    Mark certificate request fee as paid
 * @access  Private (Requires certification.update permission)
 */
router.post(
  '/requests/:id/mark-fee-paid',
  requirePermission('certification', 'update'),
  certificationController.markFeeAsPaid
);

/**
 * @route   GET /api/v1/certification/certificates
 * @desc    Get all certificates (with pagination and filters)
 * @access  Private
 */
router.get('/certificates', certificationController.getAllCertificates);

/**
 * @route   GET /api/v1/certification/certificates/:id
 * @desc    Get certificate by ID
 * @access  Private
 */
router.get('/certificates/:id', certificationController.getCertificateById);

/**
 * @route   POST /api/v1/certification/certificates/process
 * @desc    Process a certificate (generate certificate from approved request)
 * @access  Private (Requires certification.create permission)
 */
router.post(
  '/certificates/process',
  requirePermission('certification', 'create'),
  certificationController.processCertificate
);

/**
 * @route   POST /api/v1/certification/certificates/:id/mark-ready
 * @desc    Mark certificate as ready for delivery
 * @access  Private (Requires certification.update permission)
 */
router.post(
  '/certificates/:id/mark-ready',
  requirePermission('certification', 'update'),
  certificationController.markCertificateAsReady
);

/**
 * @route   PUT /api/v1/certification/certificates/:id/urls
 * @desc    Update certificate QR code and PDF URLs
 * @access  Private (Requires certification.update permission)
 */
router.put(
  '/certificates/:id/urls',
  requirePermission('certification', 'update'),
  certificationController.updateCertificateUrls
);

/**
 * @route   GET /api/v1/certification/templates
 * @desc    Get all certificate templates (with pagination and filters)
 * @access  Private
 */
router.get('/templates', certificationController.getAllCertificateTemplates);

/**
 * @route   GET /api/v1/certification/templates/:certificateType/active
 * @desc    Get active certificate template for a certificate type
 * @access  Private
 */
router.get('/templates/:certificateType/active', certificationController.getActiveCertificateTemplate);

export default router;

