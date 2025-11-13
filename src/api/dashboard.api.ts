/**
 * Dashboard API Client
 * 
 * Frontend API client for dashboard-related endpoints.
 * Provides typed functions for all dashboard operations including:
 * - Dashboard statistics retrieval
 * - Recent activities fetching
 * - Upcoming events retrieval
 * 
 * @module api/dashboard.api
 */

import client from './client';

/**
 * Dashboard Statistics Interface
 * 
 * Comprehensive statistics aggregated from all modules.
 * 
 * @interface DashboardStats
 */
export interface DashboardStats {
  /** Total number of enrolled students */
  totalStudents: number;
  /** Total number of faculty members */
  totalFaculty: number;
  /** Total payment amount (in PKR) */
  totalPayments: number;
  /** Number of pending admission applications */
  pendingApplications: number;
  /** Number of upcoming examinations */
  upcomingExams: number;
  /** Number of active academic programs */
  activePrograms: number;
  /** Total number of books in library */
  totalBooks: number;
  /** Number of overdue book borrowings */
  overdueBooks: number;
  /** Total number of employees */
  totalEmployees: number;
  /** Number of pending leave requests */
  pendingLeaveRequests: number;
}

/**
 * Recent Activity Interface
 * 
 * Represents a recent activity/event from any module.
 * 
 * @interface RecentActivity
 */
export interface RecentActivity {
  /** Activity unique identifier */
  id: string;
  /** Activity type (student, payment, admission, exam, etc.) */
  type: string;
  /** Human-readable activity description */
  action: string;
  /** Formatted time string (e.g., "2 hours ago") */
  time: string;
  /** Activity status (success, warning, info, error) */
  status: string;
  /** Optional user ID associated with the activity */
  userId?: string;
  /** Optional target ID (e.g., student ID, payment ID) */
  targetId?: string;
}

/**
 * Upcoming Event Interface
 * 
 * Represents an upcoming event from the administration module.
 * 
 * @interface UpcomingEvent
 */
export interface UpcomingEvent {
  /** Event unique identifier */
  id: string;
  /** Event title */
  title: string;
  /** Event type (academic, cultural, sports, etc.) */
  type: string;
  /** Event date (ISO format) */
  date: string;
  /** Optional event description */
  description?: string;
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Dashboard API Client Object
 * 
 * Provides methods to interact with dashboard endpoints.
 */
const dashboardAPI = {
  /**
   * Get dashboard statistics
   * 
   * Retrieves comprehensive statistics aggregated from all modules.
   * 
   * @returns {Promise<DashboardStats>} Dashboard statistics
   * @throws {Error} If the API request fails
   * 
   * @example
   * const stats = await dashboardAPI.getStats();
   * console.log(`Total students: ${stats.totalStudents}`);
   * console.log(`Upcoming exams: ${stats.upcomingExams}`);
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await client.get<ApiResponse<DashboardStats>>('/api/dashboard/stats');
    return response.data.data;
  },

  /**
   * Get recent activities
   * 
   * Retrieves recent activities from all modules with formatted time stamps.
   * 
   * @param {number} [limit=10] - Maximum number of activities to return
   * @returns {Promise<RecentActivity[]>} Array of recent activities
   * @throws {Error} If the API request fails
   * 
   * @example
   * const activities = await dashboardAPI.getRecentActivities(5);
   * activities.forEach(activity => {
   *   console.log(`${activity.action} - ${activity.time}`);
   * });
   */
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await client.get<ApiResponse<RecentActivity[]>>(
      `/api/dashboard/activities?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Get upcoming events
   * 
   * Retrieves upcoming events from the administration module.
   * 
   * @param {number} [limit=10] - Maximum number of events to return
   * @returns {Promise<UpcomingEvent[]>} Array of upcoming events
   * @throws {Error} If the API request fails
   * 
   * @example
   * const events = await dashboardAPI.getUpcomingEvents(5);
   * events.forEach(event => {
   *   console.log(`${event.title} on ${event.date}`);
   * });
   */
  getUpcomingEvents: async (limit: number = 10): Promise<UpcomingEvent[]> => {
    const response = await client.get<ApiResponse<UpcomingEvent[]>>(
      `/api/dashboard/events?limit=${limit}`
    );
    return response.data.data;
  },
};

export default dashboardAPI;

