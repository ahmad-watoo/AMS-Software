/**
 * Administration Controller
 * 
 * Handles HTTP requests for administration endpoints.
 * Manages system configurations, events, notices, and departments.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/administration.controller
 */

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

  /**
   * Get All System Configs Endpoint Handler
   * 
   * Retrieves all system configurations with pagination and optional filters.
   * 
   * @route GET /api/v1/administration/system-configs
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=100] - Items per page
   * @query {string} [category] - Filter by category
   * @query {boolean} [isEditable] - Filter by editable status
   * @returns {Object} System configs array and pagination info
   * 
   * @example
   * GET /api/v1/administration/system-configs?page=1&limit=20&category=email&isEditable=true
   */
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

  /**
   * Get System Config By Key Endpoint Handler
   * 
   * Retrieves a specific system configuration by its key.
   * 
   * @route GET /api/v1/administration/system-configs/:key
   * @access Private
   * @param {string} key - System configuration key
   * @returns {SystemConfig} System configuration object
   */
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

  /**
   * Create System Config Endpoint Handler
   * 
   * Creates a new system configuration.
   * 
   * @route POST /api/v1/administration/system-configs
   * @access Private (Requires admin.create permission)
   * @body {CreateSystemConfigDTO} System configuration creation data
   * @returns {SystemConfig} Created system configuration
   * 
   * @example
   * POST /api/v1/administration/system-configs
   * Body: {
   *   key: "max_file_size",
   *   value: "10",
   *   category: "upload",
   *   dataType: "number",
   *   description: "Maximum file size in MB"
   * }
   */
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

  /**
   * Update System Config Endpoint Handler
   * 
   * Updates an existing system configuration.
   * 
   * @route PUT /api/v1/administration/system-configs/:key
   * @access Private (Requires admin.update permission)
   * @param {string} key - System configuration key
   * @body {UpdateSystemConfigDTO} Partial configuration data to update
   * @returns {SystemConfig} Updated system configuration
   * 
   * @example
   * PUT /api/v1/administration/system-configs/max_file_size
   * Body: {
   *   value: "20",
   *   description: "Updated maximum file size"
   * }
   */
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

  /**
   * Get All Events Endpoint Handler
   * 
   * Retrieves all events with pagination and optional filters.
   * 
   * @route GET /api/v1/administration/events
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [eventType] - Filter by event type
   * @query {string} [targetAudience] - Filter by target audience
   * @query {boolean} [isActive] - Filter by active status
   * @query {string} [startDate] - Filter by start date (YYYY-MM-DD)
   * @query {string} [endDate] - Filter by end date (YYYY-MM-DD)
   * @returns {Object} Events array and pagination info
   * 
   * @example
   * GET /api/v1/administration/events?page=1&limit=20&eventType=academic&isActive=true
   */
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

  /**
   * Get Event By ID Endpoint Handler
   * 
   * Retrieves a specific event by ID.
   * 
   * @route GET /api/v1/administration/events/:id
   * @access Private
   * @param {string} id - Event ID
   * @returns {Event} Event object
   */
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

  /**
   * Create Event Endpoint Handler
   * 
   * Creates a new event.
   * 
   * @route POST /api/v1/administration/events
   * @access Private (Requires admin.create permission)
   * @body {CreateEventDTO} Event creation data
   * @returns {Event} Created event
   * 
   * @example
   * POST /api/v1/administration/events
   * Body: {
   *   title: "Annual Sports Day",
   *   eventType: "sports",
   *   startDate: "2024-03-15",
   *   endDate: "2024-03-16",
   *   targetAudience: ["students", "faculty"]
   * }
   */
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

  /**
   * Update Event Endpoint Handler
   * 
   * Updates an existing event.
   * 
   * @route PUT /api/v1/administration/events/:id
   * @access Private (Requires admin.update permission)
   * @param {string} id - Event ID
   * @body {UpdateEventDTO} Partial event data to update
   * @returns {Event} Updated event
   * 
   * @example
   * PUT /api/v1/administration/events/event123
   * Body: {
   *   title: "Updated Event Title",
   *   isActive: false
   * }
   */
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

  /**
   * Get All Notices Endpoint Handler
   * 
   * Retrieves all notices with pagination and optional filters.
   * 
   * @route GET /api/v1/administration/notices
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [noticeType] - Filter by notice type
   * @query {string} [priority] - Filter by priority
   * @query {string} [targetAudience] - Filter by target audience
   * @query {boolean} [isPublished] - Filter by published status
   * @returns {Object} Notices array and pagination info
   * 
   * @example
   * GET /api/v1/administration/notices?page=1&limit=20&noticeType=important&priority=high
   */
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

  /**
   * Get Notice By ID Endpoint Handler
   * 
   * Retrieves a specific notice by ID.
   * 
   * @route GET /api/v1/administration/notices/:id
   * @access Private
   * @param {string} id - Notice ID
   * @returns {Notice} Notice object
   */
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

  /**
   * Create Notice Endpoint Handler
   * 
   * Creates a new notice.
   * 
   * @route POST /api/v1/administration/notices
   * @access Private (Requires admin.create permission)
   * @body {CreateNoticeDTO} Notice creation data
   * @returns {Notice} Created notice
   * 
   * @example
   * POST /api/v1/administration/notices
   * Body: {
   *   title: "Fee Payment Deadline",
   *   content: "Fee payment deadline is approaching...",
   *   noticeType: "fee",
   *   priority: "urgent",
   *   targetAudience: ["students"],
   *   publishedDate: "2024-01-15",
   *   expiryDate: "2024-02-15"
   * }
   */
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

  /**
   * Update Notice Endpoint Handler
   * 
   * Updates an existing notice.
   * 
   * @route PUT /api/v1/administration/notices/:id
   * @access Private (Requires admin.update permission)
   * @param {string} id - Notice ID
   * @body {UpdateNoticeDTO} Partial notice data to update
   * @returns {Notice} Updated notice
   * 
   * @example
   * PUT /api/v1/administration/notices/notice123
   * Body: {
   *   title: "Updated Notice Title",
   *   isPublished: true
   * }
   */
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

  /**
   * Get All Departments Endpoint Handler
   * 
   * Retrieves all departments with pagination and optional filters.
   * 
   * @route GET /api/v1/administration/departments
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=100] - Items per page
   * @query {boolean} [isActive] - Filter by active status
   * @returns {Object} Departments array and pagination info
   * 
   * @example
   * GET /api/v1/administration/departments?page=1&limit=50&isActive=true
   */
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

  /**
   * Get Department By ID Endpoint Handler
   * 
   * Retrieves a specific department by ID.
   * 
   * @route GET /api/v1/administration/departments/:id
   * @access Private
   * @param {string} id - Department ID
   * @returns {Department} Department object
   */
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

  /**
   * Create Department Endpoint Handler
   * 
   * Creates a new department.
   * 
   * @route POST /api/v1/administration/departments
   * @access Private (Requires admin.create permission)
   * @body {CreateDepartmentDTO} Department creation data
   * @returns {Department} Created department
   * 
   * @example
   * POST /api/v1/administration/departments
   * Body: {
   *   name: "Computer Science",
   *   code: "CS",
   *   description: "Department of Computer Science",
   *   headId: "faculty123"
   * }
   */
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

  /**
   * Update Department Endpoint Handler
   * 
   * Updates an existing department.
   * 
   * @route PUT /api/v1/administration/departments/:id
   * @access Private (Requires admin.update permission)
   * @param {string} id - Department ID
   * @body {UpdateDepartmentDTO} Partial department data to update
   * @returns {Department} Updated department
   * 
   * @example
   * PUT /api/v1/administration/departments/dept123
   * Body: {
   *   name: "Updated Department Name",
   *   isActive: false
   * }
   */
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
