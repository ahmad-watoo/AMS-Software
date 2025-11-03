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
 * @desc    Get all students (with pagination and filters)
 * @access  Private (Requires student.read permission)
 */
router.get(
  '/',
  requirePermission('student', 'read'),
  studentController.getAllStudents
);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', studentController.getStudentById);

/**
 * @route   GET /api/v1/students/user/:userId
 * @desc    Get student by user ID
 * @access  Private
 */
router.get('/user/:userId', studentController.getStudentByUserId);

/**
 * @route   POST /api/v1/students
 * @desc    Create a new student
 * @access  Private (Requires student.create permission)
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
 */
router.delete(
  '/:id',
  requirePermission('student', 'delete'),
  studentController.deleteStudent
);

/**
 * @route   GET /api/v1/students/:id/enrollments
 * @desc    Get student enrollments
 * @access  Private
 */
router.get('/:id/enrollments', studentController.getStudentEnrollments);

/**
 * @route   GET /api/v1/students/:id/results
 * @desc    Get student results
 * @access  Private
 */
router.get('/:id/results', studentController.getStudentResults);

/**
 * @route   GET /api/v1/students/:id/cgpa
 * @desc    Get student CGPA
 * @access  Private
 */
router.get('/:id/cgpa', studentController.getStudentCGPA);

export default router;

