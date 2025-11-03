import { AdministrationRepository } from '@/repositories/administration.repository';
import {
  SystemConfig,
  Event,
  Notice,
  Department,
  CreateSystemConfigDTO,
  UpdateSystemConfigDTO,
  CreateEventDTO,
  UpdateEventDTO,
  CreateNoticeDTO,
  UpdateNoticeDTO,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@/models/Administration.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AdministrationService {
  private administrationRepository: AdministrationRepository;

  constructor() {
    this.administrationRepository = new AdministrationRepository();
  }

  // ==================== System Configs ====================

  async getAllSystemConfigs(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      category?: string;
      isEditable?: boolean;
    }
  ): Promise<{
    configs: SystemConfig[];
    total: number;
  }> {
    try {
      const allConfigs = await this.administrationRepository.findAllSystemConfigs(limit * 10, 0, filters);
      const paginatedConfigs = allConfigs.slice(offset, offset + limit);

      return {
        configs: paginatedConfigs,
        total: allConfigs.length,
      };
    } catch (error) {
      logger.error('Error getting all system configs:', error);
      throw new Error('Failed to fetch system configs');
    }
  }

  async getSystemConfigByKey(key: string): Promise<SystemConfig> {
    try {
      const config = await this.administrationRepository.findSystemConfigByKey(key);
      if (!config) {
        throw new NotFoundError('System config');
      }
      return config;
    } catch (error) {
      logger.error('Error getting system config by key:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch system config');
    }
  }

  async createSystemConfig(configData: CreateSystemConfigDTO): Promise<SystemConfig> {
    try {
      if (!configData.key || !configData.value || !configData.category || !configData.dataType) {
        throw new ValidationError('Key, value, category, and data type are required');
      }

      // Check if key already exists
      const existing = await this.administrationRepository.findSystemConfigByKey(configData.key);
      if (existing) {
        throw new ConflictError('System config with this key already exists');
      }

      // Validate data type
      this.validateConfigValue(configData.value, configData.dataType);

      return await this.administrationRepository.createSystemConfig(configData);
    } catch (error) {
      logger.error('Error creating system config:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create system config');
    }
  }

  async updateSystemConfig(key: string, configData: UpdateSystemConfigDTO): Promise<SystemConfig> {
    try {
      const existing = await this.administrationRepository.findSystemConfigByKey(key);
      if (!existing) {
        throw new NotFoundError('System config');
      }

      if (!existing.isEditable) {
        throw new ValidationError('This system config is not editable');
      }

      if (configData.value !== undefined) {
        this.validateConfigValue(configData.value, existing.dataType);
      }

      return await this.administrationRepository.updateSystemConfig(key, configData);
    } catch (error) {
      logger.error('Error updating system config:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update system config');
    }
  }

  private validateConfigValue(value: string, dataType: string): void {
    switch (dataType) {
      case 'number':
        if (isNaN(Number(value))) {
          throw new ValidationError('Value must be a valid number');
        }
        break;
      case 'boolean':
        if (value !== 'true' && value !== 'false') {
          throw new ValidationError('Value must be true or false');
        }
        break;
      case 'json':
        try {
          JSON.parse(value);
        } catch {
          throw new ValidationError('Value must be valid JSON');
        }
        break;
      // string type doesn't need validation
    }
  }

  // ==================== Events ====================

  async getAllEvents(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      eventType?: string;
      targetAudience?: string;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    events: Event[];
    total: number;
  }> {
    try {
      const allEvents = await this.administrationRepository.findAllEvents(limit * 10, 0, filters);
      const paginatedEvents = allEvents.slice(offset, offset + limit);

      return {
        events: paginatedEvents,
        total: allEvents.length,
      };
    } catch (error) {
      logger.error('Error getting all events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      const event = await this.administrationRepository.findEventById(id);
      if (!event) {
        throw new NotFoundError('Event');
      }
      return event;
    } catch (error) {
      logger.error('Error getting event by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch event');
    }
  }

  async createEvent(eventData: CreateEventDTO): Promise<Event> {
    try {
      if (!eventData.title || !eventData.startDate || !eventData.eventType) {
        throw new ValidationError('Title, start date, and event type are required');
      }

      // Validate dates
      const startDate = new Date(eventData.startDate);
      if (isNaN(startDate.getTime())) {
        throw new ValidationError('Invalid start date format');
      }

      if (eventData.endDate) {
        const endDate = new Date(eventData.endDate);
        if (isNaN(endDate.getTime()) || endDate < startDate) {
          throw new ValidationError('End date must be after start date');
        }
      }

      if (!eventData.targetAudience || eventData.targetAudience.length === 0) {
        throw new ValidationError('Target audience is required');
      }

      return await this.administrationRepository.createEvent(eventData);
    } catch (error) {
      logger.error('Error creating event:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create event');
    }
  }

  async updateEvent(id: string, eventData: UpdateEventDTO): Promise<Event> {
    try {
      const existing = await this.administrationRepository.findEventById(id);
      if (!existing) {
        throw new NotFoundError('Event');
      }

      // Validate dates if provided
      if (eventData.startDate || eventData.endDate) {
        const startDate = eventData.startDate ? new Date(eventData.startDate) : new Date(existing.startDate);
        const endDate = eventData.endDate ? new Date(eventData.endDate) : existing.endDate ? new Date(existing.endDate) : null;

        if (endDate && endDate < startDate) {
          throw new ValidationError('End date must be after start date');
        }
      }

      return await this.administrationRepository.updateEvent(id, eventData);
    } catch (error) {
      logger.error('Error updating event:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update event');
    }
  }

  // ==================== Notices ====================

  async getAllNotices(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      noticeType?: string;
      priority?: string;
      targetAudience?: string;
      isPublished?: boolean;
    }
  ): Promise<{
    notices: Notice[];
    total: number;
  }> {
    try {
      const allNotices = await this.administrationRepository.findAllNotices(limit * 10, 0, filters);
      const paginatedNotices = allNotices.slice(offset, offset + limit);

      return {
        notices: paginatedNotices,
        total: allNotices.length,
      };
    } catch (error) {
      logger.error('Error getting all notices:', error);
      throw new Error('Failed to fetch notices');
    }
  }

  async getNoticeById(id: string): Promise<Notice> {
    try {
      const notice = await this.administrationRepository.findNoticeById(id);
      if (!notice) {
        throw new NotFoundError('Notice');
      }
      return notice;
    } catch (error) {
      logger.error('Error getting notice by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch notice');
    }
  }

  async createNotice(noticeData: CreateNoticeDTO, publishedBy?: string): Promise<Notice> {
    try {
      if (!noticeData.title || !noticeData.content || !noticeData.publishedDate) {
        throw new ValidationError('Title, content, and published date are required');
      }

      if (!noticeData.targetAudience || noticeData.targetAudience.length === 0) {
        throw new ValidationError('Target audience is required');
      }

      // Validate expiry date if provided
      if (noticeData.expiryDate) {
        const publishedDate = new Date(noticeData.publishedDate);
        const expiryDate = new Date(noticeData.expiryDate);
        if (expiryDate <= publishedDate) {
          throw new ValidationError('Expiry date must be after published date');
        }
      }

      return await this.administrationRepository.createNotice(noticeData, publishedBy);
    } catch (error) {
      logger.error('Error creating notice:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create notice');
    }
  }

  async updateNotice(id: string, noticeData: UpdateNoticeDTO): Promise<Notice> {
    try {
      const existing = await this.administrationRepository.findNoticeById(id);
      if (!existing) {
        throw new NotFoundError('Notice');
      }

      // Validate expiry date if provided
      if (noticeData.expiryDate) {
        const publishedDate = noticeData.publishedDate ? new Date(noticeData.publishedDate) : new Date(existing.publishedDate);
        const expiryDate = new Date(noticeData.expiryDate);
        if (expiryDate <= publishedDate) {
          throw new ValidationError('Expiry date must be after published date');
        }
      }

      return await this.administrationRepository.updateNotice(id, noticeData);
    } catch (error) {
      logger.error('Error updating notice:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update notice');
    }
  }

  // ==================== Departments ====================

  async getAllDepartments(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      isActive?: boolean;
    }
  ): Promise<{
    departments: Department[];
    total: number;
  }> {
    try {
      const allDepartments = await this.administrationRepository.findAllDepartments(limit * 10, 0, filters);
      const paginatedDepartments = allDepartments.slice(offset, offset + limit);

      return {
        departments: paginatedDepartments,
        total: allDepartments.length,
      };
    } catch (error) {
      logger.error('Error getting all departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  async getDepartmentById(id: string): Promise<Department> {
    try {
      const department = await this.administrationRepository.findDepartmentById(id);
      if (!department) {
        throw new NotFoundError('Department');
      }
      return department;
    } catch (error) {
      logger.error('Error getting department by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch department');
    }
  }

  async createDepartment(departmentData: CreateDepartmentDTO): Promise<Department> {
    try {
      if (!departmentData.name || !departmentData.code) {
        throw new ValidationError('Department name and code are required');
      }

      // Check if code already exists
      const allDepartments = await this.administrationRepository.findAllDepartments(1000, 0);
      const existing = allDepartments.find((d) => d.code.toLowerCase() === departmentData.code.toLowerCase());
      if (existing) {
        throw new ConflictError('Department with this code already exists');
      }

      return await this.administrationRepository.createDepartment(departmentData);
    } catch (error) {
      logger.error('Error creating department:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create department');
    }
  }

  async updateDepartment(id: string, departmentData: UpdateDepartmentDTO): Promise<Department> {
    try {
      const existing = await this.administrationRepository.findDepartmentById(id);
      if (!existing) {
        throw new NotFoundError('Department');
      }

      // Check if code conflicts if updating code
      if (departmentData.code && departmentData.code !== existing.code) {
        const allDepartments = await this.administrationRepository.findAllDepartments(1000, 0);
        const conflicting = allDepartments.find(
          (d) => d.id !== id && d.code.toLowerCase() === departmentData.code!.toLowerCase()
        );
        if (conflicting) {
          throw new ConflictError('Department with this code already exists');
        }
      }

      return await this.administrationRepository.updateDepartment(id, departmentData);
    } catch (error) {
      logger.error('Error updating department:', error);
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update department');
    }
  }
}

