import { Router } from 'express';
import { ExaminationController } from '@/controllers/examination.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const examinationController = new ExaminationController();

// All examination routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/examination/exams
 * @desc    Get all exams (with pagination and filters)
 * @access  Private
 */
router.get('/exams', examinationController.getAllExams);

/**
 * @route   GET /api/v1/examination/exams/:id
 * @desc    Get exam by ID
 * @access  Private
 */
router.get('/exams/:id', examinationController.getExamById);

/**
 * @route   POST /api/v1/examination/exams
 * @desc    Create a new exam
 * @access  Private (Requires examination.create permission)
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
 */
router.put(
  '/exams/:id',
  requirePermission('examination', 'update'),
  examinationController.updateExam
);

/**
 * @route   GET /api/v1/examination/results
 * @desc    Get all results (with pagination and filters)
 * @access  Private
 */
router.get('/results', examinationController.getAllResults);

/**
 * @route   GET /api/v1/examination/results/:id
 * @desc    Get result by ID
 * @access  Private
 */
router.get('/results/:id', examinationController.getResultById);

/**
 * @route   POST /api/v1/examination/results
 * @desc    Create a new result entry
 * @access  Private (Requires examination.create permission)
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
 */
router.post(
  '/results/:id/approve',
  requirePermission('examination', 'approve'),
  examinationController.approveResult
);

/**
 * @route   GET /api/v1/examination/re-evaluations
 * @desc    Get all re-evaluation requests
 * @access  Private
 */
router.get('/re-evaluations', examinationController.getAllReEvaluations);

/**
 * @route   POST /api/v1/examination/re-evaluations
 * @desc    Create a re-evaluation request
 * @access  Private
 */
router.post('/re-evaluations', examinationController.createReEvaluation);

export default router;

