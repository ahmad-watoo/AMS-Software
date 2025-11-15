# 🚀 Quick Start Guide - Fix Signup Error

## Problem
You're getting `ERR_CONNECTION_REFUSED` when trying to sign up because **the backend server is not running**.

## Solution: Start the Backend Server

### Step 1: Open Terminal in Backend Folder

Navigate to the backend directory:
```bash
cd AMS-Software/backend
```

### Step 2: Install Dependencies (First Time Only)

```bash
npm install
```

### Step 3: Create .env File

Copy the example file:
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### Step 4: Configure Environment Variables

Open `.env` file and fill in your Supabase credentials:

1. **Get Supabase Credentials:**
   - Go to: https://app.supabase.com
   - Select your project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** → `SUPABASE_URL`
     - **anon public** key → `SUPABASE_ANON_KEY`
     - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

2. **Generate JWT Secrets:**
   
   **Windows (PowerShell):**
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
   
   **Linux/Mac:**
   ```bash
   openssl rand -base64 32
   ```
   
   Generate two different secrets and use them for:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

3. **Example .env file:**
   ```env
   NODE_ENV=development
   PORT=5000
   API_VERSION=v1
   
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   JWT_SECRET=your-generated-secret-here-min-32-chars
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_SECRET=your-generated-refresh-secret-here-min-32-chars
   JWT_REFRESH_EXPIRES_IN=7d
   
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

### Step 5: Start the Backend Server

```bash
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
API Version: v1
```

### Step 6: Keep Backend Running

**Keep this terminal window open!** The backend server must be running for the frontend to work.

### Step 7: Start Frontend (In Another Terminal)

Open a **new terminal window** and run:
```bash
cd AMS-Software
npm start
```

---

## ✅ Verify It's Working

1. Backend should show: `Server running on port 5000`
2. Frontend should connect without errors
3. Try signing up again - it should work now!

---

## 🔧 Troubleshooting

### Error: "Missing required environment variables"
- Make sure all variables in `.env` are filled
- Check for typos in variable names

### Error: "Port 5000 already in use"
- Change `PORT=5001` in `.env`
- Update frontend: `src/api/client.ts` → Change `localhost:5000` to `localhost:5001`

### Error: "Cannot connect to Supabase"
- Verify Supabase credentials are correct
- Check if Supabase project is active
- Make sure database tables are created (run SQL schema)

### Still Getting Connection Refused?
1. Check if backend is actually running (look for "Server running on port 5000")
2. Check if port 5000 is correct in `.env`
3. Try accessing: http://localhost:5000/api/v1/health (should return something)

---

## 📝 Summary

**The issue:** Backend server not running  
**The fix:** Start backend with `npm run dev` in `backend` folder  
**Required:** `.env` file with Supabase credentials and JWT secrets

Once backend is running, signup/login will work! ✅

