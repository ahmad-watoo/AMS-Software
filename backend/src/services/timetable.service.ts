/**
 * Timetable Service
 * 
 * This service handles all timetable management business logic including:
 * - Timetable CRUD operations
 * - Timetable conflict detection (room and faculty conflicts)
 * - Room management (CRUD operations)
 * - Building management (CRUD operations)
 * 
 * The timetable system manages class schedules with:
 * - Day of week (1=Monday, 7=Sunday)
 * - Start and end times (HH:mm format)
 * - Room assignments
 * - Faculty assignments
 * - Semester filtering
 * 
 * Conflict detection prevents:
 * - Double-booking of rooms at the same time
 * - Faculty being assigned to multiple classes simultaneously
 * 
 * @module services/timetable.service
 */

import { TimetableRepository } from '@/repositories/timetable.repository';
import {
  Timetable,
  Room,
  Building,
  CreateTimetableDTO,
  UpdateTimetableDTO,
  CreateRoomDTO,
  UpdateRoomDTO,
  CreateBuildingDTO,
  TimetableConflict,
} from '@/models/Timetable.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class TimetableService {
  private timetableRepository: TimetableRepository;

  constructor() {
    this.timetableRepository = new TimetableRepository();
  }

  // ==================== Timetables ====================

  /**
   * Get all timetables with pagination and filters
   * 
   * Retrieves timetables with optional filtering by section, faculty,
   * semester, day of week, and room. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of timetables to return
   * @param {number} [offset=0] - Number of timetables to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.sectionId] - Filter by section ID
   * @param {string} [filters.facultyId] - Filter by faculty ID
   * @param {string} [filters.semester] - Filter by semester
   * @param {number} [filters.dayOfWeek] - Filter by day of week (1-7)
   * @param {string} [filters.roomId] - Filter by room ID
   * @returns {Promise<{timetables: Timetable[], total: number}>} Timetables and total count
   * 
   * @example
   * const { timetables, total } = await timetableService.getAllTimetables(20, 0, {
   *   sectionId: 'section123',
   *   semester: '2024-Fall',
   *   dayOfWeek: 1
   * });
   */
  async getAllTimetables(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      facultyId?: string;
      semester?: string;
      dayOfWeek?: number;
      roomId?: string;
    }
  ): Promise<{
    timetables: Timetable[];
    total: number;
  }> {
    try {
      const allTimetables = await this.timetableRepository.findAllTimetables(limit * 10, 0, filters);
      const paginatedTimetables = allTimetables.slice(offset, offset + limit);

      return {
        timetables: paginatedTimetables,
        total: allTimetables.length,
      };
    } catch (error) {
      logger.error('Error getting all timetables:', error);
      throw new Error('Failed to fetch timetables');
    }
  }

  /**
   * Get timetable by ID
   * 
   * Retrieves a specific timetable entry by its ID.
   * 
   * @param {string} id - Timetable ID
   * @returns {Promise<Timetable>} Timetable object
   * @throws {NotFoundError} If timetable not found
   */
  async getTimetableById(id: string): Promise<Timetable> {
    try {
      const timetable = await this.timetableRepository.findTimetableById(id);
      if (!timetable) {
        throw new NotFoundError('Timetable');
      }
      return timetable;
    } catch (error) {
      logger.error('Error getting timetable by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch timetable');
    }
  }

  /**
   * Create a new timetable entry
   * 
   * Creates a new timetable entry with conflict detection.
   * Checks for room and faculty conflicts before creating.
   * 
   * @param {CreateTimetableDTO} timetableData - Timetable creation data
   * @returns {Promise<{timetable: Timetable, conflicts: TimetableConflict[]}>}
   * Created timetable and any detected conflicts (should be empty if creation succeeds)
   * @throws {ValidationError} If timetable data is invalid
   * @throws {ConflictError} If conflicts are detected
   * 
   * @example
   * const { timetable, conflicts } = await timetableService.createTimetable({
   *   sectionId: 'section123',
   *   dayOfWeek: 1,
   *   startTime: '09:00',
   *   endTime: '10:30',
   *   roomId: 'room456',
   *   facultyId: 'faculty789',
   *   semester: '2024-Fall'
   * });
   */
  async createTimetable(timetableData: CreateTimetableDTO): Promise<{ timetable: Timetable; conflicts: TimetableConflict[] }> {
    try {
      // Validate required fields
      if (!timetableData.sectionId || !timetableData.dayOfWeek || !timetableData.startTime || !timetableData.endTime || !timetableData.semester) {
        throw new ValidationError('Section ID, day of week, start time, end time, and semester are required');
      }

      // Validate day of week (1=Monday, 7=Sunday)
      if (timetableData.dayOfWeek < 1 || timetableData.dayOfWeek > 7) {
        throw new ValidationError('Day of week must be between 1 (Monday) and 7 (Sunday)');
      }

      // Validate time format and logic
      if (timetableData.startTime >= timetableData.endTime) {
        throw new ValidationError('End time must be after start time');
      }

      // Check for conflicts (room and faculty double-booking)
      const conflicts: TimetableConflict[] = [];

      // Check time conflicts for the same day and semester
      const timeConflicts = await this.timetableRepository.checkTimeConflict(
        timetableData.dayOfWeek,
        timetableData.startTime,
        timetableData.endTime,
        timetableData.semester
      );

      // Check for room conflicts
      for (const conflict of timeConflicts) {
        if (timetableData.roomId && conflict.roomId === timetableData.roomId) {
          conflicts.push({
            conflictType: 'room',
            conflictingItem: conflict,
            message: `Room is already booked at this time`,
          });
        }
        // Check for faculty conflicts
        if (timetableData.facultyId && conflict.facultyId === timetableData.facultyId) {
          conflicts.push({
            conflictType: 'faculty',
            conflictingItem: conflict,
            message: `Faculty is already assigned at this time`,
          });
        }
      }

      // If there are conflicts, throw error (prevent creation)
      if (conflicts.length > 0) {
        throw new ConflictError(`Timetable conflicts detected: ${conflicts.map(c => c.message).join(', ')}`);
      }

      // No conflicts - create the timetable
      const timetable = await this.timetableRepository.createTimetable(timetableData);
      return { timetable, conflicts: [] };
    } catch (error) {
      logger.error('Error creating timetable:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create timetable');
    }
  }

  /**
   * Update a timetable entry
   * 
   * Updates an existing timetable entry with conflict detection.
   * Checks for conflicts if time, day, room, or faculty is being updated.
   * 
   * @param {string} id - Timetable ID
   * @param {UpdateTimetableDTO} timetableData - Partial timetable data to update
   * @returns {Promise<Timetable>} Updated timetable
   * @throws {NotFoundError} If timetable not found
   * @throws {ConflictError} If conflicts are detected
   * 
   * @example
   * const timetable = await timetableService.updateTimetable('timetable123', {
   *   startTime: '10:00',
   *   endTime: '11:30',
   *   roomId: 'room789'
   * });
   */
  async updateTimetable(id: string, timetableData: UpdateTimetableDTO): Promise<Timetable> {
    try {
      const existingTimetable = await this.timetableRepository.findTimetableById(id);
      if (!existingTimetable) {
        throw new NotFoundError('Timetable');
      }

      // If time is being updated, check for conflicts
      if (timetableData.startTime || timetableData.endTime || timetableData.dayOfWeek) {
        const dayOfWeek = timetableData.dayOfWeek ?? existingTimetable.dayOfWeek;
        const startTime = timetableData.startTime ?? existingTimetable.startTime;
        const endTime = timetableData.endTime ?? existingTimetable.endTime;

        // Check for conflicts (excluding current timetable)
        const timeConflicts = await this.timetableRepository.checkTimeConflict(
          dayOfWeek,
          startTime,
          endTime,
          existingTimetable.semester,
          id // Exclude current timetable from conflict check
        );

        const roomId = timetableData.roomId ?? existingTimetable.roomId;
        const facultyId = timetableData.facultyId ?? existingTimetable.facultyId;

        // Check for room conflicts
        for (const conflict of timeConflicts) {
          if (roomId && conflict.roomId === roomId) {
            throw new ConflictError('Room is already booked at this time');
          }
          // Check for faculty conflicts
          if (facultyId && conflict.facultyId === facultyId) {
            throw new ConflictError('Faculty is already assigned at this time');
          }
        }
      }

      return await this.timetableRepository.updateTimetable(id, timetableData);
    } catch (error) {
      logger.error('Error updating timetable:', error);
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to update timetable');
    }
  }

  /**
   * Delete a timetable entry
   * 
   * Deletes a timetable entry from the system.
   * 
   * @param {string} id - Timetable ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} If timetable not found
   */
  async deleteTimetable(id: string): Promise<void> {
    try {
      const existingTimetable = await this.timetableRepository.findTimetableById(id);
      if (!existingTimetable) {
        throw new NotFoundError('Timetable');
      }

      await this.timetableRepository.deleteTimetable(id);
    } catch (error) {
      logger.error('Error deleting timetable:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to delete timetable');
    }
  }

  // ==================== Rooms ====================

  /**
   * Get all rooms with pagination and filters
   * 
   * Retrieves rooms with optional filtering by building, room type,
   * and active status. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of rooms to return
   * @param {number} [offset=0] - Number of rooms to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.buildingId] - Filter by building ID
   * @param {string} [filters.roomType] - Filter by room type
   * @param {boolean} [filters.isActive] - Filter by active status
   * @returns {Promise<{rooms: Room[], total: number}>} Rooms and total count
   * 
   * @example
   * const { rooms, total } = await timetableService.getAllRooms(20, 0, {
   *   buildingId: 'building123',
   *   roomType: 'classroom',
   *   isActive: true
   * });
   */
  async getAllRooms(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      buildingId?: string;
      roomType?: string;
      isActive?: boolean;
    }
  ): Promise<{
    rooms: Room[];
    total: number;
  }> {
    try {
      const allRooms = await this.timetableRepository.findAllRooms(limit * 10, 0, filters);
      const paginatedRooms = allRooms.slice(offset, offset + limit);

      return {
        rooms: paginatedRooms,
        total: allRooms.length,
      };
    } catch (error) {
      logger.error('Error getting all rooms:', error);
      throw new Error('Failed to fetch rooms');
    }
  }

  /**
   * Get room by ID
   * 
   * Retrieves a specific room by its ID.
   * 
   * @param {string} id - Room ID
   * @returns {Promise<Room>} Room object
   * @throws {NotFoundError} If room not found
   */
  async getRoomById(id: string): Promise<Room> {
    try {
      const room = await this.timetableRepository.findRoomById(id);
      if (!room) {
        throw new NotFoundError('Room');
      }
      return room;
    } catch (error) {
      logger.error('Error getting room by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch room');
    }
  }

  /**
   * Create a new room
   * 
   * Creates a new room with validation.
   * 
   * @param {CreateRoomDTO} roomData - Room creation data
   * @returns {Promise<Room>} Created room
   * @throws {ValidationError} If room data is invalid
   * 
   * @example
   * const room = await timetableService.createRoom({
   *   roomNumber: '101',
   *   buildingId: 'building123',
   *   roomType: 'classroom',
   *   capacity: 30,
   *   facilities: ['projector', 'whiteboard']
   * });
   */
  async createRoom(roomData: CreateRoomDTO): Promise<Room> {
    try {
      if (!roomData.roomNumber || !roomData.roomType) {
        throw new ValidationError('Room number and room type are required');
      }

      if (roomData.capacity && roomData.capacity <= 0) {
        throw new ValidationError('Capacity must be greater than 0');
      }

      return await this.timetableRepository.createRoom(roomData);
    } catch (error) {
      logger.error('Error creating room:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create room');
    }
  }

  /**
   * Update a room
   * 
   * Updates an existing room's information.
   * 
   * @param {string} id - Room ID
   * @param {UpdateRoomDTO} roomData - Partial room data to update
   * @returns {Promise<Room>} Updated room
   * @throws {NotFoundError} If room not found
   * @throws {ValidationError} If capacity is invalid
   */
  async updateRoom(id: string, roomData: UpdateRoomDTO): Promise<Room> {
    try {
      const existingRoom = await this.timetableRepository.findRoomById(id);
      if (!existingRoom) {
        throw new NotFoundError('Room');
      }

      if (roomData.capacity !== undefined && roomData.capacity <= 0) {
        throw new ValidationError('Capacity must be greater than 0');
      }

      return await this.timetableRepository.updateRoom(id, roomData);
    } catch (error) {
      logger.error('Error updating room:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to update room');
    }
  }

  // ==================== Buildings ====================

  /**
   * Get all buildings with pagination
   * 
   * Retrieves all buildings with pagination.
   * 
   * @param {number} [limit=50] - Maximum number of buildings to return
   * @param {number} [offset=0] - Number of buildings to skip
   * @returns {Promise<{buildings: Building[], total: number}>} Buildings and total count
   * 
   * @example
   * const { buildings, total } = await timetableService.getAllBuildings(20, 0);
   */
  async getAllBuildings(limit: number = 50, offset: number = 0): Promise<{
    buildings: Building[];
    total: number;
  }> {
    try {
      const allBuildings = await this.timetableRepository.findAllBuildings(limit * 10, 0);
      const paginatedBuildings = allBuildings.slice(offset, offset + limit);

      return {
        buildings: paginatedBuildings,
        total: allBuildings.length,
      };
    } catch (error) {
      logger.error('Error getting all buildings:', error);
      throw new Error('Failed to fetch buildings');
    }
  }

  /**
   * Get building by ID
   * 
   * Retrieves a specific building by its ID.
   * 
   * @param {string} id - Building ID
   * @returns {Promise<Building>} Building object
   * @throws {NotFoundError} If building not found
   */
  async getBuildingById(id: string): Promise<Building> {
    try {
      const building = await this.timetableRepository.findBuildingById(id);
      if (!building) {
        throw new NotFoundError('Building');
      }
      return building;
    } catch (error) {
      logger.error('Error getting building by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch building');
    }
  }

  /**
   * Create a new building
   * 
   * Creates a new building with validation.
   * 
   * @param {CreateBuildingDTO} buildingData - Building creation data
   * @returns {Promise<Building>} Created building
   * @throws {ValidationError} If building data is invalid
   * 
   * @example
   * const building = await timetableService.createBuilding({
   *   name: 'Science Building',
   *   code: 'SB',
   *   campusId: 'campus123',
   *   floors: 5,
   *   address: '123 Science Street'
   * });
   */
  async createBuilding(buildingData: CreateBuildingDTO): Promise<Building> {
    try {
      if (!buildingData.name || !buildingData.code) {
        throw new ValidationError('Building name and code are required');
      }

      return await this.timetableRepository.createBuilding(buildingData);
    } catch (error) {
      logger.error('Error creating building:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create building');
    }
  }
}
