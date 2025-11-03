import { supabaseAdmin } from '@/config/supabase';
import { Student, CreateStudentDTO, UpdateStudentDTO, StudentSearchFilters } from '@/models/Student.model';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class StudentRepository {
  private tableName = 'students';

  async findById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Student;
    } catch (error) {
      logger.error('Error finding student by ID:', error);
      throw error;
    }
  }

  async findByRollNumber(rollNumber: string): Promise<Student | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('roll_number', rollNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Student;
    } catch (error) {
      logger.error('Error finding student by roll number:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Student | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Student;
    } catch (error) {
      logger.error('Error finding student by user ID:', error);
      throw error;
    }
  }

  async findAll(
    limit: number = 50,
    offset: number = 0,
    filters?: StudentSearchFilters
  ): Promise<Student[]> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }

      if (filters?.batch) {
        query = query.eq('batch', filters.batch);
      }

      if (filters?.enrollmentStatus) {
        query = query.eq('enrollment_status', filters.enrollmentStatus);
      }

      if (filters?.currentSemester) {
        query = query.eq('current_semester', filters.currentSemester);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as Student[];
    } catch (error) {
      logger.error('Error finding all students:', error);
      throw new Error('Failed to fetch students');
    }
  }

  async create(studentData: CreateStudentDTO): Promise<Student> {
    try {
      // Check if roll number already exists
      const existingRoll = await this.findByRollNumber(studentData.rollNumber);
      if (existingRoll) {
        throw new ConflictError(`Roll number ${studentData.rollNumber} already exists`);
      }

      // Check if user already has a student record
      const existingUser = await this.findByUserId(studentData.userId);
      if (existingUser) {
        throw new ConflictError('User already has a student record');
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .insert({
          user_id: studentData.userId,
          roll_number: studentData.rollNumber,
          registration_number: studentData.registrationNumber,
          program_id: studentData.programId,
          batch: studentData.batch,
          admission_date: studentData.admissionDate,
          current_semester: studentData.currentSemester || 1,
          enrollment_status: 'active',
          blood_group: studentData.bloodGroup,
          emergency_contact_name: studentData.emergencyContactName,
          emergency_contact_phone: studentData.emergencyContactPhone,
          guardian_id: studentData.guardianId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Student;
    } catch (error) {
      logger.error('Error creating student:', error);
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create student');
    }
  }

  async update(id: string, studentData: UpdateStudentDTO): Promise<Student> {
    try {
      const student = await this.findById(id);
      if (!student) {
        throw new NotFoundError('Student');
      }

      // Check roll number uniqueness if being changed
      if (studentData.rollNumber && studentData.rollNumber !== student.rollNumber) {
        const existingRoll = await this.findByRollNumber(studentData.rollNumber);
        if (existingRoll) {
          throw new ConflictError(`Roll number ${studentData.rollNumber} already exists`);
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (studentData.rollNumber !== undefined) updateData.roll_number = studentData.rollNumber;
      if (studentData.registrationNumber !== undefined) updateData.registration_number = studentData.registrationNumber;
      if (studentData.programId !== undefined) updateData.program_id = studentData.programId;
      if (studentData.batch !== undefined) updateData.batch = studentData.batch;
      if (studentData.currentSemester !== undefined) updateData.current_semester = studentData.currentSemester;
      if (studentData.enrollmentStatus !== undefined) updateData.enrollment_status = studentData.enrollmentStatus;
      if (studentData.bloodGroup !== undefined) updateData.blood_group = studentData.bloodGroup;
      if (studentData.emergencyContactName !== undefined) updateData.emergency_contact_name = studentData.emergencyContactName;
      if (studentData.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = studentData.emergencyContactPhone;
      if (studentData.guardianId !== undefined) updateData.guardian_id = studentData.guardianId;

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Student;
    } catch (error) {
      logger.error('Error updating student:', error);
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to update student');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error deleting student:', error);
      throw new Error('Failed to delete student');
    }
  }

  async getStudentWithDetails(id: string): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(`
          *,
          users (
            id,
            email,
            first_name,
            last_name,
            phone,
            cnic,
            date_of_birth,
            gender,
            address,
            city,
            province,
            profile_picture_url
          ),
          programs (
            id,
            name,
            code,
            degree_level,
            total_credit_hours
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Student');
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error getting student with details:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch student details');
    }
  }
}

