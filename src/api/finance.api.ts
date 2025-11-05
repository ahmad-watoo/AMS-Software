/**
 * Finance Management API Client
 * 
 * Frontend API client for finance management endpoints.
 * Provides typed functions for all finance operations including:
 * - Fee structure management (CRUD)
 * - Student fee tracking
 * - Payment processing
 * - Financial reporting
 * 
 * @module api/finance.api
 */

import apiClient from './client';

/**
 * Fee Structure Interface
 * 
 * Represents a fee structure for a program/semester.
 * 
 * @interface FeeStructure
 */
export interface FeeStructure {
  id: string;
  programId: string;
  semester: number;
  feeType: 'tuition' | 'admission' | 'registration' | 'exam' | 'library' | 'lab' | 'other';
  amount: number;
  dueDate?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Student Fee Interface
 * 
 * Represents a fee assigned to a student.
 * 
 * @interface StudentFee
 */
export interface StudentFee {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment Interface
 * 
 * Represents a payment made by a student.
 * 
 * @interface Payment
 */
export interface Payment {
  id: string;
  studentFeeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online' | 'cheque' | 'easypaisa' | 'jazzcash' | 'other';
  transactionId?: string;
  receiptNumber: string;
  remarks?: string;
  processedBy?: string;
  createdAt: string;
}

/**
 * Financial Report Interface
 * 
 * Represents a comprehensive financial report.
 * 
 * @interface FinancialReport
 */
export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  feeCollections: number;
  pendingFees: number;
  reportPeriod: string;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

/**
 * Create Fee Structure Data Transfer Object
 * 
 * @interface CreateFeeStructureDTO
 */
export interface CreateFeeStructureDTO {
  programId: string;
  semester: number;
  feeType: 'tuition' | 'admission' | 'registration' | 'exam' | 'library' | 'lab' | 'other';
  amount: number;
  dueDate?: string;
  description?: string;
}

/**
 * Create Payment Data Transfer Object
 * 
 * @interface CreatePaymentDTO
 */
export interface CreatePaymentDTO {
  studentFeeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online' | 'cheque' | 'easypaisa' | 'jazzcash' | 'other';
  transactionId?: string;
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
 * Finance Management API Client
 * 
 * Provides methods for all finance management operations.
 */
const financeAPI = {
  // ==================== Fee Structures ====================

  /**
   * Get all fee structures with pagination and filters
   * 
   * Retrieves fee structures with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.programId] - Filter by program ID
   * @param {number} [params.semester] - Filter by semester
   * @param {string} [params.feeType] - Filter by fee type
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Fee structures array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await financeAPI.getAllFeeStructures({
   *   programId: 'program123',
   *   feeType: 'tuition',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllFeeStructures: async (params?: {
    programId?: string;
    semester?: number;
    feeType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/finance/fee-structures', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch fee structures');
    }
    return response.data.data;
  },

  /**
   * Get fee structure by ID
   * 
   * Retrieves a specific fee structure by its ID.
   * 
   * @param {string} id - Fee structure ID
   * @returns {Promise<FeeStructure>} Fee structure object
   * @throws {Error} If request fails or structure not found
   * 
   * @example
   * const structure = await financeAPI.getFeeStructureById('structure123');
   * console.log(structure.amount); // 50000
   */
  getFeeStructureById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<FeeStructure>>(`/finance/fee-structures/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch fee structure');
    }
    return response.data.data;
  },

  /**
   * Create a new fee structure
   * 
   * Creates a new fee structure.
   * Requires finance.create permission.
   * 
   * @param {CreateFeeStructureDTO} data - Fee structure creation data
   * @returns {Promise<FeeStructure>} Created fee structure
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const structure = await financeAPI.createFeeStructure({
   *   programId: 'program123',
   *   semester: 1,
   *   feeType: 'tuition',
   *   amount: 50000,
   *   description: 'Tuition fee for Fall 2024'
   * });
   */
  createFeeStructure: async (data: CreateFeeStructureDTO) => {
    const response = await apiClient.post<ApiResponse<FeeStructure>>('/finance/fee-structures', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create fee structure');
    }
    return response.data.data;
  },

  /**
   * Update a fee structure
   * 
   * Updates an existing fee structure.
   * Requires finance.update permission.
   * 
   * @param {string} id - Fee structure ID
   * @param {Partial<CreateFeeStructureDTO>} data - Partial fee structure data to update
   * @returns {Promise<FeeStructure>} Updated fee structure
   * @throws {Error} If request fails or structure not found
   * 
   * @example
   * const structure = await financeAPI.updateFeeStructure('structure123', {
   *   amount: 55000,
   *   description: 'Updated tuition fee'
   * });
   */
  updateFeeStructure: async (id: string, data: Partial<CreateFeeStructureDTO>) => {
    const response = await apiClient.put<ApiResponse<FeeStructure>>(`/finance/fee-structures/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update fee structure');
    }
    return response.data.data;
  },

