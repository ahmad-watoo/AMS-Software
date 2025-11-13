# API Documentation
## Academic Management System (AMS)

**Version:** 1.0  
**Base URL**: `https://api.ams.example.com/api/v1`  
**Authentication**: Bearer Token (JWT)

---

## Table of Contents

1. [Authentication API](#1-authentication-api)
2. [Students API](#2-students-api)
3. [Courses API](#3-courses-api)
4. [Enrollments API](#4-enrollments-api)
5. [Examinations API](#5-examinations-api)
6. [Attendance API](#6-attendance-api)
7. [Finance API](#7-finance-api)
8. [Common Patterns](#8-common-patterns)

---

## 1. Authentication API

### 1.1 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Khan",
      "roles": ["student"]
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### 1.2 Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Ahmed",
  "lastName": "Khan",
  "phone": "+923001234567",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "message": "Registration successful. Please verify your email."
  }
}
```

---

### 1.3 Refresh Token
**POST** `/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 3600
  }
}
```

---

### 1.4 Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

## 2. Students API

### 2.1 Get All Students
**GET** `/students`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name, roll number
- `programId` (uuid): Filter by program
- `batch` (string): Filter by batch
- `status` (string): Filter by enrollment status

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid",
        "rollNumber": "2024-BS-CS-001",
        "registrationNumber": "REG-2024-001",
        "user": {
          "firstName": "Ahmed",
          "lastName": "Khan",
          "email": "ahmed.khan@example.com",
          "phone": "+923001234567"
        },
        "program": {
          "id": "uuid",
          "name": "BS Computer Science",
          "code": "BS-CS"
        },
        "batch": "2024-Fall",
        "currentSemester": 1,
        "cgpa": 3.75,
        "enrollmentStatus": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 2.2 Get Student by ID
**GET** `/students/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rollNumber": "2024-BS-CS-001",
    "user": {
      "firstName": "Ahmed",
      "lastName": "Khan",
      "email": "ahmed.khan@example.com",
      "cnic": "35202-1234567-1",
      "dateOfBirth": "2000-01-15",
      "address": "Lahore, Pakistan"
    },
    "program": {
      "name": "BS Computer Science",
      "code": "BS-CS",
      "department": {
        "name": "Computer Science"
      }
    },
    "guardian": {
      "name": "Muhammad Khan",
      "relationship": "Father",
      "phone": "+923001234568"
    },
    "academicInfo": {
      "batch": "2024-Fall",
      "currentSemester": 1,
      "cgpa": 3.75,
      "totalCreditHours": 45
    }
  }
}
```

---

### 2.3 Create Student
**POST** `/students`

**Request Body:**
```json
{
  "userId": "uuid",
  "rollNumber": "2024-BS-CS-001",
  "programId": "uuid",
  "batch": "2024-Fall",
  "admissionDate": "2024-09-01",
  "guardianId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rollNumber": "2024-BS-CS-001",
    "message": "Student created successfully"
  }
}
```

---

### 2.4 Update Student
**PUT** `/students/:id`

**Request Body:**
```json
{
  "enrollmentStatus": "active",
  "currentSemester": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Student updated successfully"
  }
}
```

---

### 2.5 Get Student Enrollments
**GET** `/students/:id/enrollments`

**Query Parameters:**
- `semester` (string): Filter by semester
- `status` (string): Filter by enrollment status (registered, completed, dropped)

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "uuid",
        "section": {
          "id": "uuid",
          "sectionCode": "A",
          "course": {
            "code": "CS-101",
            "title": "Introduction to Programming",
            "creditHours": 3
          },
          "faculty": {
            "name": "Dr. Ali"
          }
        },
        "enrollmentStatus": "registered",
        "grade": null,
        "gpa": null,
        "attendancePercentage": 85.5
      }
    ]
  }
}
```

---

### 2.6 Get Student Results
**GET** `/students/:id/results`

