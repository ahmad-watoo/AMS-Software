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

  async createTimetable(timetableData: CreateTimetableDTO): Promise<{ timetable: Timetable; conflicts: TimetableConflict[] }> {
    try {
      // Validate required fields
      if (!timetableData.sectionId || !timetableData.dayOfWeek || !timetableData.startTime || !timetableData.endTime || !timetableData.semester) {
        throw new ValidationError('Section ID, day of week, start time, end time, and semester are required');
      }

      // Validate day of week
      if (timetableData.dayOfWeek < 1 || timetableData.dayOfWeek > 7) {
        throw new ValidationError('Day of week must be between 1 (Monday) and 7 (Sunday)');
      }

      // Validate time format and logic
      if (timetableData.startTime >= timetableData.endTime) {
        throw new ValidationError('End time must be after start time');
      }

      // Check for conflicts
      const conflicts: TimetableConflict[] = [];

      // Check time conflicts
      const timeConflicts = await this.timetableRepository.checkTimeConflict(
        timetableData.dayOfWeek,
        timetableData.startTime,
        timetableData.endTime,
        timetableData.semester
      );

      for (const conflict of timeConflicts) {
        if (timetableData.roomId && conflict.roomId === timetableData.roomId) {
          conflicts.push({
            conflictType: 'room',
            conflictingItem: conflict,
            message: `Room is already booked at this time`,
          });
        }
        if (timetableData.facultyId && conflict.facultyId === timetableData.facultyId) {
          conflicts.push({
            conflictType: 'faculty',
            conflictingItem: conflict,
            message: `Faculty is already assigned at this time`,
          });
        }
      }

      // If there are conflicts, throw error
      if (conflicts.length > 0) {
        throw new ConflictError(`Timetable conflicts detected: ${conflicts.map(c => c.message).join(', ')}`);
      }

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

        const timeConflicts = await this.timetableRepository.checkTimeConflict(
          dayOfWeek,
          startTime,
          endTime,
          existingTimetable.semester,
          id
        );

        const roomId = timetableData.roomId ?? existingTimetable.roomId;
        const facultyId = timetableData.facultyId ?? existingTimetable.facultyId;

        for (const conflict of timeConflicts) {
          if (roomId && conflict.roomId === roomId) {
            throw new ConflictError('Room is already booked at this time');
          }
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

