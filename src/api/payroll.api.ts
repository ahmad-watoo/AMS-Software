/**
 * Payroll Management API Client
 * 
 * Frontend API client for payroll management endpoints.
 * Provides typed functions for all payroll operations including:
 * - Salary structure management (CRUD)
 * - Salary processing and approval
 * - Salary slip generation
 * - Tax calculations
 * - Payroll summaries
 * 
 * @module api/payroll.api
 */

import apiClient from './client';

/**
 * Salary Structure Interface
 * 
 * Represents a salary structure for an employee.
 * 
 * @interface SalaryStructure
 */
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

/**
 * Salary Processing Interface
 * 
 * Represents a salary processing record for a payroll period.
 * 
 * @interface SalaryProcessing
 */
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

/**
 * Salary Slip Interface
 * 
 * Represents a salary slip issued to an employee.
 * 
 * @interface SalarySlip
 */
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

/**
 * Tax Calculation Interface
 * 
 * Represents tax calculation for an employee for a tax year.
 * 
 * @interface TaxCalculation
 */
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

/**
 * Create Salary Structure Data Transfer Object
 * 
 * @interface CreateSalaryStructureDTO
 */
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

/**
 * Process Salary Data Transfer Object
 * 
 * @interface ProcessSalaryDTO
 */
export interface ProcessSalaryDTO {
  employeeId: string;
  payrollPeriod: string;
  daysWorked?: number;
  bonus?: number;
  overtime?: number;
  advanceDeduction?: number;
  remarks?: string;
}

/**
 * Approve Salary Data Transfer Object
 * 
 * @interface ApproveSalaryDTO
 */
export interface ApproveSalaryDTO {
  status: 'approved' | 'rejected';
  remarks?: string;
}

/**
 * Payroll Summary Interface
 * 
 * Represents a payroll summary for a period.
 * 
 * @interface PayrollSummary
 */
export interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalTax: number;
  processedEmployees: number;
  pendingEmployees: number;
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
 * Payroll Management API Client
 * 
 * Provides methods for all payroll management operations.
 */
