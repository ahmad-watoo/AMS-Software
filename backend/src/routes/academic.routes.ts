import { Router } from 'express';
import { AcademicController } from '@/controllers/academic.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const academicController = new AcademicController();

// All academic routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/academic/programs
 * @desc    Get all programs (with pagination and filters)
 * @access  Private
 */
router.get('/programs', academicController.getAllPrograms);

/**
 * @route   GET /api/v1/academic/programs/:id
 * @desc    Get program by ID
 * @access  Private
 */
router.get('/programs/:id', academicController.getProgramById);

/**
 * @route   POST /api/v1/academic/programs
 * @desc    Create a new program
 * @access  Private (Requires academic.create permission)
 */
router.post(
  '/programs',
  requirePermission('academic', 'create'),
  academicController.createProgram
);

/**
 * @route   PUT /api/v1/academic/programs/:id
 * @desc    Update a program
 * @access  Private (Requires academic.update permission)
 */
router.put(
  '/programs/:id',
  requirePermission('academic', 'update'),
  academicController.updateProgram
);

/**
 * @route   GET /api/v1/academic/courses
 * @desc    Get all courses (with pagination and filters)
 * @access  Private
 */
router.get('/courses', academicController.getAllCourses);

/**
 * @route   GET /api/v1/academic/courses/:id
 * @desc    Get course by ID
 * @access  Private
 */
router.get('/courses/:id', academicController.getCourseById);

/**
 * @route   POST /api/v1/academic/courses
 * @desc    Create a new course
 * @access  Private (Requires academic.create permission)
 */
router.post(
  '/courses',
  requirePermission('academic', 'create'),
  academicController.createCourse
);

/**
 * @route   PUT /api/v1/academic/courses/:id
 * @desc    Update a course
 * @access  Private (Requires academic.update permission)
 */
router.put(
  '/courses/:id',
  requirePermission('academic', 'update'),
  academicController.updateCourse
);

/**
 * @route   GET /api/v1/academic/sections
 * @desc    Get all sections (with pagination and filters)
 * @access  Private
 */
router.get('/sections', academicController.getAllSections);

/**
 * @route   GET /api/v1/academic/sections/:id
 * @desc    Get section by ID
 * @access  Private
 */
router.get('/sections/:id', academicController.getSectionById);

/**
 * @route   POST /api/v1/academic/sections
 * @desc    Create a new section
 * @access  Private (Requires academic.create permission)
 */
router.post(
  '/sections',
  requirePermission('academic', 'create'),
  academicController.createSection
);

/**
 * @route   PUT /api/v1/academic/sections/:id
 * @desc    Update a section
 * @access  Private (Requires academic.update permission)
 */
router.put(
  '/sections/:id',
  requirePermission('academic', 'update'),
  academicController.updateSection
);

export default router;

