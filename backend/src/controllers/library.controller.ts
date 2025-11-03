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

