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

