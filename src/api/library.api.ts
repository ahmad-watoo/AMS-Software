/**
 * Library Management API Client
 * 
 * Frontend API client for library management endpoints.
 * Provides typed functions for all library operations including:
 * - Book catalog management (CRUD)
 * - Book borrowing and return
 * - Book renewal
 * - Book reservations
 * 
 * @module api/library.api
 */

import apiClient from './client';

/**
 * Book Interface
 * 
 * Represents a book in the library catalog.
 * 
 * @interface Book
 */
export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  category: string;
  subject?: string;
  language: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  description?: string;
  coverImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Book Borrowing Interface
 * 
 * Represents a book borrowing record.
 * 
 * @interface BookBorrowing
 */
export interface BookBorrowing {
  id: string;
  bookId: string;
  userId: string;
  userType: 'student' | 'faculty' | 'staff';
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue' | 'lost';
  fineAmount?: number;
  finePaid?: boolean;
  renewedCount: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Book Reservation Interface
 * 
 * Represents a book reservation.
 * 
 * @interface BookReservation
 */
export interface BookReservation {
  id: string;
  bookId: string;
  userId: string;
  userType: 'student' | 'faculty' | 'staff';
  reservationDate: string;
  expiryDate: string;
  status: 'pending' | 'available' | 'fulfilled' | 'cancelled' | 'expired';
  notified: boolean;
  createdAt: string;
}

/**
 * Create Book Data Transfer Object
 * 
 * @interface CreateBookDTO
 */
export interface CreateBookDTO {
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  category: string;
  subject?: string;
  language: string;
  totalCopies: number;
  location?: string;
  description?: string;
  coverImageUrl?: string;
}

/**
 * Create Borrowing Data Transfer Object
 * 
 * @interface CreateBorrowingDTO
 */
export interface CreateBorrowingDTO {
  bookId: string;
  userId: string;
  userType: 'student' | 'faculty' | 'staff';
  borrowedDate: string;
  dueDate: string;
}

/**
 * Create Reservation Data Transfer Object
 * 
 * @interface CreateReservationDTO
 */
export interface CreateReservationDTO {
  bookId: string;
  userId: string;
  userType: 'student' | 'faculty' | 'staff';
  reservationDate: string;
  expiryDate: string;
}

/**
 * Renew Borrowing Data Transfer Object
 * 
 * @interface RenewBorrowingDTO
 */
export interface RenewBorrowingDTO {
  newDueDate: string;
  remarks?: string;
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

/**
 * Library Management API Client
 * 
 * Provides methods for all library management operations.
 */
const libraryAPI = {
  // ==================== Books ====================

  /**
   * Get all books with pagination and search filters
   * 
   * Retrieves books with pagination and optional search filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.title] - Filter by title
   * @param {string} [params.author] - Filter by author
   * @param {string} [params.isbn] - Filter by ISBN
   * @param {string} [params.category] - Filter by category
   * @param {string} [params.subject] - Filter by subject
   * @param {boolean} [params.available] - Filter by availability
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Books array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await libraryAPI.getAllBooks({
   *   title: 'Data Structures',
   *   category: 'Computer Science',
   *   available: true,
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllBooks: async (params?: {
    title?: string;
    author?: string;
    isbn?: string;
    category?: string;
    subject?: string;
    available?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/library/books', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch books');
    }
    return response.data.data;
  },

  /**
   * Get book by ID
   * 
   * Retrieves a specific book by its ID.
   * 
   * @param {string} id - Book ID
   * @returns {Promise<Book>} Book object
   * @throws {Error} If request fails or book not found
   * 
   * @example
   * const book = await libraryAPI.getBookById('book123');
   * console.log(book.title); // 'Introduction to Algorithms'
   */
  getBookById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Book>>(`/library/books/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch book');
    }
    return response.data.data;
  },

  /**
   * Create a new book
   * 
   * Adds a new book to the library catalog.
   * Requires library.create permission.
   * 
   * @param {CreateBookDTO} data - Book creation data
   * @returns {Promise<Book>} Created book
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const book = await libraryAPI.createBook({
   *   title: 'Introduction to Algorithms',
   *   author: 'Thomas H. Cormen',
   *   category: 'Computer Science',
   *   language: 'English',
   *   totalCopies: 10
   * });
   */
  createBook: async (data: CreateBookDTO) => {
    const response = await apiClient.post<ApiResponse<Book>>('/library/books', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create book');
    }
    return response.data.data;
  },

  /**
   * Update a book
   * 
   * Updates an existing book.
   * Requires library.update permission.
   * 
   * @param {string} id - Book ID
   * @param {Partial<CreateBookDTO>} data - Partial book data to update
   * @returns {Promise<Book>} Updated book
   * @throws {Error} If request fails or book not found
   * 
   * @example
   * const book = await libraryAPI.updateBook('book123', {
   *   title: 'Updated Book Title',
   *   totalCopies: 15
   * });
   */
  updateBook: async (id: string, data: Partial<CreateBookDTO>) => {
    const response = await apiClient.put<ApiResponse<Book>>(`/library/books/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update book');
    }
    return response.data.data;
  },

