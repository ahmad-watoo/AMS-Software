# Testing Guide - Academic Management System

This guide covers testing strategies, test execution, and best practices for the AMS project.

## 📋 Testing Overview

The project uses **Jest** for unit testing and **React Testing Library** for component testing.

---

## 🧪 Test Structure

```
AMS-Software/
├── backend/
│   └── tests/
│       └── unit/
│           └── services/     # Service unit tests
├── src/
│   └── __tests__/           # Frontend tests
```

---

## 🎯 Testing Strategy

### Unit Tests (Backend)
Test individual service methods in isolation.

**Coverage:**
- ✅ User Service
- ✅ Student Service
- ✅ Admission Service
- ✅ Academic Service
- ✅ Certification Service
- ✅ Multi-Campus Service
- ✅ Payroll Service
- ✅ HR Service
- ⚠️ Remaining 9 services (Timetable, Examination, Attendance, Finance, Learning, Library, Administration)

### Component Tests (Frontend)
Test React components behavior and rendering.

**Coverage:**
- ✅ Auth Hook Tests
- ⚠️ Additional component tests needed

### Integration Tests
Test module interactions and API endpoints.

**Status:** Not yet implemented

### E2E Tests
Test complete user workflows.

**Status:** Not yet implemented

---

## 🚀 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- user.service.test.ts

# Run with coverage
npm test -- --coverage

# Run tests in specific directory
npm test -- tests/unit/services
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- useAuth.test.tsx
```

---

## 📝 Writing Tests

### Backend Service Test Example

```typescript
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    userService = new UserService();
    // Inject mock repository
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockRepository.findById.mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('1')).rejects.toThrow('NotFound');
    });
  });
});
```

### Frontend Component Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../pages/userAuth/Login';
import { AuthProvider } from '../contexts/AuthContext';

describe('Login Component', () => {
  it('should render login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const mockLogin = jest.fn();
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
```

---

## ✅ Test Coverage Goals

### Current Coverage
- **Backend Services**: ~47% (8/17 services)
- **Frontend Components**: ~10% (auth hooks only)

### Target Coverage
- **Backend Services**: 100% (all 17 services)
- **Backend Controllers**: 80%
- **Frontend Components**: 70%
- **API Integration**: 60%
- **Overall**: 75%

---

## 🧩 Testing Different Modules

### Authentication Tests
```bash
npm test -- auth.service.test.ts
```

**What to Test:**
- User registration
- Login functionality
- Password validation
- Token generation
- Token refresh

### Student Management Tests
```bash
npm test -- student.service.test.ts
```

**What to Test:**
- Student creation
- Student retrieval
- Student updates
- Enrollment management
- Performance tracking

### Finance Tests
**To be implemented:**
- Fee structure management
- Payment processing
- Balance calculations
- Financial reports

---

## 🐛 Debugging Tests

### Backend

```bash
# Run with debug output
npm test -- --verbose

# Run specific test with debug
npm test -- --testNamePattern="should create user"
```

### Frontend

```bash
# Run with coverage and open report
npm test -- --coverage --watchAll=false
# Then open: coverage/lcov-report/index.html
```

---

## 📊 Test Best Practices

### Do's ✅

1. **Write Descriptive Test Names**
   ```typescript
   it('should return error when email is invalid', ...)
   ```

2. **Test One Thing Per Test**
   ```typescript
   // Good: Single assertion
   it('should return user by ID', ...)
   
   // Bad: Multiple unrelated assertions
   it('should handle user operations', ...)
   ```

3. **Use Arrange-Act-Assert Pattern**
   ```typescript
   // Arrange
   const userData = { email: 'test@example.com' };
   
   // Act
   const result = await service.createUser(userData);
   
   // Assert
   expect(result.email).toBe('test@example.com');
   ```

4. **Mock External Dependencies**
   - Mock database calls
   - Mock API calls
   - Mock file system operations

5. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

### Don'ts ❌

1. **Don't Test Implementation Details**
   - Test behavior, not internal methods

2. **Don't Create Flaky Tests**
   - Avoid time-dependent tests
   - Use fixed dates/times

3. **Don't Skip Error Cases**
   - Test both success and failure scenarios

4. **Don't Test Third-Party Libraries**
   - Trust that libraries work
   - Test your usage of them

---

## 🔍 Test Categories

### Unit Tests
- Test individual functions/methods
- Fast execution
- No external dependencies

### Integration Tests
- Test module interactions
- May use test database
- Slower than unit tests

### E2E Tests
- Test complete user flows
- Use real or staging environment
- Slowest but most realistic

---

## 📦 Test Utilities

### Mock Data Factories

```typescript
// backend/tests/utils/mockFactories.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  ...overrides,
});

export const createMockStudent = (overrides = {}) => ({
  id: 'student-1',
  rollNumber: '2024-BS-CS-001',
  programId: 'program-1',
  ...overrides,
});
```

### Test Helpers

```typescript
// backend/tests/utils/testHelpers.ts
export const setupTestDatabase = async () => {
  // Setup test database connection
};

export const cleanupTestDatabase = async () => {
  // Clean up test data
};
```

---

## 🎯 Test Checklist

When adding a new feature, ensure:

- [ ] Unit tests for service methods
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI components
- [ ] Error handling tests
- [ ] Edge case tests
- [ ] Performance tests (if applicable)

---

## 🚨 Common Testing Issues

### Issue: Tests Timeout

**Solution:**
```typescript
// Increase timeout
jest.setTimeout(10000);
```

### Issue: Async/Await Errors

**Solution:**
```typescript
// Use async/await correctly
it('should handle async', async () => {
  await expect(asyncFunction()).resolves.toBe(expected);
});
```

### Issue: Mock Not Working

**Solution:**
```typescript
// Ensure mock is properly set up
jest.mock('../repositories/user.repository');
```

---

## 📈 Test Metrics

Track these metrics:
- **Test Coverage**: Aim for >75%
- **Test Execution Time**: Keep under 30 seconds
- **Test Reliability**: All tests should pass consistently
- **Code Quality**: No skipped tests in production

---

## 🔄 CI/CD Integration

Add tests to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: |
          cd backend && npm ci && npm test
          cd ../src && npm ci && npm test
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🧪**

