/**
 * Library Controller
 * 
 * Handles HTTP requests for library management endpoints.
 * Manages books, borrowings, and reservations.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/library.controller
 */

import { Request, Response, NextFunction } from 'express';
import { LibraryService } from '@/services/library.service';
import {
  CreateBookDTO,
  UpdateBookDTO,
  CreateBorrowingDTO,
  CreateReservationDTO,
  RenewBorrowingDTO,
  LibrarySearchFilters,
} from '@/models/Library.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class LibraryController {
  private libraryService: LibraryService;

  constructor() {
    this.libraryService = new LibraryService();
  }

  // ==================== Books ====================

  /**
   * Get All Books Endpoint Handler
   * 
   * Retrieves all books with pagination and optional search filters.
   * 
   * @route GET /api/v1/library/books
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [title] - Filter by title
   * @query {string} [author] - Filter by author
   * @query {string} [isbn] - Filter by ISBN
   * @query {string} [category] - Filter by category
   * @query {string} [subject] - Filter by subject
   * @query {boolean} [available] - Filter by availability
   * @returns {Object} Books array and pagination info
   * 
   * @example
   * GET /api/v1/library/books?page=1&limit=20&title=Data Structures&category=Computer Science
   */
  getAllBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters: LibrarySearchFilters = {
        title: req.query.title as string,
        author: req.query.author as string,
        isbn: req.query.isbn as string,
        category: req.query.category as string,
        subject: req.query.subject as string,
        available: req.query.available ? req.query.available === 'true' : undefined,
      };

      const result = await this.libraryService.getAllBooks(limit, offset, filters);

      sendSuccess(res, {
        books: result.books,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all books error:', error);
      next(error);
    }
  };

  /**
   * Get Book By ID Endpoint Handler
   * 
   * Retrieves a specific book by ID.
   * 
   * @route GET /api/v1/library/books/:id
   * @access Private
   * @param {string} id - Book ID
   * @returns {Book} Book object
   */
  getBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const book = await this.libraryService.getBookById(id);
      sendSuccess(res, book);
    } catch (error) {
      logger.error('Get book by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Book Endpoint Handler
   * 
   * Adds a new book to the library catalog.
   * 
   * @route POST /api/v1/library/books
   * @access Private (Requires library.create permission)
   * @body {CreateBookDTO} Book creation data
   * @returns {Book} Created book
   * 
   * @example
   * POST /api/v1/library/books
   * Body: {
   *   title: "Introduction to Algorithms",
   *   author: "Thomas H. Cormen",
   *   category: "Computer Science",
   *   language: "English",
   *   totalCopies: 10
   * }
   */
  createBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookData: CreateBookDTO = {
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        publicationYear: req.body.publicationYear,
        edition: req.body.edition,
        category: req.body.category,
        subject: req.body.subject,
        language: req.body.language,
        totalCopies: req.body.totalCopies,
        location: req.body.location,
        description: req.body.description,
        coverImageUrl: req.body.coverImageUrl,
      };

      if (!bookData.title || !bookData.author || !bookData.category || !bookData.language) {
        throw new ValidationError('Title, author, category, and language are required');
      }

      const book = await this.libraryService.createBook(bookData);
      sendSuccess(res, book, 'Book added successfully', 201);
    } catch (error) {
      logger.error('Create book error:', error);
      next(error);
    }
  };

  /**
   * Update Book Endpoint Handler
   * 
   * Updates an existing book's information.
   * 
   * @route PUT /api/v1/library/books/:id
   * @access Private (Requires library.update permission)
   * @param {string} id - Book ID
   * @body {UpdateBookDTO} Partial book data to update
   * @returns {Book} Updated book
   * 
   * @example
   * PUT /api/v1/library/books/book123
   * Body: {
   *   title: "Updated Book Title",
   *   totalCopies: 15
   * }
   */
  updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const bookData: UpdateBookDTO = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        publicationYear: req.body.publicationYear,
        edition: req.body.edition,
        category: req.body.category,
        subject: req.body.subject,
        language: req.body.language,
        totalCopies: req.body.totalCopies,
        location: req.body.location,
        description: req.body.description,
        coverImageUrl: req.body.coverImageUrl,
        isActive: req.body.isActive,
      };

      const book = await this.libraryService.updateBook(id, bookData);
      sendSuccess(res, book, 'Book updated successfully');
    } catch (error) {
      logger.error('Update book error:', error);
      next(error);
    }
  };

  // ==================== Borrowings ====================

  /**
   * Get All Borrowings Endpoint Handler
   * 
   * Retrieves all borrowings with pagination and optional filters.
   * 
   * @route GET /api/v1/library/borrowings
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [userId] - Filter by user ID
   * @query {string} [bookId] - Filter by book ID
   * @query {string} [status] - Filter by status
   * @returns {Object} Borrowings array and pagination info
   * 
   * @example
   * GET /api/v1/library/borrowings?page=1&limit=20&userId=user123&status=borrowed
   */
  getAllBorrowings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        userId: req.query.userId as string,
        bookId: req.query.bookId as string,
        status: req.query.status as string,
      };

      const result = await this.libraryService.getAllBorrowings(limit, offset, filters);

      sendSuccess(res, {
        borrowings: result.borrowings,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all borrowings error:', error);
      next(error);
    }
  };

  /**
   * Get Borrowing By ID Endpoint Handler
   * 
   * Retrieves a specific borrowing by ID.
   * 
   * @route GET /api/v1/library/borrowings/:id
   * @access Private
   * @param {string} id - Borrowing record ID
   * @returns {BookBorrowing} Borrowing object
   */
  getBorrowingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const borrowing = await this.libraryService.getBorrowingById(id);
      sendSuccess(res, borrowing);
    } catch (error) {
      logger.error('Get borrowing by ID error:', error);
      next(error);
    }
  };

  /**
   * Borrow Book Endpoint Handler
   * 
   * Creates a new book borrowing record.
   * 
   * @route POST /api/v1/library/borrowings
   * @access Private (Requires library.create permission)
   * @body {CreateBorrowingDTO} Borrowing creation data
   * @returns {BookBorrowing} Created borrowing record
   * 
   * @example
   * POST /api/v1/library/borrowings
   * Body: {
   *   bookId: "book123",
   *   userId: "user456",
   *   userType: "student",
   *   borrowedDate: "2024-10-15",
   *   dueDate: "2024-10-29"
   * }
   */
  borrowBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowingData: CreateBorrowingDTO = {
        bookId: req.body.bookId,
        userId: req.body.userId,
        userType: req.body.userType,
        borrowedDate: req.body.borrowedDate,
        dueDate: req.body.dueDate,
      };

      if (!borrowingData.bookId || !borrowingData.userId || !borrowingData.borrowedDate || !borrowingData.dueDate) {
        throw new ValidationError('All required fields must be provided');
      }

      const borrowing = await this.libraryService.borrowBook(borrowingData);
      sendSuccess(res, borrowing, 'Book borrowed successfully', 201);
    } catch (error) {
      logger.error('Borrow book error:', error);
      next(error);
    }
  };

  /**
   * Return Book Endpoint Handler
   * 
   * Marks a borrowed book as returned.
   * 
   * @route POST /api/v1/library/borrowings/:id/return
   * @access Private (Requires library.update permission)
   * @param {string} id - Borrowing record ID
   * @returns {BookBorrowing} Updated borrowing record
   */
  returnBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const borrowing = await this.libraryService.returnBook(id);
      sendSuccess(res, borrowing, 'Book returned successfully');
    } catch (error) {
      logger.error('Return book error:', error);
      next(error);
    }
  };

  /**
   * Renew Borrowing Endpoint Handler
   * 
   * Renews a book borrowing with a new due date.
   * 
   * @route POST /api/v1/library/borrowings/:id/renew
   * @access Private
   * @param {string} id - Borrowing record ID
   * @body {RenewBorrowingDTO} Renewal data
   * @returns {BookBorrowing} Updated borrowing record
   * 
   * @example
   * POST /api/v1/library/borrowings/borrowing123/renew
   * Body: {
   *   newDueDate: "2024-11-12",
   *   remarks: "Extended for additional research"
   * }
   */
  renewBorrowing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const renewData: RenewBorrowingDTO = {
        newDueDate: req.body.newDueDate,
        remarks: req.body.remarks,
      };

      if (!renewData.newDueDate) {
        throw new ValidationError('New due date is required');
      }

      const borrowing = await this.libraryService.renewBorrowing(id, renewData);
      sendSuccess(res, borrowing, 'Borrowing renewed successfully');
    } catch (error) {
      logger.error('Renew borrowing error:', error);
      next(error);
    }
  };

  // ==================== Reservations ====================

  /**
   * Get All Reservations Endpoint Handler
   * 
   * Retrieves all reservations with pagination and optional filters.
   * 
   * @route GET /api/v1/library/reservations
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [userId] - Filter by user ID
   * @query {string} [bookId] - Filter by book ID
   * @query {string} [status] - Filter by status
   * @returns {Object} Reservations array and pagination info
   * 
   * @example
   * GET /api/v1/library/reservations?page=1&limit=20&bookId=book123&status=pending
   */
  getAllReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        userId: req.query.userId as string,
        bookId: req.query.bookId as string,
        status: req.query.status as string,
      };

      const result = await this.libraryService.getAllReservations(limit, offset, filters);

      sendSuccess(res, {
        reservations: result.reservations,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all reservations error:', error);
      next(error);
    }
  };

  /**
   * Create Reservation Endpoint Handler
   * 
   * Creates a new book reservation.
   * 
   * @route POST /api/v1/library/reservations
   * @access Private
   * @body {CreateReservationDTO} Reservation creation data
   * @returns {BookReservation} Created reservation
   * 
   * @example
   * POST /api/v1/library/reservations
   * Body: {
   *   bookId: "book123",
   *   userId: "user456",
   *   userType: "student",
   *   reservationDate: "2024-10-15",
   *   expiryDate: "2024-10-22"
   * }
   */
  createReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservationData: CreateReservationDTO = {
        bookId: req.body.bookId,
        userId: req.body.userId,
        userType: req.body.userType,
        reservationDate: req.body.reservationDate,
        expiryDate: req.body.expiryDate,
      };

      if (!reservationData.bookId || !reservationData.userId || !reservationData.reservationDate || !reservationData.expiryDate) {
        throw new ValidationError('All required fields must be provided');
      }

      const reservation = await this.libraryService.createReservation(reservationData);
      sendSuccess(res, reservation, 'Reservation created successfully', 201);
    } catch (error) {
      logger.error('Create reservation error:', error);
      next(error);
    }
  };

  /**
   * Cancel Reservation Endpoint Handler
   * 
   * Cancels an existing book reservation.
   * 
   * @route POST /api/v1/library/reservations/:id/cancel
   * @access Private
   * @param {string} id - Reservation ID
   * @returns {BookReservation} Cancelled reservation
   */
  cancelReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reservation = await this.libraryService.cancelReservation(id);
      sendSuccess(res, reservation, 'Reservation cancelled successfully');
    } catch (error) {
      logger.error('Cancel reservation error:', error);
      next(error);
    }
  };
}
