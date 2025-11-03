import apiClient from './client';

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basicSalary: number;
  houseRentAllowance?: number;
  medicalAllowance?: number;
  transportAllowance?: number;
  otherAllowances?: number;
  providentFund?: number;
  taxDeduction?: number;
  otherDeductions?: number;
  grossSalary: number;
  netSalary: number;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryProcessing {
  id: string;
  employeeId: string;
  payrollPeriod: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  taxAmount: number;
  providentFund: number;
  netSalary: number;
  daysWorked: number;
  daysInMonth: number;
  bonus?: number;
  overtime?: number;
  advanceDeduction?: number;
  status: 'pending' | 'processed' | 'approved' | 'paid';
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paymentDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalarySlip {
  id: string;
  salaryProcessingId: string;
  employeeId: string;
  payrollPeriod: string;
  slipNumber: string;
  issuedDate: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface TaxCalculation {
  employeeId: string;
  annualSalary: number;
  taxYear: string;
  taxableIncome: number;
  taxLiability: number;
  taxPaid: number;
  taxRefund?: number;
  taxCertificate?: string;
}

export interface CreateSalaryStructureDTO {
  employeeId: string;
  basicSalary: number;
  houseRentAllowance?: number;
  medicalAllowance?: number;
  transportAllowance?: number;
  otherAllowances?: number;
  providentFund?: number;
  taxDeduction?: number;
  otherDeductions?: number;
  effectiveDate: string;
}

export interface ProcessSalaryDTO {
  employeeId: string;
  payrollPeriod: string;
  daysWorked?: number;
  bonus?: number;
  overtime?: number;
  advanceDeduction?: number;
  remarks?: string;
}

export interface ApproveSalaryDTO {
  status: 'approved' | 'rejected';
  remarks?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalTax: number;
  processedEmployees: number;
  pendingEmployees: number;
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

const payrollAPI = {
  // Salary Structures
  getAllSalaryStructures: async (params?: {
    employeeId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/payroll/salary-structures', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary structures');
    }
    return response.data.data;
  },

  getSalaryStructureById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<SalaryStructure>>(`/payroll/salary-structures/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary structure');
    }
    return response.data.data;
  },

  getActiveSalaryStructure: async (employeeId: string) => {
    const response = await apiClient.get<ApiResponse<SalaryStructure>>(
      `/payroll/employees/${employeeId}/salary-structure`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary structure');
    }
    return response.data.data;
  },

  createSalaryStructure: async (data: CreateSalaryStructureDTO) => {
    const response = await apiClient.post<ApiResponse<SalaryStructure>>('/payroll/salary-structures', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create salary structure');
    }
    return response.data.data;
  },

  updateSalaryStructure: async (id: string, data: Partial<CreateSalaryStructureDTO>) => {
    const response = await apiClient.put<ApiResponse<SalaryStructure>>(`/payroll/salary-structures/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update salary structure');
    }
    return response.data.data;
  },

  // Salary Processing
  getAllSalaryProcessings: async (params?: {
    employeeId?: string;
    payrollPeriod?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/payroll/processings', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary processings');
    }
    return response.data.data;
  },

  getSalaryProcessingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<SalaryProcessing>>(`/payroll/processings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary processing');
    }
    return response.data.data;
  },

  processSalary: async (data: ProcessSalaryDTO) => {
    const response = await apiClient.post<ApiResponse<SalaryProcessing>>('/payroll/processings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to process salary');
    }
    return response.data.data;
  },

  approveSalary: async (id: string, data: ApproveSalaryDTO) => {
    const response = await apiClient.post<ApiResponse<SalaryProcessing>>(`/payroll/processings/${id}/approve`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve salary');
    }
    return response.data.data;
  },

  markAsPaid: async (id: string) => {
    const response = await apiClient.post<ApiResponse<SalaryProcessing>>(`/payroll/processings/${id}/mark-paid`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to mark salary as paid');
    }
    return response.data.data;
  },

  // Salary Slips
  getSalarySlipsByEmployee: async (employeeId: string) => {
    const response = await apiClient.get<ApiResponse<SalarySlip[]>>(`/payroll/employees/${employeeId}/salary-slips`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary slips');
    }
    return response.data.data;
  },

  // Tax Calculations
  calculateTaxForEmployee: async (employeeId: string, taxYear: string) => {
    const response = await apiClient.get<ApiResponse<TaxCalculation>>(
      `/payroll/employees/${employeeId}/tax?taxYear=${taxYear}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to calculate tax');
    }
    return response.data.data;
  },

  // Payroll Summary
  getPayrollSummary: async (params?: {
    payrollPeriod?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<PayrollSummary>>('/payroll/summary', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch payroll summary');
    }
    return response.data.data;
  },
};

export default payrollAPI;

