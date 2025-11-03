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

