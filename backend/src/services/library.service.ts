/**
 * Library Service
 * 
 * This service handles all library management business logic including:
 * - Book catalog management (CRUD operations)
 * - Book borrowing and return processing
 * - Book renewal management
 * - Book reservation system
 * 
 * The library system manages:
 * - Book catalog with search and filtering
 * - Borrowing workflow with due dates and fines
 * - Renewal requests with reservation checks
 * - Reservation queue management
 * 
 * @module services/library.service
 */

import { LibraryRepository } from '@/repositories/library.repository';
import {
  Book,
  BookBorrowing,
  BookReservation,
  CreateBookDTO,
  UpdateBookDTO,
  CreateBorrowingDTO,
  CreateReservationDTO,
  RenewBorrowingDTO,
  LibrarySearchFilters,
} from '@/models/Library.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class LibraryService {
  private libraryRepository: LibraryRepository;

  constructor() {
    this.libraryRepository = new LibraryRepository();
  }

  // ==================== Books ====================

  /**
   * Get all books with pagination and filters
   * 
   * Retrieves books with optional filtering by title, author, ISBN,
   * category, subject, and availability. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of books to return
   * @param {number} [offset=0] - Number of books to skip
   * @param {LibrarySearchFilters} [filters] - Optional filter criteria
   * @returns {Promise<{books: Book[], total: number}>} Books and total count
   * 
   * @example
   * const { books, total } = await libraryService.getAllBooks(20, 0, {
   *   title: 'Data Structures',
   *   category: 'Computer Science',
   *   available: true
   * });
   */
  async getAllBooks(
    limit: number = 50,
    offset: number = 0,
    filters?: LibrarySearchFilters
  ): Promise<{
    books: Book[];
    total: number;
  }> {
    try {
      const allBooks = await this.libraryRepository.findAllBooks(limit * 10, 0, filters);
      const paginatedBooks = allBooks.slice(offset, offset + limit);

      return {
        books: paginatedBooks,
        total: allBooks.length,
      };
    } catch (error) {
      logger.error('Error getting all books:', error);
      throw new Error('Failed to fetch books');
    }
  }

  /**
   * Get book by ID
   * 
   * Retrieves a specific book by its ID.
   * 
   * @param {string} id - Book ID
   * @returns {Promise<Book>} Book object
   * @throws {NotFoundError} If book not found
   */
  async getBookById(id: string): Promise<Book> {
    try {
      const book = await this.libraryRepository.findBookById(id);
      if (!book) {
        throw new NotFoundError('Book');
      }
      return book;
    } catch (error) {
      logger.error('Error getting book by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch book');
    }
  }

  /**
   * Create a new book
   * 
   * Creates a new book entry in the library catalog with validation.
   * 
   * @param {CreateBookDTO} bookData - Book creation data
   * @returns {Promise<Book>} Created book
   * @throws {ValidationError} If book data is invalid
   * 
   * @example
   * const book = await libraryService.createBook({
   *   title: 'Introduction to Algorithms',
   *   author: 'Thomas H. Cormen',
   *   category: 'Computer Science',
   *   language: 'English',
   *   totalCopies: 10
   * });
   */
  async createBook(bookData: CreateBookDTO): Promise<Book> {
    try {
      if (!bookData.title || !bookData.author || !bookData.category || !bookData.language) {
        throw new ValidationError('Title, author, category, and language are required');
      }

      if (bookData.totalCopies <= 0) {
        throw new ValidationError('Total copies must be greater than 0');
      }

      return await this.libraryRepository.createBook(bookData);
    } catch (error) {
      logger.error('Error creating book:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create book');
    }
  }

  /**
   * Update a book
   * 
   * Updates an existing book's information.
   * Validates total copies cannot be less than borrowed copies.
   * 
   * @param {string} id - Book ID
   * @param {UpdateBookDTO} bookData - Partial book data to update
   * @returns {Promise<Book>} Updated book
   * @throws {NotFoundError} If book not found
   * @throws {ValidationError} If total copies is invalid
   */
  async updateBook(id: string, bookData: UpdateBookDTO): Promise<Book> {
    try {
      const existingBook = await this.libraryRepository.findBookById(id);
      if (!existingBook) {
        throw new NotFoundError('Book');
      }

      if (bookData.totalCopies !== undefined && bookData.totalCopies < existingBook.totalCopies - existingBook.availableCopies) {
        throw new ValidationError('Total copies cannot be less than borrowed copies');
      }

      return await this.libraryRepository.updateBook(id, bookData);
    } catch (error) {
      logger.error('Error updating book:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update book');
    }
  }

  // ==================== Borrowings ====================

  /**
   * Get all borrowings with pagination and filters
   * 
   * Retrieves book borrowings with optional filtering by user, book,
   * and status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of borrowings to return
   * @param {number} [offset=0] - Number of borrowings to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.userId] - Filter by user ID
   * @param {string} [filters.bookId] - Filter by book ID
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<{borrowings: BookBorrowing[], total: number}>} Borrowings and total count
   * 
   * @example
   * const { borrowings, total } = await libraryService.getAllBorrowings(20, 0, {
   *   userId: 'user123',
   *   status: 'borrowed'
   * });
   */
  async getAllBorrowings(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      userId?: string;
      bookId?: string;
      status?: string;
    }
  ): Promise<{
    borrowings: BookBorrowing[];
    total: number;
  }> {
    try {
      const allBorrowings = await this.libraryRepository.findAllBorrowings(limit * 10, 0, filters);
      const paginatedBorrowings = allBorrowings.slice(offset, offset + limit);

      return {
        borrowings: paginatedBorrowings,
        total: allBorrowings.length,
      };
    } catch (error) {
      logger.error('Error getting all borrowings:', error);
      throw new Error('Failed to fetch borrowings');
    }
  }

  /**
   * Get borrowing by ID
   * 
   * Retrieves a specific borrowing record by its ID.
   * 
   * @param {string} id - Borrowing record ID
   * @returns {Promise<BookBorrowing>} Borrowing object
   * @throws {NotFoundError} If borrowing not found
   */
  async getBorrowingById(id: string): Promise<BookBorrowing> {
    try {
      const borrowing = await this.libraryRepository.findBorrowingById(id);
      if (!borrowing) {
        throw new NotFoundError('Borrowing record');
      }
      return borrowing;
    } catch (error) {
      logger.error('Error getting borrowing by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch borrowing');
    }
  }

  /**
   * Borrow a book
   * 
   * Creates a new borrowing record with validation.
   * Checks for overdue books and borrowing limits.
   * 
   * @param {CreateBorrowingDTO} borrowingData - Borrowing creation data
   * @returns {Promise<BookBorrowing>} Created borrowing record
   * @throws {ValidationError} If borrowing data is invalid or limits are exceeded
   * 
   * @example
   * const borrowing = await libraryService.borrowBook({
   *   bookId: 'book123',
   *   userId: 'user456',
   *   userType: 'student',
   *   borrowedDate: '2024-10-15',
   *   dueDate: '2024-10-29'
   * });
   */
  async borrowBook(borrowingData: CreateBorrowingDTO): Promise<BookBorrowing> {
    try {
      if (!borrowingData.bookId || !borrowingData.userId || !borrowingData.borrowedDate || !borrowingData.dueDate) {
        throw new ValidationError('All required fields must be provided');
      }

      // Check if user has overdue books
      const userBorrowings = await this.libraryRepository.findAllBorrowings(100, 0, {
        userId: borrowingData.userId,
        status: 'overdue',
      });

      if (userBorrowings.length > 0) {
        throw new ValidationError('Cannot borrow book. You have overdue books that must be returned first.');
      }

      // Check borrowing limit (e.g., 5 books at a time)
      const activeBorrowings = await this.libraryRepository.findAllBorrowings(100, 0, {
        userId: borrowingData.userId,
        status: 'borrowed',
      });

      if (activeBorrowings.length >= 5) {
        throw new ValidationError('Borrowing limit reached. Please return some books first.');
      }

      return await this.libraryRepository.createBorrowing(borrowingData);
    } catch (error) {
      logger.error('Error borrowing book:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('not available')) {
        throw new ValidationError(error.message);
      }
      throw new Error('Failed to borrow book');
    }
  }

  /**
   * Return a book
   * 
   * Marks a borrowed book as returned.
   * 
   * @param {string} id - Borrowing record ID
   * @returns {Promise<BookBorrowing>} Updated borrowing record
   * @throws {NotFoundError} If borrowing not found
   * @throws {ValidationError} If book already returned
   */
  async returnBook(id: string): Promise<BookBorrowing> {
    try {
      const borrowing = await this.libraryRepository.findBorrowingById(id);
      if (!borrowing) {
        throw new NotFoundError('Borrowing record');
      }

      if (borrowing.status === 'returned') {
        throw new ValidationError('Book has already been returned');
      }

      const returnDate = new Date().toISOString().split('T')[0];
      return await this.libraryRepository.returnBook(id, returnDate);
    } catch (error) {
      logger.error('Error returning book:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to return book');
    }
  }

  /**
   * Renew a borrowing
   * 
   * Renews a book borrowing with a new due date.
   * Checks for pending reservations before allowing renewal.
   * 
   * @param {string} id - Borrowing record ID
   * @param {RenewBorrowingDTO} renewData - Renewal data with new due date
   * @returns {Promise<BookBorrowing>} Updated borrowing record
   * @throws {NotFoundError} If borrowing not found
   * @throws {ValidationError} If renewal is not allowed
   * 
   * @example
   * const borrowing = await libraryService.renewBorrowing('borrowing123', {
   *   newDueDate: '2024-11-12',
   *   remarks: 'Extended for additional research'
   * });
   */
  async renewBorrowing(id: string, renewData: RenewBorrowingDTO): Promise<BookBorrowing> {
    try {
      const borrowing = await this.libraryRepository.findBorrowingById(id);
      if (!borrowing) {
        throw new NotFoundError('Borrowing record');
      }

      if (borrowing.status !== 'borrowed') {
        throw new ValidationError('Only borrowed books can be renewed');
      }

      // Check if there are reservations for this book
      const reservations = await this.libraryRepository.findAllReservations(10, 0, {
        bookId: borrowing.bookId,
        status: 'pending',
      });

      if (reservations.length > 0) {
        throw new ValidationError('Cannot renew. Book is reserved by another user.');
      }

      return await this.libraryRepository.renewBorrowing(id, renewData);
    } catch (error) {
      logger.error('Error renewing borrowing:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to renew borrowing');
    }
  }

  // ==================== Reservations ====================

  /**
   * Get all reservations with pagination and filters
   * 
   * Retrieves book reservations with optional filtering by user, book,
   * and status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of reservations to return
   * @param {number} [offset=0] - Number of reservations to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.userId] - Filter by user ID
   * @param {string} [filters.bookId] - Filter by book ID
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<{reservations: BookReservation[], total: number}>} Reservations and total count
   * 
   * @example
   * const { reservations, total } = await libraryService.getAllReservations(20, 0, {
   *   bookId: 'book123',
   *   status: 'pending'
   * });
   */
  async getAllReservations(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      userId?: string;
      bookId?: string;
      status?: string;
    }
  ): Promise<{
    reservations: BookReservation[];
    total: number;
  }> {
    try {
      const allReservations = await this.libraryRepository.findAllReservations(limit * 10, 0, filters);
      const paginatedReservations = allReservations.slice(offset, offset + limit);

      return {
        reservations: paginatedReservations,
        total: allReservations.length,
      };
    } catch (error) {
      logger.error('Error getting all reservations:', error);
      throw new Error('Failed to fetch reservations');
    }
  }

  /**
   * Create a reservation
   * 
   * Creates a new book reservation with validation.
   * Checks if book exists and prevents duplicate reservations.
   * 
   * @param {CreateReservationDTO} reservationData - Reservation creation data
   * @returns {Promise<BookReservation>} Created reservation
   * @throws {ValidationError} If reservation data is invalid
   * @throws {NotFoundError} If book not found
   * 
   * @example
   * const reservation = await libraryService.createReservation({
   *   bookId: 'book123',
   *   userId: 'user456',
   *   userType: 'student',
   *   reservationDate: '2024-10-15',
   *   expiryDate: '2024-10-22'
   * });
   */
  async createReservation(reservationData: CreateReservationDTO): Promise<BookReservation> {
    try {
      if (!reservationData.bookId || !reservationData.userId || !reservationData.reservationDate || !reservationData.expiryDate) {
        throw new ValidationError('All required fields must be provided');
      }

      // Check if book exists
      const book = await this.libraryRepository.findBookById(reservationData.bookId);
      if (!book) {
        throw new NotFoundError('Book');
      }

      // Check if user already has a pending reservation for this book
      const existingReservations = await this.libraryRepository.findAllReservations(10, 0, {
        userId: reservationData.userId,
        bookId: reservationData.bookId,
        status: 'pending',
      });

      if (existingReservations.length > 0) {
        throw new ValidationError('You already have a pending reservation for this book');
      }

      return await this.libraryRepository.createReservation(reservationData);
    } catch (error) {
      logger.error('Error creating reservation:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create reservation');
    }
  }

  /**
   * Cancel a reservation
   * 
   * Cancels an existing book reservation.
   * 
   * @param {string} id - Reservation ID
   * @returns {Promise<BookReservation>} Cancelled reservation
   * @throws {Error} If cancellation fails
   */
  async cancelReservation(id: string): Promise<BookReservation> {
    try {
      const reservation = await this.libraryRepository.findAllReservations(1, 0, { userId: '', bookId: '' });
      // Find reservation by ID would need to be added to repository
      return await this.libraryRepository.updateReservationStatus(id, 'cancelled');
    } catch (error) {
      logger.error('Error cancelling reservation:', error);
      throw new Error('Failed to cancel reservation');
    }
  }
}
