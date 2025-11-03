# Quick Reference Guide - Academic Management System

A quick reference guide for developers working on the AMS project.

## 🗂️ Project Structure

```
AMS-Software/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Environment, Supabase, Logger config
│   │   ├── controllers/       # Request handlers (17 modules)
│   │   ├── middleware/        # Auth, RBAC, Error handling
│   │   ├── models/            # TypeScript interfaces
│   │   ├── repositories/      # Database operations
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers (JWT, Response, Errors)
│   └── tests/                # Unit tests
├── src/                       # React frontend
│   ├── Admin/                 # Admin panel
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   └── routes/           # Route definitions
│   ├── api/                  # API client functions
│   ├── contexts/             # React contexts (Auth, etc.)
│   ├── hooks/                # Custom hooks
│   └── components/           # Shared components
└── docs/                     # Documentation
```

## 🚀 Common Commands

### Backend
```bash
cd backend
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Production mode
npm test             # Run tests
npm run seed:rbac    # Seed roles & permissions
```

### Frontend
```bash
npm start            # Development server
npm run build        # Production build
npm test             # Run tests
npm run lint         # Lint code
```

## 📡 API Endpoints Quick Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Dashboard
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/activities` - Recent activities
- `GET /dashboard/events` - Upcoming events

### Module Endpoints (All require authentication)
- `/users` - User management
- `/students` - Student management
- `/admission` - Admission applications
- `/academic` - Programs, courses, sections
- `/timetable` - Class scheduling
- `/examination` - Exams and results
- `/attendance` - Attendance tracking
- `/finance` - Fees and payments
- `/learning` - Course materials, assignments
- `/library` - Books and borrowing
- `/hr` - Employee management
- `/payroll` - Salary processing
- `/administration` - Events, notices, departments
- `/certification` - Certificate management
- `/multicampus` - Campus management

## 🔐 Authentication

### JWT Token Usage
```typescript
// Add to request headers
Authorization: Bearer <accessToken>

// Token stored in localStorage
localStorage.getItem('accessToken')
```

### RBAC Permissions
```typescript
// Check permission in frontend
<PermissionGuard permission="users" action="create">
  <Button>Create User</Button>
</PermissionGuard>

// Check in backend middleware
requirePermission('users', 'create')
```

## 🗄️ Database Quick Reference

### Supabase Configuration
- **Project URL**: `SUPABASE_URL`
- **Anon Key**: `SUPABASE_ANON_KEY`
- **Service Role**: `SUPABASE_SERVICE_ROLE_KEY`

### Key Tables
- `users` - User accounts
- `students` - Student records
- `staff` - Employee records
- `programs` - Academic programs
- `courses` - Course catalog
- `exams` - Examination records
- `payments` - Payment transactions
- `certificates` - Digital certificates

## 📝 Code Patterns

### Repository Pattern
```typescript
// Repository returns arrays
const students = await studentRepository.findAll(limit, offset);
```

### Service Pattern
```typescript
// Service handles business logic
const result = await studentService.getAllStudents(limit, offset, filters);
// Returns: { students: [], total: number }
```

### Controller Pattern
```typescript
// Controller handles HTTP requests
export class StudentController {
  getAllStudents = async (req, res, next) => {
    const result = await studentService.getAllStudents(...);
    sendSuccess(res, result);
  };
}
```

## 🎨 Frontend Patterns

### API Calls
```typescript
import studentAPI from '@/api/student.api';

// Get all students
const response = await studentAPI.getAllStudents(1, 20, { search: 'John' });
const { students, pagination } = response;
```

### Form Handling
```typescript
const [form] = Form.useForm();

const onFinish = async (values) => {
  await studentAPI.createStudent(values);
  message.success('Student created');
};
```

### Navigation
```typescript
import { useNavigate } from 'react-router-dom';
import { route } from '@/Admin/routes/constant';

const navigate = useNavigate();
navigate(route.STUDENT_LIST);
```

## 🧪 Testing

### Run All Tests
```bash
# Backend
cd backend && npm test

# Frontend
npm test
```

### Test a Specific File
```bash
npm test -- user.service.test.ts
```

## 🐛 Debugging

### Backend Logging
```typescript
import { logger } from '@/config/logger';

logger.info('Info message');
logger.error('Error message', error);
```

### Frontend Console
- React DevTools extension
- Browser DevTools
- Network tab for API debugging

## 📦 Key Dependencies

### Backend
- `express` - Web framework
- `@supabase/supabase-js` - Database client
- `jsonwebtoken` - JWT handling
- `bcrypt` - Password hashing
- `winston` - Logging
- `jest` - Testing

### Frontend
- `react` - UI library
- `antd` - UI components
- `react-router-dom` - Routing
- `axios` - HTTP client
- `dayjs` - Date manipulation

## 🔄 Common Workflows

### Adding a New Module

1. **Backend:**
   - Create model in `backend/src/models/`
   - Create repository in `backend/src/repositories/`
   - Create service in `backend/src/services/`
   - Create controller in `backend/src/controllers/`
   - Create routes in `backend/src/routes/`
   - Add route to `backend/src/app.ts`

2. **Frontend:**
   - Create API client in `src/api/`
   - Create components in `src/Admin/components/module/`
   - Add routes to `src/Admin/routes/constant.ts`
   - Add routes to `src/Admin/routes/routeList.tsx`

### Creating a Form Component

```typescript
import { Form, Input, Button } from 'antd';

const MyForm = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  
  const onFinish = async (values) => {
    if (isEdit) {
      await api.update(id, values);
    } else {
      await api.create(values);
    }
  };
  
  return (
    <Form form={form} onFinish={onFinish}>
      {/* Form fields */}
    </Form>
  );
};
```

## 📊 Data Flow

```
User Action
    ↓
React Component
    ↓
API Client (axios)
    ↓
Backend Controller
    ↓
Service (Business Logic)
    ↓
Repository (Database)
    ↓
Supabase (PostgreSQL)
```

## 🔍 Search Patterns

### Search in Repositories
```typescript
// Use .ilike() for case-insensitive search
query.ilike('title', `%${searchTerm}%`);
```

### Pagination
```typescript
const limit = 20;
const offset = (page - 1) * limit;
```

## ⚠️ Common Errors

### CORS Error
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches

### Authentication Error
- Check JWT token in localStorage
- Verify token expiration
- Check authorization header format

### Database Error
- Verify Supabase credentials
- Check RLS policies
- Ensure tables exist

## 📚 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Ant Design Docs](https://ant.design)
- [React Router Docs](https://reactrouter.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Tip:** Keep this guide handy while developing! 📌

