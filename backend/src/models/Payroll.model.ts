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
  payrollPeriod: string; // Format: "YYYY-MM" (e.g., "2024-01")
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
  taxYear: string; // Format: "YYYY" (e.g., "2024")
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

export interface UpdateSalaryStructureDTO {
  basicSalary?: number;
  houseRentAllowance?: number;
  medicalAllowance?: number;
  transportAllowance?: number;
  otherAllowances?: number;
  providentFund?: number;
  taxDeduction?: number;
  otherDeductions?: number;
  effectiveDate?: string;
  isActive?: boolean;
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

export interface EmployeePayrollHistory {
  employeeId: string;
  payrollPeriod: string;
  grossSalary: number;
  netSalary: number;
  status: string;
  paymentDate?: string;
}

