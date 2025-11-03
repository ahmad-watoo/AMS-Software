import { supabaseAdmin } from '@/config/supabase';
import {
  Program,
  Course,
  CourseSection,
  Curriculum,
  CreateProgramDTO,
  UpdateProgramDTO,
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
} from '@/models/Academic.model';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AcademicRepository {
  private programsTable = 'programs';
  private coursesTable = 'courses';
  private sectionsTable = 'sections';
  private curriculumTable = 'curriculum';

  // ==================== Programs ====================

  async findAllPrograms(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      degreeLevel?: string;
      isActive?: boolean;
    }
  ): Promise<Program[]> {
    try {
      let query = supabaseAdmin
        .from(this.programsTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.degreeLevel) {
        query = query.eq('degree_level', filters.degreeLevel);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapProgramFromDB) as Program[];
    } catch (error) {
      logger.error('Error finding all programs:', error);
      throw new Error('Failed to fetch programs');
    }
  }

  async findProgramById(id: string): Promise<Program | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.programsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapProgramFromDB(data) as Program;
    } catch (error) {
      logger.error('Error finding program by ID:', error);
      throw error;
    }
  }

  async findProgramByCode(code: string): Promise<Program | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.programsTable)
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapProgramFromDB(data) as Program;
    } catch (error) {
      logger.error('Error finding program by code:', error);
      throw error;
    }
  }

  async createProgram(programData: CreateProgramDTO): Promise<Program> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.programsTable)
        .insert({
          code: programData.code,
          name: programData.name,
          degree_level: programData.degreeLevel,
          duration: programData.duration,
          total_credit_hours: programData.totalCreditHours,
          department_id: programData.departmentId || null,
          description: programData.description || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapProgramFromDB(data) as Program;
    } catch (error) {
      logger.error('Error creating program:', error);
      throw new Error('Failed to create program');
    }
  }

  async updateProgram(id: string, programData: UpdateProgramDTO): Promise<Program> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (programData.name !== undefined) updateData.name = programData.name;
      if (programData.degreeLevel !== undefined) updateData.degree_level = programData.degreeLevel;
      if (programData.duration !== undefined) updateData.duration = programData.duration;
      if (programData.totalCreditHours !== undefined) updateData.total_credit_hours = programData.totalCreditHours;
      if (programData.departmentId !== undefined) updateData.department_id = programData.departmentId;
      if (programData.description !== undefined) updateData.description = programData.description;
      if (programData.isActive !== undefined) updateData.is_active = programData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.programsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapProgramFromDB(data) as Program;
    } catch (error) {
      logger.error('Error updating program:', error);
      throw new Error('Failed to update program');
    }
  }

  // ==================== Courses ====================

  async findAllCourses(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      departmentId?: string;
      isElective?: boolean;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<Course[]> {
    try {
      let query = supabaseAdmin
        .from(this.coursesTable)
        .select('*')
        .order('code', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.isElective !== undefined) {
        query = query.eq('is_elective', filters.isElective);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let courses = (data || []).map(this.mapCourseFromDB) as Course[];

      // Apply search filter if provided
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        courses = courses.filter(
          (course) =>
            course.code.toLowerCase().includes(searchLower) ||
            course.title.toLowerCase().includes(searchLower)
        );
      }

      return courses;
    } catch (error) {
      logger.error('Error finding all courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  async findCourseById(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.coursesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCourseFromDB(data) as Course;
    } catch (error) {
      logger.error('Error finding course by ID:', error);
      throw error;
    }
  }

  async findCourseByCode(code: string): Promise<Course | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.coursesTable)
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCourseFromDB(data) as Course;
    } catch (error) {
      logger.error('Error finding course by code:', error);
      throw error;
    }
  }

  async createCourse(courseData: CreateCourseDTO): Promise<Course> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.coursesTable)
        .insert({
          code: courseData.code,
          title: courseData.title,
          department_id: courseData.departmentId || null,
          credit_hours: courseData.creditHours,
          theory_hours: courseData.theoryHours,
          lab_hours: courseData.labHours,
          description: courseData.description || null,
          prerequisite_course_ids: courseData.prerequisiteCourseIds || [],
          is_elective: courseData.isElective || false,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCourseFromDB(data) as Course;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  async updateCourse(id: string, courseData: UpdateCourseDTO): Promise<Course> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (courseData.title !== undefined) updateData.title = courseData.title;
      if (courseData.departmentId !== undefined) updateData.department_id = courseData.departmentId;
      if (courseData.creditHours !== undefined) updateData.credit_hours = courseData.creditHours;
      if (courseData.theoryHours !== undefined) updateData.theory_hours = courseData.theoryHours;
      if (courseData.labHours !== undefined) updateData.lab_hours = courseData.labHours;
      if (courseData.description !== undefined) updateData.description = courseData.description;
      if (courseData.prerequisiteCourseIds !== undefined) updateData.prerequisite_course_ids = courseData.prerequisiteCourseIds;
      if (courseData.isElective !== undefined) updateData.is_elective = courseData.isElective;
      if (courseData.isActive !== undefined) updateData.is_active = courseData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.coursesTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCourseFromDB(data) as Course;
    } catch (error) {
      logger.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  }

  // ==================== Sections ====================

  async findAllSections(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      courseId?: string;
      semester?: string;
      facultyId?: string;
    }
  ): Promise<CourseSection[]> {
    try {
      let query = supabaseAdmin
        .from(this.sectionsTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.courseId) {
        query = query.eq('course_id', filters.courseId);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.facultyId) {
        query = query.eq('faculty_id', filters.facultyId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapSectionFromDB) as CourseSection[];
    } catch (error) {
      logger.error('Error finding all sections:', error);
      throw new Error('Failed to fetch sections');
    }
  }

  async findSectionById(id: string): Promise<CourseSection | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.sectionsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapSectionFromDB(data) as CourseSection;
    } catch (error) {
      logger.error('Error finding section by ID:', error);
      throw error;
    }
  }

  async createSection(sectionData: CreateSectionDTO): Promise<CourseSection> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.sectionsTable)
        .insert({
          course_id: sectionData.courseId,
          section_code: sectionData.sectionCode,
          semester: sectionData.semester,
          faculty_id: sectionData.facultyId || null,
          max_capacity: sectionData.maxCapacity,
          current_enrollment: 0,
          room_id: sectionData.roomId || null,
          schedule_id: sectionData.scheduleId || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSectionFromDB(data) as CourseSection;
    } catch (error) {
      logger.error('Error creating section:', error);
      throw new Error('Failed to create section');
    }
  }

  async updateSection(id: string, sectionData: UpdateSectionDTO): Promise<CourseSection> {
    try {
      const updateData: any = {};

      if (sectionData.sectionCode !== undefined) updateData.section_code = sectionData.sectionCode;
      if (sectionData.facultyId !== undefined) updateData.faculty_id = sectionData.facultyId;
      if (sectionData.maxCapacity !== undefined) updateData.max_capacity = sectionData.maxCapacity;
      if (sectionData.currentEnrollment !== undefined) updateData.current_enrollment = sectionData.currentEnrollment;
      if (sectionData.roomId !== undefined) updateData.room_id = sectionData.roomId;
      if (sectionData.scheduleId !== undefined) updateData.schedule_id = sectionData.scheduleId;
      if (sectionData.isActive !== undefined) updateData.is_active = sectionData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.sectionsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSectionFromDB(data) as CourseSection;
    } catch (error) {
      logger.error('Error updating section:', error);
      throw new Error('Failed to update section');
    }
  }

  // ==================== Helper Mappers ====================

  private mapProgramFromDB(data: any): Partial<Program> {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      degreeLevel: data.degree_level,
      duration: data.duration,
      totalCreditHours: data.total_credit_hours,
      departmentId: data.department_id,
      description: data.description,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCourseFromDB(data: any): Partial<Course> {
    return {
      id: data.id,
      code: data.code,
      title: data.title,
      departmentId: data.department_id,
      creditHours: data.credit_hours,
      theoryHours: data.theory_hours,
      labHours: data.lab_hours,
      description: data.description,
      prerequisiteCourseIds: data.prerequisite_course_ids || [],
      isElective: data.is_elective,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSectionFromDB(data: any): Partial<CourseSection> {
    return {
      id: data.id,
      courseId: data.course_id,
      sectionCode: data.section_code,
      semester: data.semester,
      facultyId: data.faculty_id,
      maxCapacity: data.max_capacity,
      currentEnrollment: data.current_enrollment,
      roomId: data.room_id,
      scheduleId: data.schedule_id,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }
}

