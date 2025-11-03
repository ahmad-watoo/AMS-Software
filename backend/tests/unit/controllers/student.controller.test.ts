import { Request, Response, NextFunction } from 'express';
import { StudentController } from '@/controllers/student.controller';
import { StudentService } from '@/services/student.service';
import { ValidationError } from '@/utils/errors';

jest.mock('@/services/student.service');

describe('StudentController', () => {
  let studentController: StudentController;
  let mockStudentService: jest.Mocked<StudentService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockStudentService = new StudentService() as jest.Mocked<StudentService>;
    studentController = new StudentController();
    studentController['studentService'] = mockStudentService;

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStudents', () => {
    it('should return paginated students', async () => {
      mockRequest = {
        query: { page: '1', limit: '20' },
      };

      const mockStudents = [
        { id: '1', rollNumber: '2024-BS-CS-001', user: {}, program: {} },
      ];

      mockStudentService.getAllStudents.mockResolvedValue({
        students: mockStudents as any,
        total: 1,
      });

      await studentController.getAllStudents(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStudentService.getAllStudents).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });
  });

  describe('createStudent', () => {
    it('should create student with valid data', async () => {
      mockRequest = {
        body: {
          userId: 'user1',
          rollNumber: '2024-BS-CS-001',
          programId: 'prog1',
          batch: '2024-Fall',
          admissionDate: '2024-09-01',
        },
      };

      const mockStudent = {
        id: '1',
        rollNumber: '2024-BS-CS-001',
      };

      mockStudentService.createStudent.mockResolvedValue(mockStudent as any);

      await studentController.createStudent(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStudentService.createStudent).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should call next with error for missing required fields', async () => {
      mockRequest = {
        body: {
          rollNumber: '2024-BS-CS-001',
          // Missing userId, programId, batch
        },
      };

      await studentController.createStudent(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('getStudentById', () => {
    it('should return student by ID', async () => {
      mockRequest = {
        params: { id: '1' },
      };

      const mockStudent = {
        id: '1',
        rollNumber: '2024-BS-CS-001',
        user: {},
        program: {},
      };

      mockStudentService.getStudentById.mockResolvedValue(mockStudent as any);

      await studentController.getStudentById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStudentService.getStudentById).toHaveBeenCalledWith('1');
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });
});

