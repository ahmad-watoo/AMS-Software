/**
 * Certification Routes
 * 
 * Defines all certification management API endpoints.
 * 
 * Routes:
 * - Certificate Requests: Request creation, approval, fee payment
 * - Certificates: Certificate processing, ready status, URL updates
 * - Verification: Public certificate verification (no auth required)
 * - Templates: Certificate template management
 * 
 * Most routes require authentication.
 * Create, update, and approve routes require specific permissions.
 * Verification endpoint is public (no authentication required).
 * 
 * @module routes/certification.routes
 */

import { Router } from 'express';
import { CertificationController } from '@/controllers/certification.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const certificationController = new CertificationController();

/**
 * @route   POST /api/v1/certification/verify
 * @route   GET /api/v1/certification/verify
 * @desc    Verify a certificate (public endpoint, no auth required)
 * @access  Public
 * @query  {string} [verificationCode] - Verification code
 * @query  {string} [certificateNumber] - Certificate number
 * @body   {VerifyCertificateDTO} Verification data (POST only)
 * @returns {CertificateVerificationResult} Verification result
 */
router.post('/verify', certificationController.verifyCertificate);
router.get('/verify', certificationController.verifyCertificate);

// All other certification routes require authentication
router.use(authenticate);

// ==================== Certificate Requests ====================

/**
 * @route   GET /api/v1/certification/requests
 * @desc    Get all certificate requests (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [certificateType] - Filter by certificate type
 * @query  {string} [status] - Filter by request status
 * @returns {Object} Certificate requests array and pagination info
 */
router.get('/requests', certificationController.getAllCertificateRequests);

/**
 * @route   GET /api/v1/certification/requests/:id
 * @desc    Get certificate request by ID
 * @access  Private
 * @param  {string} id - Certificate request ID
 * @returns {CertificateRequest} Certificate request object
 */
router.get('/requests/:id', certificationController.getCertificateRequestById);

/**
 * @route   POST /api/v1/certification/requests
 * @desc    Create a new certificate request
 * @access  Private
 * @body   {CreateCertificateRequestDTO} Certificate request creation data
 * @returns {CertificateRequest} Created certificate request
 */
router.post('/requests', certificationController.createCertificateRequest);

/**
 * @route   POST /api/v1/certification/requests/:id/approve
 * @desc    Approve or reject a certificate request
 * @access  Private (Requires certification.approve permission)
 * @param  {string} id - Certificate request ID
 * @body   {ApproveCertificateRequestDTO} Approval/rejection data
 * @returns {CertificateRequest} Updated certificate request
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
 * @param  {string} id - Certificate request ID
 * @returns {CertificateRequest} Updated certificate request
 */
router.post(
  '/requests/:id/mark-fee-paid',
  requirePermission('certification', 'update'),
  certificationController.markFeeAsPaid
);

// ==================== Certificates ====================

/**
 * @route   GET /api/v1/certification/certificates
 * @desc    Get all certificates (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [certificateType] - Filter by certificate type
 * @query  {boolean} [isVerified] - Filter by verification status
 * @returns {Object} Certificates array and pagination info
 */
router.get('/certificates', certificationController.getAllCertificates);

/**
 * @route   GET /api/v1/certification/certificates/:id
 * @desc    Get certificate by ID
 * @access  Private
 * @param  {string} id - Certificate ID
 * @returns {Certificate} Certificate object
 */
router.get('/certificates/:id', certificationController.getCertificateById);

/**
 * @route   POST /api/v1/certification/certificates/process
 * @desc    Process a certificate (generate certificate from approved request)
 * @access  Private (Requires certification.create permission)
 * @body   {ProcessCertificateDTO} Certificate processing data
 * @returns {Certificate} Created certificate
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
 * @param  {string} id - Certificate ID
 * @returns {Certificate} Certificate object
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
 * @param  {string} id - Certificate ID
 * @body   {Object} URL data (qrCodeUrl, pdfUrl)
 * @returns {Certificate} Updated certificate
 */
router.put(
  '/certificates/:id/urls',
  requirePermission('certification', 'update'),
  certificationController.updateCertificateUrls
);

// ==================== Certificate Templates ====================

/**
 * @route   GET /api/v1/certification/templates
 * @desc    Get all certificate templates (with pagination and filters)
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [certificateType] - Filter by certificate type
 * @query  {boolean} [isActive] - Filter by active status
 * @returns {Object} Certificate templates array and pagination info
 */
router.get('/templates', certificationController.getAllCertificateTemplates);

/**
 * @route   GET /api/v1/certification/templates/:certificateType/active
 * @desc    Get active certificate template for a certificate type
 * @access  Private
 * @param  {string} certificateType - Certificate type
 * @returns {CertificateTemplate} Active certificate template
 */
router.get('/templates/:certificateType/active', certificationController.getActiveCertificateTemplate);

export default router;
