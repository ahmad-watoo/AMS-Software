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

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "courseCode": "CS-101",
        "courseTitle": "Introduction to Programming",
        "creditHours": 3,
        "obtainedMarks": 85,
        "totalMarks": 100,
        "grade": "A",
        "gpa": 4.0,
        "semester": "2024-Fall"
      }
    ],
    "summary": {
      "semesterGPA": 3.85,
      "cgpa": 3.75,
      "totalCreditHours": 45
    }
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

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "code": "CS-101",
        "title": "Introduction to Programming",
        "creditHours": 3,
        "theoryHours": 3,
        "labHours": 0,
        "department": {
          "name": "Computer Science"
        },
        "prerequisites": [
          {
            "code": "CS-100",
            "title": "Computer Fundamentals"
          }
        ],
        "isElective": false
      }
    ]
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
    "title": "Introduction to Programming",
    "description": "Introduction to programming concepts...",
    "creditHours": 3,
    "prerequisites": [...],
    "sections": [
      {
        "id": "uuid",
        "sectionCode": "A",
        "semester": "2024-Fall",
        "faculty": {
          "name": "Dr. Ali"
        },
        "maxCapacity": 50,
        "currentEnrollment": 45
      }
    ]
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

### 5.1 Get Exams
**GET** `/exams`

**Query Parameters:**
- `sectionId` (uuid): Filter by section
- `examType` (string): midterm, final, quiz
- `date` (date): Filter by date

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "uuid",
        "examType": "midterm",
        "course": {
          "code": "CS-101",
          "title": "Introduction to Programming"
        },
        "examDate": "2024-11-15",
        "startTime": "09:00",
        "endTime": "11:00",
        "room": {
          "roomNumber": "A-101",
          "building": "Block A"
        },
        "totalMarks": 100,
        "passingMarks": 50
      }
    ]
  }
}
```

---

### 5.2 Create Exam
**POST** `/exams`

**Request Body:**
```json
{
  "examType": "midterm",
  "sectionId": "uuid",
  "examDate": "2024-11-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "roomId": "uuid",
  "invigilatorId": "uuid",
  "totalMarks": 100,
  "passingMarks": 50
}
```

---

### 5.3 Enter Results
**POST** `/exams/:id/results`

**Request Body:**
```json
{
  "results": [
    {
      "enrollmentId": "uuid",
      "obtainedMarks": 85,
      "remarks": "Good performance"
    }
  ]
}
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

