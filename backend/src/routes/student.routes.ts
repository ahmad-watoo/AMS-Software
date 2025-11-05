/**
 * Student Routes
 * 
 * Defines all student management API endpoints.
 * 
 * Routes:
 * - GET /students - Get all students (with pagination and filters)
 * - GET /students/:id - Get student by ID
 * - GET /students/user/:userId - Get student by user ID
 * - POST /students - Create new student
 * - PUT /students/:id - Update student
 * - DELETE /students/:id - Delete student
 * - GET /students/:id/enrollments - Get student enrollments
 * - GET /students/:id/results - Get student results
 * - GET /students/:id/cgpa - Get student CGPA
 * 
 * All routes require authentication.
 * Most routes require specific permissions.
 * 
 * @module routes/student.routes
 */

import { Router } from 'express';
import { StudentController } from '@/controllers/student.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const studentController = new StudentController();

// All student routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/students
 * @desc    Get all students with pagination and filters
 * @access  Private (Requires student.read permission)
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [search] - Search query
 * @query  {string} [programId] - Filter by program ID
 * @query  {string} [batch] - Filter by batch
 * @query  {string} [enrollmentStatus] - Filter by enrollment status
 * @query  {number} [currentSemester] - Filter by current semester
 * @returns {Object} Students array and pagination info
 */
router.get(
  '/',
  requirePermission('student', 'read'),
  studentController.getAllStudents
);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID with full details
 * @access  Private
 * @param  {string} id - Student ID
 * @returns {StudentWithUser} Student with user and program details
 */
router.get('/:id', studentController.getStudentById);

/**
 * @route   GET /api/v1/students/user/:userId
 * @desc    Get student by user ID
 * @access  Private
 * @param  {string} userId - User ID
 * @returns {StudentWithUser} Student with user and program details
 */
router.get('/user/:userId', studentController.getStudentByUserId);

/**
 * @route   POST /api/v1/students
 * @desc    Create a new student
 * @access  Private (Requires student.create permission)
 * @body   {CreateStudentDTO} Student creation data
 * @returns {Student} Created student
 */
router.post(
  '/',
  requirePermission('student', 'create'),
  studentController.createStudent
);

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update a student
 * @access  Private (Requires student.update permission)
 * @param  {string} id - Student ID
 * @body   {UpdateStudentDTO} Partial student data to update
 * @returns {Student} Updated student
 */
router.put(
  '/:id',
  requirePermission('student', 'update'),
  studentController.updateStudent
);

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete a student
 * @access  Private (Requires student.delete permission)
 * @param  {string} id - Student ID
 * @returns {message: "Student deleted successfully"}
 */
router.delete(
  '/:id',
  requirePermission('student', 'delete'),
  studentController.deleteStudent
);

/**
 * @route   GET /api/v1/students/:id/enrollments
 * @desc    Get all course enrollments for a student
 * @access  Private
 * @param  {string} id - Student ID
 * @query  {string} [semester] - Optional semester filter
 * @returns {Array} Array of enrollments with course and section details
 */
router.get('/:id/enrollments', studentController.getStudentEnrollments);

/**
 * @route   GET /api/v1/students/:id/results
 * @desc    Get all exam results for a student
 * @access  Private
 * @param  {string} id - Student ID
 * @query  {string} [semester] - Optional semester filter
 * @returns {Array} Array of results with course and grade details
 */
router.get('/:id/results', studentController.getStudentResults);

/**
 * @route   GET /api/v1/students/:id/cgpa
 * @desc    Get student CGPA (Cumulative Grade Point Average)
 * @access  Private
 * @param  {string} id - Student ID
 * @returns {Object} CGPA value (0.0 to 4.0)
 */
router.get('/:id/cgpa', studentController.getStudentCGPA);

export default router;
