/**
 * Administration Service
 * 
 * Service for managing administrative operations including:
 * - System configuration management (key-value settings)
 * - Event management (academic, cultural, sports, etc.)
 * - Notice management (announcements, important notices)
 * - Department management (organizational structure)
 * 
 * Provides validation, error handling, and business logic for all administration operations.
 * 
 * @module services/administration.service
 */

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

  /**
   * Get all system configurations with pagination and filters
   * 
   * Retrieves system configurations with optional filtering by category and editability.
   * Returns paginated results.
   * 
   * @param {number} [limit=100] - Maximum number of configs to return
   * @param {number} [offset=0] - Number of configs to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.category] - Filter by category
   * @param {boolean} [filters.isEditable] - Filter by editable status
   * @returns {Promise<{configs: SystemConfig[], total: number}>} Configs and total count
   * 
   * @example
   * const { configs, total } = await administrationService.getAllSystemConfigs(20, 0, {
   *   category: 'email',
   *   isEditable: true
   * });
   */
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

  /**
   * Get system configuration by key
   * 
   * Retrieves a specific system configuration by its unique key.
   * 
   * @param {string} key - Configuration key
   * @returns {Promise<SystemConfig>} System configuration object
   * @throws {NotFoundError} If config not found
   */
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

  /**
   * Create a system configuration
   * 
   * Creates a new system configuration with validation.
   * Validates required fields, data type, and checks for duplicate keys.
   * 
   * @param {CreateSystemConfigDTO} configData - Configuration creation data
   * @returns {Promise<SystemConfig>} Created system configuration
   * @throws {ValidationError} If required fields are missing or data type is invalid
   * @throws {ConflictError} If key already exists
   * 
   * @example
   * const config = await administrationService.createSystemConfig({
   *   key: 'max_file_size',
   *   value: '10',
   *   category: 'upload',
   *   dataType: 'number',
   *   description: 'Maximum file size in MB'
   * });
   */
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

  /**
   * Update a system configuration
   * 
   * Updates an existing system configuration.
   * Only editable configs can be updated. Validates data type if value is being updated.
   * 
   * @param {string} key - Configuration key
   * @param {UpdateSystemConfigDTO} configData - Partial configuration data to update
   * @returns {Promise<SystemConfig>} Updated system configuration
   * @throws {NotFoundError} If config not found
   * @throws {ValidationError} If config is not editable or value is invalid
   */
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

  /**
   * Validate configuration value based on data type
   * 
   * Validates that a configuration value matches its declared data type.
   * Supports: string, number, boolean, json.
   * 
   * @private
   * @param {string} value - Configuration value to validate
   * @param {string} dataType - Expected data type
   * @throws {ValidationError} If value doesn't match data type
   */
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

  /**
   * Get all events with pagination and filters
   * 
   * Retrieves events with optional filtering by type, audience, active status, and date range.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of events to return
   * @param {number} [offset=0] - Number of events to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.eventType] - Filter by event type
   * @param {string} [filters.targetAudience] - Filter by target audience
   * @param {boolean} [filters.isActive] - Filter by active status
   * @param {string} [filters.startDate] - Filter by start date (YYYY-MM-DD)
   * @param {string} [filters.endDate] - Filter by end date (YYYY-MM-DD)
   * @returns {Promise<{events: Event[], total: number}>} Events and total count
   * 
   * @example
   * const { events, total } = await administrationService.getAllEvents(20, 0, {
   *   eventType: 'academic',
   *   isActive: true,
   *   startDate: '2024-01-01'
   * });
   */
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

  /**
   * Get event by ID
   * 
   * Retrieves a specific event by its ID.
   * 
   * @param {string} id - Event ID
   * @returns {Promise<Event>} Event object
   * @throws {NotFoundError} If event not found
   */
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

  /**
   * Create an event
   * 
   * Creates a new event with validation.
   * Validates required fields, date formats, and target audience.
   * 
   * @param {CreateEventDTO} eventData - Event creation data
   * @returns {Promise<Event>} Created event
   * @throws {ValidationError} If required fields are missing or dates are invalid
   * 
   * @example
   * const event = await administrationService.createEvent({
   *   title: 'Annual Sports Day',
   *   eventType: 'sports',
   *   startDate: '2024-03-15',
   *   endDate: '2024-03-16',
   *   targetAudience: ['students', 'faculty']
   * });
   */
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

  /**
   * Update an event
   * 
   * Updates an existing event's information.
   * Validates date relationships if dates are being updated.
   * 
   * @param {string} id - Event ID
   * @param {UpdateEventDTO} eventData - Partial event data to update
   * @returns {Promise<Event>} Updated event
   * @throws {NotFoundError} If event not found
   * @throws {ValidationError} If dates are invalid
   */
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

  /**
   * Get all notices with pagination and filters
   * 
   * Retrieves notices with optional filtering by type, priority, audience, and published status.
   * Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of notices to return
   * @param {number} [offset=0] - Number of notices to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.noticeType] - Filter by notice type
   * @param {string} [filters.priority] - Filter by priority
   * @param {string} [filters.targetAudience] - Filter by target audience
   * @param {boolean} [filters.isPublished] - Filter by published status
   * @returns {Promise<{notices: Notice[], total: number}>} Notices and total count
   * 
   * @example
   * const { notices, total } = await administrationService.getAllNotices(20, 0, {
   *   noticeType: 'important',
   *   priority: 'high',
   *   isPublished: true
   * });
   */
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

  /**
   * Get notice by ID
   * 
   * Retrieves a specific notice by its ID.
   * 
   * @param {string} id - Notice ID
   * @returns {Promise<Notice>} Notice object
   * @throws {NotFoundError} If notice not found
   */
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

  /**
   * Create a notice
   * 
   * Creates a new notice with validation.
   * Validates required fields, target audience, and expiry date.
   * 
   * @param {CreateNoticeDTO} noticeData - Notice creation data
   * @param {string} [publishedBy] - ID of user creating the notice
   * @returns {Promise<Notice>} Created notice
   * @throws {ValidationError} If required fields are missing or dates are invalid
   * 
   * @example
   * const notice = await administrationService.createNotice({
   *   title: 'Fee Payment Deadline',
   *   content: 'Fee payment deadline is approaching...',
   *   noticeType: 'fee',
   *   priority: 'urgent',
   *   targetAudience: ['students'],
   *   publishedDate: '2024-01-15',
   *   expiryDate: '2024-02-15'
   * }, 'admin123');
   */
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

  /**
   * Update a notice
   * 
   * Updates an existing notice's information.
   * Validates expiry date if being updated.
   * 
   * @param {string} id - Notice ID
   * @param {UpdateNoticeDTO} noticeData - Partial notice data to update
   * @returns {Promise<Notice>} Updated notice
   * @throws {NotFoundError} If notice not found
   * @throws {ValidationError} If expiry date is invalid
   */
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

  /**
   * Get all departments with pagination and filters
   * 
   * Retrieves departments with optional filtering by active status.
   * Returns paginated results.
   * 
   * @param {number} [limit=100] - Maximum number of departments to return
   * @param {number} [offset=0] - Number of departments to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<{departments: Department[], total: number}>} Departments and total count
   * 
   * @example
   * const { departments, total } = await administrationService.getAllDepartments(50, 0, {
   *   isActive: true
   * });
   */
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

  /**
   * Get department by ID
   * 
   * Retrieves a specific department by its ID.
   * 
   * @param {string} id - Department ID
   * @returns {Promise<Department>} Department object
   * @throws {NotFoundError} If department not found
   */
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

  /**
   * Create a department
   * 
   * Creates a new department with validation.
   * Validates required fields and checks for duplicate department codes.
   * 
   * @param {CreateDepartmentDTO} departmentData - Department creation data
   * @returns {Promise<Department>} Created department
   * @throws {ValidationError} If required fields are missing
   * @throws {ConflictError} If department code already exists
   * 
   * @example
   * const department = await administrationService.createDepartment({
   *   name: 'Computer Science',
   *   code: 'CS',
   *   description: 'Department of Computer Science',
   *   headId: 'faculty123'
   * });
   */
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

  /**
   * Update a department
   * 
   * Updates an existing department's information.
   * Validates department code uniqueness if code is being updated.
   * 
   * @param {string} id - Department ID
   * @param {UpdateDepartmentDTO} departmentData - Partial department data to update
   * @returns {Promise<Department>} Updated department
   * @throws {NotFoundError} If department not found
   * @throws {ConflictError} If department code conflicts with existing department
   * @throws {ValidationError} If validation fails
   */
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
