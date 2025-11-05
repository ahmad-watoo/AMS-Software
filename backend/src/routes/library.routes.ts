/**
 * Library Routes
 * 
 * Defines all library management API endpoints.
 * 
 * Routes:
 * - Books: CRUD operations for book catalog
 * - Borrowings: Book borrowing, return, and renewal
 * - Reservations: Book reservation management
 * 
 * All routes require authentication.
 * Create and update routes require specific permissions.
 * 
 * @module routes/library.routes
 */

import { Router } from 'express';
import { LibraryController } from '@/controllers/library.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const libraryController = new LibraryController();

// All library routes require authentication
router.use(authenticate);

// ==================== Books ====================

/**
 * @route   GET /api/v1/library/books
 * @desc    Get all books with pagination and search filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [title] - Filter by title
 * @query  {string} [author] - Filter by author
 * @query  {string} [isbn] - Filter by ISBN
 * @query  {string} [category] - Filter by category
 * @query  {string} [subject] - Filter by subject
 * @query  {boolean} [available] - Filter by availability
 * @returns {Object} Books array and pagination info
 */
router.get('/books', libraryController.getAllBooks);

/**
 * @route   GET /api/v1/library/books/:id
 * @desc    Get book by ID
 * @access  Private
 * @param  {string} id - Book ID
 * @returns {Book} Book object
 */
router.get('/books/:id', libraryController.getBookById);

/**
 * @route   POST /api/v1/library/books
 * @desc    Add a new book to the library
 * @access  Private (Requires library.create permission)
 * @body   {CreateBookDTO} Book creation data
 * @returns {Book} Created book
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
 * @param  {string} id - Book ID
 * @body   {UpdateBookDTO} Partial book data to update
 * @returns {Book} Updated book
 */
router.put(
  '/books/:id',
  requirePermission('library', 'update'),
  libraryController.updateBook
);

// ==================== Borrowings ====================

/**
 * @route   GET /api/v1/library/borrowings
 * @desc    Get all borrowings with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [userId] - Filter by user ID
 * @query  {string} [bookId] - Filter by book ID
 * @query  {string} [status] - Filter by status
 * @returns {Object} Borrowings array and pagination info
 */
router.get('/borrowings', libraryController.getAllBorrowings);

/**
 * @route   GET /api/v1/library/borrowings/:id
 * @desc    Get borrowing by ID
 * @access  Private
 * @param  {string} id - Borrowing record ID
 * @returns {BookBorrowing} Borrowing object
 */
router.get('/borrowings/:id', libraryController.getBorrowingById);

/**
 * @route   POST /api/v1/library/borrowings
 * @desc    Borrow a book
 * @access  Private (Requires library.create permission)
 * @body   {CreateBorrowingDTO} Borrowing creation data
 * @returns {BookBorrowing} Created borrowing record
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
 * @param  {string} id - Borrowing record ID
 * @returns {BookBorrowing} Updated borrowing record
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
 * @param  {string} id - Borrowing record ID
 * @body   {RenewBorrowingDTO} Renewal data
 * @returns {BookBorrowing} Updated borrowing record
 */
router.post('/borrowings/:id/renew', libraryController.renewBorrowing);

// ==================== Reservations ====================

/**
 * @route   GET /api/v1/library/reservations
 * @desc    Get all reservations with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [userId] - Filter by user ID
 * @query  {string} [bookId] - Filter by book ID
 * @query  {string} [status] - Filter by status
 * @returns {Object} Reservations array and pagination info
 */
router.get('/reservations', libraryController.getAllReservations);

/**
 * @route   POST /api/v1/library/reservations
 * @desc    Create a book reservation
 * @access  Private
 * @body   {CreateReservationDTO} Reservation creation data
 * @returns {BookReservation} Created reservation
 */
router.post('/reservations', libraryController.createReservation);

/**
 * @route   POST /api/v1/library/reservations/:id/cancel
 * @desc    Cancel a reservation
 * @access  Private
 * @param  {string} id - Reservation ID
 * @returns {BookReservation} Cancelled reservation
 */
router.post('/reservations/:id/cancel', libraryController.cancelReservation);

export default router;
