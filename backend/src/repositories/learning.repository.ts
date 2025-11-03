import { supabaseAdmin } from '@/config/supabase';
import {
  CourseMaterial,
  Assignment,
  AssignmentSubmission,
  GradeBook,
  CreateCourseMaterialDTO,
  UpdateCourseMaterialDTO,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  CreateAssignmentSubmissionDTO,
} from '@/models/Learning.model';
import { logger } from '@/config/logger';

export class LearningRepository {
  private courseMaterialsTable = 'course_materials';
  private assignmentsTable = 'assignments';
  private assignmentSubmissionsTable = 'assignment_submissions';
  private gradeBookTable = 'gradebook';

  // ==================== Course Materials ====================

  async findAllCourseMaterials(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      courseId?: string;
      materialType?: string;
      isVisible?: boolean;
    }
  ): Promise<CourseMaterial[]> {
    try {
      let query = supabaseAdmin
        .from(this.courseMaterialsTable)
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.courseId) {
        query = query.eq('course_id', filters.courseId);
      }
      if (filters?.materialType) {
        query = query.eq('material_type', filters.materialType);
      }
      if (filters?.isVisible !== undefined) {
        query = query.eq('is_visible', filters.isVisible);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapCourseMaterialFromDB) as CourseMaterial[];
    } catch (error) {
      logger.error('Error finding all course materials:', error);
      throw new Error('Failed to fetch course materials');
    }
  }

  async findCourseMaterialById(id: string): Promise<CourseMaterial | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.courseMaterialsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCourseMaterialFromDB(data) as CourseMaterial;
    } catch (error) {
      logger.error('Error finding course material by ID:', error);
      throw error;
    }
  }

  async createCourseMaterial(materialData: CreateCourseMaterialDTO, uploadedBy?: string): Promise<CourseMaterial> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.courseMaterialsTable)
        .insert({
          section_id: materialData.sectionId,
          course_id: materialData.courseId,
          title: materialData.title,
          description: materialData.description || null,
          material_type: materialData.materialType,
          file_url: materialData.fileUrl || null,
          external_url: materialData.externalUrl || null,
          file_size: materialData.fileSize || null,
          file_name: materialData.fileName || null,
          uploaded_by: uploadedBy || null,
          is_visible: materialData.isVisible ?? true,
          display_order: materialData.displayOrder || 0,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCourseMaterialFromDB(data) as CourseMaterial;
    } catch (error) {
      logger.error('Error creating course material:', error);
      throw new Error('Failed to create course material');
    }
  }

  async updateCourseMaterial(id: string, materialData: UpdateCourseMaterialDTO): Promise<CourseMaterial> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (materialData.title !== undefined) updateData.title = materialData.title;
      if (materialData.description !== undefined) updateData.description = materialData.description;
      if (materialData.isVisible !== undefined) updateData.is_visible = materialData.isVisible;
      if (materialData.displayOrder !== undefined) updateData.display_order = materialData.displayOrder;

      const { data, error } = await supabaseAdmin
        .from(this.courseMaterialsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCourseMaterialFromDB(data) as CourseMaterial;
    } catch (error) {
      logger.error('Error updating course material:', error);
      throw new Error('Failed to update course material');
    }
  }

  // ==================== Assignments ====================

  async findAllAssignments(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      courseId?: string;
      isPublished?: boolean;
    }
  ): Promise<Assignment[]> {
    try {
      let query = supabaseAdmin
        .from(this.assignmentsTable)
        .select('*')
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.courseId) {
        query = query.eq('course_id', filters.courseId);
      }
      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapAssignmentFromDB) as Assignment[];
    } catch (error) {
      logger.error('Error finding all assignments:', error);
      throw new Error('Failed to fetch assignments');
    }
  }

  async findAssignmentById(id: string): Promise<Assignment | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.assignmentsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapAssignmentFromDB(data) as Assignment;
    } catch (error) {
      logger.error('Error finding assignment by ID:', error);
      throw error;
    }
  }

  async createAssignment(assignmentData: CreateAssignmentDTO): Promise<Assignment> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.assignmentsTable)
        .insert({
          section_id: assignmentData.sectionId,
          course_id: assignmentData.courseId,
          title: assignmentData.title,
          description: assignmentData.description || null,
          instructions: assignmentData.instructions || null,
          due_date: assignmentData.dueDate,
          max_marks: assignmentData.maxMarks,
          assignment_type: assignmentData.assignmentType,
          allowed_file_types: assignmentData.allowedFileTypes || [],
          max_file_size: assignmentData.maxFileSize || null,
          is_published: assignmentData.isPublished ?? false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapAssignmentFromDB(data) as Assignment;
    } catch (error) {
      logger.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  }

  async updateAssignment(id: string, assignmentData: UpdateAssignmentDTO): Promise<Assignment> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (assignmentData.title !== undefined) updateData.title = assignmentData.title;
      if (assignmentData.description !== undefined) updateData.description = assignmentData.description;
      if (assignmentData.instructions !== undefined) updateData.instructions = assignmentData.instructions;
      if (assignmentData.dueDate !== undefined) updateData.due_date = assignmentData.dueDate;
      if (assignmentData.maxMarks !== undefined) updateData.max_marks = assignmentData.maxMarks;
      if (assignmentData.isPublished !== undefined) updateData.is_published = assignmentData.isPublished;

      const { data, error } = await supabaseAdmin
        .from(this.assignmentsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapAssignmentFromDB(data) as Assignment;
    } catch (error) {
      logger.error('Error updating assignment:', error);
      throw new Error('Failed to update assignment');
    }
  }

  // ==================== Assignment Submissions ====================

  async findAllSubmissions(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      assignmentId?: string;
      studentId?: string;
      sectionId?: string;
      status?: string;
    }
  ): Promise<AssignmentSubmission[]> {
    try {
      let query = supabaseAdmin
        .from(this.assignmentSubmissionsTable)
        .select('*')
        .order('submitted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.assignmentId) {
        query = query.eq('assignment_id', filters.assignmentId);
      }
      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapSubmissionFromDB) as AssignmentSubmission[];
    } catch (error) {
      logger.error('Error finding all submissions:', error);
      throw new Error('Failed to fetch submissions');
    }
  }

  async findSubmissionById(id: string): Promise<AssignmentSubmission | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.assignmentSubmissionsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapSubmissionFromDB(data) as AssignmentSubmission;
    } catch (error) {
      logger.error('Error finding submission by ID:', error);
      throw error;
    }
  }

  async createSubmission(submissionData: CreateAssignmentSubmissionDTO): Promise<AssignmentSubmission> {
    try {
      // Check if assignment exists and get due date
      const assignment = await this.findAssignmentById(submissionData.assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Determine if submission is late
      const submittedAt = new Date().toISOString();
      const dueDate = new Date(assignment.dueDate);
      const isLate = new Date(submittedAt) > dueDate;

      const { data, error } = await supabaseAdmin
        .from(this.assignmentSubmissionsTable)
        .insert({
          assignment_id: submissionData.assignmentId,
          enrollment_id: submissionData.enrollmentId,
          student_id: submissionData.studentId,
          section_id: submissionData.sectionId,
          submitted_at: submittedAt,
          submission_files: submissionData.submissionFiles,
          submitted_text: submissionData.submittedText || null,
          status: isLate ? 'late' : 'submitted',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSubmissionFromDB(data) as AssignmentSubmission;
    } catch (error) {
      logger.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  async gradeSubmission(
    id: string,
    obtainedMarks: number,
    feedback?: string,
    gradedBy?: string
  ): Promise<AssignmentSubmission> {
    try {
      const updateData: any = {
        obtained_marks: obtainedMarks,
        status: 'graded',
        updated_at: new Date().toISOString(),
      };

      if (feedback !== undefined) updateData.feedback = feedback;
      if (gradedBy) {
        updateData.graded_by = gradedBy;
        updateData.graded_at = new Date().toISOString();
      }

      const { data, error } = await supabaseAdmin
        .from(this.assignmentSubmissionsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSubmissionFromDB(data) as AssignmentSubmission;
    } catch (error) {
      logger.error('Error grading submission:', error);
      throw new Error('Failed to grade submission');
    }
  }

  // ==================== Helper Mappers ====================

  private mapCourseMaterialFromDB(data: any): Partial<CourseMaterial> {
    return {
      id: data.id,
      sectionId: data.section_id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      materialType: data.material_type,
      fileUrl: data.file_url,
      externalUrl: data.external_url,
      fileSize: data.file_size,
      fileName: data.file_name,
      uploadedBy: data.uploaded_by,
      uploadedAt: data.uploaded_at,
      isVisible: data.is_visible,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapAssignmentFromDB(data: any): Partial<Assignment> {
    return {
      id: data.id,
      sectionId: data.section_id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      dueDate: data.due_date,
      maxMarks: data.max_marks,
      assignmentType: data.assignment_type,
      allowedFileTypes: data.allowed_file_types || [],
      maxFileSize: data.max_file_size,
      isPublished: data.is_published,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSubmissionFromDB(data: any): Partial<AssignmentSubmission> {
    return {
      id: data.id,
      assignmentId: data.assignment_id,
      enrollmentId: data.enrollment_id,
      studentId: data.student_id,
      sectionId: data.section_id,
      submittedAt: data.submitted_at,
      submissionFiles: data.submission_files || [],
      submittedText: data.submitted_text,
      status: data.status,
      obtainedMarks: data.obtained_marks,
      feedback: data.feedback,
      gradedBy: data.graded_by,
      gradedAt: data.graded_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

