# Frontend Authentication Integration - Setup Guide

## ✅ Completed Integration

The frontend authentication has been integrated with the backend API. Here's what was implemented:

### Files Created/Updated:

1. **API Client** (`src/api/client.ts`)
   - Axios instance with base URL configuration
   - Request interceptor for adding auth tokens
   - Response interceptor for token refresh
   - Error handling

2. **Auth API** (`src/api/auth.api.ts`)
   - TypeScript interfaces for auth data
   - API functions: register, login, logout, refreshToken, getProfile

3. **Auth Hook** (`src/hooks/useAuth.ts`)
   - Custom React hook for authentication
   - Manages auth state (user, isAuthenticated, isLoading, error)
   - Functions: login, register, logout, refreshUser, clearError
   - Auto-loads user from localStorage on mount

4. **Auth Context** (`src/contexts/AuthContext.tsx`)
   - React context provider for authentication
   - Makes auth available throughout the app

5. **Updated Components:**
   - `Login.tsx` - Now uses auth API
   - `SignUp.tsx` - Enhanced with full registration form
   - `userAuthentication.tsx` - Uses AuthContext for route protection
   - `App.js` - Wrapped with AuthProvider

6. **Utilities:**
   - `validators.ts` - Validation helper functions

### Required Dependencies

Add these to your `package.json` if not already present:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "dayjs": "^1.11.10"
  }
}
```

Install with:
```bash
npm install axios dayjs
```

### Environment Variables

Create/update `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENV=development
```

### Features Implemented

✅ **User Registration**
- Full form with firstName, lastName, email, password
- Optional: phone, CNIC, gender, dateOfBirth
- Password strength validation
- Email validation
- CNIC format validation

✅ **User Login**
- Email/password authentication
- Error handling
- Token storage
- Automatic redirect after login

✅ **Protected Routes**
- Authentication check using AuthContext
- Loading state handling
- Redirect to login if not authenticated

✅ **Token Management**
- Automatic token injection in API requests
- Token refresh handling
- Token storage in localStorage

### Usage Example

```typescript
import { useAuthContext } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthContext();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome {user?.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Testing

Test files created:
- `src/__tests__/hooks/useAuth.test.tsx` - Auth hook tests

Run tests:
```bash
npm test
```

### Next Steps

1. Install dependencies (axios, dayjs)
2. Set up environment variables
3. Test login/register functionality
4. Implement RBAC (Role-Based Access Control)
5. Add user profile management

### API Endpoints Used

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/profile` - Get current user profile

### Notes

- Tokens are stored in localStorage
- Automatic token refresh on 401 errors
- All API calls include authentication headers
- Error messages are user-friendly
- Loading states are handled throughout

