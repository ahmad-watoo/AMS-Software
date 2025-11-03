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

