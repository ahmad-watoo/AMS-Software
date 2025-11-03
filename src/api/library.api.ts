import apiClient from './client';

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

export interface CreateBorrowingDTO {
  bookId: string;
  userId: string;
  userType: 'student' | 'faculty' | 'staff';
  borrowedDate: string;
  dueDate: string;
}

export interface CreateReservationDTO {
  bookId: string;
  userId: string;
  userType: 'student' | 'faculty' | 'staff';
  reservationDate: string;
  expiryDate: string;
}

export interface RenewBorrowingDTO {
  newDueDate: string;
  remarks?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

const libraryAPI = {
  // Books
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

  getBookById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Book>>(`/library/books/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch book');
    }
    return response.data.data;
  },

  createBook: async (data: CreateBookDTO) => {
    const response = await apiClient.post<ApiResponse<Book>>('/library/books', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create book');
    }
    return response.data.data;
  },

  updateBook: async (id: string, data: Partial<CreateBookDTO>) => {
    const response = await apiClient.put<ApiResponse<Book>>(`/library/books/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update book');
    }
    return response.data.data;
  },

  // Borrowings
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

  getBorrowingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<BookBorrowing>>(`/library/borrowings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch borrowing');
    }
    return response.data.data;
  },

  borrowBook: async (data: CreateBorrowingDTO) => {
    const response = await apiClient.post<ApiResponse<BookBorrowing>>('/library/borrowings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to borrow book');
    }
    return response.data.data;
  },

  returnBook: async (id: string) => {
    const response = await apiClient.post<ApiResponse<BookBorrowing>>(`/library/borrowings/${id}/return`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to return book');
    }
    return response.data.data;
  },

  renewBorrowing: async (id: string, data: RenewBorrowingDTO) => {
    const response = await apiClient.post<ApiResponse<BookBorrowing>>(`/library/borrowings/${id}/renew`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to renew borrowing');
    }
    return response.data.data;
  },

  // Reservations
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

  createReservation: async (data: CreateReservationDTO) => {
    const response = await apiClient.post<ApiResponse<BookReservation>>('/library/reservations', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create reservation');
    }
    return response.data.data;
  },

  cancelReservation: async (id: string) => {
    const response = await apiClient.post<ApiResponse<BookReservation>>(`/library/reservations/${id}/cancel`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to cancel reservation');
    }
    return response.data.data;
  },
};

export default libraryAPI;

