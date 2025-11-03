import { supabaseAdmin } from '@/config/supabase';
import {
  AttendanceRecord,
  AttendanceSummary,
  CreateAttendanceDTO,
  BulkCreateAttendanceDTO,
} from '@/models/Attendance.model';
import { logger } from '@/config/logger';

export class AttendanceRepository {
  private attendanceTable = 'attendance_records';
  private enrollmentsTable = 'enrollments';

  async findAllAttendanceRecords(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      enrollmentId?: string;
      sectionId?: string;
      studentId?: string;
      attendanceDate?: string;
      status?: string;
    }
  ): Promise<AttendanceRecord[]> {
    try {
      let query = supabaseAdmin
        .from(this.attendanceTable)
        .select('*')
        .order('attendance_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.enrollmentId) {
        query = query.eq('enrollment_id', filters.enrollmentId);
      }
      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.attendanceDate) {
        query = query.eq('attendance_date', filters.attendanceDate);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapAttendanceFromDB) as AttendanceRecord[];
    } catch (error) {
      logger.error('Error finding all attendance records:', error);
      throw new Error('Failed to fetch attendance records');
    }
  }

  async findAttendanceById(id: string): Promise<AttendanceRecord | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.attendanceTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapAttendanceFromDB(data) as AttendanceRecord;
    } catch (error) {
      logger.error('Error finding attendance by ID:', error);
      throw error;
    }
  }

  async createAttendance(attendanceData: CreateAttendanceDTO, markedBy?: string): Promise<AttendanceRecord> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.attendanceTable)
        .insert({
          enrollment_id: attendanceData.enrollmentId,
          section_id: attendanceData.sectionId,
          student_id: attendanceData.studentId,
          attendance_date: attendanceData.attendanceDate,
          status: attendanceData.status,
          marked_by: markedBy || null,
          remarks: attendanceData.remarks || null,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a unique constraint violation (duplicate attendance)
        if (error.code === '23505') {
          throw new Error('Attendance already exists for this date');
        }
        throw error;
      }

      return this.mapAttendanceFromDB(data) as AttendanceRecord;
    } catch (error) {
      logger.error('Error creating attendance:', error);
      throw error;
    }
  }

  async bulkCreateAttendance(
    bulkData: BulkCreateAttendanceDTO,
    markedBy?: string
  ): Promise<AttendanceRecord[]> {
    try {
      const records = bulkData.entries.map((entry) => ({
        enrollment_id: entry.enrollmentId,
        section_id: bulkData.sectionId,
        attendance_date: bulkData.attendanceDate,
        status: entry.status,
        marked_by: markedBy || null,
        remarks: entry.remarks || null,
      }));

      // Get student IDs from enrollments
      const enrollmentIds = bulkData.entries.map((e) => e.enrollmentId);
      const { data: enrollments } = await supabaseAdmin
        .from(this.enrollmentsTable)
        .select('id, student_id')
        .in('id', enrollmentIds);

      const enrollmentMap = new Map(enrollments?.map((e: any) => [e.id, e.student_id]) || []);

      const recordsWithStudentIds = records.map((record) => ({
        ...record,
        student_id: enrollmentMap.get(record.enrollment_id) || null,
      }));

      const { data, error } = await supabaseAdmin
        .from(this.attendanceTable)
        .insert(recordsWithStudentIds)
        .select();

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapAttendanceFromDB) as AttendanceRecord[];
    } catch (error) {
      logger.error('Error bulk creating attendance:', error);
      throw new Error('Failed to bulk create attendance');
    }
  }

  async updateAttendance(
    id: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    remarks?: string
  ): Promise<AttendanceRecord> {
    try {
      const updateData: any = {
        status,
      };

      if (remarks !== undefined) {
        updateData.remarks = remarks;
      }

      const { data, error } = await supabaseAdmin
        .from(this.attendanceTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapAttendanceFromDB(data) as AttendanceRecord;
    } catch (error) {
      logger.error('Error updating attendance:', error);
      throw new Error('Failed to update attendance');
    }
  }

  async getAttendanceSummary(
    enrollmentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceSummary | null> {
    try {
      let query = supabaseAdmin
        .from(this.attendanceTable)
        .select('*')
        .eq('enrollment_id', enrollmentId);

      if (startDate) {
        query = query.gte('attendance_date', startDate);
      }
      if (endDate) {
        query = query.lte('attendance_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const records = (data || []).map(this.mapAttendanceFromDB) as AttendanceRecord[];
      const totalClasses = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const excused = records.filter((r) => r.status === 'excused').length;
      const attendancePercentage = totalClasses > 0 ? (present / totalClasses) * 100 : 0;

      const firstRecord = records[0];

      return {
        enrollmentId,
        sectionId: firstRecord.sectionId,
        studentId: firstRecord.studentId,
        totalClasses,
        present,
        absent,
        late,
        excused,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting attendance summary:', error);
      throw new Error('Failed to fetch attendance summary');
    }
  }

  async getSectionAttendanceByDate(
    sectionId: string,
    attendanceDate: string
  ): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.attendanceTable)
        .select('*')
        .eq('section_id', sectionId)
        .eq('attendance_date', attendanceDate)
        .order('student_id', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapAttendanceFromDB) as AttendanceRecord[];
    } catch (error) {
      logger.error('Error getting section attendance by date:', error);
      throw new Error('Failed to fetch section attendance');
    }
  }

  // ==================== Helper Mappers ====================

  private mapAttendanceFromDB(data: any): Partial<AttendanceRecord> {
    return {
      id: data.id,
      enrollmentId: data.enrollment_id,
      sectionId: data.section_id,
      studentId: data.student_id,
      attendanceDate: data.attendance_date,
      status: data.status,
      markedBy: data.marked_by,
      remarks: data.remarks,
      createdAt: data.created_at,
    };
  }
}

