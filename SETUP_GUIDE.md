# Setup Guide - Academic Management System

This guide will help you set up and run the Academic Management System (AMS) on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn** (v1.22 or higher)
- **Git**
- **Supabase Account** (for database)
- **PostgreSQL** (optional, if using local database)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd AMS-Software
```

## Step 2: Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Go to SQL Editor and run the database schema from `docs/Database_Schema.md` or create tables manually
4. Set up Row Level Security (RLS) policies as per the schema documentation

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_very_long_and_random_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**Important:** Generate secure random keys for JWT secrets. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.3 Run Database Migrations

Execute the SQL schema from `docs/Database_Schema.md` in your Supabase SQL Editor.

### 3.4 Seed Initial Data (Optional)

```bash
npm run seed:rbac
```

This will seed default roles and permissions into the database.

### 3.5 Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend API will be available at `http://localhost:5000`

## Step 4: Frontend Setup

### 4.1 Install Dependencies

```bash
cd ../ # Go back to root directory
npm install
```

### 4.2 Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_NAME=Academic Management System
REACT_APP_VERSION=1.0.0
```

### 4.3 Start Frontend Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Step 5: Initial Setup Tasks

### 5.1 Create First Admin User

1. Register a user through the signup page at `/signup`
2. Or use the API directly:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User",
    "cnic": "12345-1234567-1",
    "phone": "+923001234567"
  }'
```

### 5.2 Assign Admin Role

1. Login to Supabase dashboard
2. Go to Authentication > Users
3. Find your user and note the user ID
4. Run this SQL to assign admin role:

```sql
-- First, ensure admin role exists
INSERT INTO roles (name, description, is_system_role)
VALUES ('admin', 'System Administrator', true)
ON CONFLICT DO NOTHING;

-- Assign role to user (replace 'user-id-here' with actual user ID)
INSERT INTO user_roles (user_id, role_id)
VALUES ('user-id-here', (SELECT id FROM roles WHERE name = 'admin'));
```

### 5.3 Configure Permissions (Optional)

Run the RBAC seed script:
```bash
cd backend
npm run seed:rbac
```

## Step 6: Verify Installation

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","timestamp":"...","environment":"development"}`

2. **Frontend:**
   - Open `http://localhost:3000`
   - You should see the login page
   - Try logging in with your admin credentials

3. **Dashboard:**
   - After login, you should be redirected to `/dashboard`
   - Check that statistics are loading (may show 0 if database is empty)

## Common Issues & Troubleshooting

### Issue: CORS Errors

**Solution:** Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL (usually `http://localhost:3000`)

### Issue: Database Connection Errors

**Solution:** 
- Verify Supabase credentials in `.env`
- Check that RLS policies allow authenticated access
- Ensure tables are created from the schema

### Issue: JWT Token Errors

**Solution:**
- Verify `JWT_SECRET` is set and matches between requests
- Check token expiration settings
- Clear browser localStorage and try logging in again

### Issue: Module Not Found Errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port Already in Use

**Solution:**
- Backend: Change `PORT` in backend `.env`
- Frontend: Change port by setting `PORT=3001` in root `.env` or use:
```bash
PORT=3001 npm start
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../
npm test
```

### Code Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
npm run lint
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
npm run build
```

## Project Structure

```
AMS-Software/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, RBAC, error handling
│   │   ├── models/       # TypeScript interfaces
│   │   ├── repositories/ # Database operations
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   ├── tests/            # Unit and integration tests
│   └── package.json
├── src/                  # React frontend
│   ├── Admin/            # Admin panel components
│   ├── api/              # API client functions
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   └── components/       # Reusable components
├── docs/                 # Documentation
└── package.json
```

## Next Steps

1. **Explore Modules:** Navigate through all 17 modules via the dashboard
2. **Create Test Data:** Add sample students, programs, courses, etc.
3. **Configure Permissions:** Set up role-based access control
4. **Customize:** Modify UI/UX, add custom features
5. **Deploy:** Follow deployment guide (coming soon)

## Support

For issues or questions:
- Check the documentation in `docs/` folder
- Review `Implementation_Status.md` for module details
- Check API documentation in `docs/API_Documentation.md`

---

**Happy Coding! 🚀**

