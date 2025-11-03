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

