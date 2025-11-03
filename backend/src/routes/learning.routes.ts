import { Router } from 'express';
import { LearningController } from '@/controllers/learning.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const learningController = new LearningController();

// All learning routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/learning/materials
 * @desc    Get all course materials (with pagination and filters)
 * @access  Private
 */
router.get('/materials', learningController.getAllCourseMaterials);

/**
 * @route   GET /api/v1/learning/materials/:id
 * @desc    Get course material by ID
 * @access  Private
 */
router.get('/materials/:id', learningController.getCourseMaterialById);

/**
 * @route   POST /api/v1/learning/materials
 * @desc    Create/Upload a new course material
 * @access  Private (Requires learning.create permission)
 */
router.post(
  '/materials',
  requirePermission('learning', 'create'),
  learningController.createCourseMaterial
);

/**
 * @route   PUT /api/v1/learning/materials/:id
 * @desc    Update a course material
 * @access  Private (Requires learning.update permission)
 */
router.put(
  '/materials/:id',
  requirePermission('learning', 'update'),
  learningController.updateCourseMaterial
);

/**
 * @route   GET /api/v1/learning/assignments
 * @desc    Get all assignments (with pagination and filters)
 * @access  Private
 */
router.get('/assignments', learningController.getAllAssignments);

/**
 * @route   GET /api/v1/learning/assignments/:id
 * @desc    Get assignment by ID
 * @access  Private
 */
router.get('/assignments/:id', learningController.getAssignmentById);

/**
 * @route   POST /api/v1/learning/assignments
 * @desc    Create a new assignment
 * @access  Private (Requires learning.create permission)
 */
router.post(
  '/assignments',
  requirePermission('learning', 'create'),
  learningController.createAssignment
);

/**
 * @route   PUT /api/v1/learning/assignments/:id
 * @desc    Update an assignment
 * @access  Private (Requires learning.update permission)
 */
router.put(
  '/assignments/:id',
  requirePermission('learning', 'update'),
  learningController.updateAssignment
);

/**
 * @route   GET /api/v1/learning/submissions
 * @desc    Get all assignment submissions (with pagination and filters)
 * @access  Private
 */
router.get('/submissions', learningController.getAllSubmissions);

/**
 * @route   GET /api/v1/learning/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 */
router.get('/submissions/:id', learningController.getSubmissionById);

/**
 * @route   POST /api/v1/learning/submissions
 * @desc    Submit an assignment
 * @access  Private
 */
router.post('/submissions', learningController.createSubmission);

/**
 * @route   POST /api/v1/learning/submissions/:id/grade
 * @desc    Grade an assignment submission
 * @access  Private (Requires learning.update permission)
 */
router.post(
  '/submissions/:id/grade',
  requirePermission('learning', 'update'),
  learningController.gradeSubmission
);

export default router;

