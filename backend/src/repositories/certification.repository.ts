import { supabaseAdmin } from '@/config/supabase';
import {
  CertificateRequest,
  Certificate,
  CertificateTemplate,
  CreateCertificateRequestDTO,
  ApproveCertificateRequestDTO,
  ProcessCertificateDTO,
} from '@/models/Certification.model';
import { logger } from '@/config/logger';

export class CertificationRepository {
  private certificateRequestsTable = 'certificate_requests';
  private certificatesTable = 'certificates';
  private certificateTemplatesTable = 'certificate_templates';

  // ==================== Certificate Requests ====================

  async findAllCertificateRequests(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      certificateType?: string;
      status?: string;
    }
  ): Promise<CertificateRequest[]> {
    try {
      let query = supabaseAdmin
        .from(this.certificateRequestsTable)
        .select('*')
        .order('requested_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.certificateType) {
        query = query.eq('certificate_type', filters.certificateType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapCertificateRequestFromDB) as CertificateRequest[];
    } catch (error) {
      logger.error('Error finding all certificate requests:', error);
      throw new Error('Failed to fetch certificate requests');
    }
  }

  async findCertificateRequestById(id: string): Promise<CertificateRequest | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificateRequestsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCertificateRequestFromDB(data) as CertificateRequest;
    } catch (error) {
      logger.error('Error finding certificate request by ID:', error);
      throw error;
    }
  }

  async createCertificateRequest(requestData: CreateCertificateRequestDTO): Promise<CertificateRequest> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificateRequestsTable)
        .insert({
          student_id: requestData.studentId,
          certificate_type: requestData.certificateType,
          purpose: requestData.purpose,
          requested_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          fee_amount: requestData.feeAmount || null,
          fee_paid: requestData.feeAmount ? false : true,
          delivery_method: requestData.deliveryMethod,
          delivery_address: requestData.deliveryAddress || null,
          remarks: requestData.remarks || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCertificateRequestFromDB(data) as CertificateRequest;
    } catch (error) {
      logger.error('Error creating certificate request:', error);
      throw new Error('Failed to create certificate request');
    }
  }

  async updateCertificateRequestStatus(
    id: string,
    status: CertificateRequest['status'],
    approvedBy?: string,
    processedBy?: string,
    rejectionReason?: string,
    remarks?: string
  ): Promise<CertificateRequest> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved' && approvedBy) {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      if (status === 'processing' && processedBy) {
        updateData.processed_by = processedBy;
        updateData.processed_at = new Date().toISOString();
      }

      if (status === 'ready') {
        updateData.processed_at = new Date().toISOString();
      }

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      if (remarks) {
        updateData.remarks = remarks;
      }

      const { data, error } = await supabaseAdmin
        .from(this.certificateRequestsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCertificateRequestFromDB(data) as CertificateRequest;
    } catch (error) {
      logger.error('Error updating certificate request status:', error);
      throw new Error('Failed to update certificate request');
    }
  }

  async markFeeAsPaid(id: string, paymentDate: string): Promise<CertificateRequest> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificateRequestsTable)
        .update({
          fee_paid: true,
          payment_date: paymentDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCertificateRequestFromDB(data) as CertificateRequest;
    } catch (error) {
      logger.error('Error marking fee as paid:', error);
      throw new Error('Failed to update fee payment status');
    }
  }

  // ==================== Certificates ====================

  async findAllCertificates(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      studentId?: string;
      certificateType?: string;
      isVerified?: boolean;
    }
  ): Promise<Certificate[]> {
    try {
      let query = supabaseAdmin
        .from(this.certificatesTable)
        .select('*')
        .order('issue_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.certificateType) {
        query = query.eq('certificate_type', filters.certificateType);
      }
      if (filters?.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapCertificateFromDB) as Certificate[];
    } catch (error) {
      logger.error('Error finding all certificates:', error);
      throw new Error('Failed to fetch certificates');
    }
  }

  async findCertificateById(id: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificatesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCertificateFromDB(data) as Certificate;
    } catch (error) {
      logger.error('Error finding certificate by ID:', error);
      throw error;
    }
  }

  async findCertificateByVerificationCode(verificationCode: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificatesTable)
        .select('*')
        .eq('verification_code', verificationCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCertificateFromDB(data) as Certificate;
    } catch (error) {
      logger.error('Error finding certificate by verification code:', error);
      throw error;
    }
  }

  async findCertificateByNumber(certificateNumber: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificatesTable)
        .select('*')
        .eq('certificate_number', certificateNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCertificateFromDB(data) as Certificate;
    } catch (error) {
      logger.error('Error finding certificate by number:', error);
      throw error;
    }
  }

  async createCertificate(certificateData: ProcessCertificateDTO, verificationCode: string): Promise<Certificate> {
    try {
      // Get certificate request to get student ID
      const request = await this.findCertificateRequestById(certificateData.certificateRequestId);
      if (!request) {
        throw new Error('Certificate request not found');
      }

      const { data, error } = await supabaseAdmin
        .from(this.certificatesTable)
        .insert({
          certificate_request_id: certificateData.certificateRequestId,
          student_id: request.studentId,
          certificate_number: certificateData.certificateNumber,
          certificate_type: request.certificateType,
          issue_date: certificateData.issueDate,
          expiry_date: certificateData.expiryDate || null,
          verification_code: verificationCode,
          is_verified: false,
          metadata: certificateData.metadata || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCertificateFromDB(data) as Certificate;
    } catch (error) {
      logger.error('Error creating certificate:', error);
      throw new Error('Failed to create certificate');
    }
  }

  async updateCertificate(
    id: string,
    updateData: {
      qrCodeUrl?: string;
      pdfUrl?: string;
      isVerified?: boolean;
      verifiedAt?: string;
      verifiedBy?: string;
    }
  ): Promise<Certificate> {
    try {
      const dbUpdateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.qrCodeUrl !== undefined) dbUpdateData.qr_code_url = updateData.qrCodeUrl;
      if (updateData.pdfUrl !== undefined) dbUpdateData.pdf_url = updateData.pdfUrl;
      if (updateData.isVerified !== undefined) dbUpdateData.is_verified = updateData.isVerified;
      if (updateData.verifiedAt !== undefined) dbUpdateData.verified_at = updateData.verifiedAt;
      if (updateData.verifiedBy !== undefined) dbUpdateData.verified_by = updateData.verifiedBy;

      const { data, error } = await supabaseAdmin
        .from(this.certificatesTable)
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapCertificateFromDB(data) as Certificate;
    } catch (error) {
      logger.error('Error updating certificate:', error);
      throw new Error('Failed to update certificate');
    }
  }

  // ==================== Certificate Templates ====================

  async findAllCertificateTemplates(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      certificateType?: string;
      isActive?: boolean;
    }
  ): Promise<CertificateTemplate[]> {
    try {
      let query = supabaseAdmin
        .from(this.certificateTemplatesTable)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.certificateType) {
        query = query.eq('certificate_type', filters.certificateType);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapCertificateTemplateFromDB) as CertificateTemplate[];
    } catch (error) {
      logger.error('Error finding all certificate templates:', error);
      throw new Error('Failed to fetch certificate templates');
    }
  }

  async findActiveCertificateTemplate(certificateType: string): Promise<CertificateTemplate | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.certificateTemplatesTable)
        .select('*')
        .eq('certificate_type', certificateType)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapCertificateTemplateFromDB(data) as CertificateTemplate;
    } catch (error) {
      logger.error('Error finding active certificate template:', error);
      throw error;
    }
  }

  // ==================== Helper Mappers ====================

  private mapCertificateRequestFromDB(data: any): Partial<CertificateRequest> {
    return {
      id: data.id,
      studentId: data.student_id,
      certificateType: data.certificate_type,
      purpose: data.purpose,
      requestedDate: data.requested_date,
      status: data.status,
      feeAmount: data.fee_amount,
      feePaid: data.fee_paid,
      paymentDate: data.payment_date,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      rejectionReason: data.rejection_reason,
      processedBy: data.processed_by,
      processedAt: data.processed_at,
      deliveryMethod: data.delivery_method,
      deliveryAddress: data.delivery_address,
      remarks: data.remarks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCertificateFromDB(data: any): Partial<Certificate> {
    return {
      id: data.id,
      certificateRequestId: data.certificate_request_id,
      studentId: data.student_id,
      certificateNumber: data.certificate_number,
      certificateType: data.certificate_type,
      issueDate: data.issue_date,
      expiryDate: data.expiry_date,
      qrCodeUrl: data.qr_code_url,
      pdfUrl: data.pdf_url,
      verificationCode: data.verification_code,
      isVerified: data.is_verified,
      verifiedAt: data.verified_at,
      verifiedBy: data.verified_by,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCertificateTemplateFromDB(data: any): Partial<CertificateTemplate> {
    return {
      id: data.id,
      name: data.name,
      certificateType: data.certificate_type,
      templateHtml: data.template_html,
      templatePdf: data.template_pdf,
      signatureUrl: data.signature_url,
      sealUrl: data.seal_url,
      watermarkUrl: data.watermark_url,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

