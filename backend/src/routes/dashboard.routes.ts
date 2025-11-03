import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', authenticate, dashboardController.getStats);

/**
 * @route   GET /api/dashboard/activities
 * @desc    Get recent activities
 * @access  Private
 */
router.get('/activities', authenticate, dashboardController.getRecentActivities);

/**
 * @route   GET /api/dashboard/events
 * @desc    Get upcoming events
 * @access  Private
 */
router.get('/events', authenticate, dashboardController.getUpcomingEvents);

export default router;