**Query Parameters:**
- `semester` (string): Filter by semester
- `courseId` (uuid): Filter by course

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "course": {
          "code": "CS-101",
          "title": "Introduction to Programming"
        },
        "obtainedMarks": 85,
        "totalMarks": 100,
        "grade": "A",
        "gpa": 4.0,
        "semester": "2024-Fall"
      }
    ]
  }
}
```

---

### 2.7 Get Student CGPA
**GET** `/students/:id/cgpa`

**Response:**
```json
{
  "success": true,
  "data": {
    "cgpa": 3.54
  }
}
```

---

### 2.8 Update Student Status
**PUT** `/students/:id`

**Request Body:**
```json
{
  "enrollmentStatus": "suspended",
  "remarks": "Suspended due to disciplinary action"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Student updated successfully"
  }
}
```

---

### 2.9 Get Student Attendance Summary
**GET** `/attendance/summary`

**Query Parameters:**
- `studentId` (uuid)
- `sectionId` (uuid)
- `courseId` (uuid)

**Response:**
```json
{
  "success": true,
  "data": {
    "attendancePercentage": 82.5,
    "totalClasses": 40,
    "present": 33,
    "absent": 5,
    "late": 2,
    "excused": 0
  }
}
```

---

### 2.10 Get Attendance Report
**GET** `/attendance/reports`

**Query Parameters:**
- `studentId` (uuid)
- `courseId` (uuid)
- `sectionId` (uuid)
- `minPercentage` (number)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "uuid",
      "studentName": "Ali Raza",
      "courseId": "uuid",
      "courseName": "Software Engineering",
      "sectionCode": "A",
      "attendancePercentage": 68.5,
      "totalClasses": 40,
      "presentCount": 27,
      "absentCount": 8,
      "lateCount": 3,
      "excusedCount": 2,
      "status": "critical"
    }
  ]
}
```

---

### 2.11 Parent Communication Log (Planned)
**POST** `/communications/parent`

> **Note:** Endpoint to be implemented. UI currently collects communication notes locally and will sync once the endpoint is available.

**Expected Request Body:**
```json
{
  "studentId": "uuid",
  "channel": "Email",
  "notes": "Discussed low attendance and upcoming assignments",
  "contactedAt": "2024-10-10T09:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Parent communication logged"
  }
}
```

---

## 3. Courses API

### 3.1 Get All Courses
**GET** `/courses`

**Query Parameters:**
- `departmentId` (uuid): Filter by department
- `search` (string): Search by code or title
- `isActive` (boolean): Filter active courses
- `isElective` (boolean): Filter elective vs core

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "code": "CS-101",
        "title": "Introduction to Computer Science",
        "creditHours": 3,
        "theoryHours": 3,
        "labHours": 0,
        "isElective": false,
        "isActive": true,
        "prerequisiteCourseIds": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

---

### 3.2 Get Course by ID
**GET** `/courses/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "CS-101",
    "title": "Introduction to Computer Science",
    "creditHours": 3,
    "theoryHours": 3,
    "labHours": 0,
    "isElective": false,
    "isActive": true,
    "description": "Course overview...",
    "prerequisiteCourseIds": ["uuid2", "uuid3"],
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-06-20T09:15:00Z"
  }
}
```

---

### 3.3 Create Course
**POST** `/courses`

**Request Body:**
```json
{
  "code": "CS-101",
  "title": "Introduction to Programming",
  "departmentId": "uuid",
  "creditHours": 3,
  "theoryHours": 3,
  "labHours": 0,
  "description": "Course description...",
  "prerequisiteCourseIds": ["uuid"],
  "isElective": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "CS-101",
    "message": "Course created successfully"
  }
}
```

---

### 3.4 Update Course
**PUT** `/courses/:id`

**Request Body:**
```json
{
  "code": "CS-101",
  "title": "Introduction to Programming",
  "departmentId": "uuid",
  "creditHours": 3,
  "theoryHours": 3,
  "labHours": 0,
  "description": "Course description...",
  "prerequisiteCourseIds": ["uuid"],
  "isElective": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "CS-101",
    "message": "Course updated successfully"
  }
}
```

---

### 3.5 Course Sections
**GET** `/sections`

**Query Parameters:**
- `courseId` (uuid)
- `semester` (string)
- `facultyId` (uuid)

