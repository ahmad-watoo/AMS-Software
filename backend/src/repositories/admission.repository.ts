import { supabaseAdmin } from '@/config/supabase';
import {
  AdmissionApplication,
  AdmissionDocument,
  EligibilityCriteria,
  MeritList,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from '@/models/Admission.model';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AdmissionRepository {
  private applicationsTable = 'admission_applications';
  private documentsTable = 'admission_documents';
  private criteriaTable = 'eligibility_criteria';
  private meritListsTable = 'merit_lists';

  async findApplicationById(id: string): Promise<AdmissionApplication | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.applicationsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as AdmissionApplication;
    } catch (error) {
      logger.error('Error finding application by ID:', error);
      throw error;
    }
  }

  async findApplicationByNumber(applicationNumber: string): Promise<AdmissionApplication | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.applicationsTable)
        .select('*')
        .eq('application_number', applicationNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as AdmissionApplication;
    } catch (error) {
      logger.error('Error finding application by number:', error);
      throw error;
    }
  }

  async findApplicationsByUserId(userId: string): Promise<AdmissionApplication[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.applicationsTable)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as AdmissionApplication[];
    } catch (error) {
      logger.error('Error finding applications by user ID:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  async findAllApplications(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      programId?: string;
      status?: string;
      batch?: string;
    }
  ): Promise<AdmissionApplication[]> {
    try {
      let query = supabaseAdmin
        .from(this.applicationsTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as AdmissionApplication[];
    } catch (error) {
      logger.error('Error finding all applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  async createApplication(applicationData: CreateApplicationDTO): Promise<AdmissionApplication> {
    try {
      // Generate application number (format: APP-YYYY-XXXXX)
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const applicationNumber = `APP-${year}-${randomSuffix}`;

      const { data, error } = await supabaseAdmin
        .from(this.applicationsTable)
        .insert({
          user_id: applicationData.userId,
          program_id: applicationData.programId,
          application_number: applicationNumber,
          application_date: new Date().toISOString(),
          status: 'submitted',
          eligibility_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as AdmissionApplication;
    } catch (error) {
      logger.error('Error creating application:', error);
      throw new Error('Failed to create application');
    }
  }

  async updateApplication(id: string, applicationData: UpdateApplicationDTO): Promise<AdmissionApplication> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (applicationData.status !== undefined) updateData.status = applicationData.status;
      if (applicationData.eligibilityStatus !== undefined) updateData.eligibility_status = applicationData.eligibilityStatus;
      if (applicationData.eligibilityScore !== undefined) updateData.eligibility_score = applicationData.eligibilityScore;
      if (applicationData.meritRank !== undefined) updateData.merit_rank = applicationData.meritRank;
      if (applicationData.interviewDate !== undefined) updateData.interview_date = applicationData.interviewDate;
      if (applicationData.interviewTime !== undefined) updateData.interview_time = applicationData.interviewTime;
      if (applicationData.interviewLocation !== undefined) updateData.interview_location = applicationData.interviewLocation;
      if (applicationData.remarks !== undefined) updateData.remarks = applicationData.remarks;

      const { data, error } = await supabaseAdmin
        .from(this.applicationsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as AdmissionApplication;
    } catch (error) {
      logger.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  async createDocument(documentData: Omit<AdmissionDocument, 'id' | 'uploadedAt' | 'verified'>): Promise<AdmissionDocument> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.documentsTable)
        .insert({
          application_id: documentData.applicationId,
          document_type: documentData.documentType,
          document_name: documentData.documentName,
          document_url: documentData.documentUrl,
          verified: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as AdmissionDocument;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  }

  async getApplicationDocuments(applicationId: string): Promise<AdmissionDocument[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.documentsTable)
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as AdmissionDocument[];
    } catch (error) {
      logger.error('Error getting application documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  async getEligibilityCriteria(programId: string): Promise<EligibilityCriteria | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.criteriaTable)
        .select('*')
        .eq('program_id', programId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as EligibilityCriteria;
    } catch (error) {
      logger.error('Error getting eligibility criteria:', error);
      throw new Error('Failed to fetch eligibility criteria');
    }
  }

  async getApplicationWithDetails(id: string): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.applicationsTable)
        .select(`
          *,
          users (
            id,
            email,
            first_name,
            last_name,
            phone,
            cnic
          ),
          programs (
            id,
            name,
            code
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Application');
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error getting application with details:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch application details');
    }
  }

  async getMeritList(programId: string, batch: string, semester: string): Promise<MeritList | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.meritListsTable)
        .select('*')
        .eq('program_id', programId)
        .eq('batch', batch)
        .eq('semester', semester)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as MeritList;
    } catch (error) {
      logger.error('Error getting merit list:', error);
      throw new Error('Failed to fetch merit list');
    }
  }

  async updateApplicationStatus(id: string, status: AdmissionApplication['status'], reviewedBy?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (reviewedBy) {
        updateData.reviewed_by = reviewedBy;
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabaseAdmin
        .from(this.applicationsTable)
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }
}

