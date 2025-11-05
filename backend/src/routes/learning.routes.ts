/**
 * Learning Management Routes
 * 
 * Defines all learning management API endpoints.
 * 
 * Routes:
 * - Course Materials: CRUD operations for course materials
 * - Assignments: CRUD operations for assignments
 * - Submissions: Assignment submission and grading
 * 
 * All routes require authentication.
 * Create and update routes require specific permissions.
 * 
 * @module routes/learning.routes
 */

import { Router } from 'express';
import { LearningController } from '@/controllers/learning.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const learningController = new LearningController();

// All learning routes require authentication
router.use(authenticate);

// ==================== Course Materials ====================

/**
 * @route   GET /api/v1/learning/materials
 * @desc    Get all course materials with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {string} [courseId] - Filter by course ID
 * @query  {string} [materialType] - Filter by material type
 * @query  {boolean} [isVisible] - Filter by visibility status
 * @returns {Object} Materials array and pagination info
 */
router.get('/materials', learningController.getAllCourseMaterials);

/**
 * @route   GET /api/v1/learning/materials/:id
 * @desc    Get course material by ID
 * @access  Private
 * @param  {string} id - Course material ID
 * @returns {CourseMaterial} Course material object
 */
router.get('/materials/:id', learningController.getCourseMaterialById);

/**
 * @route   POST /api/v1/learning/materials
 * @desc    Create/Upload a new course material
 * @access  Private (Requires learning.create permission)
 * @body   {CreateCourseMaterialDTO} Material creation data
 * @returns {CourseMaterial} Created course material
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
 * @param  {string} id - Course material ID
 * @body   {UpdateCourseMaterialDTO} Partial material data to update
 * @returns {CourseMaterial} Updated course material
 */
router.put(
  '/materials/:id',
  requirePermission('learning', 'update'),
  learningController.updateCourseMaterial
);

// ==================== Assignments ====================

/**
 * @route   GET /api/v1/learning/assignments
 * @desc    Get all assignments with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {string} [courseId] - Filter by course ID
 * @query  {boolean} [isPublished] - Filter by publication status
 * @returns {Object} Assignments array and pagination info
 */
router.get('/assignments', learningController.getAllAssignments);

/**
 * @route   GET /api/v1/learning/assignments/:id
 * @desc    Get assignment by ID
 * @access  Private
 * @param  {string} id - Assignment ID
 * @returns {Assignment} Assignment object
 */
router.get('/assignments/:id', learningController.getAssignmentById);

/**
 * @route   POST /api/v1/learning/assignments
 * @desc    Create a new assignment
 * @access  Private (Requires learning.create permission)
 * @body   {CreateAssignmentDTO} Assignment creation data
 * @returns {Assignment} Created assignment
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
 * @param  {string} id - Assignment ID
 * @body   {UpdateAssignmentDTO} Partial assignment data to update
 * @returns {Assignment} Updated assignment
 */
router.put(
  '/assignments/:id',
  requirePermission('learning', 'update'),
  learningController.updateAssignment
);

// ==================== Assignment Submissions ====================

/**
 * @route   GET /api/v1/learning/submissions
 * @desc    Get all assignment submissions with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [assignmentId] - Filter by assignment ID
 * @query  {string} [studentId] - Filter by student ID
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {string} [status] - Filter by status
 * @returns {Object} Submissions array and pagination info
 */
router.get('/submissions', learningController.getAllSubmissions);

/**
 * @route   GET /api/v1/learning/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 * @param  {string} id - Submission ID
 * @returns {AssignmentSubmission} Submission object
 */
router.get('/submissions/:id', learningController.getSubmissionById);

/**
 * @route   POST /api/v1/learning/submissions
 * @desc    Submit an assignment
 * @access  Private
 * @body   {CreateAssignmentSubmissionDTO} Submission creation data
 * @returns {AssignmentSubmission} Created submission
 */
router.post('/submissions', learningController.createSubmission);

/**
 * @route   POST /api/v1/learning/submissions/:id/grade
 * @desc    Grade an assignment submission
 * @access  Private (Requires learning.update permission)
 * @param  {string} id - Submission ID
 * @body   {Object} Grading data (obtainedMarks, feedback)
 * @returns {AssignmentSubmission} Graded submission
 */
router.post(
  '/submissions/:id/grade',
  requirePermission('learning', 'update'),
  learningController.gradeSubmission
);

export default router;
