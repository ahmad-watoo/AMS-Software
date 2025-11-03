import { StudentRepository } from '../repositories/student.repository';
import { UserRepository } from '../repositories/user.repository';
import { FinanceRepository } from '../repositories/finance.repository';
import { AdmissionRepository } from '../repositories/admission.repository';
import { ExaminationRepository } from '../repositories/examination.repository';
import { AcademicRepository } from '../repositories/academic.repository';
import { LibraryRepository } from '../repositories/library.repository';
import { HRRepository } from '../repositories/hr.repository';
import { AdministrationRepository } from '../repositories/administration.repository';

const studentRepository = new StudentRepository();
const userRepository = new UserRepository();
const financeRepository = new FinanceRepository();
const admissionRepository = new AdmissionRepository();
const examinationRepository = new ExaminationRepository();
const academicRepository = new AcademicRepository();
const libraryRepository = new LibraryRepository();
const hrRepository = new HRRepository();
const administrationRepository = new AdministrationRepository();

interface DashboardStats {
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

interface RecentActivity {
  id: string;
  type: string;
  action: string;
  time: string;
  status: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  description?: string;
}

class DashboardService {
  /**
   * Get comprehensive dashboard statistics
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
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get recent activities across all modules
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
      throw new Error(`Failed to fetch recent activities: ${error.message}`);
    }
  }

  /**
   * Get upcoming events
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
      throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    }
  }

  /**
   * Format time as "X hours ago", "X days ago", etc.
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