**Response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "uuid",
        "courseId": "uuid",
        "sectionCode": "A",
        "semester": "2024-Fall",
        "facultyId": "uuid",
        "maxCapacity": 35,
        "currentEnrollment": 28
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**POST** `/sections`
```json
{
  "courseId": "uuid",
  "sectionCode": "B",
  "semester": "2024-Fall",
  "maxCapacity": 30,
  "facultyId": "uuid",
  "roomId": "room-201"
}
```

**PUT** `/sections/:id`
```json
{
  "maxCapacity": 35,
  "facultyId": "uuid"
}
```

---

### 3.6 Curriculum Mapping

#### 3.6.1 Get Program Curriculum
**GET** `/academic/programs/:programId/curriculum`

**Response:**
```json
{
  "success": true,
  "data": {
    "programId": "uuid",
    "curriculum": [
      {
        "id": "uuid",
        "programId": "uuid",
        "courseId": "uuid",
        "semesterNumber": 1,
        "isCore": true,
        "notes": "Foundation course",
        "course": {
          "id": "uuid",
          "code": "CS-101",
          "title": "Introduction to Computer Science",
          "creditHours": 3
        }
      }
    ]
  }
}
```

#### 3.6.2 Add Course to Curriculum
**POST** `/academic/programs/:programId/curriculum`

**Request Body:**
```json
{
  "courseId": "uuid",
  "semesterNumber": 1,
  "isCore": true,
  "notes": "Capstone prerequisite"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "semesterNumber": 1,
    "isCore": true
  }
}
```

#### 3.6.3 Update Curriculum Entry
**PUT** `/academic/curriculum/:curriculumId`

**Request Body:**
```json
{
  "semesterNumber": 2,
  "isCore": false,
  "notes": "Moved to elective pathway"
}
```

#### 3.6.4 Delete Curriculum Entry
**DELETE** `/academic/curriculum/:curriculumId`

**Response:**
```json
{
  "success": true
}
```

---

## 4. Timetable Management API

### 4.1 Get Class Schedules
**GET** `/timetable/timetables`

**Query Parameters:**
- `sectionId` (uuid)
- `facultyId` (uuid)
- `semester` (string)
- `dayOfWeek` (1-7)
- `roomId` (uuid)

**Response:**
```json
{
  "success": true,
  "data": {
    "timetables": [
      {
        "id": "uuid",
        "sectionId": "uuid",
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "10:30",
        "roomId": "uuid",
        "facultyId": "uuid",
        "semester": "2024-Fall",
        "createdAt": "2024-09-01T06:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

### 4.2 Create Class Schedule
**POST** `/timetable/timetables`

**Request Body:**
```json
{
  "sectionId": "uuid",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "10:30",
  "roomId": "uuid",
  "facultyId": "uuid",
  "semester": "2024-Fall"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timetable": { "id": "uuid", "sectionId": "uuid" },
    "conflicts": []
  }
}
```

### 4.3 Update Class Schedule
**PUT** `/timetable/timetables/:id`

**Request Body:**
```json
{
  "startTime": "10:00",
  "endTime": "11:30",
  "roomId": "uuid"
}
```

### 4.4 Delete Class Schedule
**DELETE** `/timetable/timetables/:id`

**Response:**
```json
{
  "success": true
}
```

### 4.5 Get Rooms
**GET** `/timetable/rooms`

**Query Parameters:**
- `buildingId` (uuid)
- `roomType` (string)
- `isActive` (boolean)

### 4.6 Create Room
**POST** `/timetable/rooms`

```json
{
  "roomNumber": "NB-201",
  "roomType": "classroom",
  "capacity": 40,
  "facilities": ["projector", "whiteboard"]
}
```

### 4.7 Update Room
**PUT** `/timetable/rooms/:id`

### 4.8 Get Buildings
**GET** `/timetable/buildings`

Returns building metadata for room allocation dashboards.

---

## 4. Enrollments API

### 4.1 Register for Course
**POST** `/enrollments`

**Request Body:**
```json
{
  "studentId": "uuid",
  "sectionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Successfully enrolled in course"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "PREREQUISITE_NOT_MET",
    "message": "Prerequisite course CS-100 not completed"
  }
}
```

---

### 4.2 Drop Course
**DELETE** `/enrollments/:id`

**Response:**
```json
{
  "success": true,
  "message": "Course dropped successfully"
}
```

---

### 4.3 Get Enrollment Attendance
**GET** `/enrollments/:id/attendance`

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "uuid",
    "attendancePercentage": 85.5,
    "totalClasses": 30,
    "present": 25,
    "absent": 4,
    "late": 1,
    "records": [
      {
        "date": "2024-09-15",
        "status": "present"
      }
    ]
  }
}
```

