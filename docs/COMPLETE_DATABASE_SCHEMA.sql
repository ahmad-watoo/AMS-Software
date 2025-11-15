-- ============================================================
--  ACADEMIC MANAGEMENT SYSTEM (SUPABASE / POSTGRESQL)
--  Complete Database Schema Version 2.0
-- ============================================================
--  This script creates all tables required for the complete AMS system
--  Run this script in your Supabase SQL Editor
-- ============================================================

-- 1️⃣ Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2️⃣ CORE TABLES (Users, Roles, Permissions)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cnic ON users(cnic);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- Insert default roles
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
('staff', 'General Staff', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3️⃣ MULTI-CAMPUS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS campuses (
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

CREATE TABLE IF NOT EXISTS student_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_campus_id UUID REFERENCES campuses(id),
    to_campus_id UUID NOT NULL REFERENCES campuses(id),
    transfer_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    from_campus_id UUID REFERENCES campuses(id),
    to_campus_id UUID NOT NULL REFERENCES campuses(id),
    transfer_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4️⃣ ACADEMIC DOMAIN TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
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

CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    degree_level VARCHAR(50),
    duration_years INTEGER,
    total_credit_hours INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_number INTEGER NOT NULL,
    is_core BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, course_id, semester_number)
);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    credit_hours INTEGER NOT NULL,
    theory_hours INTEGER DEFAULT 0,
    lab_hours INTEGER DEFAULT 0,
    description TEXT,
    prerequisite_course_ids UUID[],
    is_elective BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    campus_id UUID REFERENCES campuses(id),
    floors INTEGER,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, campus_id)
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(50) NOT NULL,
    building_id UUID REFERENCES buildings(id),
    room_type VARCHAR(50),
    capacity INTEGER,
    facilities TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_number, building_id)
);

CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    occupation VARCHAR(100),
    address TEXT,
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    program_id UUID NOT NULL REFERENCES programs(id),
    batch VARCHAR(20),
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

CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    designation VARCHAR(100),
    qualification TEXT,
    specialization TEXT,
    joining_date DATE,
    employment_type VARCHAR(20) CHECK (employment_type IN ('permanent', 'contract', 'temporary', 'visiting')),
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_code VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    faculty_id UUID REFERENCES users(id),
    max_capacity INTEGER NOT NULL,
    current_enrollment INTEGER DEFAULT 0,
    room_id UUID REFERENCES rooms(id),
    schedule_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, section_code, semester)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    enrollment_status VARCHAR(20) DEFAULT 'registered' CHECK (enrollment_status IN ('registered', 'dropped', 'completed', 'failed')),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    drop_date TIMESTAMP WITH TIME ZONE,
    grade VARCHAR(5),
    gpa DECIMAL(3,2),
    attendance_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

-- ============================================================
-- 5️⃣ ADMISSION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS admission_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    application_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'eligible', 'interview_scheduled', 'selected', 'waitlisted', 'rejected', 'fee_submitted', 'enrolled')),
    eligibility_status VARCHAR(20) CHECK (eligibility_status IN ('eligible', 'not_eligible', 'pending')),
    eligibility_score DECIMAL(5,2),
    merit_rank INTEGER,
    interview_date DATE,
    interview_time TIME,
    interview_location VARCHAR(200),
    remarks TEXT,
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admission_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- 6️⃣ EXAMINATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_type VARCHAR(50),
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

CREATE TABLE IF NOT EXISTS results (
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

CREATE TABLE IF NOT EXISTS re_evaluation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    exam_id UUID REFERENCES exams(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    version VARCHAR(50),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7️⃣ ATTENDANCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id),
    student_id UUID NOT NULL REFERENCES students(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'leave')),
    remarks TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'casual', 'emergency', 'maternity', 'paternity', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL,
    reason TEXT,
    applied_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_type VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8️⃣ TIMETABLE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID REFERENCES rooms(id),
    faculty_id UUID REFERENCES users(id),
    semester VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, day_of_week, start_time, semester)
);

