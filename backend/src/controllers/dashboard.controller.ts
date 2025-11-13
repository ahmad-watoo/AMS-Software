/**
 * Dashboard Controller
 * 
 * Handles HTTP requests for dashboard-related operations.
 * Provides endpoints for:
 * - Dashboard statistics
 * - Recent activities
 * - Upcoming events
 * 
 * All endpoints require authentication.
 * 
 * @module controllers/dashboard.controller
 */

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import dashboardService from '../services/dashboard.service';
import { logger } from '@/config/logger';

/**
 * Dashboard Controller Class
 * 
 * Handles all dashboard-related HTTP requests.
 */
class DashboardController {
  /**
   * Get dashboard statistics
   * 
   * Retrieves comprehensive statistics aggregated from all modules.
   * 
   * @route GET /api/dashboard/stats
   * @access Private
   * @returns {Promise<void>}
   * 
   * @example
   * GET /api/dashboard/stats
   * Response: {
   *   success: true,
   *   data: {
   *     totalStudents: 1250,
   *     totalFaculty: 45,
   *     totalPayments: 500000,
   *     ...
   *   }
   * }
   */
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await dashboardService.getDashboardStats();
      return ResponseUtil.success(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error: any) {
      logger.error('Failed to get dashboard stats', { error: error.message });
      return ResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * Get recent activities
   * 
   * Retrieves recent activities from all modules.
   * Supports optional limit query parameter.
   * 
   * @route GET /api/dashboard/activities
   * @access Private
   * @param {Request} req - Express request object
   * @param {number} [req.query.limit] - Maximum number of activities (default: 10)
   * @returns {Promise<void>}
   * 
   * @example
   * GET /api/dashboard/activities?limit=5
   * Response: {
   *   success: true,
   *   data: [
   *     {
   *       id: "...",
   *       type: "student",
   *       action: "New student enrolled: STU-001",
   *       time: "2 hours ago",
   *       status: "success"
   *     },
   *     ...
   *   ]
   * }
   */
  async getRecentActivities(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await dashboardService.getRecentActivities(limit);
      return ResponseUtil.success(res, activities, 'Recent activities retrieved successfully');
    } catch (error: any) {
      logger.error('Failed to get recent activities', { error: error.message });
      return ResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * Get upcoming events
   * 
   * Retrieves upcoming events from the administration module.
   * Supports optional limit query parameter.
   * 
   * @route GET /api/dashboard/events
   * @access Private
   * @param {Request} req - Express request object
   * @param {number} [req.query.limit] - Maximum number of events (default: 10)
   * @returns {Promise<void>}
   * 
   * @example
   * GET /api/dashboard/events?limit=5
   * Response: {
   *   success: true,
   *   data: [
   *     {
   *       id: "...",
   *       title: "Annual Sports Day",
   *       type: "sports",
   *       date: "2025-02-15",
   *       description: "Annual sports competition"
   *     },
   *     ...
   *   ]
   * }
   */
  async getUpcomingEvents(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await dashboardService.getUpcomingEvents(limit);
      return ResponseUtil.success(res, events, 'Upcoming events retrieved successfully');
    } catch (error: any) {
      logger.error('Failed to get upcoming events', { error: error.message });
      return ResponseUtil.error(res, error.message, 500);
    }
  }
}

export default new DashboardController();

