import { lazy } from "react";
import { route } from "./constant";
import { RouteObject } from "react-router-dom";

// Dashboard
const Dashboard = lazy(
  () => import("../pages/Dashboard/Dashboard")
);

//admission modules
const AdmissionOverview = lazy(
  () => import("../components/module/Admission/Admission")
);
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
const StudentProfileLMS = lazy(
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
const AssignmentManagement = lazy(
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
// User Management
const UserList = lazy(
  () => import("../components/module/Users/UserList")
);
const UserForm = lazy(
  () => import("../components/module/Users/UserForm")
);
const UserDetail = lazy(
  () => import("../components/module/Users/UserDetail")
);
// Student Management
const StudentList = lazy(
  () => import("../components/module/Students/StudentList")
);
const StudentProfile = lazy(
  () => import("../components/module/Students/StudentProfile")
);
const StudentForm = lazy(
  () => import("../components/module/Students/StudentForm")
);
// Admission Management
const AdmissionApplicationDetail = lazy(
  () => import("../components/module/Admission/ApplicationDetail")
);
const AdmissionApplicationForm = lazy(
  () => import("../components/module/Admission/ApplicationForm")
);
// Academic Management
const ProgramList = lazy(
  () => import("../components/module/Academic/ProgramList")
);
const ProgramForm = lazy(
  () => import("../components/module/Academic/ProgramForm")
);
const ProgramDetail = lazy(
  () => import("../components/module/Academic/ProgramDetail")
);
const CourseList = lazy(
  () => import("../components/module/Academic/CourseList")
);
const CourseForm = lazy(
  () => import("../components/module/Academic/CourseForm")
);
const CourseDetail = lazy(
  () => import("../components/module/Academic/CourseDetail")
);
const SectionList = lazy(
  () => import("../components/module/Academic/SectionList")
);
const SectionForm = lazy(
  () => import("../components/module/Academic/SectionForm")
);
const SectionDetail = lazy(
  () => import("../components/module/Academic/SectionDetail")
);
const CurriculumPlanner = lazy(
  () => import("../components/module/Academic/CurriculumPlanner")
);
// Timetable Management
const TimetableList = lazy(
  () => import("../components/module/timeTable/TimetableList")
);
const TimetableForm = lazy(
  () => import("../components/module/timeTable/TimetableForm")
);
// Examination Management
const ExamList = lazy(
  () => import("../components/module/Examination/ExamList")
);
const ExamForm = lazy(
  () => import("../components/module/Examination/ExamForm")
);
const ResultEntry = lazy(
  () => import("../components/module/Examination/ResultEntry")
);
// Attendance Management
const AttendanceList = lazy(
  () => import("../components/module/Attendance/AttendanceList")
);
const BulkAttendanceEntry = lazy(
  () => import("../components/module/Attendance/BulkAttendanceEntry")
);
const AttendanceReport = lazy(
  () => import("../components/module/Attendance/AttendanceReport")
);
// Finance Management
const FeeStructureList = lazy(
  () => import("../components/module/Finance/FeeStructureList")
);
const PaymentList = lazy(
  () => import("../components/module/Finance/PaymentList")
);
const PaymentProcessing = lazy(
  () => import("../components/module/Finance/PaymentProcessing")
);
const PaymentDetail = lazy(
  () => import("../components/module/Finance/PaymentDetail")
);
const FinancialReport = lazy(
  () => import("../components/module/Finance/FinancialReport")
);
const FeeStructureForm = lazy(
  () => import("../components/module/Finance/FeeStructureForm")
);
// Learning Management
const CourseMaterialList = lazy(
  () => import("../components/module/Learning/CourseMaterialList")
);
const CourseMaterialForm = lazy(
  () => import("../components/module/Learning/CourseMaterialForm")
);
const AssignmentList = lazy(
  () => import("../components/module/Learning/AssignmentList")
);
const AssignmentForm = lazy(
  () => import("../components/module/Learning/AssignmentForm")
);
const SubmissionList = lazy(
  () => import("../components/module/Learning/SubmissionList")
);
const GradeSubmission = lazy(
  () => import("../components/module/Learning/GradeSubmission")
);
// Library Management
const BookList = lazy(
  () => import("../components/module/Library/BookList")
);
const BookForm = lazy(
  () => import("../components/module/Library/BookForm")
);
const BorrowingList = lazy(
  () => import("../components/module/Library/BorrowingList")
);
const ReservationList = lazy(
  () => import("../components/module/Library/ReservationList")
);
// HR Management
const EmployeeList = lazy(
  () => import("../components/module/HR/EmployeeList")
);
const EmployeeForm = lazy(
  () => import("../components/module/HR/EmployeeForm")
);
const EmployeeDetail = lazy(
  () => import("../components/module/HR/EmployeeDetail")
);
const LeaveRequestList = lazy(
  () => import("../components/module/HR/LeaveRequestList")
);
const LeaveRequestForm = lazy(
  () => import("../components/module/HR/LeaveRequestForm")
);
const JobPostingList = lazy(
  () => import("../components/module/HR/JobPostingList")
);
// Payroll Management
const SalaryStructureList = lazy(
  () => import("../components/module/Payroll/SalaryStructureList")
);
const SalaryStructureForm = lazy(
  () => import("../components/module/Payroll/SalaryStructureForm")
);
const SalaryStructureDetail = lazy(
  () => import("../components/module/Payroll/SalaryStructureDetail")
);
const SalaryProcessingList = lazy(
  () => import("../components/module/Payroll/SalaryProcessingList")
);
const PayrollSummary = lazy(
  () => import("../components/module/Payroll/PayrollSummary")
);
// Administration
const EventList = lazy(
  () => import("../components/module/Administration/EventList")
);
const EventForm = lazy(
  () => import("../components/module/Administration/EventForm")
);
const NoticeList = lazy(
  () => import("../components/module/Administration/NoticeList")
);
const NoticeForm = lazy(
  () => import("../components/module/Administration/NoticeForm")
);
const DepartmentList = lazy(
  () => import("../components/module/Administration/DepartmentList")
);
const DepartmentForm = lazy(
  () => import("../components/module/Administration/DepartmentForm")
);
// Certification
const CertificateRequestList = lazy(
  () => import("../components/module/Certification/CertificateRequestList")
);
const CertificateRequestForm = lazy(
  () => import("../components/module/Certification/CertificateRequestForm")
);
const CertificateRequestDetail = lazy(
  () => import("../components/module/Certification/CertificateRequestDetail")
);
const CertificateList = lazy(
  () => import("../components/module/Certification/CertificateList")
);
const CertificateDetail = lazy(
  () => import("../components/module/Certification/CertificateDetail")
);
// Multi-Campus
const CampusList = lazy(
  () => import("../components/module/MultiCampus/CampusList")
);
const CampusForm = lazy(
  () => import("../components/module/MultiCampus/CampusForm")
);
const CampusDetail = lazy(
  () => import("../components/module/MultiCampus/CampusDetail")
);
const StudentTransferList = lazy(
  () => import("../components/module/MultiCampus/StudentTransferList")
);
const StaffTransferList = lazy(
  () => import("../components/module/MultiCampus/StaffTransferList")
);
export const protectedRoutes: RouteObject[] = [
  {
    path: route.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: route.ADMISSION_OVERVIEW,
    element: <AdmissionOverview />,
  },
  {
    path: route.ADMISSION_ADMISSION_STATUS,
    element: <AdmissionStatus />,
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
    element: <StudentProfileLMS />,
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
    element: <AssignmentManagement />,
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
  // User Management Routes
  {
    path: route.USERS_LIST,
    element: <UserList />,
  },
  {
    path: route.USERS_CREATE,
    element: <UserForm isEdit={false} />,
  },
  {
    path: route.USERS_EDIT,
    element: <UserForm isEdit={true} />,
  },
  {
    path: route.USERS_DETAIL,
    element: <UserDetail />,
  },
  // Student Management Routes
  {
    path: route.STUDENT_LIST,
    element: <StudentList />,
  },
  {
    path: route.STUDENT_CREATE,
    element: <StudentForm isEdit={false} />,
  },
  {
    path: route.STUDENT_EDIT,
    element: <StudentForm isEdit={true} />,
  },
  {
    path: route.STUDENT_DETAIL,
    element: <StudentProfile />,
  },
  // Admission Management Routes
  {
    path: route.ADMISSION_APPLICATION_LIST,
    element: <ApplicationForms />,
  },
  {
    path: route.ADMISSION_APPLICATION_CREATE,
    element: <AdmissionApplicationForm isEdit={false} />,
  },
  {
    path: route.ADMISSION_APPLICATION_DETAIL,
    element: <AdmissionApplicationDetail />,
  },
  // Academic Management Routes
  {
    path: route.ACADEMIC_PROGRAM_LIST,
    element: <ProgramList />,
  },
  {
    path: route.ACADEMIC_PROGRAM_CREATE,
    element: <ProgramForm isEdit={false} />,
  },
  {
    path: route.ACADEMIC_PROGRAM_EDIT,
    element: <ProgramForm isEdit={true} />,
  },
  {
    path: route.ACADEMIC_PROGRAM_DETAIL,
    element: <ProgramDetail />,
  },
  {
    path: route.ACADEMIC_COURSE_LIST,
    element: <CourseList />,
  },
  {
    path: route.ACADEMIC_COURSE_CREATE,
    element: <CourseForm isEdit={false} />,
  },
  {
    path: route.ACADEMIC_COURSE_EDIT,
    element: <CourseForm isEdit={true} />,
  },
  {
    path: route.ACADEMIC_COURSE_DETAIL,
    element: <CourseDetail />,
  },
  {
    path: route.ACADEMIC_SECTION_LIST,
    element: <SectionList />,
  },
  {
    path: route.ACADEMIC_SECTION_CREATE,
    element: <SectionForm isEdit={false} />,
  },
  {
    path: route.ACADEMIC_SECTION_EDIT,
    element: <SectionForm isEdit={true} />,
  },
  {
    path: route.ACADEMIC_SECTION_DETAIL,
    element: <SectionDetail />,
  },
  {
    path: route.ACADEMIC_CURRICULUM_PLANNER,
    element: <CurriculumPlanner />,
  },
  // Timetable Management Routes
  {
    path: route.TIMETABLE_LIST,
    element: <TimetableList />,
  },
  {
    path: route.TIMETABLE_CREATE,
    element: <TimetableForm isEdit={false} />,
  },
  {
    path: route.TIMETABLE_EDIT,
    element: <TimetableForm isEdit={true} />,
  },
  // Examination Management
  {
    path: route.EXAMINATION_EXAM_LIST,
    element: <ExamList />,
  },
  {
    path: route.EXAMINATION_EXAM_CREATE,
    element: <ExamForm isEdit={false} />,
  },
  {
    path: route.EXAMINATION_EXAM_EDIT,
    element: <ExamForm isEdit={true} />,
  },
  {
    path: route.EXAMINATION_RESULT_ENTRY,
    element: <ResultEntry />,
  },
  // Attendance Management
  {
    path: route.ATTENDANCE_RECORD_LIST,
    element: <AttendanceList />,
  },
  {
    path: route.ATTENDANCE_BULK_ENTRY,
    element: <BulkAttendanceEntry />,
  },
  {
    path: route.ATTENDANCE_REPORTS,
    element: <AttendanceReport />,
  },
  // Finance Management
  {
    path: route.FINANCE_FEE_STRUCTURE_LIST,
    element: <FeeStructureList />,
  },
  {
    path: route.FINANCE_FEE_STRUCTURE_CREATE,
    element: <FeeStructureForm isEdit={false} />,
  },
  {
    path: route.FINANCE_FEE_STRUCTURE_EDIT,
    element: <FeeStructureForm isEdit={true} />,
  },
  {
    path: route.FINANCE_PAYMENT_LIST,
    element: <PaymentList />,
  },
  {
    path: route.FINANCE_PAYMENT_PROCESS,
    element: <PaymentProcessing />,
  },
  {
    path: route.FINANCE_PAYMENT_DETAIL,
    element: <PaymentDetail />,
  },
  {
    path: route.FINANCE_FINANCIAL_REPORTS,
    element: <FinancialReport />,
  },
  // Learning Management
  {
    path: route.LEARNING_MATERIAL_LIST,
    element: <CourseMaterialList />,
  },
  {
    path: route.LEARNING_MATERIAL_CREATE,
    element: <CourseMaterialForm isEdit={false} />,
  },
  {
    path: route.LEARNING_MATERIAL_EDIT,
    element: <CourseMaterialForm isEdit={true} />,
  },
  {
    path: route.LEARNING_ASSIGNMENT_LIST,
    element: <AssignmentList />,
  },
  {
    path: route.LEARNING_ASSIGNMENT_CREATE,
    element: <AssignmentForm isEdit={false} />,
  },
  {
    path: route.LEARNING_ASSIGNMENT_EDIT,
    element: <AssignmentForm isEdit={true} />,
  },
  {
    path: route.LEARNING_ASSIGNMENT_SUBMISSIONS,
    element: <SubmissionList />,
  },
  {
    path: route.LEARNING_SUBMISSION_LIST,
    element: <SubmissionList />,
  },
  {
    path: route.LEARNING_SUBMISSION_GRADE,
    element: <GradeSubmission />,
  },
  // Library Management
  {
    path: route.LIBRARY_BOOK_LIST,
    element: <BookList />,
  },
  {
    path: route.LIBRARY_BOOK_CREATE,
    element: <BookForm isEdit={false} />,
  },
  {
    path: route.LIBRARY_BOOK_EDIT,
    element: <BookForm isEdit={true} />,
  },
  {
    path: route.LIBRARY_BORROWING_LIST,
    element: <BorrowingList />,
  },
  {
    path: route.LIBRARY_RESERVATION_LIST,
    element: <ReservationList />,
  },
  // HR Management
  {
    path: route.HR_EMPLOYEE_LIST,
    element: <EmployeeList />,
  },
  {
    path: route.HR_EMPLOYEE_CREATE,
    element: <EmployeeForm isEdit={false} />,
  },
  {
    path: route.HR_EMPLOYEE_EDIT,
    element: <EmployeeForm isEdit={true} />,
  },
  {
    path: route.HR_EMPLOYEE_DETAIL,
    element: <EmployeeDetail />,
  },
  {
    path: route.HR_LEAVE_REQUEST_LIST,
    element: <LeaveRequestList />,
  },
  {
    path: route.HR_LEAVE_REQUEST_CREATE,
    element: <LeaveRequestForm />,
  },
  {
    path: route.HR_JOB_POSTING_LIST,
    element: <JobPostingList />,
  },
  // Payroll Management
  {
    path: route.PAYROLL_SALARY_STRUCTURE_LIST,
    element: <SalaryStructureList />,
  },
  {
    path: route.PAYROLL_SALARY_STRUCTURE_CREATE,
    element: <SalaryStructureForm isEdit={false} />,
  },
  {
    path: route.PAYROLL_SALARY_STRUCTURE_EDIT,
    element: <SalaryStructureForm isEdit={true} />,
  },
  {
    path: route.PAYROLL_SALARY_STRUCTURE_DETAIL,
    element: <SalaryStructureDetail />,
  },
  {
    path: route.PAYROLL_PROCESSING_LIST,
    element: <SalaryProcessingList />,
  },
  {
    path: route.PAYROLL_SUMMARY,
    element: <PayrollSummary />,
  },
  // Administration
  {
    path: route.ADMIN_EVENT_LIST,
    element: <EventList />,
  },
  {
    path: route.ADMIN_EVENT_CREATE,
    element: <EventForm isEdit={false} />,
  },
  {
    path: route.ADMIN_EVENT_EDIT,
    element: <EventForm isEdit={true} />,
  },
  {
    path: route.ADMIN_NOTICE_LIST,
    element: <NoticeList />,
  },
  {
    path: route.ADMIN_NOTICE_CREATE,
    element: <NoticeForm isEdit={false} />,
  },
  {
    path: route.ADMIN_NOTICE_EDIT,
    element: <NoticeForm isEdit={true} />,
  },
  {
    path: route.ADMIN_DEPARTMENT_LIST,
    element: <DepartmentList />,
  },
  {
    path: route.ADMIN_DEPARTMENT_CREATE,
    element: <DepartmentForm isEdit={false} />,
  },
  {
    path: route.ADMIN_DEPARTMENT_EDIT,
    element: <DepartmentForm isEdit={true} />,
  },
  // Certification
  {
    path: route.CERTIFICATION_REQUEST_LIST,
    element: <CertificateRequestList />,
  },
  {
    path: route.CERTIFICATION_REQUEST_CREATE,
    element: <CertificateRequestForm />,
  },
  {
    path: route.CERTIFICATION_REQUEST_DETAIL,
    element: <CertificateRequestDetail />,
  },
  {
    path: route.CERTIFICATION_CERTIFICATE_LIST,
    element: <CertificateList />,
  },
  {
    path: route.CERTIFICATION_CERTIFICATE_DETAIL,
    element: <CertificateDetail />,
  },
  // Multi-Campus
  {
    path: route.MULTICAMPUS_CAMPUS_LIST,
    element: <CampusList />,
  },
  {
    path: route.MULTICAMPUS_CAMPUS_CREATE,
    element: <CampusForm isEdit={false} />,
  },
  {
    path: route.MULTICAMPUS_CAMPUS_EDIT,
    element: <CampusForm isEdit={true} />,
  },
  {
    path: route.MULTICAMPUS_CAMPUS_DETAIL,
    element: <CampusDetail />,
  },
  {
    path: route.MULTICAMPUS_STUDENT_TRANSFER_LIST,
    element: <StudentTransferList />,
  },
  {
    path: route.MULTICAMPUS_STAFF_TRANSFER_LIST,
    element: <StaffTransferList />,
  },
];
