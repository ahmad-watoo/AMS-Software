import {
  UserOutlined,
  ReadOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileOutlined,
  SolutionOutlined,
  MoneyCollectOutlined,
  BookOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { route } from "../../routes/constant";
// import { RouteObject } from "react-router-dom";
// import { lazy } from "react";

// Map icons to menu items
const iconMap = {
  admissionMS: <SolutionOutlined />,
  libraryLMS: <ReadOutlined />,
  administratorLMS: <TeamOutlined />,
  timetableLMS: <CalendarOutlined />,
  studentLMS: <UserOutlined />,
  financeLMS: <MoneyCollectOutlined />,
  learningLMS: <BookOutlined />,
  examLMS: <FileOutlined />,
  attendanceLMS: <PieChartOutlined />,
  certificationLMS: <SafetyOutlined />,
  hrMS: <TeamOutlined />,
  multiCampLMS: <BankOutlined />,
  payrollLMS: <DatabaseOutlined />,
  academicLMS: <BookOutlined />,
};

export const sideManueRoutes = [
  {
    id: 1,
    icon: iconMap.admissionMS,
    name: "Admission",

    subsections: [
      {
        sub_name: "Overview",
        path: route.ADMISSION_OVERVIEW,
      },
      {
        sub_name: "Admission Status",
        path: route.ADMISSION_ADMISSION_STATUS,
      },
      {
        sub_name: "Applications",
        path: route.ADMISSION_APPLICATION_LIST,
      },
      {
        sub_name: "Eligibility Check",
        path: route.ADMISSION_ELIGIBILITY_CHECK,
      },

      {
        sub_name: "Fee Submission",
        path: route.ADMISSION_FEE_SUBMISSION,
      },
    ],
  },
  {
    id: 14,
    icon: iconMap.academicLMS,
    name: "Academic",
    subsections: [
      {
        sub_name: "Programs",
        path: route.ACADEMIC_PROGRAM_LIST,
      },
      {
        sub_name: "Courses",
        path: route.ACADEMIC_COURSE_LIST,
      },
      {
        sub_name: "Sections",
        path: route.ACADEMIC_SECTION_LIST,
      },
      {
        sub_name: "Curriculum Planner",
        path: route.ACADEMIC_CURRICULUM_PLANNER,
      },
    ],
  },
  {
    id: 2,
    icon: iconMap.libraryLMS,
    name: "Librarry",
    subsections: [
      {
        sub_name: "Borrow Or Return Books",
        path: route.LIBRARY_BORROW_RETURN_BOOKS,
      },

      {
        sub_name: "Catalog Search",
        path: route.LIBRARY_CATALOG_SEARCH,
      },

      {
        sub_name: "Library Timings",
        path: route.LIBRARY_LIBRARY_TIMING,
      },

      {
        sub_name: "Reservation System",
        path: route.LIBRARY_RESERVATION_SYSTEM,
      },
    ],
  },
  {
    id: 3,
    icon: iconMap.administratorLMS,
    name: "Administration",
    subsections: [
      {
        sub_name: "Events  Notices",
        path: route.ADMINISTRATION_EVENTS_NOTICES,
      },

      {
        sub_name: "Infrastructure",
        path: route.ADMINISTRATION_INFRASTRUCTURE,
      },

      {
        sub_name: "Roles  Permissions",
        path: route.ADMINISTRATION_ROLES_PERMISSIONS,
      },

      {
        sub_name: "Staff Management",
        path: route.ADMINISTRATION_STAFF_MANAGEMENT,
      },
    ],
  },
  {
    id: 4,
    icon: iconMap.timetableLMS,
    name: "Timetable",
    subsections: [
      {
        sub_name: "Class Schedules",
        path: route.TIMETABLE_CLASS_SCHEDULES,
      },

      {
        sub_name: "Exam Timetable",
        path: route.TIMETABLE_EXAM_TIMETABLE,
      },

      {
        sub_name: "Faculty Allocation",
        path: route.TIMETABLE_FACULTY_ALLOCATION,
      },

      {
        sub_name: "Room Allocation",
        path: route.TIMETABLE_ROOM_ALLOCATION,
      },

      {
        sub_name: "Special Events",
        path: route.TIMETABLE_SPECIAL_EVENTS,
      },
    ],
  },
  {
    id: 5,
    icon: iconMap.studentLMS,
    name: "Student Management",
    subsections: [
      {
        sub_name: "Attendance",
        path: route.STUDENT_MANAGEMENT_ATTENDANCE,
      },

      {
        sub_name: "disciplinaryActions",
        path: route.STUDENT_MANAGEMENT_DISCIPLINARY_ACTIONS,
      },

      {
        sub_name: "Enrollment",
        path: route.STUDENT_MANAGEMENT_ENROLLMENT,
      },

      {
        sub_name: "Parent Communication",
        path: route.STUDENT_MANAGEMENT_PARENT_COMMUNICATION,
      },

      {
        sub_name: "Performance Tracking",
        path: route.STUDENT_MANAGEMENT_PERFORMANCE_TRACKING,
      },

      {
        sub_name: "Profiles",
        path: route.STUDENT_MANAGEMENT_PROFILES,
      },
    ],
  },
  {
    id: 6,
    icon: iconMap.financeLMS,
    name: "Finance",
    subsections: [
      {
        sub_name: "Budgeting",
        path: route.FINANCE_BUDGETING,
      },

      {
        sub_name: "Expense Tracking",
        path: route.FINANCE_EXPENSE_TRACKING,
      },

      {
        sub_name: "Fee Management",
        path: route.FINANCE_FEE_MANAGEMENT,
      },

      {
        sub_name: "Financial Reports",
        path: route.FINANCE_FINANCIAL_REPORTS,
      },
    ],
  },
  {
    id: 7,
    icon: iconMap.learningLMS,
    name: "Learning",
    subsections: [
      {
        sub_name: "Assignments",
        path: route.LEARNING_ASSIGNMENTS,
      },

      {
        sub_name: "Course Materials",
        path: route.LEARNING_COURSE_MATERIALS,
      },

      {
        sub_name: "Grading",
        path: route.LEARNING_GRADING,
      },

      {
        sub_name: "Online Classes",
        path: route.LEARNING_ONLINE_CLASSES,
      },
    ],
  },
  {
    id: 8,
    icon: iconMap.examLMS,
    name: "Exams",
    subsections: [
      {
        sub_name: "Exam Schedule",
        path: route.EXAMS_EXAMS_SHEDULE,
      },

      {
        sub_name: "Question Papers",
        path: route.EXAMS_QUESTIONS_PAPPERS,
      },

      {
        sub_name: "Reevaluation",
        path: route.EXAMS_RE_EVALUATION,
      },

      {
        sub_name: "Results",
        path: route.EXAMS_RESULTS,
      },
    ],
  },
  {
    id: 9,
    icon: iconMap.attendanceLMS,
    name: "Attendance",
    subsections: [
      {
        sub_name: "Attendance Reports",
        path: route.ATTENDANCE_ATTENDANCE_REPORTS,
      },

      {
        sub_name: "Holiday Calendar",
        path: route.ATTENDANCE_HOLIDAY_CALENDAR,
      },

      {
        sub_name: "Leave Requests",
        path: route.ATTENDANCE_LEAVE_REQUESTS,
      },

      {
        sub_name: "Staff Attendance",
        path: route.ATTENDANCE_STAFF_ATTENDANCE,
      },

      {
        sub_name: "Student Attendance",
        path: route.ATTENDANCE_STUDENT_ATTENDANCE,
      },
    ],
  },
  {
    id: 10,
    icon: iconMap.certificationLMS,
    name: "Certifications",
    subsections: [
      {
        sub_name: "Certificate Requests",
        path: route.CERTIFICATIONS_CERTIFICATE_REQUESTS,
      },

      {
        sub_name: "Digital Certifications",
        path: route.CERTIFICATE_DIGITAL_CERTIFICATIONS,
      },

      {
        sub_name: "Issuing Certificates",
        path: route.CERTIFICATIONS_ISSUEING_CERTIFICATES,
      },

      {
        sub_name: "Verification",
        path: route.CERTIFICATIONS_VERIFICATION,
      },
    ],
  },
  {
    id: 11,
    icon: iconMap.hrMS,
    name: "HR Management",
    subsections: [
      {
        sub_name: "Employee Records",
        path: route.HR_MANAGEMENT_EMPLOYEE_RECORDS,
      },

      {
        sub_name: "Leave Management",
        path: route.HR_MANAGEMENT_LEAVE_MANAGEMENT,
      },

      {
        sub_name: "Payroll",
        path: route.HR_MANAGEMENT_PAYROLL,
      },

      {
        sub_name: "Recruitment",
        path: route.HR_MANAGEMENT_RECRUITMENT,
      },
    ],
  },
  {
    id: 12,
    icon: iconMap.multiCampLMS,
    name: "Multi-Campus",
    subsections: [
      {
        sub_name: "Campus Management",
        path: route.MULTI_CAMPUS_CAMPUS_MANAGEMENT,
      },

      {
        sub_name: "Campus Reports",
        path: route.MULTI_CAMPUS_CAMPUS_REPORTS,
      },

      {
        sub_name: "InterCampus Transfers",
        path: route.MULTI_CAMPUS_INTER_CAMPUS_TRNASFERS,
      },

      {
        sub_name: "Resource Allocation",
        path: route.MULTI_CAMPUS_RESOURCE_ALLOCATION,
      },
    ],
  },
  {
    id: 13,
    icon: iconMap.payrollLMS,
    name: "Payroll",
    subsections: [
      {
        sub_name: "Employee Benefits",
        path: route.PAYROLL_EMPLOYEE_BENEFITS,
      },

      {
        sub_name: "Salary Processing",
        path: route.PAYROLL_SALARY_PROCESSING,
      },

      {
        sub_name: "Salary Slips",
        path: route.PAYROLL_SALARY_SLIPS,
      },

      {
        sub_name: "Taxation",
        path: route.PAYROLL_TAXATION,
      },
    ],
  },
];
