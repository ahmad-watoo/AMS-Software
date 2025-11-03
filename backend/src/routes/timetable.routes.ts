import { Router } from 'express';
import { TimetableController } from '@/controllers/timetable.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/rbac.middleware';

const router = Router();
const timetableController = new TimetableController();

// All timetable routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/timetable/timetables
 * @desc    Get all timetables (with pagination and filters)
 * @access  Private
 */
router.get('/timetables', timetableController.getAllTimetables);

/**
 * @route   GET /api/v1/timetable/timetables/:id
 * @desc    Get timetable by ID
 * @access  Private
 */
router.get('/timetables/:id', timetableController.getTimetableById);

/**
 * @route   POST /api/v1/timetable/timetables
 * @desc    Create a new timetable entry
 * @access  Private (Requires timetable.create permission)
 */
router.post(
  '/timetables',
  requirePermission('timetable', 'create'),
  timetableController.createTimetable
);

/**
 * @route   PUT /api/v1/timetable/timetables/:id
 * @desc    Update a timetable entry
 * @access  Private (Requires timetable.update permission)
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
 */
router.delete(
  '/timetables/:id',
  requirePermission('timetable', 'delete'),
  timetableController.deleteTimetable
);

/**
 * @route   GET /api/v1/timetable/rooms
 * @desc    Get all rooms (with pagination and filters)
 * @access  Private
 */
router.get('/rooms', timetableController.getAllRooms);

/**
 * @route   GET /api/v1/timetable/rooms/:id
 * @desc    Get room by ID
 * @access  Private
 */
router.get('/rooms/:id', timetableController.getRoomById);

/**
 * @route   POST /api/v1/timetable/rooms
 * @desc    Create a new room
 * @access  Private (Requires timetable.create permission)
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
 */
router.put(
  '/rooms/:id',
  requirePermission('timetable', 'update'),
  timetableController.updateRoom
);

/**
 * @route   GET /api/v1/timetable/buildings
 * @desc    Get all buildings (with pagination)
 * @access  Private
 */
router.get('/buildings', timetableController.getAllBuildings);

/**
 * @route   GET /api/v1/timetable/buildings/:id
 * @desc    Get building by ID
 * @access  Private
 */
router.get('/buildings/:id', timetableController.getBuildingById);

/**
 * @route   POST /api/v1/timetable/buildings
 * @desc    Create a new building
 * @access  Private (Requires timetable.create permission)
 */
router.post(
  '/buildings',
  requirePermission('timetable', 'create'),
  timetableController.createBuilding
);

export default router;

