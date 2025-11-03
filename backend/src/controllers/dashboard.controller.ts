import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import dashboardService from '../services/dashboard.service';

class DashboardController {
  /**
   * Get dashboard statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return ResponseUtil.success(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await dashboardService.getRecentActivities(limit);
      return ResponseUtil.success(res, activities, 'Recent activities retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await dashboardService.getUpcomingEvents(limit);
      return ResponseUtil.success(res, events, 'Upcoming events retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 500);
    }
  }
}

export default new DashboardController();

