import { Request, Response, NextFunction } from 'express';
import { AdministrationService } from '@/services/administration.service';
import {
  CreateSystemConfigDTO,
  UpdateSystemConfigDTO,
  CreateEventDTO,
  UpdateEventDTO,
  CreateNoticeDTO,
  UpdateNoticeDTO,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@/models/Administration.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AdministrationController {
  private administrationService: AdministrationService;

  constructor() {
    this.administrationService = new AdministrationService();
  }

  // ==================== System Configs ====================

  getAllSystemConfigs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;

      const filters = {
        category: req.query.category as string,
        isEditable: req.query.isEditable ? req.query.isEditable === 'true' : undefined,
      };

      const result = await this.administrationService.getAllSystemConfigs(limit, offset, filters);

      sendSuccess(res, {
        configs: result.configs,
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
      logger.error('Get all system configs error:', error);
      next(error);
    }
  };

  getSystemConfigByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const config = await this.administrationService.getSystemConfigByKey(key);
      sendSuccess(res, config);
    } catch (error) {
      logger.error('Get system config by key error:', error);
      next(error);
    }
  };

  createSystemConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const configData: CreateSystemConfigDTO = {
        key: req.body.key,
        value: req.body.value,
        category: req.body.category,
        description: req.body.description,
        dataType: req.body.dataType,
        isEditable: req.body.isEditable,
      };

      if (!configData.key || !configData.value || !configData.category || !configData.dataType) {
        throw new ValidationError('Key, value, category, and data type are required');
      }

      const config = await this.administrationService.createSystemConfig(configData);
      sendSuccess(res, config, 'System config created successfully', 201);
    } catch (error) {
      logger.error('Create system config error:', error);
      next(error);
    }
  };

  updateSystemConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const configData: UpdateSystemConfigDTO = {
        value: req.body.value,
        description: req.body.description,
        isEditable: req.body.isEditable,
      };

      const config = await this.administrationService.updateSystemConfig(key, configData);
      sendSuccess(res, config, 'System config updated successfully');
    } catch (error) {
      logger.error('Update system config error:', error);
      next(error);
    }
  };

  // ==================== Events ====================

  getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        eventType: req.query.eventType as string,
        targetAudience: req.query.targetAudience as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await this.administrationService.getAllEvents(limit, offset, filters);

      sendSuccess(res, {
        events: result.events,
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
      logger.error('Get all events error:', error);
      next(error);
    }
  };

  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.administrationService.getEventById(id);
      sendSuccess(res, event);
    } catch (error) {
      logger.error('Get event by ID error:', error);
      next(error);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventData: CreateEventDTO = {
        title: req.body.title,
        description: req.body.description,
        eventType: req.body.eventType,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        location: req.body.location,
        organizerId: req.body.organizerId,
        targetAudience: req.body.targetAudience,
        imageUrl: req.body.imageUrl,
        registrationRequired: req.body.registrationRequired,
        maxParticipants: req.body.maxParticipants,
      };

      if (!eventData.title || !eventData.startDate || !eventData.eventType) {
        throw new ValidationError('Title, start date, and event type are required');
      }

      const event = await this.administrationService.createEvent(eventData);
      sendSuccess(res, event, 'Event created successfully', 201);
    } catch (error) {
      logger.error('Create event error:', error);
      next(error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const eventData: UpdateEventDTO = {
        title: req.body.title,
        description: req.body.description,
        eventType: req.body.eventType,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        location: req.body.location,
        organizerId: req.body.organizerId,
        targetAudience: req.body.targetAudience,
        isActive: req.body.isActive,
        imageUrl: req.body.imageUrl,
        registrationRequired: req.body.registrationRequired,
        maxParticipants: req.body.maxParticipants,
      };

      const event = await this.administrationService.updateEvent(id, eventData);
      sendSuccess(res, event, 'Event updated successfully');
    } catch (error) {
      logger.error('Update event error:', error);
      next(error);
    }
  };

  // ==================== Notices ====================

  getAllNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        noticeType: req.query.noticeType as string,
        priority: req.query.priority as string,
        targetAudience: req.query.targetAudience as string,
        isPublished: req.query.isPublished ? req.query.isPublished === 'true' : undefined,
      };

      const result = await this.administrationService.getAllNotices(limit, offset, filters);

      sendSuccess(res, {
        notices: result.notices,
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
      logger.error('Get all notices error:', error);
      next(error);
    }
  };

  getNoticeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notice = await this.administrationService.getNoticeById(id);
      sendSuccess(res, notice);
    } catch (error) {
      logger.error('Get notice by ID error:', error);
      next(error);
    }
  };

  createNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const noticeData: CreateNoticeDTO = {
        title: req.body.title,
        content: req.body.content,
        noticeType: req.body.noticeType,
        priority: req.body.priority,
        targetAudience: req.body.targetAudience,
        publishedDate: req.body.publishedDate,
        expiryDate: req.body.expiryDate,
        attachmentUrl: req.body.attachmentUrl,
        isPublished: req.body.isPublished,
      };

      if (!noticeData.title || !noticeData.content || !noticeData.publishedDate) {
        throw new ValidationError('Title, content, and published date are required');
      }

      const user = (req as any).user;
      const notice = await this.administrationService.createNotice(noticeData, user?.id);
      sendSuccess(res, notice, 'Notice created successfully', 201);
    } catch (error) {
      logger.error('Create notice error:', error);
      next(error);
    }
  };

  updateNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const noticeData: UpdateNoticeDTO = {
        title: req.body.title,
        content: req.body.content,
        noticeType: req.body.noticeType,
        priority: req.body.priority,
        targetAudience: req.body.targetAudience,
        publishedDate: req.body.publishedDate,
        expiryDate: req.body.expiryDate,
        isPublished: req.body.isPublished,
        attachmentUrl: req.body.attachmentUrl,
      };

      const notice = await this.administrationService.updateNotice(id, noticeData);
      sendSuccess(res, notice, 'Notice updated successfully');
    } catch (error) {
      logger.error('Update notice error:', error);
      next(error);
    }
  };

  // ==================== Departments ====================

  getAllDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;

      const filters = {
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      };

      const result = await this.administrationService.getAllDepartments(limit, offset, filters);

      sendSuccess(res, {
        departments: result.departments,
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
      logger.error('Get all departments error:', error);
      next(error);
    }
  };

  getDepartmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const department = await this.administrationService.getDepartmentById(id);
      sendSuccess(res, department);
    } catch (error) {
      logger.error('Get department by ID error:', error);
      next(error);
    }
  };

  createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const departmentData: CreateDepartmentDTO = {
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        headId: req.body.headId,
        parentDepartmentId: req.body.parentDepartmentId,
      };

      if (!departmentData.name || !departmentData.code) {
        throw new ValidationError('Department name and code are required');
      }

      const department = await this.administrationService.createDepartment(departmentData);
      sendSuccess(res, department, 'Department created successfully', 201);
    } catch (error) {
      logger.error('Create department error:', error);
      next(error);
    }
  };

  updateDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const departmentData: UpdateDepartmentDTO = {
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        headId: req.body.headId,
        parentDepartmentId: req.body.parentDepartmentId,
        isActive: req.body.isActive,
      };

      const department = await this.administrationService.updateDepartment(id, departmentData);
      sendSuccess(res, department, 'Department updated successfully');
    } catch (error) {
      logger.error('Update department error:', error);
      next(error);
    }
  };
}

