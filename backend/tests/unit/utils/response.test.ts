import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';

describe('Response Utilities', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      sendSuccess(mockResponse as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send success response with message', () => {
      const data = { id: 1 };
      sendSuccess(mockResponse as Response, data, 'Operation successful');

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Operation successful',
      });
    });

    it('should allow custom status code', () => {
      const data = { id: 1 };
      sendSuccess(mockResponse as Response, data, undefined, 201);

      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('should send error response', () => {
      sendError(mockResponse as Response, 'ERROR_CODE', 'Error message', 400);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ERROR_CODE',
          message: 'Error message',
        },
      });
    });

    it('should include details in error response', () => {
      const details = { field: 'email', issue: 'invalid' };
      sendError(mockResponse as Response, 'VALIDATION_ERROR', 'Validation failed', 400, details);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    });

    it('should use default status code 500', () => {
      sendError(mockResponse as Response, 'ERROR_CODE', 'Error message');

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});

