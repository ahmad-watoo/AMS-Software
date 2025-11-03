import { Router } from 'express';
import { LibraryController } from '@/controllers/library.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const libraryController = new LibraryController();

// All library routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/library/books
 * @desc    Get all books (with pagination and search filters)
 * @access  Private
 */
router.get('/books', libraryController.getAllBooks);

/**
 * @route   GET /api/v1/library/books/:id
 * @desc    Get book by ID
 * @access  Private
 */
router.get('/books/:id', libraryController.getBookById);

/**
 * @route   POST /api/v1/library/books
 * @desc    Add a new book to the library
 * @access  Private (Requires library.create permission)
 */
router.post(
  '/books',
  requirePermission('library', 'create'),
  libraryController.createBook
);

/**
 * @route   PUT /api/v1/library/books/:id
 * @desc    Update a book
 * @access  Private (Requires library.update permission)
 */
router.put(
  '/books/:id',
  requirePermission('library', 'update'),
  libraryController.updateBook
);

/**
 * @route   GET /api/v1/library/borrowings
 * @desc    Get all borrowings (with pagination and filters)
 * @access  Private
 */
router.get('/borrowings', libraryController.getAllBorrowings);

/**
 * @route   GET /api/v1/library/borrowings/:id
 * @desc    Get borrowing by ID
 * @access  Private
 */
router.get('/borrowings/:id', libraryController.getBorrowingById);

/**
 * @route   POST /api/v1/library/borrowings
 * @desc    Borrow a book
 * @access  Private (Requires library.create permission)
 */
router.post(
  '/borrowings',
  requirePermission('library', 'create'),
  libraryController.borrowBook
);

/**
 * @route   POST /api/v1/library/borrowings/:id/return
 * @desc    Return a borrowed book
 * @access  Private (Requires library.update permission)
 */
router.post(
  '/borrowings/:id/return',
  requirePermission('library', 'update'),
  libraryController.returnBook
);

/**
 * @route   POST /api/v1/library/borrowings/:id/renew
 * @desc    Renew a borrowed book
 * @access  Private
 */
router.post('/borrowings/:id/renew', libraryController.renewBorrowing);

/**
 * @route   GET /api/v1/library/reservations
 * @desc    Get all reservations (with pagination and filters)
 * @access  Private
 */
router.get('/reservations', libraryController.getAllReservations);

/**
 * @route   POST /api/v1/library/reservations
 * @desc    Create a book reservation
 * @access  Private
 */
router.post('/reservations', libraryController.createReservation);

/**
 * @route   POST /api/v1/library/reservations/:id/cancel
 * @desc    Cancel a reservation
 * @access  Private
 */
router.post('/reservations/:id/cancel', libraryController.cancelReservation);

export default router;

