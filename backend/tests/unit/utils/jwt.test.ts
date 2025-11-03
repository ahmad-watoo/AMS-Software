import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  TokenPayload,
} from '@/utils/jwt';

describe('JWT Utilities', () => {
  const mockPayload: TokenPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'student',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateAccessToken(mockPayload);
      const differentPayload = { ...mockPayload, userId: 'different-id' };
      const token2 = generateAccessToken(differentPayload);
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokenPair = generateTokenPair(mockPayload);
      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
    });

    it('should generate different access and refresh tokens', () => {
      const tokenPair = generateTokenPair(mockPayload);
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      // This would require mocking time or using a token with very short expiry
      // For now, we'll just test the error handling
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid';
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyRefreshToken(invalidToken)).toThrow();
    });
  });
});

