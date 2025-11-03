import { StudentRepository } from '@/repositories/student.repository';
import { Student, CreateStudentDTO, UpdateStudentDTO, StudentWithUser, StudentSearchFilters } from '@/models/Student.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';
import { supabaseAdmin } from '@/config/supabase';

export class StudentService {
  private studentRepository: StudentRepository;

  constructor() {
    this.studentRepository = new StudentRepository();
  }

  async getAllStudents(
    limit: number = 50,
    offset: number = 0,
    filters?: StudentSearchFilters
  ): Promise<{
    students: StudentWithUser[];
    total: number;
  }> {
    try {
      // Get all students first (for filtering)
      const allStudents = await this.studentRepository.findAll(limit * 10, 0, filters);
      
      let filteredStudents = allStudents;

      // Apply search filter if provided (name, roll number, email)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        // We'll need to join with users table for name/email search
        // For now, filter by roll number
        filteredStudents = allStudents.filter(
          (student) =>
            student.rollNumber.toLowerCase().includes(searchLower) ||
            student.registrationNumber?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const paginatedStudents = filteredStudents.slice(offset, offset + limit);

      // Get detailed information for each student
      const studentsWithDetails = await Promise.all(
        paginatedStudents.map(async (student) => {
          try {
            return await this.studentRepository.getStudentWithDetails(student.id);
          } catch (error) {
            logger.error(`Error getting details for student ${student.id}:`, error);
            return { ...student, user: null, program: null };
          }
        })
      );

      return {
        students: studentsWithDetails as StudentWithUser[],
        total: filteredStudents.length,
      };
    } catch (error) {
      logger.error('Error getting all students:', error);
      throw new Error('Failed to fetch students');
    }
  }

  async getStudentById(id: string): Promise<StudentWithUser> {
    try {
      const studentWithDetails = await this.studentRepository.getStudentWithDetails(id);
      
      if (!studentWithDetails) {
        throw new NotFoundError('Student');
      }

      return studentWithDetails as StudentWithUser;
    } catch (error) {
      logger.error('Error getting student by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch student');
    }
  }

  async getStudentByUserId(userId: string): Promise<StudentWithUser> {
    try {
      const student = await this.studentRepository.findByUserId(userId);
      
      if (!student) {
        throw new NotFoundError('Student');
      }

      return await this.getStudentById(student.id);
    } catch (error) {
      logger.error('Error getting student by user ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch student');
    }
  }

  async createStudent(studentData: CreateStudentDTO): Promise<Student> {
    try {
      // Validate required fields
      if (!studentData.userId || !studentData.rollNumber || !studentData.programId || !studentData.batch) {
        throw new ValidationError('userId, rollNumber, programId, and batch are required');
      }

      // Validate roll number format (can be customized)
      if (!this.isValidRollNumber(studentData.rollNumber)) {
        throw new ValidationError('Invalid roll number format');
      }

      // Validate batch format (e.g., "2024-Fall")
      if (!this.isValidBatch(studentData.batch)) {
        throw new ValidationError('Invalid batch format (expected: YYYY-Session, e.g., 2024-Fall)');
      }

      return await this.studentRepository.create(studentData);
    } catch (error) {
      logger.error('Error creating student:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create student');
    }
  }

  async updateStudent(id: string, studentData: UpdateStudentDTO): Promise<Student> {
    try {
      if (studentData.batch && !this.isValidBatch(studentData.batch)) {
        throw new ValidationError('Invalid batch format');
      }

      return await this.studentRepository.update(id, studentData);
    } catch (error) {
      logger.error('Error updating student:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to update student');
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      const student = await this.studentRepository.findById(id);
      if (!student) {
        throw new NotFoundError('Student');
      }

      return await this.studentRepository.delete(id);
    } catch (error) {
      logger.error('Error deleting student:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to delete student');
    }
  }

  async calculateCGPA(studentId: string): Promise<number> {
    try {
      // This will use a database function to calculate CGPA
      // For now, return 0.0 - will be implemented with enrollment/results data
      const { data, error } = await supabaseAdmin
        .rpc('calculate_cgpa', { student_uuid: studentId });

      if (error) {
        logger.error('Error calculating CGPA:', error);
        return 0.0;
      }

      return data || 0.0;
    } catch (error) {
      logger.error('Error calculating CGPA:', error);
      return 0.0;
    }
  }

  async getStudentEnrollments(studentId: string, semester?: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('enrollments')
        .select(`
          *,
          sections (
            id,
            section_code,
            course_id,
            semester,
            courses (
              id,
              code,
              title,
              credit_hours
            )
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Filter by semester if provided
      let enrollments = data || [];
      if (semester) {
        enrollments = enrollments.filter((enrollment: any) => 
          enrollment.sections?.semester === semester
        );
      }

      return enrollments;
    } catch (error) {
      logger.error('Error getting student enrollments:', error);
      throw new Error('Failed to fetch enrollments');
    }
  }

  async getStudentResults(studentId: string, semester?: string): Promise<any[]> {
    try {
      // Get enrollments first, then get results for those enrollments
      const enrollments = await this.getStudentEnrollments(studentId, semester);
      const enrollmentIds = enrollments.map((e: any) => e.id);

      if (enrollmentIds.length === 0) {
        return [];
      }

      const { data, error } = await supabaseAdmin
        .from('results')
        .select(`
          *,
          enrollments (
            id,
            sections (
              id,
              section_code,
              course_id,
              semester,
              courses (
                id,
                code,
                title,
                credit_hours
              )
            )
          )
        `)
        .in('enrollment_id', enrollmentIds)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error getting student results:', error);
      throw new Error('Failed to fetch results');
    }
  }

  private isValidRollNumber(rollNumber: string): boolean {
    // Basic validation - can be customized
    return rollNumber.length >= 3 && rollNumber.length <= 50;
  }

  private isValidBatch(batch: string): boolean {
    // Format: YYYY-Session (e.g., 2024-Fall, 2024-Spring)
    const batchRegex = /^\d{4}-(Fall|Spring|Summer)$/i;
    return batchRegex.test(batch);
  }
}
