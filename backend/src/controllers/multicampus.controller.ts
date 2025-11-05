/**
 * Multi-Campus Controller
 * 
 * Handles HTTP requests for multi-campus management endpoints.
 * Manages campuses, student transfers, staff transfers, and campus reports.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/multicampus.controller
 */

import { Request, Response, NextFunction } from 'express';
import { MultiCampusService } from '@/services/multicampus.service';
import {
  CreateCampusDTO,
  UpdateCampusDTO,
  CreateStudentTransferDTO,
  CreateStaffTransferDTO,
  ApproveTransferDTO,
} from '@/models/MultiCampus.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class MultiCampusController {
  private multiCampusService: MultiCampusService;

  constructor() {
    this.multiCampusService = new MultiCampusService();
  }

  // ==================== Campuses ====================

  /**
   * Get All Campuses Endpoint Handler
   * 
   * Retrieves all campuses with pagination and optional filters.
   * 
   * @route GET /api/v1/multicampus/campuses
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=100] - Items per page
   * @query {string} [province] - Filter by province
   * @query {string} [city] - Filter by city
   * @query {boolean} [isActive] - Filter by active status
   * @returns {Object} Campuses array and pagination info
   * 
   * @example
   * GET /api/v1/multicampus/campuses?page=1&limit=50&province=Punjab&isActive=true
   */
  getAllCampuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;

      const filters = {
        province: req.query.province as string,
        city: req.query.city as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      };

      const result = await this.multiCampusService.getAllCampuses(limit, offset, filters);

      sendSuccess(res, {
        campuses: result.campuses,
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
      logger.error('Get all campuses error:', error);
      next(error);
    }
  };

  /**
   * Get Campus By ID Endpoint Handler
   * 
   * Retrieves a specific campus by ID.
   * 
   * @route GET /api/v1/multicampus/campuses/:id
   * @access Private
   * @param {string} id - Campus ID
   * @returns {Campus} Campus object
   */
  getCampusById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campus = await this.multiCampusService.getCampusById(id);
      sendSuccess(res, campus);
    } catch (error) {
      logger.error('Get campus by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Campus Endpoint Handler
   * 
   * Creates a new campus.
   * 
   * @route POST /api/v1/multicampus/campuses
   * @access Private (Requires admin.create permission)
   * @body {CreateCampusDTO} Campus creation data
   * @returns {Campus} Created campus
   * 
   * @example
   * POST /api/v1/multicampus/campuses
   * Body: {
   *   name: "Main Campus",
   *   code: "MC",
   *   address: "123 University Road",
   *   city: "Lahore",
   *   province: "Punjab"
   * }
   */
  createCampus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campusData: CreateCampusDTO = {
        name: req.body.name,
        code: req.body.code,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        postalCode: req.body.postalCode,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        campusHeadId: req.body.campusHeadId,
        establishedDate: req.body.establishedDate,
        capacity: req.body.capacity,
        description: req.body.description,
      };

      if (!campusData.name || !campusData.code || !campusData.address || !campusData.city || !campusData.province) {
        throw new ValidationError('Name, code, address, city, and province are required');
      }

      const campus = await this.multiCampusService.createCampus(campusData);
      sendSuccess(res, campus, 'Campus created successfully', 201);
    } catch (error) {
      logger.error('Create campus error:', error);
      next(error);
    }
  };

  /**
   * Update Campus Endpoint Handler
   * 
   * Updates an existing campus.
   * 
   * @route PUT /api/v1/multicampus/campuses/:id
   * @access Private (Requires admin.update permission)
   * @param {string} id - Campus ID
   * @body {UpdateCampusDTO} Partial campus data to update
   * @returns {Campus} Updated campus
   * 
   * @example
   * PUT /api/v1/multicampus/campuses/campus123
   * Body: {
   *   name: "Updated Campus Name",
   *   isActive: false
   * }
   */
  updateCampus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campusData: UpdateCampusDTO = {
        name: req.body.name,
        code: req.body.code,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        postalCode: req.body.postalCode,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        campusHeadId: req.body.campusHeadId,
        isActive: req.body.isActive,
        capacity: req.body.capacity,
        description: req.body.description,
      };

      const campus = await this.multiCampusService.updateCampus(id, campusData);
      sendSuccess(res, campus, 'Campus updated successfully');
    } catch (error) {
      logger.error('Update campus error:', error);
      next(error);
    }
  };

  // ==================== Student Transfers ====================

  /**
   * Get All Student Transfers Endpoint Handler
   * 
   * Retrieves all student transfers with pagination and optional filters.
   * 
   * @route GET /api/v1/multicampus/student-transfers
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [studentId] - Filter by student ID
   * @query {string} [fromCampusId] - Filter by source campus ID
   * @query {string} [toCampusId] - Filter by destination campus ID
   * @query {string} [status] - Filter by transfer status
   * @returns {Object} Student transfers array and pagination info
   * 
   * @example
   * GET /api/v1/multicampus/student-transfers?page=1&limit=20&fromCampusId=campus123&status=pending
   */
  getAllStudentTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        studentId: req.query.studentId as string,
        fromCampusId: req.query.fromCampusId as string,
        toCampusId: req.query.toCampusId as string,
        status: req.query.status as string,
      };

      const result = await this.multiCampusService.getAllStudentTransfers(limit, offset, filters);

      sendSuccess(res, {
        transfers: result.transfers,
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
      logger.error('Get all student transfers error:', error);
      next(error);
    }
  };

  /**
   * Get Student Transfer By ID Endpoint Handler
   * 
   * Retrieves a specific student transfer by ID.
   * 
   * @route GET /api/v1/multicampus/student-transfers/:id
   * @access Private
   * @param {string} id - Student transfer ID
   * @returns {StudentTransfer} Student transfer object
   */
  getStudentTransferById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transfer = await this.multiCampusService.getStudentTransferById(id);
      sendSuccess(res, transfer);
    } catch (error) {
      logger.error('Get student transfer by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Student Transfer Endpoint Handler
   * 
   * Creates a new student transfer request.
   * 
   * @route POST /api/v1/multicampus/student-transfers
   * @access Private
   * @body {CreateStudentTransferDTO} Student transfer creation data
   * @returns {StudentTransfer} Created student transfer
   * 
   * @example
   * POST /api/v1/multicampus/student-transfers
   * Body: {
   *   studentId: "student123",
   *   fromCampusId: "campus1",
   *   toCampusId: "campus2",
   *   transferType: "permanent",
   *   reason: "Family relocation"
   * }
   */
  createStudentTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transferData: CreateStudentTransferDTO = {
        studentId: req.body.studentId,
        fromCampusId: req.body.fromCampusId,
        toCampusId: req.body.toCampusId,
        transferType: req.body.transferType,
        reason: req.body.reason,
        effectiveDate: req.body.effectiveDate,
        remarks: req.body.remarks,
      };

      if (!transferData.studentId || !transferData.fromCampusId || !transferData.toCampusId || !transferData.reason) {
        throw new ValidationError('Student ID, from campus, to campus, and reason are required');
      }

      const transfer = await this.multiCampusService.createStudentTransfer(transferData);
      sendSuccess(res, transfer, 'Student transfer request created successfully', 201);
    } catch (error) {
      logger.error('Create student transfer error:', error);
      next(error);
    }
  };

  /**
   * Approve Student Transfer Endpoint Handler
   * 
   * Approves or rejects a student transfer request.
   * 
   * @route POST /api/v1/multicampus/student-transfers/:id/approve
   * @access Private (Requires admin.approve permission)
   * @param {string} id - Student transfer ID
   * @body {ApproveTransferDTO} Approval/rejection data
   * @returns {StudentTransfer} Updated student transfer
   * 
   * @example
   * POST /api/v1/multicampus/student-transfers/transfer123/approve
   * Body: {
   *   status: "approved",
   *   effectiveDate: "2024-02-01",
   *   remarks: "Transfer approved"
   * }
   */
  approveStudentTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approveData: ApproveTransferDTO = {
        status: req.body.status,
        rejectionReason: req.body.rejectionReason,
        transferDate: req.body.transferDate,
        effectiveDate: req.body.effectiveDate,
        remarks: req.body.remarks,
      };

      if (!approveData.status || !['approved', 'rejected'].includes(approveData.status)) {
        throw new ValidationError('Status must be either approved or rejected');
      }

      const user = (req as any).user;
      const transfer = await this.multiCampusService.approveStudentTransfer(id, approveData, user?.id);
      sendSuccess(res, transfer, `Student transfer ${approveData.status} successfully`);
    } catch (error) {
      logger.error('Approve student transfer error:', error);
      next(error);
    }
  };

  // ==================== Staff Transfers ====================

  /**
   * Get All Staff Transfers Endpoint Handler
   * 
   * Retrieves all staff transfers with pagination and optional filters.
   * 
   * @route GET /api/v1/multicampus/staff-transfers
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [staffId] - Filter by staff ID
   * @query {string} [fromCampusId] - Filter by source campus ID
   * @query {string} [toCampusId] - Filter by destination campus ID
   * @query {string} [status] - Filter by transfer status
   * @returns {Object} Staff transfers array and pagination info
   * 
   * @example
   * GET /api/v1/multicampus/staff-transfers?page=1&limit=20&fromCampusId=campus123&status=pending
   */
  getAllStaffTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        staffId: req.query.staffId as string,
        fromCampusId: req.query.fromCampusId as string,
        toCampusId: req.query.toCampusId as string,
        status: req.query.status as string,
      };

      const result = await this.multiCampusService.getAllStaffTransfers(limit, offset, filters);

      sendSuccess(res, {
        transfers: result.transfers,
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
      logger.error('Get all staff transfers error:', error);
      next(error);
    }
  };

  /**
   * Get Staff Transfer By ID Endpoint Handler
   * 
   * Retrieves a specific staff transfer by ID.
   * 
   * @route GET /api/v1/multicampus/staff-transfers/:id
   * @access Private
   * @param {string} id - Staff transfer ID
   * @returns {StaffTransfer} Staff transfer object
   */
  getStaffTransferById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transfer = await this.multiCampusService.getStaffTransferById(id);
      sendSuccess(res, transfer);
    } catch (error) {
      logger.error('Get staff transfer by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Staff Transfer Endpoint Handler
   * 
   * Creates a new staff transfer request.
   * 
   * @route POST /api/v1/multicampus/staff-transfers
   * @access Private
   * @body {CreateStaffTransferDTO} Staff transfer creation data
   * @returns {StaffTransfer} Created staff transfer
   * 
   * @example
   * POST /api/v1/multicampus/staff-transfers
   * Body: {
   *   staffId: "staff123",
   *   fromCampusId: "campus1",
   *   toCampusId: "campus2",
   *   transferType: "permanent",
   *   reason: "Organizational restructuring"
   * }
   */
  createStaffTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transferData: CreateStaffTransferDTO = {
        staffId: req.body.staffId,
        fromCampusId: req.body.fromCampusId,
        toCampusId: req.body.toCampusId,
        transferType: req.body.transferType,
        reason: req.body.reason,
        effectiveDate: req.body.effectiveDate,
        remarks: req.body.remarks,
      };

      if (!transferData.staffId || !transferData.fromCampusId || !transferData.toCampusId || !transferData.reason) {
        throw new ValidationError('Staff ID, from campus, to campus, and reason are required');
      }

      const transfer = await this.multiCampusService.createStaffTransfer(transferData);
      sendSuccess(res, transfer, 'Staff transfer request created successfully', 201);
    } catch (error) {
      logger.error('Create staff transfer error:', error);
      next(error);
    }
  };

  /**
   * Approve Staff Transfer Endpoint Handler
   * 
   * Approves or rejects a staff transfer request.
   * 
   * @route POST /api/v1/multicampus/staff-transfers/:id/approve
   * @access Private (Requires admin.approve permission)
   * @param {string} id - Staff transfer ID
   * @body {ApproveTransferDTO} Approval/rejection data
   * @returns {StaffTransfer} Updated staff transfer
   * 
   * @example
   * POST /api/v1/multicampus/staff-transfers/transfer123/approve
   * Body: {
   *   status: "approved",
   *   effectiveDate: "2024-02-01",
   *   remarks: "Transfer approved"
   * }
   */
  approveStaffTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approveData: ApproveTransferDTO = {
        status: req.body.status,
        rejectionReason: req.body.rejectionReason,
        transferDate: req.body.transferDate,
        effectiveDate: req.body.effectiveDate,
        remarks: req.body.remarks,
      };

      if (!approveData.status || !['approved', 'rejected'].includes(approveData.status)) {
        throw new ValidationError('Status must be either approved or rejected');
      }

      const user = (req as any).user;
      const transfer = await this.multiCampusService.approveStaffTransfer(id, approveData, user?.id);
      sendSuccess(res, transfer, `Staff transfer ${approveData.status} successfully`);
    } catch (error) {
      logger.error('Approve staff transfer error:', error);
      next(error);
    }
  };

  // ==================== Campus Reports ====================

  /**
   * Get Campus Report Endpoint Handler
   * 
   * Generates a comprehensive report for a specific campus.
   * 
   * @route GET /api/v1/multicampus/campuses/:campusId/report
   * @access Private
   * @param {string} campusId - Campus ID
   * @query {string} [reportPeriod] - Report period (YYYY-MM-DD)
   * @returns {CampusReport} Campus report with statistics
   * 
   * @example
   * GET /api/v1/multicampus/campuses/campus123/report?reportPeriod=2024-01-31
   */
  getCampusReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { campusId } = req.params;
      const { reportPeriod } = req.query;

      const report = await this.multiCampusService.getCampusReport(campusId, reportPeriod as string);
      sendSuccess(res, report);
    } catch (error) {
      logger.error('Get campus report error:', error);
      next(error);
    }
  };
}
