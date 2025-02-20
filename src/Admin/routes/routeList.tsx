import { lazy } from "react";
import { route } from "./constant";
import { RouteObject } from "react-router-dom";
//admission modules
const AdmissionStatus = lazy(
  () => import("../components/module/Admission/Subsections/AdmissionStatus")
);
const ApplicationForms = lazy(
  () => import("../components/module/Admission/Subsections/ApplicationForms")
);

const EligibilityCheck = lazy(
  () => import("../components/module/Admission/Subsections/EligibilityCheck")
);
const FeeSubmission = lazy(
  () => import("../components/module/Admission/Subsections/FeeSubmission")
);
// Library module
const BorrowReturnBooks = lazy(
  () => import("../components/module/Librarry/Subsections/BorrowOrReturnBooks")
);
const CatalogSearch = lazy(
  () => import("../components/module/Librarry/Subsections/CatalogSearch")
);
const LibraryTimings = lazy(
  () => import("../components/module/Librarry/Subsections/LibraryTimings")
);

const ReservationSystem = lazy(
  () => import("../components/module/Librarry/Subsections/ReservationSystem")
);
// Administrations
const EventNotices = lazy(
  () => import("../components/module/Administration/Subsections/EventsNotices")
);
const Infrastructure = lazy(
  () => import("../components/module/Administration/Subsections/Infrastructure")
);
const RoleAndPermissions = lazy(
  () =>
    import("../components/module/Administration/Subsections/RolePermissions")
);
const StaffManagement = lazy(
  () =>
    import("../components/module/Administration/Subsections/StaffManagement")
);
// timetable
const ClassShedule = lazy(
  () => import("../components/module/timeTable/Subsections/classShedules")
);
const ExamShedule = lazy(
  () => import("../components/module/timeTable/Subsections/examTimetable")
);
const FacultyAllocation = lazy(
  () => import("../components/module/timeTable/Subsections/FacultyAllocation")
);
const RoomAllocation = lazy(
  () => import("../components/module/timeTable/Subsections/roomAllocation")
);
const SpecialEvents = lazy(
  () => import("../components/module/timeTable/Subsections/SpecialEvents")
);
// Student Management
const Attendance = lazy(
  () => import("../components/module/studentLMS/Subsections/Attendance")
);
const DisciplinaryActions = lazy(
  () =>
    import("../components/module/studentLMS/Subsections/disciplinaryActions")
);
const StudentEnrollment = lazy(
  () => import("../components/module/studentLMS/Subsections/Enrollment")
);
const ParentCommunication = lazy(
  () =>
    import("../components/module/studentLMS/Subsections/ParentCommunication")
);
const PerformanceTracking = lazy(
  () =>
    import("../components/module/studentLMS/Subsections/PerformanceTracking")
);
const StudentProfile = lazy(
  () => import("../components/module/studentLMS/Subsections/Profiles")
);
//finance
const Budgeting = lazy(
  () => import("../components/module/financeLMS/Subsections/Budgeting")
);
const ExpenseTracking = lazy(
  () => import("../components/module/financeLMS/Subsections/ExpenseTracking")
);
const FeeManagement = lazy(
  () => import("../components/module/financeLMS/Subsections/FeeManagment")
);
const FinancialReports = lazy(
  () => import("../components/module/financeLMS/Subsections/FinancialReports")
);
//Learning
const Assignment = lazy(
  () => import("../components/module/LearningLMS/Subsections/Assignment")
);
const CourseMaterials = lazy(
  () => import("../components/module/LearningLMS/Subsections/CourseMaterials")
);
const Grading = lazy(
  () => import("../components/module/LearningLMS/Subsections/Grading")
);
const OnlineClasses = lazy(
  () => import("../components/module/LearningLMS/Subsections/OnlineClasses")
);
//Exams
const StdExamShedule = lazy(
  () => import("../components/module/examLMS/Subsections/examShedule")
);
const QuestionPapers = lazy(
  () => import("../components/module/examLMS/Subsections/QuestionPapers")
);
const Revaluation = lazy(
  () => import("../components/module/examLMS/Subsections/ReEvaluation")
);
const StdResults = lazy(
  () => import("../components/module/examLMS/Subsections/Results")
);
// Attendance
const AttendanceReports = lazy(
  () =>
    import("../components/module/attendanceLMS/Subsections/attendanceReports")
);
const HolidayCalendar = lazy(
  () => import("../components/module/attendanceLMS/Subsections/HolidayCalendar")
);
const LeaveRequests = lazy(
  () => import("../components/module/attendanceLMS/Subsections/leaveRequests")
);
const StaffAttendance = lazy(
  () => import("../components/module/attendanceLMS/Subsections/staffAttendance")
);
const StudentAttendance = lazy(
  () =>
    import("../components/module/attendanceLMS/Subsections/StudentAttendance")
);
// Certifications
const CertificateRequests = lazy(
  () =>
    import(
      "../components/module/certificationLMS/Subsections/CertificateRequests"
    )
);
const GenerateCertificate = lazy(
  () =>
    import(
      "../components/module/certificationLMS/Subsections/DigitalCertifications"
    )
);
const IssuingCertificates = lazy(
  () =>
    import(
      "../components/module/certificationLMS/Subsections/IssuingCertificates"
    )
);
const Verification = lazy(
  () => import("../components/module/certificationLMS/Subsections/Verification")
);
//hr management
const EmployeeRecords = lazy(
  () => import("../components/module/hrLMS/Subsections/EmployeeRecords")
);
const LeaveManagment = lazy(
  () => import("../components/module/hrLMS/Subsections/leaveManagment")
);
const Payroll = lazy(
  () => import("../components/module/hrLMS/Subsections/Payroll")
);
const Recruitment = lazy(
  () => import("../components/module/hrLMS/Subsections/Recruitment")
);
//multi campus
const CampusManagment = lazy(
  () =>
    import("../components/module/multiCampusLMS/Subsections/CampusManagment")
);
const CampusReports = lazy(
  () => import("../components/module/multiCampusLMS/Subsections/CampusReports")
);
const InterCampusTransfers = lazy(
  () =>
    import(
      "../components/module/multiCampusLMS/Subsections/InterCampusTransfers"
    )
);
const ResourceAllocation = lazy(
  () =>
    import("../components/module/multiCampusLMS/Subsections/ResourceAllocation")
);
//payroll
const EmployeeBenefits = lazy(
  () => import("../components/module/payrollLMS/Subsections/EmployeeBenefits")
);
const SalaryProcessing = lazy(
  () => import("../components/module/payrollLMS/Subsections/SalaryProcessing")
);
const SalarySlips = lazy(
  () => import("../components/module/payrollLMS/Subsections/salarySlips")
);
const Taxation = lazy(
  () => import("../components/module/payrollLMS/Subsections/Taxation")
);
export const protectedRoutes: RouteObject[] = [
  {
    path: route.ADMISSION_ADMISSION_STATUS,
    element: <AdmissionStatus />,
  },

  {
    path: route.ADMISSION_APLLICATION_FORMS,
    element: <ApplicationForms />,
  },

  {
    path: route.ADMISSION_ELIGIBILITY_CHECK,
    element: <EligibilityCheck />,
  },

  {
    path: route.ADMISSION_FEE_SUBMISSION,
    element: <FeeSubmission />,
  },

  {
    path: route.LIBRARY_BORROW_RETURN_BOOKS,
    element: <BorrowReturnBooks />,
  },

  {
    path: route.LIBRARY_CATALOG_SEARCH,
    element: <CatalogSearch />,
  },

  {
    path: route.LIBRARY_LIBRARY_TIMING,
    element: <LibraryTimings />,
  },

  {
    path: route.LIBRARY_RESERVATION_SYSTEM,
    element: <ReservationSystem />,
  },

  {
    path: route.ADMINISTRATION_EVENTS_NOTICES,
    element: <EventNotices />,
  },

  {
    path: route.ADMINISTRATION_INFRASTRUCTURE,
    element: <Infrastructure />,
  },

  {
    path: route.ADMINISTRATION_ROLES_PERMISSIONS,
    element: <RoleAndPermissions />,
  },

  {
    path: route.ADMINISTRATION_STAFF_MANAGEMENT,
    element: <StaffManagement />,
  },

  {
    path: route.TIMETABLE_CLASS_SCHEDULES,
    element: <ClassShedule />,
  },

  {
    path: route.TIMETABLE_EXAM_TIMETABLE,
    element: <ExamShedule />,
  },

  {
    path: route.TIMETABLE_FACULTY_ALLOCATION,
    element: <FacultyAllocation />,
  },

  {
    path: route.TIMETABLE_ROOM_ALLOCATION,
    element: <RoomAllocation />,
  },

  {
    path: route.TIMETABLE_SPECIAL_EVENTS,
    element: <SpecialEvents />,
  },

  {
    path: route.STUDENT_MANAGEMENT_ATTENDANCE,
    element: <Attendance />,
  },

  {
    path: route.STUDENT_MANAGEMENT_DISCIPLINARY_ACTIONS,
    element: <DisciplinaryActions />,
  },

  {
    path: route.STUDENT_MANAGEMENT_ENROLLMENT,
    element: <StudentEnrollment />,
  },

  {
    path: route.STUDENT_MANAGEMENT_PARENT_COMMUNICATION,
    element: <ParentCommunication />,
  },

  {
    path: route.STUDENT_MANAGEMENT_PERFORMANCE_TRACKING,
    element: <PerformanceTracking />,
  },

  {
    path: route.STUDENT_MANAGEMENT_PROFILES,
    element: <StudentProfile />,
  },

  {
    path: route.FINANCE_BUDGETING,
    element: <Budgeting />,
  },

  {
    path: route.FINANCE_EXPENSE_TRACKING,
    element: <ExpenseTracking />,
  },

  {
    path: route.FINANCE_FEE_MANAGEMENT,
    element: <FeeManagement />,
  },

  {
    path: route.FINANCE_FINANCIAL_REPORTS,
    element: <FinancialReports />,
  },

  {
    path: route.LEARNING_ASSIGNMENTS,
    element: <Assignment />,
  },

  {
    path: route.LEARNING_COURSE_MATERIALS,
    element: <CourseMaterials />,
  },

  {
    path: route.LEARNING_GRADING,
    element: <Grading />,
  },

  {
    path: route.LEARNING_ONLINE_CLASSES,
    element: <OnlineClasses />,
  },

  {
    path: route.EXAMS_EXAMS_SHEDULE,
    element: <StdExamShedule />,
  },

  {
    path: route.EXAMS_QUESTIONS_PAPPERS,
    element: <QuestionPapers />,
  },

  {
    path: route.EXAMS_RE_EVALUATION,
    element: <Revaluation />,
  },

  {
    path: route.EXAMS_RESULTS,
    element: <StdResults />,
  },

  {
    path: route.ATTENDANCE_ATTENDANCE_REPORTS,
    element: <AttendanceReports />,
  },

  {
    path: route.ATTENDANCE_HOLIDAY_CALENDAR,
    element: <HolidayCalendar />,
  },

  {
    path: route.ATTENDANCE_LEAVE_REQUESTS,
    element: <LeaveRequests />,
  },

  {
    path: route.ATTENDANCE_STAFF_ATTENDANCE,
    element: <StaffAttendance />,
  },

  {
    path: route.ATTENDANCE_STUDENT_ATTENDANCE,
    element: <StudentAttendance />,
  },

  {
    path: route.CERTIFICATIONS_CERTIFICATE_REQUESTS,
    element: <CertificateRequests />,
  },

  {
    path: route.CERTIFICATE_DIGITAL_CERTIFICATIONS,
    element: <GenerateCertificate />,
  },

  {
    path: route.CERTIFICATIONS_ISSUEING_CERTIFICATES,
    element: <IssuingCertificates />,
  },

  {
    path: route.CERTIFICATIONS_VERIFICATION,
    element: <Verification />,
  },

  {
    path: route.HR_MANAGEMENT_EMPLOYEE_RECORDS,
    element: <EmployeeRecords />,
  },

  {
    path: route.HR_MANAGEMENT_LEAVE_MANAGEMENT,
    element: <LeaveManagment />,
  },

  {
    path: route.HR_MANAGEMENT_PAYROLL,
    element: <Payroll />,
  },

  {
    path: route.HR_MANAGEMENT_RECRUITMENT,
    element: <Recruitment />,
  },

  {
    path: route.MULTI_CAMPUS_CAMPUS_MANAGEMENT,
    element: <CampusManagment />,
  },

  {
    path: route.MULTI_CAMPUS_CAMPUS_REPORTS,
    element: <CampusReports />,
  },

  {
    path: route.MULTI_CAMPUS_INTER_CAMPUS_TRNASFERS,
    element: <InterCampusTransfers />,
  },

  {
    path: route.MULTI_CAMPUS_RESOURCE_ALLOCATION,
    element: <ResourceAllocation />,
  },

  {
    path: route.PAYROLL_EMPLOYEE_BENEFITS,
    element: <EmployeeBenefits />,
  },

  {
    path: route.PAYROLL_SALARY_PROCESSING,
    element: <SalaryProcessing />,
  },

  {
    path: route.PAYROLL_SALARY_SLIPS,
    element: <SalarySlips />,
  },

  {
    path: route.PAYROLL_TAXATION,
    element: <Taxation />,
  },
];
