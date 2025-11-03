import { AppError, ValidationError, AuthenticationError, NotFoundError } from '@/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Not found', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should create an AppError with isOperational flag', () => {
      const error = new AppError('Error', 500, false);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with status 400', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should include details in message', () => {
      const details = { field: 'email', issue: 'invalid format' };
      const error = new ValidationError('Validation failed', details);
      expect(error.message).toContain('Validation failed');
      expect(error.message).toContain(JSON.stringify(details));
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with status 401', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should allow custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with status 404', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should use default resource name', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });
});

