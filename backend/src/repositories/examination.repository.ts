import { supabaseAdmin } from '@/config/supabase';
import {
  Exam,
  ExamSchedule,
  Result,
  GradeEntry,
  ReEvaluation,
  CreateExamDTO,
  UpdateExamDTO,
  CreateResultDTO,
  UpdateResultDTO,
  CreateReEvaluationDTO,
  calculateGrade,
} from '@/models/Examination.model';
import { logger } from '@/config/logger';

export class ExaminationRepository {
  private examsTable = 'exams';
  private examSchedulesTable = 'exam_schedules';
  private resultsTable = 'results';
  private gradeEntriesTable = 'grade_entries';
  private reEvaluationsTable = 're_evaluations';

  // ==================== Exams ====================

  async findAllExams(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      examType?: string;
      semester?: string;
      examDate?: string;
    }
  ): Promise<Exam[]> {
    try {
      let query = supabaseAdmin
        .from(this.examsTable)
        .select('*')
        .order('exam_date', { ascending: false })
        .order('start_time', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.examType) {
        query = query.eq('exam_type', filters.examType);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.examDate) {
        query = query.eq('exam_date', filters.examDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapExamFromDB) as Exam[];
    } catch (error) {
      logger.error('Error finding all exams:', error);
      throw new Error('Failed to fetch exams');
    }
  }

  async findExamById(id: string): Promise<Exam | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.examsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapExamFromDB(data) as Exam;
    } catch (error) {
      logger.error('Error finding exam by ID:', error);
      throw error;
    }
  }

  async createExam(examData: CreateExamDTO): Promise<Exam> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.examsTable)
        .insert({
          section_id: examData.sectionId,
          exam_type: examData.examType,
          title: examData.title,
          exam_date: examData.examDate,
          start_time: examData.startTime,
          end_time: examData.endTime,
          duration: examData.duration,
          total_marks: examData.totalMarks,
          passing_marks: examData.passingMarks,
          room_id: examData.roomId || null,
          instructions: examData.instructions || null,
          semester: examData.semester,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapExamFromDB(data) as Exam;
    } catch (error) {
      logger.error('Error creating exam:', error);
      throw new Error('Failed to create exam');
    }
  }

  async updateExam(id: string, examData: UpdateExamDTO): Promise<Exam> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (examData.title !== undefined) updateData.title = examData.title;
      if (examData.examDate !== undefined) updateData.exam_date = examData.examDate;
      if (examData.startTime !== undefined) updateData.start_time = examData.startTime;
      if (examData.endTime !== undefined) updateData.end_time = examData.endTime;
      if (examData.duration !== undefined) updateData.duration = examData.duration;
      if (examData.totalMarks !== undefined) updateData.total_marks = examData.totalMarks;
      if (examData.passingMarks !== undefined) updateData.passing_marks = examData.passingMarks;
      if (examData.roomId !== undefined) updateData.room_id = examData.roomId;
      if (examData.instructions !== undefined) updateData.instructions = examData.instructions;

      const { data, error } = await supabaseAdmin
        .from(this.examsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapExamFromDB(data) as Exam;
    } catch (error) {
      logger.error('Error updating exam:', error);
      throw new Error('Failed to update exam');
    }
  }

  // ==================== Results ====================

  async findAllResults(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      examId?: string;
      studentId?: string;
      sectionId?: string;
      isApproved?: boolean;
    }
  ): Promise<Result[]> {
    try {
      let query = supabaseAdmin
        .from(this.resultsTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.examId) {
        query = query.eq('exam_id', filters.examId);
      }
      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapResultFromDB) as Result[];
    } catch (error) {
      logger.error('Error finding all results:', error);
      throw new Error('Failed to fetch results');
    }
  }

  async findResultById(id: string): Promise<Result | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.resultsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapResultFromDB(data) as Result;
    } catch (error) {
      logger.error('Error finding result by ID:', error);
      throw error;
    }
  }

  async createResult(resultData: CreateResultDTO): Promise<Result> {
    try {
      const percentage = (resultData.obtainedMarks / resultData.totalMarks) * 100;
      const { grade, gpa } = calculateGrade(percentage);

      const { data, error } = await supabaseAdmin
        .from(this.resultsTable)
        .insert({
          enrollment_id: resultData.enrollmentId,
          exam_id: resultData.examId,
          student_id: resultData.studentId,
          section_id: resultData.sectionId,
          obtained_marks: resultData.obtainedMarks,
          total_marks: resultData.totalMarks,
          percentage,
          grade,
          gpa,
          remarks: resultData.remarks || null,
          is_approved: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapResultFromDB(data) as Result;
    } catch (error) {
      logger.error('Error creating result:', error);
      throw new Error('Failed to create result');
    }
  }

  async updateResult(id: string, resultData: UpdateResultDTO, enteredBy?: string): Promise<Result> {
    try {
      const existingResult = await this.findResultById(id);
      if (!existingResult) {
        throw new Error('Result not found');
      }

      const totalMarks = resultData.totalMarks ?? existingResult.totalMarks;
      const obtainedMarks = resultData.obtainedMarks ?? existingResult.obtainedMarks;
      const percentage = (obtainedMarks / totalMarks) * 100;
      const { grade, gpa } = calculateGrade(percentage);

      const updateData: any = {
        updated_at: new Date().toISOString(),
        percentage,
        grade,
        gpa,
      };

      if (resultData.obtainedMarks !== undefined) updateData.obtained_marks = resultData.obtainedMarks;
      if (resultData.totalMarks !== undefined) updateData.total_marks = resultData.totalMarks;
      if (resultData.remarks !== undefined) updateData.remarks = resultData.remarks;
      if (resultData.isApproved !== undefined) {
        updateData.is_approved = resultData.isApproved;
        if (resultData.isApproved && enteredBy) {
          updateData.approved_by = enteredBy;
          updateData.approved_at = new Date().toISOString();
        }
      }
      if (enteredBy) {
        updateData.entered_by = enteredBy;
        updateData.entered_at = new Date().toISOString();
      }

      // Create grade entry for tracking changes
      if (resultData.obtainedMarks !== undefined && resultData.obtainedMarks !== existingResult.obtainedMarks && enteredBy) {
        await supabaseAdmin.from(this.gradeEntriesTable).insert({
          result_id: id,
          old_marks: existingResult.obtainedMarks,
          new_marks: resultData.obtainedMarks,
          reason: resultData.remarks || 'Grade update',
          modified_by: enteredBy,
        });
      }

      const { data, error } = await supabaseAdmin
        .from(this.resultsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapResultFromDB(data) as Result;
    } catch (error) {
      logger.error('Error updating result:', error);
      throw new Error('Failed to update result');
    }
  }

  // ==================== Re-Evaluations ====================

  async findAllReEvaluations(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      status?: string;
    }
  ): Promise<ReEvaluation[]> {
    try {
      let query = supabaseAdmin
        .from(this.reEvaluationsTable)
        .select('*')
        .order('request_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapReEvaluationFromDB) as ReEvaluation[];
    } catch (error) {
      logger.error('Error finding all re-evaluations:', error);
      throw new Error('Failed to fetch re-evaluations');
    }
  }

  async createReEvaluation(reEvalData: CreateReEvaluationDTO): Promise<ReEvaluation> {
    try {
      // Get existing result to get old marks
      const result = await this.findResultById(reEvalData.resultId);
      if (!result) {
        throw new Error('Result not found');
      }

      const { data, error } = await supabaseAdmin
        .from(this.reEvaluationsTable)
        .insert({
          result_id: reEvalData.resultId,
          student_id: reEvalData.studentId,
          exam_id: reEvalData.examId,
          request_date: new Date().toISOString(),
          fee_paid: false,
          status: 'pending',
          old_marks: result.obtainedMarks,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapReEvaluationFromDB(data) as ReEvaluation;
    } catch (error) {
      logger.error('Error creating re-evaluation:', error);
      throw new Error('Failed to create re-evaluation');
    }
  }

  // ==================== Helper Mappers ====================

  private mapExamFromDB(data: any): Partial<Exam> {
    return {
      id: data.id,
      sectionId: data.section_id,
      examType: data.exam_type,
      title: data.title,
      examDate: data.exam_date,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      totalMarks: data.total_marks,
      passingMarks: data.passing_marks,
      roomId: data.room_id,
      instructions: data.instructions,
      semester: data.semester,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapResultFromDB(data: any): Partial<Result> {
    return {
      id: data.id,
      enrollmentId: data.enrollment_id,
      examId: data.exam_id,
      studentId: data.student_id,
      sectionId: data.section_id,
      obtainedMarks: data.obtained_marks,
      totalMarks: data.total_marks,
      percentage: data.percentage,
      grade: data.grade,
      gpa: data.gpa,
      remarks: data.remarks,
      enteredBy: data.entered_by,
      enteredAt: data.entered_at,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      isApproved: data.is_approved,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapReEvaluationFromDB(data: any): Partial<ReEvaluation> {
    return {
      id: data.id,
      resultId: data.result_id,
      studentId: data.student_id,
      examId: data.exam_id,
      requestDate: data.request_date,
      feePaid: data.fee_paid,
      feeAmount: data.fee_amount,
      status: data.status,
      oldMarks: data.old_marks,
      newMarks: data.new_marks,
      remarks: data.remarks,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      createdAt: data.created_at,
    };
  }
}

