export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'conference' | 'holiday' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerId?: string;
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  isActive: boolean;
  imageUrl?: string;
  registrationRequired?: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  noticeType: 'announcement' | 'important' | 'general' | 'exam' | 'fee' | 'holiday';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  publishedDate: string;
  expiryDate?: string;
  publishedBy?: string;
  isPublished: boolean;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentDepartmentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemConfigDTO {
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable?: boolean;
}

export interface UpdateSystemConfigDTO {
  value?: string;
  description?: string;
  isEditable?: boolean;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  eventType: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'conference' | 'holiday' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerId?: string;
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  imageUrl?: string;
  registrationRequired?: boolean;
  maxParticipants?: number;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  eventType?: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'conference' | 'holiday' | 'other';
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerId?: string;
  targetAudience?: ('students' | 'faculty' | 'staff' | 'all')[];
  isActive?: boolean;
  imageUrl?: string;
  registrationRequired?: boolean;
  maxParticipants?: number;
}

export interface CreateNoticeDTO {
  title: string;
  content: string;
  noticeType: 'announcement' | 'important' | 'general' | 'exam' | 'fee' | 'holiday';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
  publishedDate: string;
  expiryDate?: string;
  attachmentUrl?: string;
  isPublished?: boolean;
}

export interface UpdateNoticeDTO {
  title?: string;
  content?: string;
  noticeType?: 'announcement' | 'important' | 'general' | 'exam' | 'fee' | 'holiday';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: ('students' | 'faculty' | 'staff' | 'all')[];
  publishedDate?: string;
  expiryDate?: string;
  isPublished?: boolean;
  attachmentUrl?: string;
}

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentDepartmentId?: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  code?: string;
  description?: string;
  headId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
}

