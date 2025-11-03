import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from '@/services/admission.service';
import { CreateApplicationDTO, UpdateApplicationDTO, EligibilityCheckDTO, MeritListGenerateDTO } from '@/models/Admission.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AdmissionController {
  private admissionService: AdmissionService;

  constructor() {
    this.admissionService = new AdmissionService();
  }

  getAllApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        programId: req.query.programId as string,
        status: req.query.status as string,
        batch: req.query.batch as string,
        search: req.query.search as string,
      };

      const result = await this.admissionService.getAllApplications(limit, offset, filters);

      sendSuccess(res, {
        applications: result.applications,
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
      logger.error('Get all applications error:', error);
      next(error);
    }
  };

  getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const application = await this.admissionService.getApplicationById(id);
      sendSuccess(res, application);
    } catch (error) {
      logger.error('Get application by ID error:', error);
      next(error);
    }
  };

  getUserApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const applications = await this.admissionService.getUserApplications(userId);
      sendSuccess(res, applications);
    } catch (error) {
      logger.error('Get user applications error:', error);
      next(error);
    }
  };

  createApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationData: CreateApplicationDTO = {
        userId: req.body.userId,
        programId: req.body.programId,
        documents: req.body.documents,
      };

      if (!applicationData.userId || !applicationData.programId) {
        throw new ValidationError('userId and programId are required');
      }

      const application = await this.admissionService.createApplication(applicationData);
      sendSuccess(res, application, 'Application submitted successfully', 201);
    } catch (error) {
      logger.error('Create application error:', error);
      next(error);
    }
  };

  updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const applicationData: UpdateApplicationDTO = {
        status: req.body.status,
        eligibilityStatus: req.body.eligibilityStatus,
        eligibilityScore: req.body.eligibilityScore,
        meritRank: req.body.meritRank,
        interviewDate: req.body.interviewDate,
        interviewTime: req.body.interviewTime,
        interviewLocation: req.body.interviewLocation,
        remarks: req.body.remarks,
      };

      const application = await this.admissionService.updateApplication(id, applicationData);
      sendSuccess(res, application, 'Application updated successfully');
    } catch (error) {
      logger.error('Update application error:', error);
      next(error);
    }
  };

  checkEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const checkData: EligibilityCheckDTO = {
        applicationId: req.body.applicationId,
        programId: req.body.programId,
        academicHistory: req.body.academicHistory,
        testScores: req.body.testScores,
      };

      if (!checkData.applicationId || !checkData.programId || !checkData.academicHistory) {
        throw new ValidationError('applicationId, programId, and academicHistory are required');
      }

      const result = await this.admissionService.checkEligibility(checkData);
      sendSuccess(res, result);
    } catch (error) {
      logger.error('Check eligibility error:', error);
      next(error);
    }
  };

  generateMeritList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const generateData: MeritListGenerateDTO = {
        programId: req.body.programId,
        batch: req.body.batch,
        semester: req.body.semester,
        totalSeats: req.body.totalSeats,
        selectionCriteria: req.body.selectionCriteria,
      };

      if (!generateData.programId || !generateData.batch || !generateData.semester || !generateData.totalSeats) {
        throw new ValidationError('programId, batch, semester, and totalSeats are required');
      }

      const meritList = await this.admissionService.generateMeritList(generateData);
      sendSuccess(res, meritList, 'Merit list generated successfully', 201);
    } catch (error) {
      logger.error('Generate merit list error:', error);
      next(error);
    }
  };

  getApplicationDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const documents = await this.admissionService.getApplicationDocuments(id);
      sendSuccess(res, documents);
    } catch (error) {
      logger.error('Get application documents error:', error);
      next(error);
    }
  };

  updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const reviewedBy = req.user?.userId;
      await this.admissionService.updateApplicationStatus(id, status, reviewedBy);
      sendSuccess(res, null, 'Application status updated successfully');
    } catch (error) {
      logger.error('Update application status error:', error);
      next(error);
    }
  };
}

