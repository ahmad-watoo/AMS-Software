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
  location?: string; // Shelf location
  description?: string;
  coverImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookBorrowing {
  id: string;
  bookId: string;
  userId: string; // Student or Faculty ID
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

export interface LibraryTiming {
  id: string;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  openingTime: string; // HH:mm format
  closingTime: string; // HH:mm format
  isOpen: boolean;
  remarks?: string;
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

export interface UpdateBookDTO {
  title?: string;
  author?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  category?: string;
  subject?: string;
  language?: string;
  totalCopies?: number;
  location?: string;
  description?: string;
  coverImageUrl?: string;
  isActive?: boolean;
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

export interface LibrarySearchFilters {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  subject?: string;
  available?: boolean;
}

export interface BorrowingHistory {
  bookId: string;
  bookTitle: string;
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount?: number;
}

