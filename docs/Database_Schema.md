# Database Schema Design
## Academic Management System
### Supabase (PostgreSQL) Schema

**Version:** 1.0  
**Last Updated:** 2024

---

## Table of Contents

1. [Schema Overview](#1-schema-overview)
2. [Core Tables](#2-core-tables)
3. [Academic Tables](#3-academic-tables)
4. [Financial Tables](#4-financial-tables)
5. [Administrative Tables](#5-administrative-tables)
6. [Library Tables](#6-library-tables)
7. [Security & Audit Tables](#7-security--audit-tables)
8. [Indexes and Constraints](#8-indexes-and-constraints)
9. [Row Level Security (RLS)](#9-row-level-security-rls)

---

## 1. Schema Overview

### 1.1 Database Structure
- **Database**: PostgreSQL 15+ (via Supabase)
- **Naming Convention**: snake_case
- **Primary Keys**: UUID (uuid_generate_v4())
- **Timestamps**: Created_at, Updated_at (with triggers)
- **Soft Deletes**: Deleted_at column for soft deletion

### 1.2 Schema Organization
Schemas organized by functional domains:
- `auth` - Authentication (Supabase managed)
- `public` - Main application tables
- `analytics` - Reporting and analytics tables

---

## 2. Core Tables

### 2.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(50),
    postal_code VARCHAR(10),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cnic ON users(cnic);
CREATE INDEX idx_users_active ON users(is_active);
```

### 2.2 Roles Table
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    level INTEGER NOT NULL, -- Hierarchy level (higher = more privileges)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default roles
INSERT INTO roles (name, description, level) VALUES
('super_admin', 'System Super Administrator', 10),
('admin', 'Institution Administrator', 9),
('registrar', 'Academic Registrar', 8),
('faculty', 'Teaching Faculty', 7),
('finance_officer', 'Finance Officer', 7),
('hr_manager', 'HR Manager', 7),
('librarian', 'Library Staff', 6),
('student', 'Student', 5),
('parent', 'Parent/Guardian', 4),
('staff', 'General Staff', 6);
```

### 2.3 User Roles Table (Many-to-Many)
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id),
    department_id UUID REFERENCES departments(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id, campus_id, department_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

### 2.4 Permissions Table
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, approve
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example permissions
-- Module: admission, Actions: create_application, view_application, approve_application
-- Module: student, Actions: view_profile, update_profile, delete_profile
```

### 2.5 Role Permissions Table
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);
```

---

## 3. Academic Tables

### 3.1 Campuses Table
```sql
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    principal_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Departments Table
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    campus_id UUID REFERENCES campuses(id),
    head_of_department_id UUID REFERENCES users(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, campus_id)
);
```

### 3.3 Programs Table
```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    degree_level VARCHAR(50), -- Bachelor, Master, PhD, Diploma, Certificate
    duration_years INTEGER,
    total_credit_hours INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.4 Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    program_id UUID NOT NULL REFERENCES programs(id),
    batch VARCHAR(20), -- e.g., "2024-Fall"
    admission_date DATE NOT NULL,
    enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('active', 'graduated', 'suspended', 'withdrawn', 'transfer')),
    current_semester INTEGER DEFAULT 1,
    cgpa DECIMAL(4,2),
    blood_group VARCHAR(5),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    guardian_id UUID REFERENCES guardians(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_batch ON students(batch);
```

### 3.5 Guardians Table
```sql
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(50), -- Father, Mother, Guardian
    name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    occupation VARCHAR(100),
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.6 Courses Table
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    credit_hours INTEGER NOT NULL,
    theory_hours INTEGER DEFAULT 0,
    lab_hours INTEGER DEFAULT 0,
    description TEXT,
    prerequisite_course_ids UUID[], -- Array of course IDs
    is_elective BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department ON courses(department_id);
```

### 3.7 Sections Table
```sql
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_code VARCHAR(10) NOT NULL, -- A, B, C, etc.
    semester VARCHAR(20) NOT NULL, -- e.g., "2024-Fall"
    faculty_id UUID REFERENCES users(id),
    max_capacity INTEGER NOT NULL,
    current_enrollment INTEGER DEFAULT 0,
    room_id UUID REFERENCES rooms(id),
    schedule_id UUID REFERENCES schedules(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, section_code, semester)
);

CREATE INDEX idx_sections_course_semester ON sections(course_id, semester);
```

### 3.8 Enrollments Table
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    enrollment_status VARCHAR(20) DEFAULT 'registered' CHECK (enrollment_status IN ('registered', 'dropped', 'completed', 'failed')),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    drop_date TIMESTAMP WITH TIME ZONE,
    grade VARCHAR(5), -- A+, A, B+, B, etc.
    gpa DECIMAL(3,2),
    attendance_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_section ON enrollments(section_id);
```

### 3.9 Faculty Table
```sql
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    designation VARCHAR(100), -- Professor, Associate Professor, Assistant Professor, Lecturer
    qualification TEXT,
    specialization TEXT,
    joining_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.10 Timetables Table
```sql
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID REFERENCES rooms(id),
    faculty_id UUID REFERENCES users(id),
    semester VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, day_of_week, start_time, semester)
);
```

### 3.11 Rooms Table
```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(50) NOT NULL,
    building_id UUID REFERENCES buildings(id),
    room_type VARCHAR(50), -- Classroom, Lab, Auditorium, Library
    capacity INTEGER,
    facilities TEXT[], -- Array of facilities
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_number, building_id)
);
```

### 3.12 Buildings Table
```sql
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    campus_id UUID REFERENCES campuses(id),
    floors INTEGER,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, campus_id)
);
```

### 3.13 Exams Table
```sql
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_type VARCHAR(50), -- Midterm, Final, Quiz, Assignment
    course_id UUID REFERENCES courses(id),
    section_id UUID REFERENCES sections(id),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID REFERENCES rooms(id),
    invigilator_id UUID REFERENCES users(id),
    total_marks INTEGER NOT NULL,
    passing_marks INTEGER,
    question_paper_url TEXT,
    answer_key_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exams_section ON exams(section_id);
```

### 3.14 Results Table
```sql
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id),
    obtained_marks DECIMAL(6,2),
    total_marks DECIMAL(6,2),
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    gpa DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'pass' CHECK (status IN ('pass', 'fail', 'absent')),
    remarks TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_results_enrollment ON results(enrollment_id);
```

### 3.15 Attendance Records Table
```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, attendance_date)
);

CREATE INDEX idx_attendance_enrollment_date ON attendance_records(enrollment_id, attendance_date);
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
```

---

## 4. Financial Tables

### 4.1 Fee Structures Table
```sql
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id),
    semester VARCHAR(20) NOT NULL,
    fee_type VARCHAR(50) NOT NULL, -- Tuition, Library, Lab, Sports, etc.
    amount DECIMAL(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Student Fees Table
```sql
CREATE TABLE student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id),
    semester VARCHAR(20) NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    due_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'waived', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_status ON student_fees(payment_status);
```

### 4.3 Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_fee_id UUID REFERENCES student_fees(id),
    student_id UUID NOT NULL REFERENCES students(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- Cash, Bank Transfer, JazzCash, EasyPaisa, Card
    transaction_id VARCHAR(100),
    payment_gateway VARCHAR(50),
    receipt_number VARCHAR(50) UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
```

### 4.4 Fee Concessions Table
```sql
CREATE TABLE fee_concessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    concession_type VARCHAR(50), -- Scholarship, Financial Aid, Merit-based, Need-based
    percentage DECIMAL(5,2),
    amount DECIMAL(10,2),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Administrative Tables

### 5.1 Staff Table
```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    designation VARCHAR(100),
    joining_date DATE,
    employment_type VARCHAR(50), -- Permanent, Contract, Temporary
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.2 Leaves Table
```sql
CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type VARCHAR(50), -- Annual, Sick, Casual, Emergency, Maternity
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.3 Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- Academic, Cultural, Sports, Workshop
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    organizer_id UUID REFERENCES users(id),
    target_audience VARCHAR(50)[], -- students, faculty, staff, all
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.4 Notices Table
```sql
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notice_type VARCHAR(50), -- General, Academic, Fee, Exam, Event
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience VARCHAR(50)[], -- students, faculty, staff, parents, all
    campus_id UUID REFERENCES campuses(id),
    department_id UUID REFERENCES departments(id),
    published_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notices_active ON notices(is_active, published_at);
```

---

## 6. Library Tables

### 6.1 Books Table
```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn VARCHAR(20),
    title VARCHAR(200) NOT NULL,
    author VARCHAR(200),
    publisher VARCHAR(200),
    publication_year INTEGER,
    category VARCHAR(100),
    language VARCHAR(50),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    shelf_location VARCHAR(50),
    cover_image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
```

### 6.2 Book Borrowings Table
```sql
CREATE TABLE book_borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrower_id UUID NOT NULL REFERENCES users(id),
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
    issued_by UUID REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_borrowings_borrower ON book_borrowings(borrower_id);
CREATE INDEX idx_borrowings_status ON book_borrowings(status);
```

### 6.3 Book Reservations Table
```sql
CREATE TABLE book_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    reservation_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'expired')),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, user_id, status) WHERE status = 'pending'
);
```

---

## 7. Security & Audit Tables

### 7.1 Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- create, update, delete, login, logout
    entity_type VARCHAR(50), -- student, course, payment, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 7.2 Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## 8. Indexes and Constraints

### 8.1 Common Indexes
- Foreign key indexes
- Frequently queried columns
- Composite indexes for common queries

### 8.2 Triggers

#### 8.2.1 Updated_at Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 8.2.2 Audit Log Trigger
```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
        current_setting('app.current_user_id', true)::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        row_to_json(OLD),
        row_to_json(NEW)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';
```

---

## 9. Row Level Security (RLS)

### 9.1 Enable RLS
```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
-- Enable for all sensitive tables
```

### 9.2 RLS Policies Examples

#### Students can view their own data
```sql
CREATE POLICY "Students can view own profile"
ON students FOR SELECT
USING (user_id = auth.uid());
```

#### Faculty can view their section students
```sql
CREATE POLICY "Faculty can view section students"
ON enrollments FOR SELECT
USING (
    section_id IN (
        SELECT id FROM sections WHERE faculty_id = auth.uid()
    )
);
```

---

## 10. Database Functions

### 10.1 Calculate CGPA
```sql
CREATE OR REPLACE FUNCTION calculate_cgpa(student_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_credits DECIMAL := 0;
    weighted_sum DECIMAL := 0;
    cgpa DECIMAL;
BEGIN
    SELECT 
        SUM(c.credit_hours),
        SUM(c.credit_hours * e.gpa)
    INTO total_credits, weighted_sum
    FROM enrollments e
    JOIN sections s ON e.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE e.student_id = student_uuid
    AND e.enrollment_status = 'completed'
    AND e.gpa IS NOT NULL;
    
    IF total_credits > 0 THEN
        cgpa := weighted_sum / total_credits;
    ELSE
        cgpa := 0;
    END IF;
    
    RETURN cgpa;
END;
$$ LANGUAGE plpgsql;
```

### 10.2 Get Student Attendance Percentage
```sql
CREATE OR REPLACE FUNCTION get_attendance_percentage(enrollment_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_classes INTEGER;
    present_count INTEGER;
    percentage DECIMAL;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status IN ('present', 'late'))
    INTO total_classes, present_count
    FROM attendance_records
    WHERE enrollment_id = enrollment_uuid;
    
    IF total_classes > 0 THEN
        percentage := (present_count::DECIMAL / total_classes::DECIMAL) * 100;
    ELSE
        percentage := 0;
    END IF;
    
    RETURN percentage;
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Data Migration Scripts

### 11.1 Seed Data Script
```sql
-- Insert default roles
-- Insert default permissions
-- Insert default admin user
-- Insert sample campuses/departments
```

---

## Notes

1. All timestamps use `TIMESTAMP WITH TIME ZONE`
2. Use UUID for all primary keys
3. Implement soft deletes using `deleted_at`
4. Use JSONB for flexible data storage where needed
5. All foreign keys should have appropriate CASCADE rules
6. Index frequently queried columns
7. Use check constraints for data validation
8. Implement RLS for data security

---

**Document End**

