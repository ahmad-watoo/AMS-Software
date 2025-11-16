# Backend Server Setup Guide

## Problem
The signup/login is failing with `ERR_CONNECTION_REFUSED` because the backend server is not running.

## Solution: Start the Backend Server

### Step 1: Navigate to Backend Directory

```bash
cd AMS-Software/backend
```

### Step 2: Install Dependencies (if not already installed)

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the `backend` directory with the following variables:

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
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Step 4: Get Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 5: Generate JWT Secrets

Generate secure random strings for JWT secrets (minimum 32 characters):

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or use an online generator: https://generate-secret.vercel.app/32

### Step 6: Start the Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# OR Production mode (after building)
npm run build
npm start
```

### Step 7: Verify Server is Running

You should see output like:
```
Server running on port 5000
Environment: development
API Version: v1
```

### Step 8: Test the API

Open your browser and visit:
```
http://localhost:5000/api/v1/health
```

Or test the register endpoint:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

---

## Troubleshooting

### Issue: Port 5000 is already in use

**Solution**: Change the port in `.env`:
```env
PORT=5001
```

Then update frontend API URL in `AMS-Software/src/api/client.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';
```

### Issue: Missing environment variables

**Solution**: Make sure all required variables are set in `.env` file. Check `backend/src/config/env.ts` for required variables.

### Issue: Supabase connection error

**Solution**: 
1. Verify Supabase credentials are correct
2. Check if Supabase project is active
3. Ensure database tables are created (run the SQL schema)

### Issue: TypeScript compilation errors

**Solution**:
```bash
# Install dependencies
npm install

# Check for type errors
npm run typecheck

# Build the project
npm run build
```

---

## Quick Start Checklist

- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file created with all required variables
- [ ] Supabase credentials configured
- [ ] JWT secrets generated and set
- [ ] Backend server started (`npm run dev`)
- [ ] Server running on port 5000
- [ ] Frontend can connect to backend

---

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd AMS-Software/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd AMS-Software
npm start
```

### Option 2: Use a Process Manager

Install `concurrently`:
```bash
npm install -g concurrently
```

Then run both:
```bash
concurrently "cd backend && npm run dev" "npm start"
```

---

**Status**: Once the backend server is running, the signup/login should work! ✅


