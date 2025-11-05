/**
 * Multi-Campus Service
 * 
 * Service for managing multiple campuses and transfers.
 * Handles campus management, student transfers, and staff transfers:
 * - Campus CRUD operations
 * - Student transfer requests and approvals
 * - Staff transfer requests and approvals
 * - Campus reports and analytics
 * 
 * Features:
 * - Campus code uniqueness validation
 * - Transfer validation (same campus check, active campus check)
 * - Transfer approval workflow
 * - Campus analytics and reporting
 * 
 * @module services/multicampus.service
 */

import { MultiCampusRepository } from '@/repositories/multicampus.repository';
import {
  Campus,
  CampusDepartment,
  StudentTransfer,
  StaffTransfer,
  CampusReport,
  CreateCampusDTO,
  UpdateCampusDTO,
  CreateStudentTransferDTO,
  CreateStaffTransferDTO,
  ApproveTransferDTO,
} from '@/models/MultiCampus.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';
import { supabaseAdmin } from '@/config/supabase';

export class MultiCampusService {
  private multiCampusRepository: MultiCampusRepository;

  constructor() {
    this.multiCampusRepository = new MultiCampusRepository();
  }

  // ==================== Campuses ====================

  /**
   * Get all campuses with pagination and filters
   * 
   * Retrieves campuses with optional filtering by province, city, and active status.
   * Returns paginated results.
   * 
   * @param {number} [limit=100] - Maximum number of campuses to return
   * @param {number} [offset=0] - Number of campuses to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.province] - Filter by province
   * @param {string} [filters.city] - Filter by city
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<{campuses: Campus[], total: number}>} Campuses and total count
   * 
   * @example
   * const { campuses, total } = await multiCampusService.getAllCampuses(50, 0, {
   *   province: 'Punjab',
   *   isActive: true
   * });
   */
  async getAllCampuses(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      province?: string;
      city?: string;
      isActive?: boolean;
    }
  ): Promise<{
    campuses: Campus[];
    total: number;
  }> {
    try {
      const allCampuses = await this.multiCampusRepository.findAllCampuses(limit * 10, 0, filters);
      const paginatedCampuses = allCampuses.slice(offset, offset + limit);

      return {
        campuses: paginatedCampuses,
        total: allCampuses.length,
      };
    } catch (error) {
      logger.error('Error getting all campuses:', error);
      throw new Error('Failed to fetch campuses');
    }
  }

  /**
   * Get campus by ID
   * 
   * Retrieves a specific campus by its ID.
   * 
   * @param {string} id - Campus ID
   * @returns {Promise<Campus>} Campus object
   * @throws {NotFoundError} If campus not found
   */
  async getCampusById(id: string): Promise<Campus> {
    try {
      const campus = await this.multiCampusRepository.findCampusById(id);
      if (!campus) {
        throw new NotFoundError('Campus');
      }
      return campus;
    } catch (error) {
      logger.error('Error getting campus by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch campus');
    }
  }

  /**
   * Create a campus
   * 
   * Creates a new campus with validation.
   * Validates required fields and checks for duplicate campus codes.
   * 
   * @param {CreateCampusDTO} campusData - Campus creation data
   * @returns {Promise<Campus>} Created campus
   * @throws {ValidationError} If required fields are missing
   * @throws {ConflictError} If campus code already exists
   * 
   * @example
   * const campus = await multiCampusService.createCampus({
   *   name: 'Main Campus',
   *   code: 'MC',
   *   address: '123 University Road',
   *   city: 'Lahore',
   *   province: 'Punjab'
   * });
   */
  async createCampus(campusData: CreateCampusDTO): Promise<Campus> {
    try {
      if (!campusData.name || !campusData.code || !campusData.address || !campusData.city || !campusData.province) {
        throw new ValidationError('Name, code, address, city, and province are required');
      }

      // Check if campus code already exists
      const allCampuses = await this.multiCampusRepository.findAllCampuses(1000, 0);
      const existing = allCampuses.find((c) => c.code.toLowerCase() === campusData.code.toLowerCase());
      if (existing) {
        throw new ConflictError('Campus with this code already exists');
      }

      return await this.multiCampusRepository.createCampus(campusData);
    } catch (error) {
      logger.error('Error creating campus:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create campus');
    }
  }

  /**
   * Update a campus
   * 
   * Updates an existing campus's information.
   * Validates campus code uniqueness if code is being updated.
   * 
   * @param {string} id - Campus ID
   * @param {UpdateCampusDTO} campusData - Partial campus data to update
   * @returns {Promise<Campus>} Updated campus
   * @throws {NotFoundError} If campus not found
   * @throws {ConflictError} If campus code conflicts with existing campus
   */
  async updateCampus(id: string, campusData: UpdateCampusDTO): Promise<Campus> {
    try {
      const existing = await this.multiCampusRepository.findCampusById(id);
      if (!existing) {
        throw new NotFoundError('Campus');
      }

      // Check if code conflicts if updating code
      if (campusData.code && campusData.code !== existing.code) {
        const allCampuses = await this.multiCampusRepository.findAllCampuses(1000, 0);
        const conflicting = allCampuses.find(
          (c) => c.id !== id && c.code.toLowerCase() === campusData.code!.toLowerCase()
        );
        if (conflicting) {
          throw new ConflictError('Campus with this code already exists');
        }
      }

      return await this.multiCampusRepository.updateCampus(id, campusData);
    } catch (error) {
      logger.error('Error updating campus:', error);
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to update campus');
    }
  }

  // ==================== Student Transfers ====================

  /**
   * Get all student transfers with pagination and filters
   * 
   * Retrieves student transfers with optional filtering by student, campuses, and status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of transfers to return
   * @param {number} [offset=0] - Number of transfers to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.studentId] - Filter by student ID
   * @param {string} [filters.fromCampusId] - Filter by source campus ID
   * @param {string} [filters.toCampusId] - Filter by destination campus ID
   * @param {string} [filters.status] - Filter by transfer status
   * @returns {Promise<{transfers: StudentTransfer[], total: number}>} Transfers and total count
   * 
   * @example
   * const { transfers, total } = await multiCampusService.getAllStudentTransfers(20, 0, {
   *   fromCampusId: 'campus123',
   *   status: 'pending'
   * });
   */
  async getAllStudentTransfers(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      fromCampusId?: string;
      toCampusId?: string;
      status?: string;
    }
  ): Promise<{
    transfers: StudentTransfer[];
    total: number;
  }> {
    try {
      const allTransfers = await this.multiCampusRepository.findAllStudentTransfers(limit * 10, 0, filters);
      const paginatedTransfers = allTransfers.slice(offset, offset + limit);

      return {
        transfers: paginatedTransfers,
        total: allTransfers.length,
      };
    } catch (error) {
      logger.error('Error getting all student transfers:', error);
      throw new Error('Failed to fetch student transfers');
    }
  }

  /**
   * Get student transfer by ID
   * 
   * Retrieves a specific student transfer by its ID.
   * 
   * @param {string} id - Student transfer ID
   * @returns {Promise<StudentTransfer>} Student transfer object
   * @throws {NotFoundError} If transfer not found
   */
  async getStudentTransferById(id: string): Promise<StudentTransfer> {
    try {
      const transfer = await this.multiCampusRepository.findStudentTransferById(id);
      if (!transfer) {
        throw new NotFoundError('Student transfer');
      }
      return transfer;
    } catch (error) {
      logger.error('Error getting student transfer by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch student transfer');
    }
  }

  /**
   * Create a student transfer request
   * 
   * Creates a new student transfer request with validation.
   * Validates required fields, campus existence, and active status.
   * 
   * @param {CreateStudentTransferDTO} transferData - Student transfer creation data
   * @returns {Promise<StudentTransfer>} Created student transfer
   * @throws {ValidationError} If required fields are missing or campuses are invalid
   * @throws {NotFoundError} If campus not found
   * 
   * @example
   * const transfer = await multiCampusService.createStudentTransfer({
   *   studentId: 'student123',
   *   fromCampusId: 'campus1',
   *   toCampusId: 'campus2',
   *   transferType: 'permanent',
   *   reason: 'Family relocation'
   * });
   */
  async createStudentTransfer(transferData: CreateStudentTransferDTO): Promise<StudentTransfer> {
    try {
      if (!transferData.studentId || !transferData.fromCampusId || !transferData.toCampusId || !transferData.reason) {
        throw new ValidationError('Student ID, from campus, to campus, and reason are required');
      }

      if (transferData.fromCampusId === transferData.toCampusId) {
        throw new ValidationError('From campus and to campus cannot be the same');
      }

      // Validate campuses exist
      const fromCampus = await this.multiCampusRepository.findCampusById(transferData.fromCampusId);
      const toCampus = await this.multiCampusRepository.findCampusById(transferData.toCampusId);

      if (!fromCampus || !toCampus) {
        throw new NotFoundError('Campus');
      }

      if (!fromCampus.isActive || !toCampus.isActive) {
        throw new ValidationError('Both campuses must be active');
      }

      return await this.multiCampusRepository.createStudentTransfer(transferData);
    } catch (error) {
      logger.error('Error creating student transfer:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create student transfer');
    }
  }

  /**
   * Approve or reject a student transfer
   * 
   * Approves or rejects a pending student transfer.
   * Only pending transfers can be approved/rejected.
   * Requires effective date for approval and rejection reason for rejection.
   * 
   * @param {string} id - Student transfer ID
   * @param {ApproveTransferDTO} approveData - Approval/rejection data
   * @param {string} [approvedBy] - ID of user approving/rejecting the transfer
   * @returns {Promise<StudentTransfer>} Updated student transfer
   * @throws {NotFoundError} If transfer not found
   * @throws {ValidationError} If transfer is not pending or required fields are missing
   * 
   * @example
   * const transfer = await multiCampusService.approveStudentTransfer('transfer123', {
   *   status: 'approved',
   *   effectiveDate: '2024-02-01',
   *   remarks: 'Transfer approved'
   * }, 'admin456');
   */
  async approveStudentTransfer(id: string, approveData: ApproveTransferDTO, approvedBy?: string): Promise<StudentTransfer> {
    try {
      const transfer = await this.multiCampusRepository.findStudentTransferById(id);
      if (!transfer) {
        throw new NotFoundError('Student transfer');
      }

      if (transfer.status !== 'pending') {
        throw new ValidationError('Only pending transfers can be approved or rejected');
      }

      if (approveData.status === 'approved') {
        if (!approveData.effectiveDate) {
          throw new ValidationError('Effective date is required when approving transfer');
        }
      } else if (approveData.status === 'rejected') {
        if (!approveData.rejectionReason) {
          throw new ValidationError('Rejection reason is required when rejecting transfer');
        }
      }

      return await this.multiCampusRepository.updateStudentTransferStatus(
        id,
        approveData.status,
        approvedBy,
        approveData.rejectionReason,
        approveData.transferDate,
        approveData.effectiveDate,
        approveData.remarks
      );
    } catch (error) {
      logger.error('Error approving student transfer:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to approve student transfer');
    }
  }

  // ==================== Staff Transfers ====================

  /**
   * Get all staff transfers with pagination and filters
   * 
   * Retrieves staff transfers with optional filtering by staff, campuses, and status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of transfers to return
   * @param {number} [offset=0] - Number of transfers to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.staffId] - Filter by staff ID
   * @param {string} [filters.fromCampusId] - Filter by source campus ID
   * @param {string} [filters.toCampusId] - Filter by destination campus ID
   * @param {string} [filters.status] - Filter by transfer status
   * @returns {Promise<{transfers: StaffTransfer[], total: number}>} Transfers and total count
   * 
   * @example
   * const { transfers, total } = await multiCampusService.getAllStaffTransfers(20, 0, {
   *   fromCampusId: 'campus123',
   *   status: 'pending'
   * });
   */
  async getAllStaffTransfers(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      staffId?: string;
      fromCampusId?: string;
      toCampusId?: string;
      status?: string;
    }
  ): Promise<{
    transfers: StaffTransfer[];
    total: number;
  }> {
    try {
      const allTransfers = await this.multiCampusRepository.findAllStaffTransfers(limit * 10, 0, filters);
      const paginatedTransfers = allTransfers.slice(offset, offset + limit);

      return {
        transfers: paginatedTransfers,
        total: allTransfers.length,
      };
    } catch (error) {
      logger.error('Error getting all staff transfers:', error);
      throw new Error('Failed to fetch staff transfers');
    }
  }

  /**
   * Get staff transfer by ID
   * 
   * Retrieves a specific staff transfer by its ID.
   * 
   * @param {string} id - Staff transfer ID
   * @returns {Promise<StaffTransfer>} Staff transfer object
   * @throws {NotFoundError} If transfer not found
   */
  async getStaffTransferById(id: string): Promise<StaffTransfer> {
    try {
      const transfer = await this.multiCampusRepository.findStaffTransferById(id);
      if (!transfer) {
        throw new NotFoundError('Staff transfer');
      }
      return transfer;
    } catch (error) {
      logger.error('Error getting staff transfer by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch staff transfer');
    }
  }

  /**
   * Create a staff transfer request
   * 
   * Creates a new staff transfer request with validation.
   * Validates required fields, campus existence, and active status.
   * 
   * @param {CreateStaffTransferDTO} transferData - Staff transfer creation data
   * @returns {Promise<StaffTransfer>} Created staff transfer
   * @throws {ValidationError} If required fields are missing or campuses are invalid
   * @throws {NotFoundError} If campus not found
   * 
   * @example
   * const transfer = await multiCampusService.createStaffTransfer({
   *   staffId: 'staff123',
   *   fromCampusId: 'campus1',
   *   toCampusId: 'campus2',
   *   transferType: 'permanent',
   *   reason: 'Organizational restructuring'
   * });
   */
  async createStaffTransfer(transferData: CreateStaffTransferDTO): Promise<StaffTransfer> {
    try {
      if (!transferData.staffId || !transferData.fromCampusId || !transferData.toCampusId || !transferData.reason) {
        throw new ValidationError('Staff ID, from campus, to campus, and reason are required');
      }

      if (transferData.fromCampusId === transferData.toCampusId) {
        throw new ValidationError('From campus and to campus cannot be the same');
      }

      // Validate campuses exist
      const fromCampus = await this.multiCampusRepository.findCampusById(transferData.fromCampusId);
      const toCampus = await this.multiCampusRepository.findCampusById(transferData.toCampusId);

      if (!fromCampus || !toCampus) {
        throw new NotFoundError('Campus');
      }

      if (!fromCampus.isActive || !toCampus.isActive) {
        throw new ValidationError('Both campuses must be active');
      }

      return await this.multiCampusRepository.createStaffTransfer(transferData);
    } catch (error) {
      logger.error('Error creating staff transfer:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create staff transfer');
    }
  }

  /**
   * Approve or reject a staff transfer
   * 
   * Approves or rejects a pending staff transfer.
   * Only pending transfers can be approved/rejected.
   * Requires effective date for approval and rejection reason for rejection.
   * 
   * @param {string} id - Staff transfer ID
   * @param {ApproveTransferDTO} approveData - Approval/rejection data
   * @param {string} [approvedBy] - ID of user approving/rejecting the transfer
   * @returns {Promise<StaffTransfer>} Updated staff transfer
   * @throws {NotFoundError} If transfer not found
   * @throws {ValidationError} If transfer is not pending or required fields are missing
   * 
   * @example
   * const transfer = await multiCampusService.approveStaffTransfer('transfer123', {
   *   status: 'approved',
   *   effectiveDate: '2024-02-01',
   *   remarks: 'Transfer approved'
   * }, 'admin456');
   */
  async approveStaffTransfer(id: string, approveData: ApproveTransferDTO, approvedBy?: string): Promise<StaffTransfer> {
    try {
      const transfer = await this.multiCampusRepository.findStaffTransferById(id);
      if (!transfer) {
        throw new NotFoundError('Staff transfer');
      }

      if (transfer.status !== 'pending') {
        throw new ValidationError('Only pending transfers can be approved or rejected');
      }

      if (approveData.status === 'approved') {
        if (!approveData.effectiveDate) {
          throw new ValidationError('Effective date is required when approving transfer');
        }
      } else if (approveData.status === 'rejected') {
        if (!approveData.rejectionReason) {
          throw new ValidationError('Rejection reason is required when rejecting transfer');
        }
      }

      return await this.multiCampusRepository.updateStaffTransferStatus(
        id,
        approveData.status,
        approvedBy,
        approveData.rejectionReason,
        approveData.transferDate,
        approveData.effectiveDate,
        approveData.remarks
      );
    } catch (error) {
      logger.error('Error approving staff transfer:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to approve staff transfer');
    }
  }

  // ==================== Campus Reports ====================

  /**
   * Get campus report/analytics
   * 
   * Generates a comprehensive report for a specific campus.
   * Includes student count, staff count, programs, courses, and enrollments.
   * 
   * @param {string} campusId - Campus ID
   * @param {string} [reportPeriod] - Report period (YYYY-MM-DD), defaults to current date
   * @returns {Promise<CampusReport>} Campus report with statistics
   * @throws {NotFoundError} If campus not found
   * 
   * @example
   * const report = await multiCampusService.getCampusReport('campus123', '2024-01-31');
   * console.log(report.totalStudents); // 500
   * console.log(report.totalStaff); // 50
   */
  async getCampusReport(campusId: string, reportPeriod?: string): Promise<CampusReport> {
    try {
      const campus = await this.multiCampusRepository.findCampusById(campusId);
      if (!campus) {
        throw new NotFoundError('Campus');
      }

      // Get student count for this campus
      const { count: studentCount } = await supabaseAdmin
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('campus_id', campusId);

      // Get staff count for this campus
      const { count: staffCount } = await supabaseAdmin
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('campus_id', campusId);

      // Get programs count (would need campus_id in programs table)
      const { count: programsCount } = await supabaseAdmin
        .from('programs')
        .select('*', { count: 'exact', head: true });

      // Get courses count
      const { count: coursesCount } = await supabaseAdmin
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Get active enrollments
      const { count: enrollmentsCount } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('enrollment_status', 'registered');

      return {
        campusId: campus.id,
        campusName: campus.name,
        totalStudents: studentCount || 0,
        totalStaff: staffCount || 0,
        totalFaculty: 0, // Would need to query separately
        totalPrograms: programsCount || 0,
        totalCourses: coursesCount || 0,
        activeEnrollments: enrollmentsCount || 0,
        reportPeriod: reportPeriod || new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      logger.error('Error getting campus report:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch campus report');
    }
  }
}
