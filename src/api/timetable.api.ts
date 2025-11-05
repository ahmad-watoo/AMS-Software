/**
 * Timetable Management API Client
 * 
 * Frontend API client for timetable management endpoints.
 * Provides typed functions for all timetable operations including:
 * - Timetable management (CRUD with conflict detection)
 * - Room management (CRUD)
 * - Building management (CRUD)
 * 
 * @module api/timetable.api
 */

import apiClient from './client';

/**
 * Timetable Interface
 * 
 * Represents a class schedule entry.
 * 
 * @interface Timetable
 */
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

/**
 * Room Interface
 * 
 * Represents a room/classroom.
 * 
 * @interface Room
 */
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

/**
 * Building Interface
 * 
 * Represents a building.
 * 
 * @interface Building
 */
export interface Building {
  id: string;
  name: string;
  code: string;
  campusId?: string;
  floors?: number;
  address?: string;
  createdAt: string;
}

/**
 * Create Timetable Data Transfer Object
 * 
 * @interface CreateTimetableDTO
 */
export interface CreateTimetableDTO {
  sectionId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  facultyId?: string;
  semester: string;
}

/**
 * Create Room Data Transfer Object
 * 
 * @interface CreateRoomDTO
 */
export interface CreateRoomDTO {
  roomNumber: string;
  buildingId?: string;
  roomType: 'classroom' | 'lab' | 'auditorium' | 'library' | 'other';
  capacity?: number;
  facilities?: string[];
}

/**
 * Create Building Data Transfer Object
 * 
 * @interface CreateBuildingDTO
 */