-- ============================================================
-- 9️⃣ FINANCIAL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id),
    semester VARCHAR(20) NOT NULL,
    fee_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_fees (
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

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_fee_id UUID REFERENCES student_fees(id),
    student_id UUID NOT NULL REFERENCES students(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_gateway VARCHAR(50),
    receipt_number VARCHAR(50) UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 🔟 LEARNING MANAGEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS course_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('document', 'video', 'link', 'presentation', 'other')),
    file_url TEXT,
    external_url TEXT,
    file_size INTEGER,
    file_name VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date DATE NOT NULL,
    max_marks INTEGER NOT NULL,
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('individual', 'group', 'project')),
    allowed_file_types TEXT[],
    max_file_size INTEGER,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    submission_files JSONB,
    submitted_text TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded', 'returned')),
    obtained_marks DECIMAL(6,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grade_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    assignment_id UUID REFERENCES assignments(id),
    exam_id UUID REFERENCES exams(id),
    obtained_marks DECIMAL(6,2) NOT NULL,
    total_marks DECIMAL(6,2) NOT NULL,
    weightage DECIMAL(5,2) NOT NULL,
    grade_category VARCHAR(50) NOT NULL CHECK (grade_category IN ('assignment', 'quiz', 'midterm', 'final', 'project', 'participation')),
    remarks TEXT,
    entered_by UUID REFERENCES users(id),
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 1️⃣1️⃣ LIBRARY TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn VARCHAR(20),
    title VARCHAR(200) NOT NULL,
    author VARCHAR(200),
    publisher VARCHAR(200),
    publication_year INTEGER,
    edition VARCHAR(50),
    category VARCHAR(100),
    subject VARCHAR(200),
    language VARCHAR(50),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location VARCHAR(50),
    cover_image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrower_id UUID NOT NULL REFERENCES users(id),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty', 'staff')),
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
    issued_by UUID REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    remarks TEXT,
    renewed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty', 'staff')),
    reservation_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'fulfilled', 'cancelled', 'expired')),
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_timings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day_of_week)
);

-- ============================================================
-- 1️⃣2️⃣ HR MANAGEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    designation VARCHAR(100),
    qualification TEXT,
    specialization TEXT,
    joining_date DATE,
    employment_type VARCHAR(20) CHECK (employment_type IN ('permanent', 'contract', 'temporary', 'visiting')),
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    employment_type VARCHAR(20) NOT NULL CHECK (employment_type IN ('permanent', 'contract', 'temporary')),
    location VARCHAR(200),
    posted_date DATE NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'filled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_name VARCHAR(200) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_cnic VARCHAR(15) NOT NULL,
    cover_letter TEXT,
    resume_url TEXT,
    applied_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'interviewed', 'rejected', 'accepted')),
    interview_date DATE,
    interview_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 1️⃣3️⃣ PAYROLL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS salary_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    basic_salary DECIMAL(10,2) NOT NULL,
    house_rent_allowance DECIMAL(10,2) DEFAULT 0,
    medical_allowance DECIMAL(10,2) DEFAULT 0,
    transport_allowance DECIMAL(10,2) DEFAULT 0,
    other_allowances DECIMAL(10,2) DEFAULT 0,
    provident_fund DECIMAL(10,2) DEFAULT 0,
    tax_deduction DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    gross_salary DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_processing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    payroll_period VARCHAR(7) NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    gross_salary DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    provident_fund DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    days_worked INTEGER,
    days_in_month INTEGER,
    bonus DECIMAL(10,2) DEFAULT 0,
    overtime DECIMAL(10,2) DEFAULT 0,
    advance_deduction DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'approved', 'paid')),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    payment_date DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, payroll_period)
);

CREATE TABLE IF NOT EXISTS salary_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salary_processing_id UUID NOT NULL REFERENCES salary_processing(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES staff(id),
    payroll_period VARCHAR(7) NOT NULL,
    slip_number VARCHAR(50) UNIQUE NOT NULL,
    issued_date DATE NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 1️⃣4️⃣ CERTIFICATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS certificate_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL CHECK (certificate_type IN ('degree', 'transcript', 'character', 'bonafide', 'course_completion', 'attendance', 'other')),
    purpose TEXT NOT NULL,
    requested_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'ready', 'delivered', 'cancelled')),
    fee_amount DECIMAL(10,2),
    fee_paid BOOLEAN DEFAULT false,
    payment_date DATE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('pickup', 'email', 'postal')),
    delivery_address TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_request_id UUID NOT NULL REFERENCES certificate_requests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    certificate_type VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    qr_code_url TEXT,
    pdf_url TEXT,
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    certificate_type VARCHAR(50) NOT NULL,
    template_html TEXT NOT NULL,
    template_pdf TEXT,
    signature_url TEXT,
    seal_url TEXT,
    watermark_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 1️⃣5️⃣ ADMINISTRATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    category VARCHAR(50),
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_editable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) CHECK (event_type IN ('academic', 'cultural', 'sports', 'workshop', 'seminar', 'conference', 'holiday', 'other')),
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    organizer_id UUID REFERENCES users(id),
    target_audience TEXT[],
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    registration_required BOOLEAN DEFAULT false,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notice_type VARCHAR(50) CHECK (notice_type IN ('announcement', 'important', 'general', 'exam', 'fee', 'holiday')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    target_audience TEXT[],
    published_date DATE NOT NULL,
    expiry_date DATE,
    published_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 1️⃣6️⃣ TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_%s_updated_at ON %I', r.table_name, r.table_name);
        EXECUTE format('CREATE TRIGGER trg_update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', r.table_name, r.table_name);
    END LOOP;
END $$;

-- ============================================================
-- ✅ END OF SCHEMA
-- ============================================================

