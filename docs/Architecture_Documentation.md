# System Architecture Documentation
## Academic Management System (AMS)

**Version:** 1.0  
**Last Updated:** 2024

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Architecture](#6-database-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Integration Architecture](#8-integration-architecture)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Scalability Considerations](#10-scalability-considerations)

---

## 1. Architecture Overview

### 1.1 System Architecture Pattern
The AMS follows a **three-tier architecture** pattern:
- **Presentation Layer**: React frontend
- **Application Layer**: Node.js/Express backend
- **Data Layer**: Supabase (PostgreSQL)

### 1.2 Architectural Principles
- **Separation of Concerns**: Clear boundaries between layers
- **Modularity**: Feature-based modules
- **Scalability**: Horizontal scaling capability
- **Security**: Defense in depth
- **Maintainability**: Clean code, documentation
- **Performance**: Optimized for speed

### 1.3 System Flow
```
User → React Frontend → Express Backend → Supabase Database
                      ↓
              Third-party Services
           (Payment, SMS, Email, etc.)
```

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile Web  │  │   Admin      │    │
│  │  (React)     │  │   (PWA)      │  │   Panel      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          │
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Express.js Backend                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │  Auth    │  │ Business │  │   API    │          │ │
│  │  │ Service  │  │  Logic   │  │ Gateway  │          │ │
│  │  └──────────┘  └──────────┘  └──────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Middleware Layer                        │ │
│  │  Auth | Validation | Error Handling | Logging       │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Supabase (PostgreSQL)                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │   Auth   │  │Database  │  │ Storage  │          │ │
│  │  │  Service│  │(Postgres) │  │  (Files) │          │ │
│  │  └──────────┘  └──────────┘  └──────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│              THIRD-PARTY SERVICES                           │
│  Payment | SMS | Email | Video Conference | Biometric      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend Stack

```
React 18+
├── TypeScript          # Type safety
├── Ant Design 5        # UI component library
├── React Router v6     # Client-side routing
├── React Query         # Server state management
├── React Hook Form     # Form management
├── Zod                 # Schema validation
├── Axios               # HTTP client
├── date-fns            # Date manipulation
└── Recharts            # Data visualization
```

### 3.2 Backend Stack

```
Node.js 18+
├── Express.js 4.x      # Web framework
├── TypeScript         # Type safety
├── Supabase Client    # Database client
├── JWT                # Authentication tokens
├── Socket.io          # Real-time (optional)
├── Multer             # File uploads
├── Winston             # Logging
└── Zod                # Validation
```

### 3.3 Database Stack

```
Supabase Platform
├── PostgreSQL 15+     # Primary database
├── Row Level Security # Data security
├── Realtime           # Real-time subscriptions
├── Storage            # File storage
├── Auth               # Authentication service
└── Edge Functions     # Serverless functions (optional)
```

---

## 4. Frontend Architecture

### 4.1 Component Architecture

#### 4.1.1 Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Content Area
│       ├── Routes
│       │   ├── Dashboard
│       │   ├── Students
│       │   ├── Courses
│       │   └── ...
│       └── Modals
└── Providers
    ├── AuthProvider
    ├── ThemeProvider
    └── QueryProvider
```

#### 4.1.2 Component Types
- **Pages**: Top-level route components
- **Containers**: Connected components with state/logic
- **Components**: Reusable UI components
- **Layouts**: Page layout wrappers
- **Forms**: Form-specific components

### 4.2 State Management Architecture

#### 4.2.1 Server State
- **React Query**: Manages server state
- **Caching**: Automatic caching and refetching
- **Optimistic Updates**: For better UX

#### 4.2.2 Client State
- **React Context**: For global UI state (theme, user)
- **Local State**: useState/useReducer for component state
- **URL State**: React Router for navigation state

### 4.3 Routing Architecture

```typescript
// Route Structure
/                       # Public Landing
/login                  # Public Login
/signup                 # Public Signup

/dashboard              # Protected (Role-based)
/students               # Protected (Students module)
/courses                # Protected (Courses module)
/fees                   # Protected (Finance module)
/...
```

### 4.4 API Integration Layer

```typescript
// API Client Structure
api/
├── client.ts          # Axios instance, interceptors
├── auth.ts            # Auth endpoints
├── students.ts        # Student endpoints
├── courses.ts         # Course endpoints
└── ...
```

**Features:**
- Request/Response interceptors
- Automatic token refresh
- Error handling
- Request cancellation

---

## 5. Backend Architecture

### 5.1 Layered Architecture

```
┌─────────────────────────────────────────┐
│         Controller Layer                │
│  (Request handling, validation)        │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Service Layer                   │
│  (Business logic, orchestration)       │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Data Access Layer                │
│  (Database queries, Supabase client)   │
└─────────────────────────────────────────┘
```

### 5.2 Controller Layer
- **Responsibilities**:
  - Request validation
  - Response formatting
  - Error handling
  - Authentication/Authorization checks

### 5.3 Service Layer
- **Responsibilities**:
  - Business logic
  - Data transformation
  - Orchestration of multiple operations
  - External service integration

### 5.4 Data Access Layer
- **Responsibilities**:
  - Database queries
  - Data mapping
  - Query optimization
  - Transaction management

### 5.5 Middleware Stack

```
Request
  │
  ├─> CORS Middleware
  ├─> Body Parser
  ├─> Authentication Middleware
  ├─> Authorization Middleware
  ├─> Validation Middleware
  ├─> Rate Limiting
  │
  └─> Route Handler
```

---

## 6. Database Architecture

### 6.1 Database Schema Organization

```
public schema
├── Core Tables
│   ├── users
│   ├── roles
│   ├── permissions
│   └── user_roles
├── Academic Tables
│   ├── campuses
│   ├── departments
│   ├── programs
│   ├── students
│   ├── courses
│   ├── sections
│   └── enrollments
├── Financial Tables
│   ├── fee_structures
│   ├── student_fees
│   └── payments
└── Other Modules...
```

### 6.2 Database Design Principles
- **Normalization**: 3NF minimum
- **Indexing**: Strategic indexes for performance
- **Constraints**: Foreign keys, check constraints
- **Triggers**: For automated tasks
- **Functions**: Reusable database functions

### 6.3 Row Level Security (RLS)
- **Campus-level isolation**: Users see only their campus data
- **Department-level isolation**: Faculty see only their department
- **User-level isolation**: Students see only their own data

### 6.4 Database Access Patterns

#### Direct Supabase Client (Frontend)
```typescript
// For simple queries with RLS
const { data } = await supabase
  .from('students')
  .select('*')
  .eq('campus_id', campusId);
```

#### Backend API (Complex Operations)
```typescript
// For complex business logic
POST /api/v1/students
// Backend validates, processes, then inserts
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
1. User submits credentials
2. Backend validates with Supabase Auth
3. Supabase returns JWT tokens
4. Backend returns tokens to frontend
5. Frontend stores tokens (httpOnly cookies or localStorage)
6. Frontend includes token in subsequent requests
```

### 7.2 Authorization Layers

```
Request
  │
  ├─> JWT Token Validation
  ├─> Role Extraction
  ├─> Permission Check
  ├─> Resource Ownership Check
  └─> Row Level Security (Database)
```

### 7.3 Data Security

#### 7.3.1 Encryption
- **In Transit**: HTTPS/TLS
- **At Rest**: Database encryption (Supabase managed)
- **Sensitive Fields**: Additional encryption for PII

#### 7.3.2 Input Validation
- **Frontend**: Client-side validation
- **Backend**: Server-side validation
- **Database**: Constraints and triggers

### 7.4 Security Best Practices
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection (tokens)
- Rate limiting
- Security headers

---

## 8. Integration Architecture

### 8.1 Payment Gateway Integration

```
Payment Request
  │
  ├─> Validate payment details
  ├─> Create payment record (pending)
  ├─> Call payment gateway API
  │   ├─> JazzCash
  │   ├─> EasyPaisa
  │   └─> Bank Transfer
  │
  ├─> Payment Gateway Callback
  ├─> Verify payment
  └─> Update payment status
```

### 8.2 SMS Integration

```
SMS Sending
  │
  ├─> Queue SMS message
  ├─> Call SMS Gateway API
  │   ├─> Ufone API
  │   ├─> Telenor API
  │   └─> Jazz API
  │
  └─> Log SMS status
```

### 8.3 Email Integration

```
Email Sending
  │
  ├─> Prepare email template
  ├─> Send via SMTP/SendGrid
  └─> Log email status
```

### 8.4 Biometric Integration

```
Attendance Marking
  │
  ├─> Biometric device scan
  ├─> Device API call
  ├─> Verify fingerprint/face
  ├─> Match with student/faculty
  └─> Record attendance
```

---

## 9. Deployment Architecture

### 9.1 Production Deployment

```
┌─────────────────────────────────────────┐
│           CDN (CloudFront)              │
│      Static Assets, Caching             │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│      Load Balancer                      │
│  (Route53 + ALB/Cloudflare)            │
└─────────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───────────┐            ┌───────────┐
│ Frontend  │            │ Backend   │
│ (Vercel/  │            │ (Railway/ │
│ Netlify)  │            │ Render)   │
└───────────┘            └───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────────────┐      ┌───────────────┐
            │   Supabase    │      │  File Storage │
            │  (PostgreSQL) │      │  (Supabase)   │
            └───────────────┘      └───────────────┘
```

### 9.2 Environment Configuration

#### Development
- Local Supabase instance (optional)
- Local development server
- Hot reload enabled

#### Staging
- Staging Supabase project
- Staging API server
- Production-like environment

#### Production
- Production Supabase project
- Production API server
- SSL certificates
- Monitoring and logging

### 9.3 CI/CD Pipeline

```
Git Push
  │
  ├─> Run Tests
  ├─> Build Application
  ├─> Security Scan
  ├─> Deploy to Staging
  ├─> Run Integration Tests
  ├─> Manual Approval
  └─> Deploy to Production
```

---

## 10. Scalability Considerations

### 10.1 Horizontal Scaling

#### Frontend
- CDN for static assets
- Multiple instances (if needed)
- Browser caching

#### Backend
- Stateless API design
- Load balancer
- Multiple server instances
- Database connection pooling

#### Database
- Supabase auto-scaling
- Read replicas (if needed)
- Query optimization
- Caching layer (Redis - optional)

### 10.2 Performance Optimization

#### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

#### Backend
- Database query optimization
- Caching strategies
- API response compression
- Efficient data pagination

#### Database
- Proper indexing
- Query analysis
- Connection pooling
- Materialized views (if needed)

### 10.3 Caching Strategy

```
┌─────────────┐
│   Browser   │  ← Browser Cache
│   Cache     │
└─────────────┘
      │
┌─────────────┐
│     CDN     │  ← CDN Cache (Static Assets)
│   Cache     │
└─────────────┘
      │
┌─────────────┐
│ Application │  ← In-Memory Cache (Optional)
│   Cache     │
└─────────────┘
      │
┌─────────────┐
│  Database   │  ← Query Result Cache
└─────────────┘
```

---

## 11. Monitoring & Observability

### 11.1 Application Monitoring
- **Error Tracking**: Sentry
- **Performance Monitoring**: New Relic / Datadog
- **Logging**: Winston + Centralized logging

### 11.2 Key Metrics
- Response times
- Error rates
- User activity
- Database performance
- API usage

### 11.3 Alerting
- Error threshold alerts
- Performance degradation alerts
- Database connection alerts
- Payment gateway alerts

---

## 12. Backup & Disaster Recovery

### 12.1 Backup Strategy
- **Database**: Daily automated backups (Supabase)
- **Files**: Regular backups to separate storage
- **Code**: Git repository (GitHub/GitLab)

### 12.2 Recovery Plan
- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: 24 hours
- **Testing**: Monthly recovery tests

---

## 13. Development Workflow

### 13.1 Local Development Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

# Environment
cp .env.example .env
# Configure Supabase credentials
```

### 13.2 Code Quality Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Type checking

---

## Conclusion

This architecture provides a solid foundation for the Academic Management System, ensuring:
- **Scalability**: Can grow with user base
- **Security**: Multiple layers of protection
- **Maintainability**: Clean, modular code
- **Performance**: Optimized for speed
- **Reliability**: Robust error handling

The architecture follows industry best practices and is designed to support the requirements of Pakistani educational institutions while remaining flexible for future enhancements.

---

**Document End**

