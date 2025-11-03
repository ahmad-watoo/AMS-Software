import client from './client';

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalPayments: number;
  pendingApplications: number;
  upcomingExams: number;
  activePrograms: number;
  totalBooks: number;
  overdueBooks: number;
  totalEmployees: number;
  pendingLeaveRequests: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  time: string;
  status: string;
  userId?: string;
  targetId?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  description?: string;
}

const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await client.get('/api/dashboard/stats');
    return response.data.data;
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await client.get(`/api/dashboard/activities?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get upcoming events
   */
  getUpcomingEvents: async (limit: number = 10): Promise<UpcomingEvent[]> => {
    const response = await client.get(`/api/dashboard/events?limit=${limit}`);
    return response.data.data;
  },
};

export default dashboardAPI;

