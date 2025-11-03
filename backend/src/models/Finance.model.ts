export interface FeeStructure {
  id: string;
  programId?: string;
  semester: string;
  feeType: 'tuition' | 'library' | 'lab' | 'sports' | 'transportation' | 'hostel' | 'other';
  amount: number;
  isMandatory: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFee {
  id: string;
  studentId: string;
  feeStructureId: string;
  semester: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'waived' | 'overdue';
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentFeeId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card' | 'online';
  transactionId?: string;
  receiptNumber?: string;
  receivedBy?: string;
  remarks?: string;
  createdAt: string;
}

export interface CreateFeeStructureDTO {
  programId?: string;
  semester: string;
  feeType: 'tuition' | 'library' | 'lab' | 'sports' | 'transportation' | 'hostel' | 'other';
  amount: number;
  isMandatory?: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  description?: string;
}

export interface UpdateFeeStructureDTO {
  amount?: number;
  isMandatory?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
}

export interface CreatePaymentDTO {
  studentFeeId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card' | 'online';
  transactionId?: string;
  receiptNumber?: string;
  remarks?: string;
}

export interface FinancialReport {
  period: string;
  totalFeesDue: number;
  totalFeesPaid: number;
  totalPending: number;
  totalOverdue: number;
  paymentBreakdown: {
    paymentMethod: string;
    amount: number;
    count: number;
  }[];
  feeTypeBreakdown: {
    feeType: string;
    amount: number;
  }[];
}

export interface StudentFinancialSummary {
  studentId: string;
  semester: string;
  totalFeesDue: number;
  totalFeesPaid: number;
  balance: number;
  fees: StudentFee[];
  payments: Payment[];
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue';
}

