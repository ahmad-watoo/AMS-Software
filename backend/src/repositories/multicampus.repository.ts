import { supabaseAdmin } from '@/config/supabase';
import {
  Campus,
  CampusDepartment,
  StudentTransfer,
  StaffTransfer,
  CreateCampusDTO,
  UpdateCampusDTO,
  CreateStudentTransferDTO,
  CreateStaffTransferDTO,
  ApproveTransferDTO,
} from '@/models/MultiCampus.model';
import { logger } from '@/config/logger';

export class MultiCampusRepository {
  private campusesTable = 'campuses';
  private campusDepartmentsTable = 'campus_departments';
  private studentTransfersTable = 'student_transfers';
  private staffTransfersTable = 'staff_transfers';

  // ==================== Campuses ====================

  async findAllCampuses(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      province?: string;
      city?: string;
      isActive?: boolean;
    }
  ): Promise<Campus[]> {
    try {
      let query = supabaseAdmin
        .from(this.campusesTable)
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.province) {
        query = query.eq('province', filters.province);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapCampusFromDB) as Campus[];
    } catch (error) {
      logger.error('Error finding all campuses:', error);
      throw new Error('Failed to fetch campuses');
    }
  }

  async findCampusById(id: string): Promise<Campus | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.campusesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCampusFromDB(data) as Campus;
    } catch (error) {
      logger.error('Error finding campus by ID:', error);
      throw error;
    }
  }

  async createCampus(campusData: CreateCampusDTO): Promise<Campus> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.campusesTable)
        .insert({
          name: campusData.name,
          code: campusData.code,
          address: campusData.address,
          city: campusData.city,
          province: campusData.province,
          postal_code: campusData.postalCode || null,
          phone: campusData.phone || null,
          email: campusData.email || null,
          website: campusData.website || null,
          campus_head_id: campusData.campusHeadId || null,
          is_active: true,
          established_date: campusData.establishedDate || null,
          capacity: campusData.capacity || null,
          description: campusData.description || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCampusFromDB(data) as Campus;
    } catch (error) {
      logger.error('Error creating campus:', error);
      throw new Error('Failed to create campus');
    }
  }

  async updateCampus(id: string, campusData: UpdateCampusDTO): Promise<Campus> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (campusData.name !== undefined) updateData.name = campusData.name;
      if (campusData.code !== undefined) updateData.code = campusData.code;
      if (campusData.address !== undefined) updateData.address = campusData.address;
      if (campusData.city !== undefined) updateData.city = campusData.city;
      if (campusData.province !== undefined) updateData.province = campusData.province;
      if (campusData.postalCode !== undefined) updateData.postal_code = campusData.postalCode;
      if (campusData.phone !== undefined) updateData.phone = campusData.phone;
      if (campusData.email !== undefined) updateData.email = campusData.email;
      if (campusData.website !== undefined) updateData.website = campusData.website;
      if (campusData.campusHeadId !== undefined) updateData.campus_head_id = campusData.campusHeadId;
      if (campusData.isActive !== undefined) updateData.is_active = campusData.isActive;
      if (campusData.capacity !== undefined) updateData.capacity = campusData.capacity;
      if (campusData.description !== undefined) updateData.description = campusData.description;

      const { data, error } = await supabaseAdmin
        .from(this.campusesTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCampusFromDB(data) as Campus;
    } catch (error) {
      logger.error('Error updating campus:', error);
      throw new Error('Failed to update campus');
    }
  }

  // ==================== Campus Departments ====================

  async findAllCampusDepartments(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      campusId?: string;
      departmentId?: string;
      isActive?: boolean;
    }
  ): Promise<CampusDepartment[]> {
    try {
      let query = supabaseAdmin
        .from(this.campusDepartmentsTable)
        .select('*')
        .range(offset, offset + limit - 1);

      if (filters?.campusId) {
        query = query.eq('campus_id', filters.campusId);
      }
      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapCampusDepartmentFromDB) as CampusDepartment[];
    } catch (error) {
      logger.error('Error finding all campus departments:', error);
      throw new Error('Failed to fetch campus departments');
    }
  }

  // ==================== Student Transfers ====================

  async findAllStudentTransfers(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      fromCampusId?: string;
      toCampusId?: string;
      status?: string;
    }
  ): Promise<StudentTransfer[]> {
    try {
      let query = supabaseAdmin
        .from(this.studentTransfersTable)
        .select('*')
        .order('requested_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.fromCampusId) {
        query = query.eq('from_campus_id', filters.fromCampusId);
      }
      if (filters?.toCampusId) {
        query = query.eq('to_campus_id', filters.toCampusId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapStudentTransferFromDB) as StudentTransfer[];
    } catch (error) {
      logger.error('Error finding all student transfers:', error);
      throw new Error('Failed to fetch student transfers');
    }
  }

  async findStudentTransferById(id: string): Promise<StudentTransfer | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.studentTransfersTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapStudentTransferFromDB(data) as StudentTransfer;
    } catch (error) {
      logger.error('Error finding student transfer by ID:', error);
      throw error;
    }
  }

  async createStudentTransfer(transferData: CreateStudentTransferDTO): Promise<StudentTransfer> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.studentTransfersTable)
        .insert({
          student_id: transferData.studentId,
          from_campus_id: transferData.fromCampusId,
          to_campus_id: transferData.toCampusId,
          transfer_type: transferData.transferType,
          reason: transferData.reason,
          requested_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          effective_date: transferData.effectiveDate || null,
          remarks: transferData.remarks || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStudentTransferFromDB(data) as StudentTransfer;
    } catch (error) {
      logger.error('Error creating student transfer:', error);
      throw new Error('Failed to create student transfer');
    }
  }

  async updateStudentTransferStatus(
    id: string,
    status: StudentTransfer['status'],
    approvedBy?: string,
    rejectionReason?: string,
    transferDate?: string,
    effectiveDate?: string,
    remarks?: string
  ): Promise<StudentTransfer> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved' || status === 'rejected') {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      if (transferDate) {
        updateData.transfer_date = transferDate;
      }

      if (effectiveDate) {
        updateData.effective_date = effectiveDate;
      }

      if (remarks) {
        updateData.remarks = remarks;
      }

      const { data, error } = await supabaseAdmin
        .from(this.studentTransfersTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStudentTransferFromDB(data) as StudentTransfer;
    } catch (error) {
      logger.error('Error updating student transfer status:', error);
      throw new Error('Failed to update student transfer');
    }
  }

  // ==================== Staff Transfers ====================

  async findAllStaffTransfers(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      staffId?: string;
      fromCampusId?: string;
      toCampusId?: string;
      status?: string;
    }
  ): Promise<StaffTransfer[]> {
    try {
      let query = supabaseAdmin
        .from(this.staffTransfersTable)
        .select('*')
        .order('requested_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.staffId) {
        query = query.eq('staff_id', filters.staffId);
      }
      if (filters?.fromCampusId) {
        query = query.eq('from_campus_id', filters.fromCampusId);
      }
      if (filters?.toCampusId) {
        query = query.eq('to_campus_id', filters.toCampusId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapStaffTransferFromDB) as StaffTransfer[];
    } catch (error) {
      logger.error('Error finding all staff transfers:', error);
      throw new Error('Failed to fetch staff transfers');
    }
  }

  async findStaffTransferById(id: string): Promise<StaffTransfer | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.staffTransfersTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapStaffTransferFromDB(data) as StaffTransfer;
    } catch (error) {
      logger.error('Error finding staff transfer by ID:', error);
      throw error;
    }
  }

  async createStaffTransfer(transferData: CreateStaffTransferDTO): Promise<StaffTransfer> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.staffTransfersTable)
        .insert({
          staff_id: transferData.staffId,
          from_campus_id: transferData.fromCampusId,
          to_campus_id: transferData.toCampusId,
          transfer_type: transferData.transferType,
          reason: transferData.reason,
          requested_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          effective_date: transferData.effectiveDate || null,
          remarks: transferData.remarks || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStaffTransferFromDB(data) as StaffTransfer;
    } catch (error) {
      logger.error('Error creating staff transfer:', error);
      throw new Error('Failed to create staff transfer');
    }
  }

  async updateStaffTransferStatus(
    id: string,
    status: StaffTransfer['status'],
    approvedBy?: string,
    rejectionReason?: string,
    transferDate?: string,
    effectiveDate?: string,
    remarks?: string
  ): Promise<StaffTransfer> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved' || status === 'rejected') {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      if (transferDate) {
        updateData.transfer_date = transferDate;
      }

      if (effectiveDate) {
        updateData.effective_date = effectiveDate;
      }

      if (remarks) {
        updateData.remarks = remarks;
      }

      const { data, error } = await supabaseAdmin
        .from(this.staffTransfersTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStaffTransferFromDB(data) as StaffTransfer;
    } catch (error) {
      logger.error('Error updating staff transfer status:', error);
      throw new Error('Failed to update staff transfer');
    }
  }

  // ==================== Helper Mappers ====================

  private mapCampusFromDB(data: any): Partial<Campus> {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postal_code,
      phone: data.phone,
      email: data.email,
      website: data.website,
      campusHeadId: data.campus_head_id,
      isActive: data.is_active,
      establishedDate: data.established_date,
      capacity: data.capacity,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCampusDepartmentFromDB(data: any): Partial<CampusDepartment> {
    return {
      id: data.id,
      campusId: data.campus_id,
      departmentId: data.department_id,
      headId: data.head_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapStudentTransferFromDB(data: any): Partial<StudentTransfer> {
    return {
      id: data.id,
      studentId: data.student_id,
      fromCampusId: data.from_campus_id,
      toCampusId: data.to_campus_id,
      transferType: data.transfer_type,
      reason: data.reason,
      requestedDate: data.requested_date,
      status: data.status,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      rejectionReason: data.rejection_reason,
      transferDate: data.transfer_date,
      effectiveDate: data.effective_date,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapStaffTransferFromDB(data: any): Partial<StaffTransfer> {
    return {
      id: data.id,
      staffId: data.staff_id,
      fromCampusId: data.from_campus_id,
      toCampusId: data.to_campus_id,
      transferType: data.transfer_type,
      reason: data.reason,
      requestedDate: data.requested_date,
      status: data.status,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      rejectionReason: data.rejection_reason,
      transferDate: data.transfer_date,
      effectiveDate: data.effective_date,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

