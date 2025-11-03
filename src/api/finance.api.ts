import apiClient from './client';

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

export interface CreateFeeStructureDTO {
  programId: string;
  semester: number;
  feeType: 'tuition' | 'admission' | 'registration' | 'exam' | 'library' | 'lab' | 'other';
  amount: number;
  dueDate?: string;
  description?: string;
}

export interface CreatePaymentDTO {
  studentFeeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online' | 'cheque' | 'easypaisa' | 'jazzcash' | 'other';
  transactionId?: string;
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

const financeAPI = {
  // Fee Structures
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

  getFeeStructureById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<FeeStructure>>(`/finance/fee-structures/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch fee structure');
    }
    return response.data.data;
  },

  createFeeStructure: async (data: CreateFeeStructureDTO) => {
    const response = await apiClient.post<ApiResponse<FeeStructure>>('/finance/fee-structures', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create fee structure');
    }
    return response.data.data;
  },

  updateFeeStructure: async (id: string, data: Partial<CreateFeeStructureDTO>) => {
    const response = await apiClient.put<ApiResponse<FeeStructure>>(`/finance/fee-structures/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update fee structure');
    }
    return response.data.data;
  },

  // Student Fees
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

  getStudentFeeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StudentFee>>(`/finance/student-fees/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student fee');
    }
    return response.data.data;
  },

  // Payments
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

  getPaymentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/finance/payments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch payment');
    }
    return response.data.data;
  },

  createPayment: async (data: CreatePaymentDTO) => {
    const response = await apiClient.post<ApiResponse<Payment>>('/finance/payments', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create payment');
    }
    return response.data.data;
  },

  // Financial Reports
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

