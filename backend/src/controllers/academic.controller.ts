/**
 * Academic Controller
 * 
 * Handles HTTP requests for academic management endpoints.
 * Manages programs, courses, and course sections.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/academic.controller
 */

import { Request, Response, NextFunction } from 'express';
import { AcademicService } from '@/services/academic.service';
import {
  CreateProgramDTO,
  UpdateProgramDTO,
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
} from '@/models/Academic.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AcademicController {
  private academicService: AcademicService;

  constructor() {
    this.academicService = new AcademicService();
  }

  // ==================== Programs ====================

  /**
   * Get All Programs Endpoint Handler
   * 
   * Retrieves all programs with pagination and optional filters.
   * 
   * @route GET /api/v1/academic/programs
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [departmentId] - Filter by department ID
   * @query {string} [degreeLevel] - Filter by degree level
   * @query {boolean} [isActive] - Filter by active status
   * @query {string} [search] - Search by program code or name
   * @returns {Object} Programs array and pagination info
   * 
   * @example
   * GET /api/v1/academic/programs?page=1&limit=20&degreeLevel=undergraduate&search=CS
   */
  getAllPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        departmentId: req.query.departmentId as string,
        degreeLevel: req.query.degreeLevel as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string,
      };

      const result = await this.academicService.getAllPrograms(limit, offset, filters);

      sendSuccess(res, {
        programs: result.programs,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all programs error:', error);
      next(error);
    }
  };

  /**
   * Get Program By ID Endpoint Handler
   * 
   * Retrieves a specific program by ID.
   * 
   * @route GET /api/v1/academic/programs/:id
   * @access Private
   * @param {string} id - Program ID
   * @returns {Program} Program object
   */
  getProgramById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const program = await this.academicService.getProgramById(id);
      sendSuccess(res, program);
    } catch (error) {
      logger.error('Get program by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Program Endpoint Handler
   * 
   * Creates a new academic program.
   * 
   * @route POST /api/v1/academic/programs
   * @access Private (Requires academic.create permission)
   * @body {CreateProgramDTO} Program creation data
   * @returns {Program} Created program
   * 
   * @example
   * POST /api/v1/academic/programs
   * Body: {
   *   code: "BS-CS",
   *   name: "Bachelor of Science in Computer Science",
   *   degreeLevel: "undergraduate",
   *   duration: 4,
   *   totalCreditHours: 130,
   *   departmentId: "dept123"
   * }
   */
  createProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const programData: CreateProgramDTO = {
        code: req.body.code,
        name: req.body.name,
        degreeLevel: req.body.degreeLevel,
        duration: req.body.duration,
        totalCreditHours: req.body.totalCreditHours,
        departmentId: req.body.departmentId,
        description: req.body.description,
      };

      if (!programData.code || !programData.name || !programData.degreeLevel) {
        throw new ValidationError('Code, name, and degree level are required');
      }

      const program = await this.academicService.createProgram(programData);
      sendSuccess(res, program, 'Program created successfully', 201);
    } catch (error) {
      logger.error('Create program error:', error);
      next(error);
    }
  };

  /**
   * Update Program Endpoint Handler
   * 
   * Updates an existing program.
   * 
   * @route PUT /api/v1/academic/programs/:id
   * @access Private (Requires academic.update permission)
   * @param {string} id - Program ID
   * @body {UpdateProgramDTO} Partial program data to update
   * @returns {Program} Updated program
   * 
   * @example
   * PUT /api/v1/academic/programs/prog123
   * Body: {
   *   name: "Updated Program Name",
   *   totalCreditHours: 135
   * }
   */
  updateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const programData: UpdateProgramDTO = {
        name: req.body.name,
        degreeLevel: req.body.degreeLevel,
        duration: req.body.duration,
        totalCreditHours: req.body.totalCreditHours,
        departmentId: req.body.departmentId,
        description: req.body.description,
        isActive: req.body.isActive,
      };

      const program = await this.academicService.updateProgram(id, programData);
      sendSuccess(res, program, 'Program updated successfully');
    } catch (error) {
      logger.error('Update program error:', error);
      next(error);
    }
  };

  // ==================== Courses ====================

  /**
   * Get All Courses Endpoint Handler
   * 
   * Retrieves all courses with pagination and optional filters.
   * 
   * @route GET /api/v1/academic/courses
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [departmentId] - Filter by department ID
   * @query {boolean} [isElective] - Filter by elective status
   * @query {boolean} [isActive] - Filter by active status
   * @query {string} [search] - Search by course code or title
   * @returns {Object} Courses array and pagination info
   * 
   * @example
   * GET /api/v1/academic/courses?page=1&limit=20&isElective=false&search=CS
   */
  getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        departmentId: req.query.departmentId as string,
        isElective: req.query.isElective ? req.query.isElective === 'true' : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string,
      };

      const result = await this.academicService.getAllCourses(limit, offset, filters);

      sendSuccess(res, {
        courses: result.courses,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all courses error:', error);
      next(error);
    }
  };

  /**
   * Get Course By ID Endpoint Handler
   * 
   * Retrieves a specific course by ID.
   * 
   * @route GET /api/v1/academic/courses/:id
   * @access Private
   * @param {string} id - Course ID
   * @returns {Course} Course object
   */
  getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const course = await this.academicService.getCourseById(id);
      sendSuccess(res, course);
    } catch (error) {
      logger.error('Get course by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Course Endpoint Handler
   * 
   * Creates a new course.
   * 
   * @route POST /api/v1/academic/courses
   * @access Private (Requires academic.create permission)
   * @body {CreateCourseDTO} Course creation data
   * @returns {Course} Created course
   * 
   * @example
   * POST /api/v1/academic/courses
   * Body: {
   *   code: "CS-101",
   *   title: "Introduction to Computer Science",
   *   creditHours: 3,
   *   theoryHours: 3,
   *   labHours: 0,
   *   departmentId: "dept123",
   *   isElective: false
   * }
   */
  createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseData: CreateCourseDTO = {
        code: req.body.code,
        title: req.body.title,
        departmentId: req.body.departmentId,
        creditHours: req.body.creditHours,
        theoryHours: req.body.theoryHours,
        labHours: req.body.labHours,
        description: req.body.description,
        prerequisiteCourseIds: req.body.prerequisiteCourseIds,
        isElective: req.body.isElective,
      };

      if (!courseData.code || !courseData.title || !courseData.creditHours) {
        throw new ValidationError('Code, title, and credit hours are required');
      }

      const course = await this.academicService.createCourse(courseData);
      sendSuccess(res, course, 'Course created successfully', 201);
    } catch (error) {
      logger.error('Create course error:', error);
      next(error);
    }
  };

  /**
   * Update Course Endpoint Handler
   * 
   * Updates an existing course.
   * 
   * @route PUT /api/v1/academic/courses/:id
   * @access Private (Requires academic.update permission)
   * @param {string} id - Course ID
   * @body {UpdateCourseDTO} Partial course data to update
   * @returns {Course} Updated course
   * 
   * @example
   * PUT /api/v1/academic/courses/course123
   * Body: {
   *   title: "Updated Course Title",
   *   creditHours: 4
   * }
   */
  updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const courseData: UpdateCourseDTO = {
        title: req.body.title,
        departmentId: req.body.departmentId,
        creditHours: req.body.creditHours,
        theoryHours: req.body.theoryHours,
        labHours: req.body.labHours,
        description: req.body.description,
        prerequisiteCourseIds: req.body.prerequisiteCourseIds,
        isElective: req.body.isElective,
        isActive: req.body.isActive,
      };

      const course = await this.academicService.updateCourse(id, courseData);
      sendSuccess(res, course, 'Course updated successfully');
    } catch (error) {
      logger.error('Update course error:', error);
      next(error);
    }
  };

  // ==================== Sections ====================

  /**
   * Get All Sections Endpoint Handler
   * 
   * Retrieves all course sections with pagination and optional filters.
   * 
   * @route GET /api/v1/academic/sections
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [courseId] - Filter by course ID
   * @query {string} [semester] - Filter by semester
   * @query {string} [facultyId] - Filter by faculty ID
   * @returns {Object} Sections array and pagination info
   * 
   * @example
   * GET /api/v1/academic/sections?page=1&limit=20&courseId=course123&semester=2024-Fall
   */
  getAllSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        courseId: req.query.courseId as string,
        semester: req.query.semester as string,
        facultyId: req.query.facultyId as string,
      };

      const result = await this.academicService.getAllSections(limit, offset, filters);

      sendSuccess(res, {
        sections: result.sections,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get all sections error:', error);
      next(error);
    }
  };

  /**
   * Get Section By ID Endpoint Handler
   * 
   * Retrieves a specific course section by ID.
   * 
   * @route GET /api/v1/academic/sections/:id
   * @access Private
   * @param {string} id - Section ID
   * @returns {CourseSection} Section object
   */
  getSectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const section = await this.academicService.getSectionById(id);
      sendSuccess(res, section);
    } catch (error) {
      logger.error('Get section by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Section Endpoint Handler
   * 
   * Creates a new course section.
   * 
   * @route POST /api/v1/academic/sections
   * @access Private (Requires academic.create permission)
   * @body {CreateSectionDTO} Section creation data
   * @returns {CourseSection} Created section
   * 
   * @example
   * POST /api/v1/academic/sections
   * Body: {
   *   courseId: "course123",
   *   sectionCode: "A",
   *   semester: "2024-Fall",
   *   maxCapacity: 30,
   *   facultyId: "faculty456",
   *   roomId: "room789"
   * }
   */
  createSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sectionData: CreateSectionDTO = {
        courseId: req.body.courseId,
        sectionCode: req.body.sectionCode,
        semester: req.body.semester,
        facultyId: req.body.facultyId,
        maxCapacity: req.body.maxCapacity,
        roomId: req.body.roomId,
        scheduleId: req.body.scheduleId,
      };

      if (!sectionData.courseId || !sectionData.sectionCode || !sectionData.semester || !sectionData.maxCapacity) {
        throw new ValidationError('Course ID, section code, semester, and max capacity are required');
      }

      const section = await this.academicService.createSection(sectionData);
      sendSuccess(res, section, 'Section created successfully', 201);
    } catch (error) {
      logger.error('Create section error:', error);
      next(error);
    }
  };

  /**
   * Update Section Endpoint Handler
   * 
   * Updates an existing course section.
   * 
   * @route PUT /api/v1/academic/sections/:id
   * @access Private (Requires academic.update permission)
   * @param {string} id - Section ID
   * @body {UpdateSectionDTO} Partial section data to update
   * @returns {CourseSection} Updated section
   * 
   * @example
   * PUT /api/v1/academic/sections/section123
   * Body: {
   *   maxCapacity: 35,
   *   facultyId: "faculty789"
   * }
   */
  updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const sectionData: UpdateSectionDTO = {
        sectionCode: req.body.sectionCode,
        facultyId: req.body.facultyId,
        maxCapacity: req.body.maxCapacity,
        currentEnrollment: req.body.currentEnrollment,
        roomId: req.body.roomId,
        scheduleId: req.body.scheduleId,
        isActive: req.body.isActive,
      };

      const section = await this.academicService.updateSection(id, sectionData);
      sendSuccess(res, section, 'Section updated successfully');
    } catch (error) {
      logger.error('Update section error:', error);
      next(error);
    }
  };
}
