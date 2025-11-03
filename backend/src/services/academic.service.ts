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
      const allPrograms = await this.academicRepository.findAllPrograms(limit * 10, 0, {
        departmentId: filters?.departmentId,
        degreeLevel: filters?.degreeLevel,
        isActive: filters?.isActive,
      });

      let filteredPrograms = allPrograms;

      // Apply search filter if provided
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

  async getProgramCourses(programId: string): Promise<Course[]> {
    try {
      // This would need a join with curriculum table
      // For now, returning empty array
      // TODO: Implement curriculum relationship
      return [];
    } catch (error) {
      logger.error('Error getting program courses:', error);
      throw new Error('Failed to fetch program courses');
    }
  }
}