---

## 5. Examinations API

### 5.1 List Exams
**GET** `/examination/exams`

**Query Parameters:**
- `courseId` (uuid)
- `sectionId` (uuid)
- `examType` (`midterm` | `final` | `quiz` | `assignment` | `practical`)
- `status` (`scheduled` | `ongoing` | `completed` | `cancelled`)
- `search` (string)
- `startDate`, `endDate` (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "uuid",
        "title": "Midterm Exam - Data Structures",
        "examType": "midterm",
        "courseId": "uuid",
        "sectionId": "uuid",
        "examDate": "2024-11-15",
        "startTime": "09:00",
        "endTime": "11:00",
        "totalMarks": 100,
        "passingMarks": 50,
        "roomId": "uuid",
        "location": "Auditorium A",
        "status": "scheduled",
        "createdAt": "2024-09-01T06:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

### 5.2 Create Exam
**POST** `/examination/exams`

**Request Body:**
```json
{
  "title": "Midterm Exam - Data Structures",
  "examType": "midterm",
  "courseId": "uuid",
  "sectionId": "uuid",
  "examDate": "2024-11-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "totalMarks": 100,
  "passingMarks": 50,
  "roomId": "uuid",
  "location": "Auditorium A",
  "instructions": "Bring scientific calculator"
}
```

### 5.3 Update Exam
**PUT** `/examination/exams/:id`

**Sample Body:**
```json
{
  "title": "Midterm Exam - Data Structures (Updated)",
  "totalMarks": 120
}
```

### 5.4 Delete Exam
**DELETE** `/examination/exams/:id`

**Response:**
```json
{ "success": true }
```

### 5.5 List Exam Results
**GET** `/examination/results`

**Query Parameters:**
- `examId` (uuid)
- `studentId` (uuid)
- `status` (`pending` | `graded` | `approved` | `re_evaluation`)
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "examId": "uuid",
        "studentId": "uuid",
        "obtainedMarks": 85,
        "totalMarks": 100,
        "percentage": 85,
        "status": "graded",
        "remarks": "Good performance",
        "createdAt": "2024-11-20T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

### 5.6 Create Exam Result
**POST** `/examination/results`

**Request Body:**
```json
{
  "examId": "uuid",
  "studentId": "uuid",
  "obtainedMarks": 75,
  "remarks": "Great improvement"
}
```

### 5.7 Update Exam Result
**PUT** `/examination/results/:id`

**Sample Body:**
```json
{
  "obtainedMarks": 80,
  "remarks": "Adjusted after recheck"
}
```

### 5.8 Approve Exam Result
**POST** `/examination/results/:id/approve`

**Response:**
```json
{ "success": true, "data": { "status": "approved" } }
```

### 5.9 List Re-evaluation Requests
**GET** `/examination/re-evaluations`

**Query Parameters:**
- `resultId` (uuid)
- `status` (`pending` | `under_review` | `approved` | `rejected`)
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "reEvaluations": [
      {
        "id": "uuid",
        "resultId": "uuid",
        "reason": "Mismatch in total",
        "status": "pending",
        "requestedBy": "student456",
        "createdAt": "2024-11-25T08:30:00Z"
      }
    ]
  }
}
```

### 5.10 Process Re-evaluation
**POST** `/examination/re-evaluations/:id/approve`

**Request Body:**
```json
{
  "decision": "approved",
  "remarks": "Marks recalculated"
}
```

### 5.11 Upload Question Paper
**POST** `/examination/question-papers`

**Request Body:**
```json
{
  "examId": "uuid",
  "version": "Final v1",
  "notes": "Sealed until exam day",
  "isActive": true,
  "secureUntil": "2024-11-14",
  "fileName": "CS101-midterm.pdf",
  "fileBase64": "data:application/pdf;base64,......"
}
```

### 5.12 Generate Secure Question Paper Link
**POST** `/examination/question-papers/:id/link`

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://storage..."
  }
}
```

