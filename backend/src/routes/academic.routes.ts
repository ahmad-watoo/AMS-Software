/**
 * Academic Routes
 * 
 * Defines all academic management API endpoints.
 * 
 * Routes:
 * - Programs: CRUD operations for academic programs
 * - Courses: CRUD operations for courses
 * - Sections: CRUD operations for course sections
 * 
 * All routes require authentication.
 * Create and update routes require specific permissions.
 * 
 * @module routes/academic.routes
 */

import { Router } from 'express';
import { AcademicController } from '@/controllers/academic.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const academicController = new AcademicController();

// All academic routes require authentication
router.use(authenticate);

// ==================== Programs ====================

/**
 * @route   GET /api/v1/academic/programs
 * @desc    Get all programs with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [departmentId] - Filter by department ID
 * @query  {string} [degreeLevel] - Filter by degree level
 * @query  {boolean} [isActive] - Filter by active status
 * @query  {string} [search] - Search by program code or name
 * @returns {Object} Programs array and pagination info
 */
router.get('/programs', academicController.getAllPrograms);

/**
 * @route   GET /api/v1/academic/programs/:id
 * @desc    Get program by ID
 * @access  Private
 * @param  {string} id - Program ID
 * @returns {Program} Program object
 */
router.get('/programs/:id', academicController.getProgramById);

/**
 * @route   POST /api/v1/academic/programs
 * @desc    Create a new program
 * @access  Private (Requires academic.create permission)
 * @body   {CreateProgramDTO} Program creation data
 * @returns {Program} Created program
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
 * @param  {string} id - Program ID
 * @body   {UpdateProgramDTO} Partial program data to update
 * @returns {Program} Updated program
 */
router.put(
  '/programs/:id',
  requirePermission('academic', 'update'),
  academicController.updateProgram
);

// ==================== Courses ====================

/**
 * @route   GET /api/v1/academic/courses
 * @desc    Get all courses with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [departmentId] - Filter by department ID
 * @query  {boolean} [isElective] - Filter by elective status
 * @query  {boolean} [isActive] - Filter by active status
 * @query  {string} [search] - Search by course code or title
 * @returns {Object} Courses array and pagination info
 */
router.get('/courses', academicController.getAllCourses);

/**
 * @route   GET /api/v1/academic/courses/:id
 * @desc    Get course by ID
 * @access  Private
 * @param  {string} id - Course ID
 * @returns {Course} Course object
 */
router.get('/courses/:id', academicController.getCourseById);

/**
 * @route   POST /api/v1/academic/courses
 * @desc    Create a new course
 * @access  Private (Requires academic.create permission)
 * @body   {CreateCourseDTO} Course creation data
 * @returns {Course} Created course
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
 * @param  {string} id - Course ID
 * @body   {UpdateCourseDTO} Partial course data to update
 * @returns {Course} Updated course
 */
router.put(
  '/courses/:id',
  requirePermission('academic', 'update'),
  academicController.updateCourse
);

// ==================== Sections ====================

/**
 * @route   GET /api/v1/academic/sections
 * @desc    Get all sections with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [courseId] - Filter by course ID
 * @query  {string} [semester] - Filter by semester
 * @query  {string} [facultyId] - Filter by faculty ID
 * @returns {Object} Sections array and pagination info
 */
router.get('/sections', academicController.getAllSections);

/**
 * @route   GET /api/v1/academic/sections/:id
 * @desc    Get section by ID
 * @access  Private
 * @param  {string} id - Section ID
 * @returns {CourseSection} Section object
 */
router.get('/sections/:id', academicController.getSectionById);

/**
 * @route   POST /api/v1/academic/sections
 * @desc    Create a new section
 * @access  Private (Requires academic.create permission)
 * @body   {CreateSectionDTO} Section creation data
 * @returns {CourseSection} Created section
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
 * @param  {string} id - Section ID
 * @body   {UpdateSectionDTO} Partial section data to update
 * @returns {CourseSection} Updated section
 */
router.put(
  '/sections/:id',
  requirePermission('academic', 'update'),
  academicController.updateSection
);

export default router;