  // ==================== Borrowings ====================

  /**
   * Get all borrowings with pagination and filters
   * 
   * Retrieves borrowings with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.bookId] - Filter by book ID
   * @param {string} [params.userId] - Filter by user ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Borrowings array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await libraryAPI.getAllBorrowings({
   *   userId: 'user123',
   *   status: 'borrowed',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllBorrowings: async (params?: {
    bookId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/library/borrowings', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch borrowings');
    }
    return response.data.data;
  },

  /**
   * Get borrowing by ID
   * 
   * Retrieves a specific borrowing by its ID.
   * 
   * @param {string} id - Borrowing record ID
   * @returns {Promise<BookBorrowing>} Borrowing object
   * @throws {Error} If request fails or borrowing not found
   * 
   * @example
   * const borrowing = await libraryAPI.getBorrowingById('borrowing123');
   * console.log(borrowing.dueDate); // '2024-10-29'
   */
  getBorrowingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<BookBorrowing>>(`/library/borrowings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch borrowing');
    }
    return response.data.data;
  },

  /**
   * Borrow a book
   * 
   * Creates a new book borrowing record.
   * Requires library.create permission.
   * 
   * @param {CreateBorrowingDTO} data - Borrowing creation data
   * @returns {Promise<BookBorrowing>} Created borrowing record
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const borrowing = await libraryAPI.borrowBook({
   *   bookId: 'book123',
   *   userId: 'user456',
   *   userType: 'student',
   *   borrowedDate: '2024-10-15',
   *   dueDate: '2024-10-29'
   * });
   */
  borrowBook: async (data: CreateBorrowingDTO) => {
    const response = await apiClient.post<ApiResponse<BookBorrowing>>('/library/borrowings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to borrow book');
    }
    return response.data.data;
  },

  /**
   * Return a book
   * 
   * Marks a borrowed book as returned.
   * Requires library.update permission.
   * 
   * @param {string} id - Borrowing record ID
   * @returns {Promise<BookBorrowing>} Updated borrowing record
   * @throws {Error} If request fails or borrowing not found
   * 
   * @example
   * const borrowing = await libraryAPI.returnBook('borrowing123');
   */
  returnBook: async (id: string) => {
    const response = await apiClient.post<ApiResponse<BookBorrowing>>(`/library/borrowings/${id}/return`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to return book');
    }
    return response.data.data;
  },

  /**
   * Renew a borrowing
   * 
   * Renews a book borrowing with a new due date.
   * 
   * @param {string} id - Borrowing record ID
   * @param {RenewBorrowingDTO} data - Renewal data
   * @returns {Promise<BookBorrowing>} Updated borrowing record
   * @throws {Error} If request fails or renewal not allowed
   * 
   * @example
   * const borrowing = await libraryAPI.renewBorrowing('borrowing123', {
   *   newDueDate: '2024-11-12',
   *   remarks: 'Extended for additional research'
   * });
   */
  renewBorrowing: async (id: string, data: RenewBorrowingDTO) => {
    const response = await apiClient.post<ApiResponse<BookBorrowing>>(`/library/borrowings/${id}/renew`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to renew borrowing');
    }
    return response.data.data;
  },

  // ==================== Reservations ====================

  /**
   * Get all reservations with pagination and filters
   * 
   * Retrieves reservations with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.bookId] - Filter by book ID
   * @param {string} [params.userId] - Filter by user ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Reservations array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await libraryAPI.getAllReservations({
   *   bookId: 'book123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllReservations: async (params?: {
    bookId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/library/reservations', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch reservations');
    }
    return response.data.data;
  },

  /**
   * Create a reservation
   * 
   * Creates a new book reservation.
   * 
   * @param {CreateReservationDTO} data - Reservation creation data
   * @returns {Promise<BookReservation>} Created reservation
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const reservation = await libraryAPI.createReservation({
   *   bookId: 'book123',
   *   userId: 'user456',
   *   userType: 'student',
   *   reservationDate: '2024-10-15',
   *   expiryDate: '2024-10-22'
   * });
   */
  createReservation: async (data: CreateReservationDTO) => {
    const response = await apiClient.post<ApiResponse<BookReservation>>('/library/reservations', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create reservation');
    }
    return response.data.data;
  },

  /**
   * Cancel a reservation
   * 
   * Cancels an existing book reservation.
   * 
   * @param {string} id - Reservation ID
   * @returns {Promise<BookReservation>} Cancelled reservation
   * @throws {Error} If request fails or reservation not found
   * 
   * @example
   * const reservation = await libraryAPI.cancelReservation('reservation123');
   */
  cancelReservation: async (id: string) => {
    const response = await apiClient.post<ApiResponse<BookReservation>>(`/library/reservations/${id}/cancel`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to cancel reservation');
    }
    return response.data.data;
  },

  /**
   * Delete a book
   * 
   * Deletes a book from the library catalog.
   * Requires library.delete permission.
   * 
   * @param {string} id - Book ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or book not found
   * 
   * @example
   * await libraryAPI.deleteBook('book123');
   */
  deleteBook: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/library/books/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete book');
    }
  },
};

export default libraryAPI;
