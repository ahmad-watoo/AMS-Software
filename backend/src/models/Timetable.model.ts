export interface Timetable {
  id: string;
  sectionId: string;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  roomId?: string;
  facultyId?: string;
  semester: string;
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  buildingId?: string;
  roomType: 'classroom' | 'lab' | 'auditorium' | 'library' | 'other';
  capacity?: number;
  facilities?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  campusId?: string;
  floors?: number;
  address?: string;
  createdAt: string;
}

export interface CreateTimetableDTO {
  sectionId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  facultyId?: string;
  semester: string;
}

export interface UpdateTimetableDTO {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  facultyId?: string;
}

export interface CreateRoomDTO {
  roomNumber: string;
  buildingId?: string;
  roomType: 'classroom' | 'lab' | 'auditorium' | 'library' | 'other';
  capacity?: number;
  facilities?: string[];
}

export interface UpdateRoomDTO {
  roomNumber?: string;
  buildingId?: string;
  roomType?: 'classroom' | 'lab' | 'auditorium' | 'library' | 'other';
  capacity?: number;
  facilities?: string[];
  isActive?: boolean;
}

export interface CreateBuildingDTO {
  name: string;
  code: string;
  campusId?: string;
  floors?: number;
  address?: string;
}

export interface TimetableConflict {
  conflictType: 'room' | 'faculty' | 'time';
  conflictingItem: Timetable;
  message: string;
}

export interface TimetableSchedule {
  sectionId: string;
  sectionCode: string;
  courseCode: string;
  courseTitle: string;
  schedules: Timetable[];
}

