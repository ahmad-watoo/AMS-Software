/**
 * Timetable Routes
 * 
 * Defines all timetable management API endpoints.
 * 
 * Routes:
 * - Timetables: CRUD operations for class schedules
 * - Rooms: CRUD operations for rooms
 * - Buildings: CRUD operations for buildings
 * 
 * All routes require authentication.
 * Create, update, and delete routes require specific permissions.
 * 
 * @module routes/timetable.routes
 */

import { Router } from 'express';
import { TimetableController } from '@/controllers/timetable.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const timetableController = new TimetableController();

// All timetable routes require authentication
router.use(authenticate);

// ==================== Timetables ====================

/**
 * @route   GET /api/v1/timetable/timetables
 * @desc    Get all timetables with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [sectionId] - Filter by section ID
 * @query  {string} [facultyId] - Filter by faculty ID
 * @query  {string} [semester] - Filter by semester
 * @query  {number} [dayOfWeek] - Filter by day of week (1-7)
 * @query  {string} [roomId] - Filter by room ID
 * @returns {Object} Timetables array and pagination info
 */
router.get('/timetables', timetableController.getAllTimetables);

/**
 * @route   GET /api/v1/timetable/timetables/:id
 * @desc    Get timetable by ID
 * @access  Private
 * @param  {string} id - Timetable ID
 * @returns {Timetable} Timetable object
 */
router.get('/timetables/:id', timetableController.getTimetableById);

/**
 * @route   POST /api/v1/timetable/timetables
 * @desc    Create a new timetable entry (with conflict detection)
 * @access  Private (Requires timetable.create permission)
 * @body   {CreateTimetableDTO} Timetable creation data
 * @returns {Object} Created timetable and conflicts array
 */
router.post(
  '/timetables',
  requirePermission('timetable', 'create'),
  timetableController.createTimetable
);

/**
 * @route   PUT /api/v1/timetable/timetables/:id
 * @desc    Update a timetable entry (with conflict detection)
 * @access  Private (Requires timetable.update permission)
 * @param  {string} id - Timetable ID
 * @body   {UpdateTimetableDTO} Partial timetable data to update
 * @returns {Timetable} Updated timetable
 */
router.put(
  '/timetables/:id',
  requirePermission('timetable', 'update'),
  timetableController.updateTimetable
);

/**
 * @route   DELETE /api/v1/timetable/timetables/:id
 * @desc    Delete a timetable entry
 * @access  Private (Requires timetable.delete permission)
 * @param  {string} id - Timetable ID
 * @returns {message: "Timetable deleted successfully"}
 */
router.delete(
  '/timetables/:id',
  requirePermission('timetable', 'delete'),
  timetableController.deleteTimetable
);

// ==================== Rooms ====================

/**
 * @route   GET /api/v1/timetable/rooms
 * @desc    Get all rooms with pagination and filters
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @query  {string} [buildingId] - Filter by building ID
 * @query  {string} [roomType] - Filter by room type
 * @query  {boolean} [isActive] - Filter by active status
 * @returns {Object} Rooms array and pagination info
 */
router.get('/rooms', timetableController.getAllRooms);

/**
 * @route   GET /api/v1/timetable/rooms/:id
 * @desc    Get room by ID
 * @access  Private
 * @param  {string} id - Room ID
 * @returns {Room} Room object
 */
router.get('/rooms/:id', timetableController.getRoomById);

/**
 * @route   POST /api/v1/timetable/rooms
 * @desc    Create a new room
 * @access  Private (Requires timetable.create permission)
 * @body   {CreateRoomDTO} Room creation data
 * @returns {Room} Created room
 */
router.post(
  '/rooms',
  requirePermission('timetable', 'create'),
  timetableController.createRoom
);

/**
 * @route   PUT /api/v1/timetable/rooms/:id
 * @desc    Update a room
 * @access  Private (Requires timetable.update permission)
 * @param  {string} id - Room ID
 * @body   {UpdateRoomDTO} Partial room data to update
 * @returns {Room} Updated room
 */
router.put(
  '/rooms/:id',
  requirePermission('timetable', 'update'),
  timetableController.updateRoom
);

// ==================== Buildings ====================

/**
 * @route   GET /api/v1/timetable/buildings
 * @desc    Get all buildings with pagination
 * @access  Private
 * @query  {number} [page=1] - Page number
 * @query  {number} [limit=20] - Items per page
 * @returns {Object} Buildings array and pagination info
 */
router.get('/buildings', timetableController.getAllBuildings);

/**
 * @route   GET /api/v1/timetable/buildings/:id
 * @desc    Get building by ID
 * @access  Private
 * @param  {string} id - Building ID
 * @returns {Building} Building object
 */
router.get('/buildings/:id', timetableController.getBuildingById);

/**
 * @route   POST /api/v1/timetable/buildings
 * @desc    Create a new building
 * @access  Private (Requires timetable.create permission)
 * @body   {CreateBuildingDTO} Building creation data
 * @returns {Building} Created building
 */
router.post(
  '/buildings',
  requirePermission('timetable', 'create'),
  timetableController.createBuilding
);

export default router;
