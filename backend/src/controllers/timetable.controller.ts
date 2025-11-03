import { Request, Response, NextFunction } from 'express';
import { TimetableService } from '@/services/timetable.service';
import {
  CreateTimetableDTO,
  UpdateTimetableDTO,
  CreateRoomDTO,
  UpdateRoomDTO,
  CreateBuildingDTO,
} from '@/models/Timetable.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class TimetableController {
  private timetableService: TimetableService;

  constructor() {
    this.timetableService = new TimetableService();
  }

  // ==================== Timetables ====================

  getAllTimetables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        sectionId: req.query.sectionId as string,
        facultyId: req.query.facultyId as string,
        semester: req.query.semester as string,
        dayOfWeek: req.query.dayOfWeek ? parseInt(req.query.dayOfWeek as string) : undefined,
        roomId: req.query.roomId as string,
      };

      const result = await this.timetableService.getAllTimetables(limit, offset, filters);

      sendSuccess(res, {
        timetables: result.timetables,
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
      logger.error('Get all timetables error:', error);
      next(error);
    }
  };

  getTimetableById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const timetable = await this.timetableService.getTimetableById(id);
      sendSuccess(res, timetable);
    } catch (error) {
      logger.error('Get timetable by ID error:', error);
      next(error);
    }
  };

  createTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const timetableData: CreateTimetableDTO = {
        sectionId: req.body.sectionId,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        roomId: req.body.roomId,
        facultyId: req.body.facultyId,
        semester: req.body.semester,
      };

      if (!timetableData.sectionId || !timetableData.dayOfWeek || !timetableData.startTime || !timetableData.endTime || !timetableData.semester) {
        throw new ValidationError('Section ID, day of week, start time, end time, and semester are required');
      }

      const result = await this.timetableService.createTimetable(timetableData);
      sendSuccess(res, result, 'Timetable created successfully', 201);
    } catch (error) {
      logger.error('Create timetable error:', error);
      next(error);
    }
  };

  updateTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const timetableData: UpdateTimetableDTO = {
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        roomId: req.body.roomId,
        facultyId: req.body.facultyId,
      };

      const timetable = await this.timetableService.updateTimetable(id, timetableData);
      sendSuccess(res, timetable, 'Timetable updated successfully');
    } catch (error) {
      logger.error('Update timetable error:', error);
      next(error);
    }
  };

  deleteTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.timetableService.deleteTimetable(id);
      sendSuccess(res, null, 'Timetable deleted successfully');
    } catch (error) {
      logger.error('Delete timetable error:', error);
      next(error);
    }
  };

  // ==================== Rooms ====================

  getAllRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const filters = {
        buildingId: req.query.buildingId as string,
        roomType: req.query.roomType as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      };

      const result = await this.timetableService.getAllRooms(limit, offset, filters);

      sendSuccess(res, {
        rooms: result.rooms,
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
      logger.error('Get all rooms error:', error);
      next(error);
    }
  };

  getRoomById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const room = await this.timetableService.getRoomById(id);
      sendSuccess(res, room);
    } catch (error) {
      logger.error('Get room by ID error:', error);
      next(error);
    }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomData: CreateRoomDTO = {
        roomNumber: req.body.roomNumber,
        buildingId: req.body.buildingId,
        roomType: req.body.roomType,
        capacity: req.body.capacity,
        facilities: req.body.facilities,
      };

      if (!roomData.roomNumber || !roomData.roomType) {
        throw new ValidationError('Room number and room type are required');
      }

      const room = await this.timetableService.createRoom(roomData);
      sendSuccess(res, room, 'Room created successfully', 201);
    } catch (error) {
      logger.error('Create room error:', error);
      next(error);
    }
  };

  updateRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const roomData: UpdateRoomDTO = {
        roomNumber: req.body.roomNumber,
        buildingId: req.body.buildingId,
        roomType: req.body.roomType,
        capacity: req.body.capacity,
        facilities: req.body.facilities,
        isActive: req.body.isActive,
      };

      const room = await this.timetableService.updateRoom(id, roomData);
      sendSuccess(res, room, 'Room updated successfully');
    } catch (error) {
      logger.error('Update room error:', error);
      next(error);
    }
  };

  // ==================== Buildings ====================

  getAllBuildings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = await this.timetableService.getAllBuildings(limit, offset);

      sendSuccess(res, {
        buildings: result.buildings,
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
      logger.error('Get all buildings error:', error);
      next(error);
    }
  };

  getBuildingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const building = await this.timetableService.getBuildingById(id);
      sendSuccess(res, building);
    } catch (error) {
      logger.error('Get building by ID error:', error);
      next(error);
    }
  };

  createBuilding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buildingData: CreateBuildingDTO = {
        name: req.body.name,
        code: req.body.code,
        campusId: req.body.campusId,
        floors: req.body.floors,
        address: req.body.address,
      };

      if (!buildingData.name || !buildingData.code) {
        throw new ValidationError('Building name and code are required');
      }

      const building = await this.timetableService.createBuilding(buildingData);
      sendSuccess(res, building, 'Building created successfully', 201);
    } catch (error) {
      logger.error('Create building error:', error);
      next(error);
    }
  };
}