export interface CreateBuildingDTO {
  name: string;
  code: string;
  campusId?: string;
  floors?: number;
  address?: string;
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Timetables Response with Pagination
 * 
 * @interface TimetablesResponse
 */
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

/**
 * Rooms Response with Pagination
 * 
 * @interface RoomsResponse
 */
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

/**
 * Buildings Response with Pagination
 * 
 * @interface BuildingsResponse
 */
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

/**
 * Timetable Management API Client
 * 
 * Provides methods for all timetable management operations.
 */
export const timetableAPI = {
  // ==================== Timetables ====================

  /**
   * Get all timetables with pagination and filters
   * 
   * Retrieves timetables with pagination and optional filters.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.facultyId] - Filter by faculty ID
   * @param {string} [filters.semester] - Filter by semester
   * @param {number} [filters.dayOfWeek] - Filter by day of week (1-7)
   * @param {string} [filters.roomId] - Filter by room ID
   * @returns {Promise<TimetablesResponse>} Timetables array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await timetableAPI.getTimetables(1, 20, {
   *   sectionId: 'section123',
   *   semester: '2024-Fall',
   *   dayOfWeek: 1
   * });
   */
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

  /**
   * Get timetable by ID
   * 
   * Retrieves a specific timetable by its ID.
   * 
   * @param {string} id - Timetable ID
   * @returns {Promise<Timetable>} Timetable object
   * @throws {Error} If request fails or timetable not found
   * 
   * @example
   * const timetable = await timetableAPI.getTimetable('timetable123');
   * console.log(timetable.startTime); // '09:00'
   */
  getTimetable: async (id: string): Promise<Timetable> => {
    const response = await apiClient.get<ApiResponse<Timetable>>(`/timetable/timetables/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch timetable');
    }
    return response.data.data;
  },

  /**
   * Create a new timetable
   * 
   * Creates a new timetable entry with conflict detection.
   * Requires timetable.create permission.
   * 
   * Conflict detection prevents:
   * - Double-booking of rooms at the same time
   * - Faculty being assigned to multiple classes simultaneously
   * 
   * @param {CreateTimetableDTO} data - Timetable creation data
   * @returns {Promise<{timetable: Timetable, conflicts: any[]}>} Created timetable and conflicts array
   * @throws {Error} If request fails, validation fails, or conflicts detected
   * 
   * @example
   * const result = await timetableAPI.createTimetable({
   *   sectionId: 'section123',
   *   dayOfWeek: 1,
   *   startTime: '09:00',
   *   endTime: '10:30',
   *   roomId: 'room456',
   *   facultyId: 'faculty789',
   *   semester: '2024-Fall'
   * });
   */
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

  /**
   * Update a timetable
   * 
   * Updates an existing timetable entry with conflict detection.
   * Requires timetable.update permission.
   * 
   * @param {string} id - Timetable ID
   * @param {Partial<CreateTimetableDTO>} data - Partial timetable data to update
   * @returns {Promise<Timetable>} Updated timetable
   * @throws {Error} If request fails or conflicts detected
   * 
   * @example
   * const timetable = await timetableAPI.updateTimetable('timetable123', {
   *   startTime: '10:00',
   *   endTime: '11:30',
   *   roomId: 'room789'
   * });
   */
  updateTimetable: async (id: string, data: Partial<CreateTimetableDTO>): Promise<Timetable> => {
    const response = await apiClient.put<ApiResponse<Timetable>>(`/timetable/timetables/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update timetable');
    }
    return response.data.data;
  },

  /**
   * Delete a timetable
   * 
   * Deletes a timetable entry.
   * Requires timetable.delete permission.
   * 
   * @param {string} id - Timetable ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or timetable not found
   * 
   * @example
   * await timetableAPI.deleteTimetable('timetable123');
   */
  deleteTimetable: async (id: string): Promise<void> => {
    await apiClient.delete(`/timetable/timetables/${id}`);
  },

  // ==================== Rooms ====================

  /**
   * Get all rooms with pagination and filters
   * 
   * Retrieves rooms with pagination and optional filters.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.buildingId] - Filter by building ID
   * @param {string} [filters.roomType] - Filter by room type
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<RoomsResponse>} Rooms array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await timetableAPI.getRooms(1, 20, {
   *   buildingId: 'building123',
   *   roomType: 'classroom',
   *   isActive: true
   * });
   */
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

  /**
   * Get room by ID
   * 
   * Retrieves a specific room by its ID.
   * 
   * @param {string} id - Room ID
   * @returns {Promise<Room>} Room object
   * @throws {Error} If request fails or room not found
   * 
   * @example
   * const room = await timetableAPI.getRoom('room123');
   * console.log(room.roomNumber); // '101'
   */
  getRoom: async (id: string): Promise<Room> => {
    const response = await apiClient.get<ApiResponse<Room>>(`/timetable/rooms/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch room');
    }
    return response.data.data;
  },

  /**
   * Create a new room
   * 
   * Creates a new room.
   * Requires timetable.create permission.
   * 
   * @param {CreateRoomDTO} data - Room creation data
   * @returns {Promise<Room>} Created room
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const room = await timetableAPI.createRoom({
   *   roomNumber: '101',
   *   buildingId: 'building123',
   *   roomType: 'classroom',
   *   capacity: 30,
   *   facilities: ['projector', 'whiteboard']
   * });
   */
  createRoom: async (data: CreateRoomDTO): Promise<Room> => {
    const response = await apiClient.post<ApiResponse<Room>>('/timetable/rooms', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create room');
    }
    return response.data.data;
  },

  /**
   * Update a room
   * 
   * Updates an existing room.
   * Requires timetable.update permission.
   * 
   * @param {string} id - Room ID
   * @param {Partial<CreateRoomDTO & { isActive?: boolean }>} data - Partial room data to update
   * @returns {Promise<Room>} Updated room
   * @throws {Error} If request fails or room not found
   * 
   * @example
   * const room = await timetableAPI.updateRoom('room123', {
   *   capacity: 35,
   *   facilities: ['projector', 'whiteboard', 'smartboard']
   * });
   */
  updateRoom: async (id: string, data: Partial<CreateRoomDTO & { isActive?: boolean }>): Promise<Room> => {
    const response = await apiClient.put<ApiResponse<Room>>(`/timetable/rooms/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update room');
    }
    return response.data.data;
  },

  // ==================== Buildings ====================

  /**
   * Get all buildings with pagination
   * 
   * Retrieves buildings with pagination.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @returns {Promise<BuildingsResponse>} Buildings array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await timetableAPI.getBuildings(1, 20);
   */
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

  /**
   * Get building by ID
   * 
   * Retrieves a specific building by its ID.
   * 
   * @param {string} id - Building ID
   * @returns {Promise<Building>} Building object
   * @throws {Error} If request fails or building not found
   * 
   * @example
   * const building = await timetableAPI.getBuilding('building123');
   * console.log(building.name); // 'Science Building'
   */
  getBuilding: async (id: string): Promise<Building> => {
    const response = await apiClient.get<ApiResponse<Building>>(`/timetable/buildings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch building');
    }
    return response.data.data;
  },

  /**
   * Create a new building
   * 
   * Creates a new building.
   * Requires timetable.create permission.
   * 
   * @param {CreateBuildingDTO} data - Building creation data
   * @returns {Promise<Building>} Created building
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const building = await timetableAPI.createBuilding({
   *   name: 'Science Building',
   *   code: 'SB',
   *   campusId: 'campus123',
   *   floors: 5,
   *   address: '123 Science Street'
   * });
   */
  createBuilding: async (data: CreateBuildingDTO): Promise<Building> => {
    const response = await apiClient.post<ApiResponse<Building>>('/timetable/buildings', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create building');
    }
    return response.data.data;
  },
};
