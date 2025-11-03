import { supabaseAdmin } from '@/config/supabase';
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
import { logger } from '@/config/logger';

export class AdministrationRepository {
  private systemConfigsTable = 'system_configs';
  private eventsTable = 'events';
  private noticesTable = 'notices';
  private departmentsTable = 'departments';

  // ==================== System Configs ====================

  async findAllSystemConfigs(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      category?: string;
      isEditable?: boolean;
    }
  ): Promise<SystemConfig[]> {
    try {
      let query = supabaseAdmin
        .from(this.systemConfigsTable)
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.isEditable !== undefined) {
        query = query.eq('is_editable', filters.isEditable);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapSystemConfigFromDB) as SystemConfig[];
    } catch (error) {
      logger.error('Error finding all system configs:', error);
      throw new Error('Failed to fetch system configs');
    }
  }

  async findSystemConfigByKey(key: string): Promise<SystemConfig | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.systemConfigsTable)
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapSystemConfigFromDB(data) as SystemConfig;
    } catch (error) {
      logger.error('Error finding system config by key:', error);
      throw error;
    }
  }

  async createSystemConfig(configData: CreateSystemConfigDTO): Promise<SystemConfig> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.systemConfigsTable)
        .insert({
          key: configData.key,
          value: configData.value,
          category: configData.category,
          description: configData.description || null,
          data_type: configData.dataType,
          is_editable: configData.isEditable ?? true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSystemConfigFromDB(data) as SystemConfig;
    } catch (error) {
      logger.error('Error creating system config:', error);
      throw new Error('Failed to create system config');
    }
  }

  async updateSystemConfig(key: string, configData: UpdateSystemConfigDTO): Promise<SystemConfig> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (configData.value !== undefined) updateData.value = configData.value;
      if (configData.description !== undefined) updateData.description = configData.description;
      if (configData.isEditable !== undefined) updateData.is_editable = configData.isEditable;

      const { data, error } = await supabaseAdmin
        .from(this.systemConfigsTable)
        .update(updateData)
        .eq('key', key)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapSystemConfigFromDB(data) as SystemConfig;
    } catch (error) {
      logger.error('Error updating system config:', error);
      throw new Error('Failed to update system config');
    }
  }

  // ==================== Events ====================

  async findAllEvents(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      eventType?: string;
      targetAudience?: string;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Event[]> {
    try {
      let query = supabaseAdmin
        .from(this.eventsTable)
        .select('*')
        .order('start_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('start_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let events = (data || []).map(this.mapEventFromDB) as Event[];

      // Filter by target audience if specified
      if (filters?.targetAudience) {
        events = events.filter((event) => event.targetAudience.includes(filters!.targetAudience as any));
      }

      return events;
    } catch (error) {
      logger.error('Error finding all events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async findEventById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.eventsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapEventFromDB(data) as Event;
    } catch (error) {
      logger.error('Error finding event by ID:', error);
      throw error;
    }
  }

  async createEvent(eventData: CreateEventDTO): Promise<Event> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.eventsTable)
        .insert({
          title: eventData.title,
          description: eventData.description || null,
          event_type: eventData.eventType,
          start_date: eventData.startDate,
          end_date: eventData.endDate || null,
          start_time: eventData.startTime || null,
          end_time: eventData.endTime || null,
          location: eventData.location || null,
          organizer_id: eventData.organizerId || null,
          target_audience: eventData.targetAudience,
          is_active: true,
          image_url: eventData.imageUrl || null,
          registration_required: eventData.registrationRequired || false,
          max_participants: eventData.maxParticipants || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapEventFromDB(data) as Event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  async updateEvent(id: string, eventData: UpdateEventDTO): Promise<Event> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.eventType !== undefined) updateData.event_type = eventData.eventType;
      if (eventData.startDate !== undefined) updateData.start_date = eventData.startDate;
      if (eventData.endDate !== undefined) updateData.end_date = eventData.endDate;
      if (eventData.startTime !== undefined) updateData.start_time = eventData.startTime;
      if (eventData.endTime !== undefined) updateData.end_time = eventData.endTime;
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.organizerId !== undefined) updateData.organizer_id = eventData.organizerId;
      if (eventData.targetAudience !== undefined) updateData.target_audience = eventData.targetAudience;
      if (eventData.isActive !== undefined) updateData.is_active = eventData.isActive;
      if (eventData.imageUrl !== undefined) updateData.image_url = eventData.imageUrl;
      if (eventData.registrationRequired !== undefined) updateData.registration_required = eventData.registrationRequired;
      if (eventData.maxParticipants !== undefined) updateData.max_participants = eventData.maxParticipants;

      const { data, error } = await supabaseAdmin
        .from(this.eventsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapEventFromDB(data) as Event;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  // ==================== Notices ====================

  async findAllNotices(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      noticeType?: string;
      priority?: string;
      targetAudience?: string;
      isPublished?: boolean;
    }
  ): Promise<Notice[]> {
    try {
      let query = supabaseAdmin
        .from(this.noticesTable)
        .select('*')
        .order('published_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.noticeType) {
        query = query.eq('notice_type', filters.noticeType);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let notices = (data || []).map(this.mapNoticeFromDB) as Notice[];

      // Filter by target audience if specified
      if (filters?.targetAudience) {
        notices = notices.filter((notice) => notice.targetAudience.includes(filters!.targetAudience as any));
      }

      return notices;
    } catch (error) {
      logger.error('Error finding all notices:', error);
      throw new Error('Failed to fetch notices');
    }
  }

  async findNoticeById(id: string): Promise<Notice | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.noticesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapNoticeFromDB(data) as Notice;
    } catch (error) {
      logger.error('Error finding notice by ID:', error);
      throw error;
    }
  }

  async createNotice(noticeData: CreateNoticeDTO, publishedBy?: string): Promise<Notice> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.noticesTable)
        .insert({
          title: noticeData.title,
          content: noticeData.content,
          notice_type: noticeData.noticeType,
          priority: noticeData.priority,
          target_audience: noticeData.targetAudience,
          published_date: noticeData.publishedDate,
          expiry_date: noticeData.expiryDate || null,
          published_by: publishedBy || null,
          is_published: noticeData.isPublished ?? false,
          attachment_url: noticeData.attachmentUrl || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapNoticeFromDB(data) as Notice;
    } catch (error) {
      logger.error('Error creating notice:', error);
      throw new Error('Failed to create notice');
    }
  }

  async updateNotice(id: string, noticeData: UpdateNoticeDTO): Promise<Notice> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (noticeData.title !== undefined) updateData.title = noticeData.title;
      if (noticeData.content !== undefined) updateData.content = noticeData.content;
      if (noticeData.noticeType !== undefined) updateData.notice_type = noticeData.noticeType;
      if (noticeData.priority !== undefined) updateData.priority = noticeData.priority;
      if (noticeData.targetAudience !== undefined) updateData.target_audience = noticeData.targetAudience;
      if (noticeData.publishedDate !== undefined) updateData.published_date = noticeData.publishedDate;
      if (noticeData.expiryDate !== undefined) updateData.expiry_date = noticeData.expiryDate;
      if (noticeData.isPublished !== undefined) updateData.is_published = noticeData.isPublished;
      if (noticeData.attachmentUrl !== undefined) updateData.attachment_url = noticeData.attachmentUrl;

      const { data, error } = await supabaseAdmin
        .from(this.noticesTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapNoticeFromDB(data) as Notice;
    } catch (error) {
      logger.error('Error updating notice:', error);
      throw new Error('Failed to update notice');
    }
  }

  // ==================== Departments ====================

  async findAllDepartments(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      isActive?: boolean;
    }
  ): Promise<Department[]> {
    try {
      let query = supabaseAdmin
        .from(this.departmentsTable)
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDepartmentFromDB) as Department[];
    } catch (error) {
      logger.error('Error finding all departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  async findDepartmentById(id: string): Promise<Department | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.departmentsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapDepartmentFromDB(data) as Department;
    } catch (error) {
      logger.error('Error finding department by ID:', error);
      throw error;
    }
  }

  async createDepartment(departmentData: CreateDepartmentDTO): Promise<Department> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.departmentsTable)
        .insert({
          name: departmentData.name,
          code: departmentData.code,
          description: departmentData.description || null,
          head_id: departmentData.headId || null,
          parent_department_id: departmentData.parentDepartmentId || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDepartmentFromDB(data) as Department;
    } catch (error) {
      logger.error('Error creating department:', error);
      throw new Error('Failed to create department');
    }
  }

  async updateDepartment(id: string, departmentData: UpdateDepartmentDTO): Promise<Department> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (departmentData.name !== undefined) updateData.name = departmentData.name;
      if (departmentData.code !== undefined) updateData.code = departmentData.code;
      if (departmentData.description !== undefined) updateData.description = departmentData.description;
      if (departmentData.headId !== undefined) updateData.head_id = departmentData.headId;
      if (departmentData.parentDepartmentId !== undefined) updateData.parent_department_id = departmentData.parentDepartmentId;
      if (departmentData.isActive !== undefined) updateData.is_active = departmentData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.departmentsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDepartmentFromDB(data) as Department;
    } catch (error) {
      logger.error('Error updating department:', error);
      throw new Error('Failed to update department');
    }
  }

  // ==================== Helper Mappers ====================

  private mapSystemConfigFromDB(data: any): Partial<SystemConfig> {
    return {
      id: data.id,
      key: data.key,
      value: data.value,
      category: data.category,
      description: data.description,
      dataType: data.data_type,
      isEditable: data.is_editable,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapEventFromDB(data: any): Partial<Event> {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      eventType: data.event_type,
      startDate: data.start_date,
      endDate: data.end_date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      organizerId: data.organizer_id,
      targetAudience: data.target_audience || [],
      isActive: data.is_active,
      imageUrl: data.image_url,
      registrationRequired: data.registration_required,
      maxParticipants: data.max_participants,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapNoticeFromDB(data: any): Partial<Notice> {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      noticeType: data.notice_type,
      priority: data.priority,
      targetAudience: data.target_audience || [],
      publishedDate: data.published_date,
      expiryDate: data.expiry_date,
      publishedBy: data.published_by,
      isPublished: data.is_published,
      attachmentUrl: data.attachment_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDepartmentFromDB(data: any): Partial<Department> {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      description: data.description,
      headId: data.head_id,
      parentDepartmentId: data.parent_department_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

