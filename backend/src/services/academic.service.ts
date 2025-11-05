/**
 * Academic Service
 * 
 * This service handles all academic management business logic including:
 * - Program management (CRUD operations)
 * - Course management (CRUD operations)
 * - Course section management (CRUD operations)
 * - Curriculum management (program-course relationships)
 * 
 * The academic hierarchy is:
 * - Program (e.g., BS Computer Science)
 *   - Course (e.g., Data Structures)
 *     - Section (e.g., Section A, Fall 2024)
 * 
 * @module services/academic.service
 */

import { AcademicRepository } from '@/repositories/academic.repository';
import {
  Program,
  Course,
  CourseSection,
  CreateProgramDTO,
  UpdateProgramDTO,
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
  AddCourseToCurriculumDTO,
} from '@/models/Academic.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AcademicService {
  private academicRepository: AcademicRepository;

  constructor() {
    this.academicRepository = new AcademicRepository();
  }

  // ==================== Programs ====================

  /**
   * Get all programs with pagination and filters
   * 
   * Retrieves programs with optional filtering by department, degree level,
   * active status, and search query. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of programs to return
   * @param {number} [offset=0] - Number of programs to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.departmentId] - Filter by department ID
   * @param {string} [filters.degreeLevel] - Filter by degree level (undergraduate, graduate, doctoral)
   * @param {boolean} [filters.isActive] - Filter by active status
   * @param {string} [filters.search] - Search by program code or name
   * @returns {Promise<{programs: Program[], total: number}>} Programs and total count
   * 
   * @example
   * const { programs, total } = await academicService.getAllPrograms(20, 0, {
   *   departmentId: 'dept123',
   *   degreeLevel: 'undergraduate',
   *   search: 'CS'
   * });
   */
  async getAllPrograms(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      degreeLevel?: string;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<{
    programs: Program[];
    total: number;
  }> {
    try {
      // Get all programs (for filtering)
      // TODO: Move filtering to database level for better performance
      const allPrograms = await this.academicRepository.findAllPrograms(limit * 10, 0, {
        departmentId: filters?.departmentId,
        degreeLevel: filters?.degreeLevel,
        isActive: filters?.isActive,
      });

      let filteredPrograms = allPrograms;

      // Apply search filter if provided (by code or name)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPrograms = allPrograms.filter(
          (program) =>
            program.code.toLowerCase().includes(searchLower) ||
            program.name.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const paginatedPrograms = filteredPrograms.slice(offset, offset + limit);

      return {
        programs: paginatedPrograms,
        total: filteredPrograms.length,
      };
    } catch (error) {
      logger.error('Error getting all programs:', error);
      throw new Error('Failed to fetch programs');
    }
  }

  /**
   * Get program by ID
   * 
   * Retrieves a specific program by its ID.
   * 
   * @param {string} id - Program ID
   * @returns {Promise<Program>} Program object
   * @throws {NotFoundError} If program not found
   */
  async getProgramById(id: string): Promise<Program> {
    try {
      const program = await this.academicRepository.findProgramById(id);
      if (!program) {
        throw new NotFoundError('Program');
      }
      return program;
    } catch (error) {
      logger.error('Error getting program by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch program');
    }
  }

  /**
   * Create a new program
   * 
   * Creates a new academic program with validation.
   * Validates program code uniqueness and credit hours.
   * 
   * @param {CreateProgramDTO} programData - Program creation data
   * @returns {Promise<Program>} Created program
   * @throws {ValidationError} If program data is invalid
   * @throws {ConflictError} If program code already exists
   * 
   * @example
   * const program = await academicService.createProgram({
   *   code: 'BS-CS',
   *   name: 'Bachelor of Science in Computer Science',
   *   degreeLevel: 'undergraduate',
   *   duration: 4,
   *   totalCreditHours: 130,
   *   departmentId: 'dept123'
   * });
   */
  async createProgram(programData: CreateProgramDTO): Promise<Program> {
    try {
      // Validate required fields
      if (!programData.code || !programData.name || !programData.degreeLevel) {
        throw new ValidationError('Code, name, and degree level are required');
      }

      // Check if program code already exists
      const existingProgram = await this.academicRepository.findProgramByCode(programData.code);
      if (existingProgram) {
        throw new ConflictError('Program with this code already exists');
      }

      // Validate credit hours
      if (programData.totalCreditHours <= 0) {
        throw new ValidationError('Total credit hours must be greater than 0');
      }

      return await this.academicRepository.createProgram(programData);
    } catch (error) {
      logger.error('Error creating program:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create program');
    }
  }

  /**
   * Update a program
   * 
   * Updates an existing program's information.
   * 
   * @param {string} id - Program ID
   * @param {UpdateProgramDTO} programData - Partial program data to update
   * @returns {Promise<Program>} Updated program
   * @throws {NotFoundError} If program not found
   */
  async updateProgram(id: string, programData: UpdateProgramDTO): Promise<Program> {
    try {
      const existingProgram = await this.academicRepository.findProgramById(id);
      if (!existingProgram) {
        throw new NotFoundError('Program');
      }

      return await this.academicRepository.updateProgram(id, programData);
    } catch (error) {
      logger.error('Error updating program:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update program');
    }
  }

  // ==================== Courses ====================

  /**
   * Get all courses with pagination and filters
   * 
   * Retrieves courses with optional filtering by department, elective status,
   * active status, and search query. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of courses to return
   * @param {number} [offset=0] - Number of courses to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.departmentId] - Filter by department ID
   * @param {boolean} [filters.isElective] - Filter by elective status
   * @param {boolean} [filters.isActive] - Filter by active status
   * @param {string} [filters.search] - Search by course code or title
   * @returns {Promise<{courses: Course[], total: number}>} Courses and total count
   * 
   * @example
   * const { courses, total } = await academicService.getAllCourses(20, 0, {
   *   departmentId: 'dept123',
   *   isElective: false,
   *   search: 'CS'
   * });
   */
  async getAllCourses(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      isElective?: boolean;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<{
    courses: Course[];
    total: number;
  }> {
    try {
      const allCourses = await this.academicRepository.findAllCourses(limit * 10, 0, {
        departmentId: filters?.departmentId,
        isElective: filters?.isElective,
        isActive: filters?.isActive,
        search: filters?.search,
      });

      // Apply pagination
      const paginatedCourses = allCourses.slice(offset, offset + limit);

      return {
        courses: paginatedCourses,
        total: allCourses.length,
      };
    } catch (error) {
      logger.error('Error getting all courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  /**
   * Get course by ID
   * 
   * Retrieves a specific course by its ID.
   * 
   * @param {string} id - Course ID
   * @returns {Promise<Course>} Course object
   * @throws {NotFoundError} If course not found
   */
  async getCourseById(id: string): Promise<Course> {
    try {
      const course = await this.academicRepository.findCourseById(id);
      if (!course) {
        throw new NotFoundError('Course');
      }
      return course;
    } catch (error) {
      logger.error('Error getting course by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch course');
    }
  }

  /**
   * Create a new course
   * 
   * Creates a new course with validation.
   * Validates course code uniqueness, credit hours, and theory/lab hours.
   * 
   * @param {CreateCourseDTO} courseData - Course creation data
   * @returns {Promise<Course>} Created course
   * @throws {ValidationError} If course data is invalid
   * @throws {ConflictError} If course code already exists
   * 
   * @example
   * const course = await academicService.createCourse({
   *   code: 'CS-101',
   *   title: 'Introduction to Computer Science',
   *   creditHours: 3,
   *   theoryHours: 3,
   *   labHours: 0,
   *   departmentId: 'dept123',
   *   isElective: false
   * });
   */
  async createCourse(courseData: CreateCourseDTO): Promise<Course> {
    try {
      // Validate required fields
      if (!courseData.code || !courseData.title || !courseData.creditHours) {
        throw new ValidationError('Code, title, and credit hours are required');
      }

      // Check if course code already exists
      const existingCourse = await this.academicRepository.findCourseByCode(courseData.code);
      if (existingCourse) {
        throw new ConflictError('Course with this code already exists');
      }

      // Validate credit hours
      if (courseData.creditHours <= 0) {
        throw new ValidationError('Credit hours must be greater than 0');
      }

      // Validate theory and lab hours don't exceed credit hours
      // Typically: 1 credit hour = 1 hour theory OR 2-3 hours lab
      if (courseData.theoryHours + courseData.labHours > courseData.creditHours * 2) {
        throw new ValidationError('Theory and lab hours should not exceed credit hours');
      }

      return await this.academicRepository.createCourse(courseData);
    } catch (error) {
      logger.error('Error creating course:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create course');
    }
  }

  /**
   * Update a course
   * 
   * Updates an existing course's information.
   * 
   * @param {string} id - Course ID
   * @param {UpdateCourseDTO} courseData - Partial course data to update
   * @returns {Promise<Course>} Updated course
   * @throws {NotFoundError} If course not found
   */
  async updateCourse(id: string, courseData: UpdateCourseDTO): Promise<Course> {
    try {
      const existingCourse = await this.academicRepository.findCourseById(id);
      if (!existingCourse) {
        throw new NotFoundError('Course');
      }

      return await this.academicRepository.updateCourse(id, courseData);
    } catch (error) {
      logger.error('Error updating course:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update course');
    }
  }

  // ==================== Sections ====================

  /**
   * Get all sections with pagination and filters
   * 
   * Retrieves course sections with optional filtering by course, semester,
   * and faculty. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of sections to return
   * @param {number} [offset=0] - Number of sections to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.courseId] - Filter by course ID
   * @param {string} [filters.semester] - Filter by semester
   * @param {string} [filters.facultyId] - Filter by faculty ID
   * @returns {Promise<{sections: CourseSection[], total: number}>} Sections and total count
   * 
   * @example
   * const { sections, total } = await academicService.getAllSections(20, 0, {
   *   courseId: 'course123',
   *   semester: '2024-Fall'
   * });
   */
  async getAllSections(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      courseId?: string;
      semester?: string;
      facultyId?: string;
    }
  ): Promise<{
    sections: CourseSection[];
    total: number;
  }> {
    try {
      const allSections = await this.academicRepository.findAllSections(limit * 10, 0, filters);
      const paginatedSections = allSections.slice(offset, offset + limit);

      return {
        sections: paginatedSections,
        total: allSections.length,
      };
    } catch (error) {
      logger.error('Error getting all sections:', error);
      throw new Error('Failed to fetch sections');
    }
  }

  /**
   * Get section by ID
   * 
   * Retrieves a specific course section by its ID.
   * 
   * @param {string} id - Section ID
   * @returns {Promise<CourseSection>} Section object
   * @throws {NotFoundError} If section not found
   */
  async getSectionById(id: string): Promise<CourseSection> {
    try {
      const section = await this.academicRepository.findSectionById(id);
      if (!section) {
        throw new NotFoundError('Section');
      }
      return section;
    } catch (error) {
      logger.error('Error getting section by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch section');
    }
  }

  /**
   * Create a new section
   * 
   * Creates a new course section with validation.
   * Validates max capacity and required fields.
   * 
   * @param {CreateSectionDTO} sectionData - Section creation data
   * @returns {Promise<CourseSection>} Created section
   * @throws {ValidationError} If section data is invalid
   * 
   * @example
   * const section = await academicService.createSection({
   *   courseId: 'course123',
   *   sectionCode: 'A',
   *   semester: '2024-Fall',
   *   maxCapacity: 30,
   *   facultyId: 'faculty456',
   *   roomId: 'room789'
   * });
   */
  async createSection(sectionData: CreateSectionDTO): Promise<CourseSection> {
    try {
      // Validate required fields
      if (!sectionData.courseId || !sectionData.sectionCode || !sectionData.semester || !sectionData.maxCapacity) {
        throw new ValidationError('Course ID, section code, semester, and max capacity are required');
      }

      // Validate max capacity
      if (sectionData.maxCapacity <= 0) {
        throw new ValidationError('Max capacity must be greater than 0');
      }

      return await this.academicRepository.createSection(sectionData);
    } catch (error) {
      logger.error('Error creating section:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create section');
    }
  }

  /**
   * Update a section
   * 
   * Updates an existing course section's information.
   * 
   * @param {string} id - Section ID
   * @param {UpdateSectionDTO} sectionData - Partial section data to update
   * @returns {Promise<CourseSection>} Updated section
   * @throws {NotFoundError} If section not found
   * @throws {ValidationError} If max capacity is invalid
   */
  async updateSection(id: string, sectionData: UpdateSectionDTO): Promise<CourseSection> {
    try {
      const existingSection = await this.academicRepository.findSectionById(id);
      if (!existingSection) {
        throw new NotFoundError('Section');
      }

      // Validate max capacity if being updated
      if (sectionData.maxCapacity !== undefined && sectionData.maxCapacity <= 0) {
        throw new ValidationError('Max capacity must be greater than 0');
      }

      return await this.academicRepository.updateSection(id, sectionData);
    } catch (error) {
      logger.error('Error updating section:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update section');
    }
  }

  /**
   * Get program courses
   * 
   * Retrieves all courses in a program's curriculum.
   * 
   * @param {string} programId - Program ID
   * @returns {Promise<Course[]>} Array of courses in the program
   * 
   * @example
   * const courses = await academicService.getProgramCourses('prog123');
   */
  async getProgramCourses(programId: string): Promise<Course[]> {
    try {
      // TODO: Implement curriculum relationship
      // This would need a join with curriculum table to get courses for a program
      // For now, returning empty array
      return [];
    } catch (error) {
      logger.error('Error getting program courses:', error);
      throw new Error('Failed to fetch program courses');
    }
  }
}
