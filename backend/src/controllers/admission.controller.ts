/**
 * Admission Controller
 * 
 * Handles HTTP requests for admission management endpoints.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/admission.controller
 */

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

  /**
   * Get All Applications Endpoint Handler
   * 
   * Retrieves all applications with pagination and optional filters.
   * 
   * @route GET /api/v1/admission/applications
   * @access Private (Requires admission.view permission)
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [programId] - Filter by program ID
   * @query {string} [status] - Filter by application status
   * @query {string} [batch] - Filter by batch
   * @query {string} [search] - Search by application number
   * @returns {Object} Applications array and pagination info
   * 
   * @example
   * GET /api/v1/admission/applications?page=1&limit=20&programId=prog123&status=eligible
   */
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

  /**
   * Get Application By ID Endpoint Handler
   * 
   * Retrieves a specific application by ID with full details.
   * 
   * @route GET /api/v1/admission/applications/:id
   * @access Private
   * @param {string} id - Application ID
   * @returns {Object} Application with full details
   */
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

  /**
   * Get User Applications Endpoint Handler
   * 
   * Retrieves all applications submitted by a specific user.
   * 
   * @route GET /api/v1/admission/users/:userId/applications
   * @access Private
   * @param {string} userId - User ID
   * @returns {Array} Array of user's applications
   */
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

  /**
   * Create Application Endpoint Handler
   * 
   * Creates a new admission application.
   * 
   * @route POST /api/v1/admission/applications
   * @access Private
   * @body {CreateApplicationDTO} Application creation data
   * @returns {AdmissionApplication} Created application
   * 
   * @example
   * POST /api/v1/admission/applications
   * Body: {
   *   userId: "user123",
   *   programId: "prog456",
   *   documents: [
   *     { documentType: "matric", documentName: "Matric Certificate", documentUrl: "..." }
   *   ]
   * }
   */
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

  /**
   * Update Application Endpoint Handler
   * 
   * Updates an existing application's information.
   * 
   * @route PUT /api/v1/admission/applications/:id
   * @access Private (Requires admission.approve permission)
   * @param {string} id - Application ID
   * @body {UpdateApplicationDTO} Partial application data to update
   * @returns {AdmissionApplication} Updated application
   * 
   * @example
   * PUT /api/v1/admission/applications/app123
   * Body: {
   *   status: "eligible",
   *   eligibilityScore: 85.5,
   *   interviewDate: "2024-10-15"
   * }
   */
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

  /**
   * Check Eligibility Endpoint Handler
   * 
   * Checks if an application meets eligibility criteria for a program.
   * 
   * @route POST /api/v1/admission/eligibility-check
   * @access Private (Requires admission.view permission)
   * @body {EligibilityCheckDTO} Eligibility check data
   * @returns {Object} Eligibility result with score and reasons
   * 
   * @example
   * POST /api/v1/admission/eligibility-check
   * Body: {
   *   applicationId: "app123",
   *   programId: "prog456",
   *   academicHistory: [
   *     { degree: "BS", marks: 85, cgpa: 3.4, year: 2024 }
   *   ],
   *   testScores: {
   *     entryTest: 75,
   *     interview: 80
   *   }
   * }
   */
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

  /**
   * Generate Merit List Endpoint Handler
   * 
   * Generates a merit list for a program based on eligibility scores.
   * 
   * @route POST /api/v1/admission/merit-list
   * @access Private (Requires admission.approve permission)
   * @body {MeritListGenerateDTO} Merit list generation data
   * @returns {MeritList} Generated merit list with ranked applications
   * 
   * @example
   * POST /api/v1/admission/merit-list
   * Body: {
   *   programId: "prog456",
   *   batch: "2024-Fall",
   *   semester: "Fall",
   *   totalSeats: 50
   * }
   */
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

  /**
   * Get Application Documents Endpoint Handler
   * 
   * Retrieves all documents uploaded for an application.
   * 
   * @route GET /api/v1/admission/applications/:id/documents
   * @access Private
   * @param {string} id - Application ID
   * @returns {Array} Array of application documents
   */
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

  /**
   * Update Application Status Endpoint Handler
   * 
   * Updates the status of an application (e.g., 'selected', 'rejected', 'enrolled').
   * 
   * @route POST /api/v1/admission/applications/:id/status
   * @access Private (Requires admission.approve permission)
   * @param {string} id - Application ID
   * @body {string} status - New application status
   * @returns {message: "Application status updated successfully"}
   * 
   * @example
   * POST /api/v1/admission/applications/app123/status
   * Body: {
   *   status: "selected"
   * }
   */
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