### 5.13 Delete Question Paper
**DELETE** `/examination/question-papers/:id`

**Response:**
```json
{ "success": true }
```

---

## 6. Attendance API

### 6.1 Mark Attendance
**POST** `/attendance/mark`

**Request Body:**
```json
{
  "enrollmentId": "uuid",
  "date": "2024-09-15",
  "status": "present",
  "remarks": ""
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Attendance marked successfully"
  }
}
```

---

### 6.2 Bulk Mark Attendance
**POST** `/attendance/bulk-mark`

**Request Body:**
```json
{
  "sectionId": "uuid",
  "date": "2024-09-15",
  "attendance": [
    {
      "enrollmentId": "uuid",
      "status": "present"
    },
    {
      "enrollmentId": "uuid",
      "status": "absent"
    }
  ]
}
```

---

### 6.3 Get Attendance
**GET** `/attendance/enrollment/:id`

**Query Parameters:**
- `startDate` (date)
- `endDate` (date)

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "uuid",
    "attendancePercentage": 85.5,
    "totalClasses": 30,
    "present": 25,
    "absent": 4,
    "late": 1,
    "records": [...]
  }
}
```

---

## 7. Finance API

### 7.1 Get Student Fees
**GET** `/fees/student/:studentId`

**Query Parameters:**
- `semester` (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "fees": [
      {
        "id": "uuid",
        "feeType": "Tuition Fee",
        "semester": "2024-Fall",
        "amountDue": 50000,
        "amountPaid": 25000,
        "dueDate": "2024-10-15",
        "paymentStatus": "partial"
      }
    ],
    "summary": {
      "totalDue": 50000,
      "totalPaid": 25000,
      "outstanding": 25000
    }
  }
}
```

---

### 7.2 Process Payment
**POST** `/fees/payment`

**Request Body:**
```json
{
  "studentFeeId": "uuid",
  "amount": 25000,
  "paymentMethod": "jazzcash",
  "transactionId": "TXN123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "receiptNumber": "RCP-2024-001",
    "message": "Payment processed successfully"
  }
}
```

---

### 7.3 Get Payment Receipt
**GET** `/fees/receipt/:receiptNumber`

**Response:**
```json
{
  "success": true,
  "data": {
    "receiptNumber": "RCP-2024-001",
    "student": {
      "name": "Ahmed Khan",
      "rollNumber": "2024-BS-CS-001"
    },
    "payment": {
      "amount": 25000,
      "paymentDate": "2024-10-01",
      "paymentMethod": "jazzcash"
    },
    "feeDetails": {
      "semester": "2024-Fall",
      "feeType": "Tuition Fee"
    }
  }
}
```

---

## 8. Common Patterns

### 8.1 Pagination
All list endpoints support pagination:

```
GET /api/v1/resource?page=1&limit=20
```

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 8.2 Error Responses

**Standard Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `INTERNAL_ERROR`: Server error

### 8.3 Filtering & Sorting

**Query Parameters:**
- `search`: Text search
- `filter`: JSON filter object
- `sort`: Sort field and direction
- `fields`: Fields to include/exclude

**Example:**
```
GET /api/v1/students?search=ahmed&sort=-createdAt&limit=10
```

### 8.4 Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Tokens expire after 1 hour. Use refresh token endpoint to get new token.

---

## API Rate Limiting

- **Standard**: 100 requests per minute
- **Authenticated**: 500 requests per minute
- **Response Headers:**
  ```
  X-RateLimit-Limit: 500
  X-RateLimit-Remaining: 450
  X-RateLimit-Reset: 1633024800
  ```

---

## API Versioning

- Current version: `v1`
- Version in URL: `/api/v1/...`
- Future versions: `/api/v2/...`
- Deprecated endpoints will be announced 3 months in advance

---

## Testing

Use the following test credentials for development:

```
Email: test@example.com
Password: Test123!
```

**Note**: These credentials only work in development/staging environments.

---

## Support

For API support:
- Documentation: [docs.ams.example.com](https://docs.ams.example.com)
- Support Email: api-support@ams.example.com
- GitHub Issues: [github.com/ams/issues](https://github.com/ams/issues)

---

**Last Updated**: 2024

