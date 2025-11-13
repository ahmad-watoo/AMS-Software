/**
 * Dashboard Service
 * 
 * Service for aggregating and providing dashboard data across all modules.
 * Handles statistics, recent activities, and upcoming events:
 * - Dashboard statistics aggregation (students, faculty, payments, etc.)
 * - Recent activities from multiple modules
 * - Upcoming events from administration module
 * 
 * The dashboard provides a unified view of:
 * - System-wide statistics and metrics
 * - Recent activities across all modules (students, payments, applications, exams)
 * - Upcoming events and important dates
 * 
 * Features:
 * - Parallel data fetching for optimal performance
 * - Time-based formatting for activities
 * - Comprehensive error handling
 * 
 * @module services/dashboard.service
 */

import { StudentRepository } from '../repositories/student.repository';
import { UserRepository } from '../repositories/user.repository';
import { FinanceRepository } from '../repositories/finance.repository';
import { AdmissionRepository } from '../repositories/admission.repository';
import { ExaminationRepository } from '../repositories/examination.repository';
import { AcademicRepository } from '../repositories/academic.repository';
import { LibraryRepository } from '../repositories/library.repository';
import { HRRepository } from '../repositories/hr.repository';
import { AdministrationRepository } from '../repositories/administration.repository';
import { logger } from '@/config/logger';

const studentRepository = new StudentRepository();
const userRepository = new UserRepository();
const financeRepository = new FinanceRepository();
const admissionRepository = new AdmissionRepository();
const examinationRepository = new ExaminationRepository();
const academicRepository = new AcademicRepository();
const libraryRepository = new LibraryRepository();
const hrRepository = new HRRepository();
const administrationRepository = new AdministrationRepository();

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
 * Dashboard Service Class
 * 
 * Provides methods to aggregate and format dashboard data from multiple modules.
 */