  // ==================== Student Fees ====================

  /**
   * Get all student fees with pagination and filters
   * 
   * Retrieves student fees with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.programId] - Filter by program ID
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Student fees array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await financeAPI.getAllStudentFees({
   *   studentId: 'student123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllStudentFees: async (params?: {
    studentId?: string;
    programId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/finance/student-fees', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student fees');
    }
    return response.data.data;
  },

  /**
   * Get student fee by ID
   * 
   * Retrieves a specific student fee by its ID.
   * 
   * @param {string} id - Student fee ID
   * @returns {Promise<StudentFee>} Student fee object
   * @throws {Error} If request fails or fee not found
   * 
   * @example
   * const fee = await financeAPI.getStudentFeeById('fee123');
   * console.log(fee.balance); // 15000
   */
  getStudentFeeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StudentFee>>(`/finance/student-fees/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student fee');
    }
    return response.data.data;
  },

  // ==================== Payments ====================

  /**
   * Get all payments with pagination and filters
   * 
   * Retrieves payments with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.studentFeeId] - Filter by student fee ID
   * @param {string} [params.studentId] - Filter by student ID
   * @param {string} [params.paymentMethod] - Filter by payment method
   * @param {string} [params.startDate] - Filter by start date
   * @param {string} [params.endDate] - Filter by end date
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Payments array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await financeAPI.getAllPayments({
   *   studentId: 'student123',
   *   startDate: '2024-09-01',
   *   endDate: '2024-10-31',
   *   page: 1,
   *   limit: 20
   * });
   */
  getAllPayments: async (params?: {
    studentFeeId?: string;
    studentId?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/finance/payments', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch payments');
    }
    return response.data.data;
  },

  /**
   * Get payment by ID
   * 
   * Retrieves a specific payment by its ID.
   * 
   * @param {string} id - Payment ID
   * @returns {Promise<Payment>} Payment object
   * @throws {Error} If request fails or payment not found
   * 
   * @example
   * const payment = await financeAPI.getPaymentById('payment123');
   * console.log(payment.amount); // 25000
   */
  getPaymentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/finance/payments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch payment');
    }
    return response.data.data;
  },

  /**
   * Create a payment
   * 
   * Creates a new payment record and updates the associated student fee.
   * Requires finance.create permission.
   * 
   * @param {CreatePaymentDTO} data - Payment creation data
   * @returns {Promise<Payment>} Created payment
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const payment = await financeAPI.createPayment({
   *   studentFeeId: 'fee123',
   *   amount: 25000,
   *   paymentDate: '2024-10-15',
   *   paymentMethod: 'bank_transfer',
   *   transactionId: 'TXN789'
   * });
   */
  createPayment: async (data: CreatePaymentDTO) => {
    const response = await apiClient.post<ApiResponse<Payment>>('/finance/payments', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create payment');
    }
    return response.data.data;
  },

  // ==================== Financial Reports ====================

  /**
   * Get financial report
   * 
   * Retrieves a comprehensive financial report.
   * Requires finance.view permission.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.startDate] - Start date for the report
   * @param {string} [params.endDate] - End date for the report
   * @param {string} [params.programId] - Filter by program ID
   * @returns {Promise<FinancialReport>} Financial report
   * @throws {Error} If request fails
   * 
   * @example
   * const report = await financeAPI.getFinancialReport({
   *   startDate: '2024-09-01',
   *   endDate: '2024-10-31',
   *   programId: 'program123'
   * });
   * console.log(report.totalRevenue); // 5000000
   */
  getFinancialReport: async (params?: {
    startDate?: string;
    endDate?: string;
    programId?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<FinancialReport>>('/finance/reports', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch financial report');
    }
    return response.data.data;
  },
};

export default financeAPI;
