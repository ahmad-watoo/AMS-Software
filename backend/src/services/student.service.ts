/**
 * Student Service
 * 
 * This service handles all student management business logic including:
 * - Student CRUD operations
 * - Student search and pagination
 * - Student enrollment management
 * - Student results tracking
 * - CGPA calculation
 * - Batch and roll number validation
 * 
 * @module services/student.service
 */

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

  /**
   * Get all students with pagination and filters
   * 
   * Retrieves students with optional search filtering, program filtering,
   * batch filtering, and pagination. Returns detailed student information
   * including user and program data.
   * 
   * @param {number} [limit=50] - Maximum number of students to return
   * @param {number} [offset=0] - Number of students to skip
   * @param {StudentSearchFilters} [filters] - Optional search and filter criteria
   * @returns {Promise<{students: StudentWithUser[], total: number}>} Students and total count
   * 
   * @example
   * const { students, total } = await studentService.getAllStudents(20, 0, {
   *   search: 'BS2024',
   *   programId: 'prog123',
   *   batch: '2024-Fall'
   * });
   */
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
      // TODO: Move filtering to database level for better performance
      const allStudents = await this.studentRepository.findAll(limit * 10, 0, filters);
      
      let filteredStudents = allStudents;

      // Apply search filter if provided (name, roll number, email)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        // Filter by roll number and registration number
        // TODO: Join with users table for name/email search
        filteredStudents = allStudents.filter(
          (student) =>
            student.rollNumber.toLowerCase().includes(searchLower) ||
            student.registrationNumber?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const paginatedStudents = filteredStudents.slice(offset, offset + limit);

      // Get detailed information for each student (user and program data)
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

  /**
   * Get student by ID
   * 
   * Retrieves a specific student by their ID with full details
   * including user and program information.
   * 
   * @param {string} id - Student ID
   * @returns {Promise<StudentWithUser>} Student with user and program details
   * @throws {NotFoundError} If student not found
   */
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

  /**
   * Get student by user ID
   * 
   * Retrieves a student record associated with a specific user ID.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<StudentWithUser>} Student with user and program details
   * @throws {NotFoundError} If student not found for user
   * 
   * @example
   * const student = await studentService.getStudentByUserId('user123');
   */
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

  /**
   * Create a new student
   * 
   * Creates a new student record with validation.
   * Validates roll number format and batch format.
   * 
   * @param {CreateStudentDTO} studentData - Student creation data
   * @returns {Promise<Student>} Created student
   * @throws {ValidationError} If student data is invalid
   * @throws {ConflictError} If roll number already exists
   * 
   * @example
   * const student = await studentService.createStudent({
   *   userId: 'user123',
   *   rollNumber: 'BS2024-001',
   *   programId: 'prog456',
   *   batch: '2024-Fall',
   *   admissionDate: '2024-09-01'
   * });
   */
  async createStudent(studentData: CreateStudentDTO): Promise<Student> {
    try {
      // Validate required fields
      if (!studentData.userId || !studentData.rollNumber || !studentData.programId || !studentData.batch) {
        throw new ValidationError('userId, rollNumber, programId, and batch are required');
      }

      // Validate roll number format
      if (!this.isValidRollNumber(studentData.rollNumber)) {
        throw new ValidationError('Invalid roll number format');
      }

      // Validate batch format (e.g., "2024-Fall", "2024-Spring", "2024-Summer")
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

  /**
   * Update a student
   * 
   * Updates an existing student's information.
   * 
   * @param {string} id - Student ID
   * @param {UpdateStudentDTO} studentData - Partial student data to update
   * @returns {Promise<Student>} Updated student
   * @throws {NotFoundError} If student not found
   * @throws {ValidationError} If batch format is invalid
   * 
   * @example
   * const student = await studentService.updateStudent('student123', {
   *   currentSemester: 2,
   *   enrollmentStatus: 'active'
   * });
   */
  async updateStudent(id: string, studentData: UpdateStudentDTO): Promise<Student> {
    try {
      // Validate batch format if provided
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

  /**
   * Delete a student
   * 
   * Deletes a student record (soft delete).
   * 
   * @param {string} id - Student ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} If student not found
   */
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

  /**
   * Calculate student CGPA
   * 
   * Calculates the Cumulative Grade Point Average (CGPA) for a student.
   * Uses database function for accurate calculation based on all results.
   * 
   * @param {string} studentId - Student ID
   * @returns {Promise<number>} CGPA value (0.0 to 4.0)
   * 
   * @example
   * const cgpa = await studentService.calculateCGPA('student123');
   * console.log(`CGPA: ${cgpa.toFixed(2)}`); // e.g., "CGPA: 3.45"
   */
  async calculateCGPA(studentId: string): Promise<number> {
    try {
      // Call database function to calculate CGPA
      // This function aggregates all grades and calculates weighted average
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

  /**
   * Get student enrollments
   * 
   * Retrieves all course enrollments for a student, optionally filtered by semester.
   * Includes course and section details.
   * 
   * @param {string} studentId - Student ID
   * @param {string} [semester] - Optional semester filter
   * @returns {Promise<any[]>} Array of enrollments with course and section details
   * 
   * @example
   * // Get all enrollments
   * const enrollments = await studentService.getStudentEnrollments('student123');
   * 
   * @example
   * // Get enrollments for specific semester
   * const fallEnrollments = await studentService.getStudentEnrollments('student123', '2024-Fall');
   */
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

  /**
   * Get student results
   * 
   * Retrieves all exam results for a student, optionally filtered by semester.
   * Includes course, section, and grade details.
   * 
   * @param {string} studentId - Student ID
   * @param {string} [semester] - Optional semester filter
   * @returns {Promise<any[]>} Array of results with course and enrollment details
   * 
   * @example
   * // Get all results
   * const results = await studentService.getStudentResults('student123');
   * 
   * @example
   * // Get results for specific semester
   * const fallResults = await studentService.getStudentResults('student123', '2024-Fall');
   */
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

  /**
   * Validate roll number format
   * 
   * Validates that roll number meets basic requirements.
   * Can be customized based on institution's roll number format.
   * 
   * @private
   * @param {string} rollNumber - Roll number to validate
   * @returns {boolean} True if roll number format is valid
   */
  private isValidRollNumber(rollNumber: string): boolean {
    // Basic validation - can be customized
    // Currently: 3-50 characters
    return rollNumber.length >= 3 && rollNumber.length <= 50;
  }

  /**
   * Validate batch format
   * 
   * Validates batch format: YYYY-Session (e.g., 2024-Fall, 2024-Spring, 2024-Summer).
   * 
   * @private
   * @param {string} batch - Batch string to validate
   * @returns {boolean} True if batch format is valid
   */
  private isValidBatch(batch: string): boolean {
    // Format: YYYY-Session (e.g., 2024-Fall, 2024-Spring, 2024-Summer)
    const batchRegex = /^\d{4}-(Fall|Spring|Summer)$/i;
    return batchRegex.test(batch);
  }
}
