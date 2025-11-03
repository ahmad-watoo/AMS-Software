import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth.api';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the API
jest.mock('../../api/auth.api');

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      isVerified: true,
    };

    const mockAuthResponse = {
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    };

    mockAuthAPI.login.mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'Test@1234',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
  });

  it('should handle login error', async () => {
    mockAuthAPI.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout successfully', async () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify({ id: '123' }));

    mockAuthAPI.logout.mockResolvedValue();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

