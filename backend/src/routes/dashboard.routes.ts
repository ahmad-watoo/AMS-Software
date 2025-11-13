/**
 * Dashboard Routes
 * 
 * Defines all routes for dashboard-related operations.
 * All routes require authentication.
 * 
 * Routes:
 * - GET /stats - Get dashboard statistics
 * - GET /activities - Get recent activities
 * - GET /events - Get upcoming events
 * 
 * @module routes/dashboard.routes
 */

import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get comprehensive dashboard statistics from all modules
 * @access  Private (requires authentication)
 * @returns {Object} Dashboard statistics including totals for students, faculty, payments, etc.
 */
router.get('/stats', authenticate, dashboardController.getStats);

/**
 * @route   GET /api/dashboard/activities
 * @desc    Get recent activities across all modules
 * @access  Private (requires authentication)
 * @query   {number} limit - Maximum number of activities to return (default: 10)
 * @returns {Array} Array of recent activities with formatted time stamps
 */
router.get('/activities', authenticate, dashboardController.getRecentActivities);

/**
 * @route   GET /api/dashboard/events
 * @desc    Get upcoming events from administration module
 * @access  Private (requires authentication)
 * @query   {number} limit - Maximum number of events to return (default: 10)
 * @returns {Array} Array of upcoming events sorted by date
 */
router.get('/events', authenticate, dashboardController.getUpcomingEvents);

export default router;

