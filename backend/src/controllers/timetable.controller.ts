/**
 * Timetable Controller
 * 
 * Handles HTTP requests for timetable management endpoints.
 * Manages timetables, rooms, and buildings.
 * Validates input, calls service layer, and formats responses.
 * 
 * @module controllers/timetable.controller
 */

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

  /**
   * Get All Timetables Endpoint Handler
   * 
   * Retrieves all timetables with pagination and optional filters.
   * 
   * @route GET /api/v1/timetable/timetables
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [sectionId] - Filter by section ID
   * @query {string} [facultyId] - Filter by faculty ID
   * @query {string} [semester] - Filter by semester
   * @query {number} [dayOfWeek] - Filter by day of week (1-7)
   * @query {string} [roomId] - Filter by room ID
   * @returns {Object} Timetables array and pagination info
   * 
   * @example
   * GET /api/v1/timetable/timetables?page=1&limit=20&sectionId=section123&semester=2024-Fall
   */
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

  /**
   * Get Timetable By ID Endpoint Handler
   * 
   * Retrieves a specific timetable by ID.
   * 
   * @route GET /api/v1/timetable/timetables/:id
   * @access Private
   * @param {string} id - Timetable ID
   * @returns {Timetable} Timetable object
   */
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

  /**
   * Create Timetable Endpoint Handler
   * 
   * Creates a new timetable entry with conflict detection.
   * 
   * @route POST /api/v1/timetable/timetables
   * @access Private (Requires timetable.create permission)
   * @body {CreateTimetableDTO} Timetable creation data
   * @returns {Object} Created timetable and conflicts array
   * 
   * @example
   * POST /api/v1/timetable/timetables
   * Body: {
   *   sectionId: "section123",
   *   dayOfWeek: 1,
   *   startTime: "09:00",
   *   endTime: "10:30",
   *   roomId: "room456",
   *   facultyId: "faculty789",
   *   semester: "2024-Fall"
   * }
   */
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

  /**
   * Update Timetable Endpoint Handler
   * 
   * Updates an existing timetable entry with conflict detection.
   * 
   * @route PUT /api/v1/timetable/timetables/:id
   * @access Private (Requires timetable.update permission)
   * @param {string} id - Timetable ID
   * @body {UpdateTimetableDTO} Partial timetable data to update
   * @returns {Timetable} Updated timetable
   * 
   * @example
   * PUT /api/v1/timetable/timetables/timetable123
   * Body: {
   *   startTime: "10:00",
   *   endTime: "11:30",
   *   roomId: "room789"
   * }
   */
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

  /**
   * Delete Timetable Endpoint Handler
   * 
   * Deletes a timetable entry.
   * 
   * @route DELETE /api/v1/timetable/timetables/:id
   * @access Private (Requires timetable.delete permission)
   * @param {string} id - Timetable ID
   * @returns {message: "Timetable deleted successfully"}
   */
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

  /**
   * Get All Rooms Endpoint Handler
   * 
   * Retrieves all rooms with pagination and optional filters.
   * 
   * @route GET /api/v1/timetable/rooms
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @query {string} [buildingId] - Filter by building ID
   * @query {string} [roomType] - Filter by room type
   * @query {boolean} [isActive] - Filter by active status
   * @returns {Object} Rooms array and pagination info
   * 
   * @example
   * GET /api/v1/timetable/rooms?page=1&limit=20&buildingId=building123&roomType=classroom
   */
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

  /**
   * Get Room By ID Endpoint Handler
   * 
   * Retrieves a specific room by ID.
   * 
   * @route GET /api/v1/timetable/rooms/:id
   * @access Private
   * @param {string} id - Room ID
   * @returns {Room} Room object
   */
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

  /**
   * Create Room Endpoint Handler
   * 
   * Creates a new room.
   * 
   * @route POST /api/v1/timetable/rooms
   * @access Private (Requires timetable.create permission)
   * @body {CreateRoomDTO} Room creation data
   * @returns {Room} Created room
   * 
   * @example
   * POST /api/v1/timetable/rooms
   * Body: {
   *   roomNumber: "101",
   *   buildingId: "building123",
   *   roomType: "classroom",
   *   capacity: 30,
   *   facilities: ["projector", "whiteboard"]
   * }
   */
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

  /**
   * Update Room Endpoint Handler
   * 
   * Updates an existing room.
   * 
   * @route PUT /api/v1/timetable/rooms/:id
   * @access Private (Requires timetable.update permission)
   * @param {string} id - Room ID
   * @body {UpdateRoomDTO} Partial room data to update
   * @returns {Room} Updated room
   * 
   * @example
   * PUT /api/v1/timetable/rooms/room123
   * Body: {
   *   capacity: 35,
   *   facilities: ["projector", "whiteboard", "smartboard"]
   * }
   */
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

  /**
   * Get All Buildings Endpoint Handler
   * 
   * Retrieves all buildings with pagination.
   * 
   * @route GET /api/v1/timetable/buildings
   * @access Private
   * @query {number} [page=1] - Page number
   * @query {number} [limit=20] - Items per page
   * @returns {Object} Buildings array and pagination info
   */
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

  /**
   * Get Building By ID Endpoint Handler
   * 
   * Retrieves a specific building by ID.
   * 
   * @route GET /api/v1/timetable/buildings/:id
   * @access Private
   * @param {string} id - Building ID
   * @returns {Building} Building object
   */
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

  /**
   * Create Building Endpoint Handler
   * 
   * Creates a new building.
   * 
   * @route POST /api/v1/timetable/buildings
   * @access Private (Requires timetable.create permission)
   * @body {CreateBuildingDTO} Building creation data
   * @returns {Building} Created building
   * 
   * @example
   * POST /api/v1/timetable/buildings
   * Body: {
   *   name: "Science Building",
   *   code: "SB",
   *   campusId: "campus123",
   *   floors: 5,
   *   address: "123 Science Street"
   * }
   */
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
