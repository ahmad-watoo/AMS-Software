import { supabaseAdmin } from '@/config/supabase';
import {
  Book,
  BookBorrowing,
  BookReservation,
  LibraryTiming,
  CreateBookDTO,
  UpdateBookDTO,
  CreateBorrowingDTO,
  CreateReservationDTO,
  RenewBorrowingDTO,
  LibrarySearchFilters,
} from '@/models/Library.model';
import { logger } from '@/config/logger';

export class LibraryRepository {
  private booksTable = 'books';
  private borrowingsTable = 'book_borrowings';
  private reservationsTable = 'book_reservations';
  private libraryTimingsTable = 'library_timings';

  // ==================== Books ====================

  async findAllBooks(
    limit: number = 50,
    offset: number = 0,
    filters?: LibrarySearchFilters
  ): Promise<Book[]> {
    try {
      let query = supabaseAdmin
        .from(this.booksTable)
        .select('*')
        .order('title', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      if (filters?.author) {
        query = query.ilike('author', `%${filters.author}%`);
      }
      if (filters?.isbn) {
        query = query.eq('isbn', filters.isbn);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.subject) {
        query = query.ilike('subject', `%${filters.subject}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let books = (data || []).map(this.mapBookFromDB) as Book[];

      // Filter by availability if requested
      if (filters?.available !== undefined) {
        books = books.filter((book) => {
          if (filters.available) {
            return book.availableCopies > 0;
          }
          return book.availableCopies === 0;
        });
      }

      return books;
    } catch (error) {
      logger.error('Error finding all books:', error);
      throw new Error('Failed to fetch books');
    }
  }

  async findBookById(id: string): Promise<Book | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.booksTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapBookFromDB(data) as Book;
    } catch (error) {
      logger.error('Error finding book by ID:', error);
      throw error;
    }
  }

  async createBook(bookData: CreateBookDTO): Promise<Book> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.booksTable)
        .insert({
          isbn: bookData.isbn || null,
          title: bookData.title,
          author: bookData.author,
          publisher: bookData.publisher || null,
          publication_year: bookData.publicationYear || null,
          edition: bookData.edition || null,
          category: bookData.category,
          subject: bookData.subject || null,
          language: bookData.language,
          total_copies: bookData.totalCopies,
          available_copies: bookData.totalCopies,
          location: bookData.location || null,
          description: bookData.description || null,
          cover_image_url: bookData.coverImageUrl || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapBookFromDB(data) as Book;
    } catch (error) {
      logger.error('Error creating book:', error);
      throw new Error('Failed to create book');
    }
  }

  async updateBook(id: string, bookData: UpdateBookDTO): Promise<Book> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (bookData.title !== undefined) updateData.title = bookData.title;
      if (bookData.author !== undefined) updateData.author = bookData.author;
      if (bookData.publisher !== undefined) updateData.publisher = bookData.publisher;
      if (bookData.publicationYear !== undefined) updateData.publication_year = bookData.publicationYear;
      if (bookData.edition !== undefined) updateData.edition = bookData.edition;
      if (bookData.category !== undefined) updateData.category = bookData.category;
      if (bookData.subject !== undefined) updateData.subject = bookData.subject;
      if (bookData.language !== undefined) updateData.language = bookData.language;
      if (bookData.totalCopies !== undefined) {
        updateData.total_copies = bookData.totalCopies;
        // Update available copies proportionally if total copies changes
        const currentBook = await this.findBookById(id);
        if (currentBook) {
          const ratio = bookData.totalCopies / currentBook.totalCopies;
          updateData.available_copies = Math.floor(currentBook.availableCopies * ratio);
        }
      }
      if (bookData.location !== undefined) updateData.location = bookData.location;
      if (bookData.description !== undefined) updateData.description = bookData.description;
      if (bookData.coverImageUrl !== undefined) updateData.cover_image_url = bookData.coverImageUrl;
      if (bookData.isActive !== undefined) updateData.is_active = bookData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.booksTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapBookFromDB(data) as Book;
    } catch (error) {
      logger.error('Error updating book:', error);
      throw new Error('Failed to update book');
    }
  }

  // ==================== Borrowings ====================

  async findAllBorrowings(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      userId?: string;
      bookId?: string;
      status?: string;
    }
  ): Promise<BookBorrowing[]> {
    try {
      let query = supabaseAdmin
        .from(this.borrowingsTable)
        .select('*')
        .order('borrowed_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.bookId) {
        query = query.eq('book_id', filters.bookId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapBorrowingFromDB) as BookBorrowing[];
    } catch (error) {
      logger.error('Error finding all borrowings:', error);
      throw new Error('Failed to fetch borrowings');
    }
  }

  async findBorrowingById(id: string): Promise<BookBorrowing | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.borrowingsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapBorrowingFromDB(data) as BookBorrowing;
    } catch (error) {
      logger.error('Error finding borrowing by ID:', error);
      throw error;
    }
  }

  async createBorrowing(borrowingData: CreateBorrowingDTO): Promise<BookBorrowing> {
    try {
      // Check if book is available
      const book = await this.findBookById(borrowingData.bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      if (book.availableCopies <= 0) {
        throw new Error('Book is not available');
      }

      // Create borrowing record
      const { data, error } = await supabaseAdmin
        .from(this.borrowingsTable)
        .insert({
          book_id: borrowingData.bookId,
          user_id: borrowingData.userId,
          user_type: borrowingData.userType,
          borrowed_date: borrowingData.borrowedDate,
          due_date: borrowingData.dueDate,
          status: 'borrowed',
          renewed_count: 0,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Decrease available copies
      await supabaseAdmin
        .from(this.booksTable)
        .update({ available_copies: book.availableCopies - 1 })
        .eq('id', borrowingData.bookId);

      return this.mapBorrowingFromDB(data) as BookBorrowing;
    } catch (error) {
      logger.error('Error creating borrowing:', error);
      throw error;
    }
  }

  async returnBook(id: string, returnDate: string): Promise<BookBorrowing> {
    try {
      const borrowing = await this.findBorrowingById(id);
      if (!borrowing) {
        throw new Error('Borrowing record not found');
      }

      const dueDate = new Date(borrowing.dueDate);
      const actualReturnDate = new Date(returnDate);
      const isOverdue = actualReturnDate > dueDate;

      // Calculate fine if overdue (e.g., 10 PKR per day)
      let fineAmount = 0;
      if (isOverdue) {
        const daysOverdue = Math.ceil((actualReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * 10; // 10 PKR per day
      }

      const { data, error } = await supabaseAdmin
        .from(this.borrowingsTable)
        .update({
          return_date: returnDate,
          status: isOverdue ? 'overdue' : 'returned',
          fine_amount: fineAmount,
          fine_paid: fineAmount === 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Increase available copies
      const book = await this.findBookById(borrowing.bookId);
      if (book) {
        await supabaseAdmin
          .from(this.booksTable)
          .update({ available_copies: book.availableCopies + 1 })
          .eq('id', borrowing.bookId);
      }

      return this.mapBorrowingFromDB(data) as BookBorrowing;
    } catch (error) {
      logger.error('Error returning book:', error);
      throw new Error('Failed to return book');
    }
  }

  async renewBorrowing(id: string, renewData: RenewBorrowingDTO): Promise<BookBorrowing> {
    try {
      const borrowing = await this.findBorrowingById(id);
      if (!borrowing) {
        throw new Error('Borrowing record not found');
      }

      // Check max renewal limit (e.g., 2 renewals)
      if (borrowing.renewedCount >= 2) {
        throw new Error('Maximum renewal limit reached');
      }

      const { data, error } = await supabaseAdmin
        .from(this.borrowingsTable)
        .update({
          due_date: renewData.newDueDate,
          renewed_count: borrowing.renewedCount + 1,
          remarks: renewData.remarks || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapBorrowingFromDB(data) as BookBorrowing;
    } catch (error) {
      logger.error('Error renewing borrowing:', error);
      throw error;
    }
  }

  // ==================== Reservations ====================

  async findAllReservations(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      userId?: string;
      bookId?: string;
      status?: string;
    }
  ): Promise<BookReservation[]> {
    try {
      let query = supabaseAdmin
        .from(this.reservationsTable)
        .select('*')
        .order('reservation_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.bookId) {
        query = query.eq('book_id', filters.bookId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapReservationFromDB) as BookReservation[];
    } catch (error) {
      logger.error('Error finding all reservations:', error);
      throw new Error('Failed to fetch reservations');
    }
  }

  async createReservation(reservationData: CreateReservationDTO): Promise<BookReservation> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.reservationsTable)
        .insert({
          book_id: reservationData.bookId,
          user_id: reservationData.userId,
          user_type: reservationData.userType,
          reservation_date: reservationData.reservationDate,
          expiry_date: reservationData.expiryDate,
          status: 'pending',
          notified: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapReservationFromDB(data) as BookReservation;
    } catch (error) {
      logger.error('Error creating reservation:', error);
      throw new Error('Failed to create reservation');
    }
  }

  async updateReservationStatus(id: string, status: BookReservation['status']): Promise<BookReservation> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.reservationsTable)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapReservationFromDB(data) as BookReservation;
    } catch (error) {
      logger.error('Error updating reservation status:', error);
      throw new Error('Failed to update reservation');
    }
  }

  // ==================== Helper Mappers ====================

  private mapBookFromDB(data: any): Partial<Book> {
    return {
      id: data.id,
      isbn: data.isbn,
      title: data.title,
      author: data.author,
      publisher: data.publisher,
      publicationYear: data.publication_year,
      edition: data.edition,
      category: data.category,
      subject: data.subject,
      language: data.language,
      totalCopies: data.total_copies,
      availableCopies: data.available_copies,
      location: data.location,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapBorrowingFromDB(data: any): Partial<BookBorrowing> {
    return {
      id: data.id,
      bookId: data.book_id,
      userId: data.user_id,
      userType: data.user_type,
      borrowedDate: data.borrowed_date,
      dueDate: data.due_date,
      returnDate: data.return_date,
      status: data.status,
      fineAmount: data.fine_amount,
      finePaid: data.fine_paid,
      renewedCount: data.renewed_count,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapReservationFromDB(data: any): Partial<BookReservation> {
    return {
      id: data.id,
      bookId: data.book_id,
      userId: data.user_id,
      userType: data.user_type,
      reservationDate: data.reservation_date,
      expiryDate: data.expiry_date,
      status: data.status,
      notified: data.notified,
      createdAt: data.created_at,
    };
  }
}

