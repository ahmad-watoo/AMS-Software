/**
 * Examination Routes
 * 
 * Defines all examination management API endpoints.
 * 
 * Routes:
 * - Exams: CRUD operations for exams
 * - Results: CRUD operations for exam results, result approval
 * - Re-Evaluations: Create and manage re-evaluation requests
 * 
 * All routes require authentication.
 * Create, update, and approve routes require specific permissions.
 * 
 * @module routes/examination.routes
 */

import { Router } from 'express';
import { ExaminationController } from '@/controllers/examination.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const examinationController = new ExaminationController();

// All examination routes require authentication
router.use(authenticate);

// ==================== Exams ====================

/**
 * @route   GET /api/v1/examination/exams
 * @desc    Get all exams with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {string} [examType] - Filter by exam type
 * @query  {string} [semester] - Filter by semester
 * @query  {string} [examDate] - Filter by exam date
 * @returns {Object} Exams array and pagination info
 */
router.get('/exams', examinationController.getAllExams);

/**
 * @route   GET /api/v1/examination/exams/:id
 * @desc    Get exam by ID
 * @access  Private
 * @param  {string} id - Exam ID
 * @returns {Exam} Exam object
 */
router.get('/exams/:id', examinationController.getExamById);

/**
 * @route   POST /api/v1/examination/exams
 * @desc    Create a new exam
 * @access  Private (Requires examination.create permission)
 * @body   {CreateExamDTO} Exam creation data
 * @returns {Exam} Created exam
 */
router.post(
  '/exams',
  requirePermission('examination', 'create'),
  examinationController.createExam
);

/**
 * @route   PUT /api/v1/examination/exams/:id
 * @desc    Update an exam
 * @access  Private (Requires examination.update permission)
 * @param  {string} id - Exam ID
 * @body   {UpdateExamDTO} Partial exam data to update
 * @returns {Exam} Updated exam
 */
router.put(
  '/exams/:id',
  requirePermission('examination', 'update'),
  examinationController.updateExam
);

// ==================== Results ====================

/**
 * @route   GET /api/v1/examination/results
 * @desc    Get all results with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [examId] - Filter by exam ID
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {boolean} [isApproved] - Filter by approval status
 * @returns {Object} Results array and pagination info
 */
router.get('/results', examinationController.getAllResults);

/**
 * @route   GET /api/v1/examination/results/:id
 * @desc    Get result by ID
 * @access  Private
 * @param  {string} id - Result ID
 * @returns {Result} Result object
 */
router.get('/results/:id', examinationController.getResultById);

/**
 * @route   POST /api/v1/examination/results
 * @desc    Create a new result entry
 * @access  Private (Requires examination.create permission)
 * @body   {CreateResultDTO} Result creation data
 * @returns {Result} Created result
 */
router.post(
  '/results',
  requirePermission('examination', 'create'),
  examinationController.createResult
);

/**
 * @route   PUT /api/v1/examination/results/:id
 * @desc    Update a result entry
 * @access  Private (Requires examination.update permission)
 * @param  {string} id - Result ID
 * @body   {UpdateResultDTO} Partial result data to update
 * @returns {Result} Updated result
 */
router.put(
  '/results/:id',
  requirePermission('examination', 'update'),
  examinationController.updateResult
);

/**
 * @route   POST /api/v1/examination/results/:id/approve
 * @desc    Approve a result
 * @access  Private (Requires examination.approve permission)
 * @param  {string} id - Result ID
 * @returns {Result} Approved result
 */
router.post(
  '/results/:id/approve',
  requirePermission('examination', 'approve'),
  examinationController.approveResult
);

// ==================== Re-Evaluations ====================

/**
 * @route   GET /api/v1/examination/re-evaluations
 * @desc    Get all re-evaluation requests with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [status] - Filter by status
 * @returns {Object} Re-evaluations array and pagination info
 */
router.get('/re-evaluations', examinationController.getAllReEvaluations);

/**
 * @route   POST /api/v1/examination/re-evaluations
 * @desc    Create a re-evaluation request
 * @access  Private
 * @body   {CreateReEvaluationDTO} Re-evaluation creation data
 * @returns {ReEvaluation} Created re-evaluation request
 */
router.post('/re-evaluations', examinationController.createReEvaluation);

export default router;
