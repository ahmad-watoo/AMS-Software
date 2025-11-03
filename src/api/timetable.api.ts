import apiClient from './client';

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

export interface CreateRoomDTO {
  roomNumber: string;
  buildingId?: string;
  roomType: 'classroom' | 'lab' | 'auditorium' | 'library' | 'other';
  capacity?: number;
  facilities?: string[];
}

export interface CreateBuildingDTO {
  name: string;
  code: string;
  campusId?: string;
  floors?: number;
  address?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface TimetablesResponse {
  timetables: Timetable[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RoomsResponse {
  rooms: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BuildingsResponse {
  buildings: Building[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const timetableAPI = {
  // ==================== Timetables ====================

  getTimetables: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      sectionId?: string;
      facultyId?: string;
      semester?: string;
      dayOfWeek?: number;
      roomId?: string;
    }
  ): Promise<TimetablesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.sectionId) params.append('sectionId', filters.sectionId);
    if (filters?.facultyId) params.append('facultyId', filters.facultyId);
    if (filters?.semester) params.append('semester', filters.semester);
    if (filters?.dayOfWeek) params.append('dayOfWeek', filters.dayOfWeek.toString());
    if (filters?.roomId) params.append('roomId', filters.roomId);

    const response = await apiClient.get<ApiResponse<TimetablesResponse>>(
      `/timetable/timetables?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch timetables');
    }
    return response.data.data;
  },

  getTimetable: async (id: string): Promise<Timetable> => {
    const response = await apiClient.get<ApiResponse<Timetable>>(`/timetable/timetables/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch timetable');
    }
    return response.data.data;
  },

  createTimetable: async (data: CreateTimetableDTO): Promise<{ timetable: Timetable; conflicts: any[] }> => {
    const response = await apiClient.post<ApiResponse<{ timetable: Timetable; conflicts: any[] }>>(
      '/timetable/timetables',
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create timetable');
    }
    return response.data.data;
  },

  updateTimetable: async (id: string, data: Partial<CreateTimetableDTO>): Promise<Timetable> => {
    const response = await apiClient.put<ApiResponse<Timetable>>(`/timetable/timetables/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update timetable');
    }
    return response.data.data;
  },

  deleteTimetable: async (id: string): Promise<void> => {
    await apiClient.delete(`/timetable/timetables/${id}`);
  },

  // ==================== Rooms ====================

  getRooms: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      buildingId?: string;
      roomType?: string;
      isActive?: boolean;
    }
  ): Promise<RoomsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.buildingId) params.append('buildingId', filters.buildingId);
    if (filters?.roomType) params.append('roomType', filters.roomType);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get<ApiResponse<RoomsResponse>>(
      `/timetable/rooms?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch rooms');
    }
    return response.data.data;
  },

  getRoom: async (id: string): Promise<Room> => {
    const response = await apiClient.get<ApiResponse<Room>>(`/timetable/rooms/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch room');
    }
    return response.data.data;
  },

  createRoom: async (data: CreateRoomDTO): Promise<Room> => {
    const response = await apiClient.post<ApiResponse<Room>>('/timetable/rooms', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create room');
    }
    return response.data.data;
  },

  updateRoom: async (id: string, data: Partial<CreateRoomDTO & { isActive?: boolean }>): Promise<Room> => {
    const response = await apiClient.put<ApiResponse<Room>>(`/timetable/rooms/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update room');
    }
    return response.data.data;
  },

  // ==================== Buildings ====================

  getBuildings: async (page: number = 1, limit: number = 20): Promise<BuildingsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ApiResponse<BuildingsResponse>>(
      `/timetable/buildings?${params.toString()}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch buildings');
    }
    return response.data.data;
  },

  getBuilding: async (id: string): Promise<Building> => {
    const response = await apiClient.get<ApiResponse<Building>>(`/timetable/buildings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch building');
    }
    return response.data.data;
  },

  createBuilding: async (data: CreateBuildingDTO): Promise<Building> => {
    const response = await apiClient.post<ApiResponse<Building>>('/timetable/buildings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create building');
    }
    return response.data.data;
  },
};