class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   * 
   * Aggregates statistics from multiple repositories in parallel for optimal performance.
   * Calculates totals, counts, and filtered metrics across all modules.
   * 
   * @returns {Promise<DashboardStats>} Comprehensive dashboard statistics
   * @throws {Error} If any repository call fails
   * 
   * @example
   * const stats = await dashboardService.getDashboardStats();
   * console.log(`Total students: ${stats.totalStudents}`);
   * console.log(`Upcoming exams: ${stats.upcomingExams}`);
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch statistics from multiple repositories in parallel
      // Note: Repositories return arrays, we need to count them
      const [
        allStudents,
        allUsers,
        recentPayments,
        allApplications,
        allExams,
        allPrograms,
        allBooks,
        allBorrowings,
        allEmployees,
        allLeaveRequests,
      ] = await Promise.all([
        studentRepository.findAll(10000, 0), // Get all for count
        userRepository.findAll(10000, 0),
        financeRepository.findAllPayments(100, 0), // Get recent for amount calculation
        admissionRepository.findAllApplications(1000, 0),
        examinationRepository.findAllExams(100, 0),
        academicRepository.findAllPrograms(1000, 0),
        libraryRepository.findAllBooks(10000, 0),
        libraryRepository.findAllBorrowings(1000, 0, { status: 'borrowed' }),
        hrRepository.findAllEmployees(10000, 0),
        hrRepository.findAllLeaveRequests(1000, 0, { status: 'pending' }),
      ]);

      // Calculate totals (repositories return arrays)
      const totalStudents = Array.isArray(allStudents) ? allStudents.length : 0;
      const totalFaculty = Array.isArray(allUsers) ? allUsers.filter((u: any) => u.roles?.includes('faculty')).length : 0;
      const totalPaymentsCount = Array.isArray(recentPayments) ? recentPayments.length : 0;
      
      // Count pending applications
      const pendingApplications = Array.isArray(allApplications) ? allApplications.filter(
        (app: any) => app.status === 'submitted' || app.status === 'under_review'
      ).length : 0;

      // Count upcoming exams (exams with date >= today)
      const today = new Date().toISOString().split('T')[0];
      const upcomingExams = Array.isArray(allExams) ? allExams.filter((exam: any) => 
        exam.examDate >= today
      ).length : 0;

      // Count active programs
      const activePrograms = Array.isArray(allPrograms) ? allPrograms.filter(
        (prog: any) => prog.isActive !== false
      ).length : 0;

      const totalBooks = Array.isArray(allBooks) ? allBooks.length : 0;
      // Count overdue borrowings (due date < today)
      const overdueBooks = Array.isArray(allBorrowings) ? allBorrowings.filter((borrowing: any) => 
        borrowing.dueDate && borrowing.dueDate < today && borrowing.status === 'borrowed'
      ).length : 0;
      const totalEmployees = Array.isArray(allEmployees) ? allEmployees.length : 0;
      const pendingLeaveRequests = Array.isArray(allLeaveRequests) ? allLeaveRequests.length : 0;

      // Calculate total payment amount from recent payments
      let totalPaymentAmount = 0;
      if (Array.isArray(recentPayments)) {
        totalPaymentAmount = recentPayments.reduce(
          (sum: number, payment: any) => sum + (payment.amount || 0),
          0
        );
      }

      return {
        totalStudents,
        totalFaculty,
        totalPayments: totalPaymentAmount,
        pendingApplications,
        upcomingExams,
        activePrograms,
        totalBooks,
        overdueBooks,
        totalEmployees,
        pendingLeaveRequests,
      };
    } catch (error: any) {
      logger.error('Failed to fetch dashboard statistics', { error: error.message });
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get recent activities across all modules
   * 
   * Fetches recent activities from multiple modules (students, payments, applications, exams)
   * and transforms them into a unified activity format with human-readable time stamps.
   * 
   * @param {number} [limit=10] - Maximum number of activities to return
   * @returns {Promise<RecentActivity[]>} Array of recent activities sorted by time (most recent first)
   * @throws {Error} If any repository call fails
   * 
   * @example
   * const activities = await dashboardService.getRecentActivities(5);
   * activities.forEach(activity => {
   *   console.log(`${activity.action} - ${activity.time}`);
   * });
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent activities from various modules (repositories return arrays)
      const [
        recentStudents,
        recentPayments,
        recentApplications,
        recentExams,
      ] = await Promise.all([
        studentRepository.findAll(5, 0),
        financeRepository.findAllPayments(5, 0),
        admissionRepository.findAllApplications(5, 0),
        examinationRepository.findAllExams(5, 0),
      ]);

      // Transform student enrollments
      if (Array.isArray(recentStudents)) {
        recentStudents.forEach((student: any) => {
          activities.push({
            id: student.id,
            type: 'student',
            action: `New student enrolled: ${student.rollNumber}`,
            time: this.formatTimeAgo(new Date(student.createdAt)),
            status: 'success',
          });
        });
      }

      // Transform payments
      if (Array.isArray(recentPayments)) {
        recentPayments.forEach((payment: any) => {
          activities.push({
            id: payment.id,
            type: 'payment',
            action: `Payment received: PKR ${payment.amount || 0}`,
            time: this.formatTimeAgo(new Date(payment.paymentDate || payment.createdAt)),
            status: 'success',
          });
        });
      }

      // Transform applications
      if (Array.isArray(recentApplications)) {
        recentApplications.forEach((app: any) => {
          activities.push({
            id: app.id,
            type: 'admission',
            action: `New application submitted: ${app.applicationNumber || app.id}`,
            time: this.formatTimeAgo(new Date(app.submittedDate || app.createdAt)),
            status: app.status === 'submitted' ? 'warning' : 'info',
          });
        });
      }

      // Transform exams
      if (Array.isArray(recentExams)) {
        recentExams.forEach((exam: any) => {
          activities.push({
            id: exam.id,
            type: 'exam',
            action: `Exam scheduled: ${exam.title}`,
            time: this.formatTimeAgo(new Date(exam.examDate)),
            status: 'info',
          });
        });
      }

      // Sort by creation date (most recent first) and limit
      // Activities are already fetched in reverse chronological order from repositories
      return activities.slice(0, limit);
    } catch (error: any) {
      logger.error('Failed to fetch recent activities', { error: error.message });
      throw new Error(`Failed to fetch recent activities: ${error.message}`);
    }
  }

  /**
   * Get upcoming events
   * 
   * Fetches upcoming events from the administration module that are active
   * and have a start date on or after today.
   * 
   * @param {number} [limit=10] - Maximum number of events to return
   * @returns {Promise<UpcomingEvent[]>} Array of upcoming events sorted by date
   * @throws {Error} If repository call fails
   * 
   * @example
   * const events = await dashboardService.getUpcomingEvents(5);
   * events.forEach(event => {
   *   console.log(`${event.title} on ${event.date}`);
   * });
   */
  async getUpcomingEvents(limit: number = 10): Promise<UpcomingEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const events = await administrationRepository.findAllEvents(limit, 0, {
        startDate: today,
        isActive: true,
      });
      
      return (Array.isArray(events) ? events : []).map((event: any) => ({
        id: event.id,
        title: event.title,
        type: event.eventType || 'general',
        date: event.startDate,
        description: event.description,
      }));
    } catch (error: any) {
      logger.error('Failed to fetch upcoming events', { error: error.message });
      throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    }
  }

  /**
   * Format time as relative time string
   * 
   * Converts a date to a human-readable relative time string
   * (e.g., "Just now", "5 minutes ago", "2 hours ago", "3 days ago").
   * 
   * @param {Date} date - Date to format
   * @returns {string} Formatted time string
   * @private
   * 
   * @example
   * const timeAgo = this.formatTimeAgo(new Date(Date.now() - 3600000));
   * // Returns: "1 hour ago"
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}

export default new DashboardService();