const payrollAPI = {
  // ==================== Salary Structures ====================

  /**
   * Get all salary structures with pagination and filters
   * 
   * Retrieves salary structures with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.employeeId] - Filter by employee ID
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Salary structures array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await payrollAPI.getAllSalaryStructures({
   *   employeeId: 'employee123',
   *   isActive: true,
   *   page: 1,
   *   limit: 20
   * });
   */
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

  /**
   * Get salary structure by ID
   * 
   * Retrieves a specific salary structure by its ID.
   * 
   * @param {string} id - Salary structure ID
   * @returns {Promise<SalaryStructure>} Salary structure object
   * @throws {Error} If request fails or structure not found
   * 
   * @example
   * const structure = await payrollAPI.getSalaryStructureById('structure123');
   * console.log(structure.basicSalary); // 100000
   */
  getSalaryStructureById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<SalaryStructure>>(`/payroll/salary-structures/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary structure');
    }
    return response.data.data;
  },

  /**
   * Get active salary structure for an employee
   * 
   * Retrieves the currently active salary structure for an employee.
   * 
   * @param {string} employeeId - Employee ID
   * @returns {Promise<SalaryStructure>} Active salary structure
   * @throws {Error} If request fails or structure not found
   * 
   * @example
   * const structure = await payrollAPI.getActiveSalaryStructure('employee123');
   * console.log(structure.effectiveDate); // '2024-01-01'
   */
  getActiveSalaryStructure: async (employeeId: string) => {
    const response = await apiClient.get<ApiResponse<SalaryStructure>>(
      `/payroll/employees/${employeeId}/salary-structure`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary structure');
    }
    return response.data.data;
  },

  /**
   * Create a salary structure
   * 
   * Creates a new salary structure.
   * Requires payroll.create permission.
   * 
   * @param {CreateSalaryStructureDTO} data - Salary structure creation data
   * @returns {Promise<SalaryStructure>} Created salary structure
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const structure = await payrollAPI.createSalaryStructure({
   *   employeeId: 'employee123',
   *   basicSalary: 100000,
   *   houseRentAllowance: 50000,
   *   medicalAllowance: 10000,
   *   effectiveDate: '2024-01-01'
   * });
   */
  createSalaryStructure: async (data: CreateSalaryStructureDTO) => {
    const response = await apiClient.post<ApiResponse<SalaryStructure>>('/payroll/salary-structures', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create salary structure');
    }
    return response.data.data;
  },

  /**
   * Update a salary structure
   * 
   * Updates an existing salary structure.
   * Requires payroll.update permission.
   * 
   * @param {string} id - Salary structure ID
   * @param {Partial<CreateSalaryStructureDTO>} data - Partial structure data to update
   * @returns {Promise<SalaryStructure>} Updated salary structure
   * @throws {Error} If request fails or structure not found
   * 
   * @example
   * const structure = await payrollAPI.updateSalaryStructure('structure123', {
   *   basicSalary: 120000,
   *   houseRentAllowance: 60000
   * });
   */
  updateSalaryStructure: async (id: string, data: Partial<CreateSalaryStructureDTO>) => {
    const response = await apiClient.put<ApiResponse<SalaryStructure>>(`/payroll/salary-structures/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update salary structure');
    }
    return response.data.data;
  },

  // ==================== Salary Processing ====================

  /**
   * Get all salary processings with pagination and filters
   * 
   * Retrieves salary processings with pagination and optional filters.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.employeeId] - Filter by employee ID
   * @param {string} [params.payrollPeriod] - Filter by payroll period (YYYY-MM)
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<any>} Salary processings array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await payrollAPI.getAllSalaryProcessings({
   *   payrollPeriod: '2024-10',
   *   status: 'processed',
   *   page: 1,
   *   limit: 20
   * });
   */
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

  /**
   * Get salary processing by ID
   * 
   * Retrieves a specific salary processing by its ID.
   * 
   * @param {string} id - Salary processing ID
   * @returns {Promise<SalaryProcessing>} Salary processing object
   * @throws {Error} If request fails or processing not found
   * 
   * @example
   * const processing = await payrollAPI.getSalaryProcessingById('processing123');
   * console.log(processing.netSalary); // 150000
   */
  getSalaryProcessingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<SalaryProcessing>>(`/payroll/processings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary processing');
    }
    return response.data.data;
  },

  /**
   * Process salary for an employee
   * 
   * Processes monthly salary with comprehensive calculations.
   * Requires payroll.create permission.
   * 
   * @param {ProcessSalaryDTO} data - Salary processing data
   * @returns {Promise<SalaryProcessing>} Created salary processing record
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const processing = await payrollAPI.processSalary({
   *   employeeId: 'employee123',
   *   payrollPeriod: '2024-10',
   *   daysWorked: 25,
   *   bonus: 10000
   * });
   */
  processSalary: async (data: ProcessSalaryDTO) => {
    const response = await apiClient.post<ApiResponse<SalaryProcessing>>('/payroll/processings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to process salary');
    }
    return response.data.data;
  },

  /**
   * Approve a processed salary
   * 
   * Approves a processed salary and generates a salary slip.
   * Requires payroll.approve permission.
   * 
   * @param {string} id - Salary processing ID
   * @param {ApproveSalaryDTO} data - Approval data
   * @returns {Promise<SalaryProcessing>} Updated salary processing
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const processing = await payrollAPI.approveSalary('processing123', {
   *   status: 'approved',
   *   remarks: 'Approved for payment'
   * });
   */
  approveSalary: async (id: string, data: ApproveSalaryDTO) => {
    const response = await apiClient.post<ApiResponse<SalaryProcessing>>(`/payroll/processings/${id}/approve`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve salary');
    }
    return response.data.data;
  },

  /**
   * Mark salary as paid
   * 
   * Marks an approved salary as paid.
   * Requires payroll.update permission.
   * 
   * @param {string} id - Salary processing ID
   * @returns {Promise<SalaryProcessing>} Updated salary processing
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const processing = await payrollAPI.markAsPaid('processing123');
   */
  markAsPaid: async (id: string) => {
    const response = await apiClient.post<ApiResponse<SalaryProcessing>>(`/payroll/processings/${id}/mark-paid`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to mark salary as paid');
    }
    return response.data.data;
  },

  // ==================== Salary Slips ====================

  /**
   * Get salary slips for an employee
   * 
   * Retrieves salary slips for a specific employee.
   * 
   * @param {string} employeeId - Employee ID
   * @returns {Promise<SalarySlip[]>} Array of salary slips
   * @throws {Error} If request fails
   * 
   * @example
   * const slips = await payrollAPI.getSalarySlipsByEmployee('employee123');
   */
  getSalarySlipsByEmployee: async (employeeId: string) => {
    const response = await apiClient.get<ApiResponse<SalarySlip[]>>(`/payroll/employees/${employeeId}/salary-slips`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch salary slips');
    }
    return response.data.data;
  },

  // ==================== Tax Calculations ====================

  /**
   * Calculate tax for an employee for a tax year
   * 
   * Calculates annual tax liability based on paid salaries.
   * 
   * @param {string} employeeId - Employee ID
   * @param {string} taxYear - Tax year (YYYY)
   * @returns {Promise<TaxCalculation>} Tax calculation
   * @throws {Error} If request fails
   * 
   * @example
   * const taxCalc = await payrollAPI.calculateTaxForEmployee('employee123', '2024');
   * console.log(taxCalc.taxLiability); // 120000
   */
  calculateTaxForEmployee: async (employeeId: string, taxYear: string) => {
    const response = await apiClient.get<ApiResponse<TaxCalculation>>(
      `/payroll/employees/${employeeId}/tax?taxYear=${taxYear}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to calculate tax');
    }
    return response.data.data;
  },

  // ==================== Payroll Summary ====================

  /**
   * Get payroll summary for a period
   * 
   * Retrieves a comprehensive payroll summary for a payroll period.
   * 
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.payrollPeriod] - Payroll period (YYYY-MM)
   * @returns {Promise<PayrollSummary>} Payroll summary
   * @throws {Error} If request fails
   * 
   * @example
   * const summary = await payrollAPI.getPayrollSummary({
   *   payrollPeriod: '2024-10'
   * });
   * console.log(summary.totalGrossSalary); // 5000000
   */
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
