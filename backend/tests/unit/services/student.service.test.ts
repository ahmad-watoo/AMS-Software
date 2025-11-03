import { StudentService } from '@/services/student.service';
import { StudentRepository } from '@/repositories/student.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

jest.mock('@/repositories/student.repository');

describe('StudentService', () => {
  let studentService: StudentService;
  let mockRepository: jest.Mocked<StudentRepository>;

  beforeEach(() => {
    mockRepository = new StudentRepository() as jest.Mocked<StudentRepository>;
    studentService = new StudentService();
    (studentService as any).studentRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStudent', () => {
    it('should create a student successfully', async () => {
      const studentData = {
        userId: 'user-123',
        rollNumber: '2024-CS-001',
        programId: 'prog-123',
        batch: '2024-Fall',
        admissionDate: '2024-09-01',
      };

      const mockStudent = {
        id: 'student-123',
        ...studentData,
        enrollmentStatus: 'active' as const,
        currentSemester: 1,
        createdAt: '2024-09-01T10:00:00Z',
        updatedAt: '2024-09-01T10:00:00Z',
      };

      mockRepository.findByRollNumber = jest.fn().mockResolvedValue(null);
      mockRepository.create = jest.fn().mockResolvedValue(mockStudent);

      const result = await studentService.createStudent(studentData);

      expect(result).toEqual(mockStudent);
      expect(mockRepository.create).toHaveBeenCalledWith(studentData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const studentData = {
        userId: '',
        rollNumber: '',
        programId: '',
        batch: '',
        admissionDate: '',
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if roll number already exists', async () => {
      const studentData = {
        userId: 'user-123',
        rollNumber: '2024-CS-001',
        programId: 'prog-123',
        batch: '2024-Fall',
        admissionDate: '2024-09-01',
      };

      const existingStudent = {
        id: 'student-456',
        rollNumber: '2024-CS-001',
        userId: 'user-456',
        programId: 'prog-123',
        batch: '2024-Fall',
        admissionDate: '2024-09-01',
        enrollmentStatus: 'active' as const,
        currentSemester: 1,
        createdAt: '2024-09-01T10:00:00Z',
        updatedAt: '2024-09-01T10:00:00Z',
      };

      mockRepository.findByRollNumber = jest.fn().mockResolvedValue(existingStudent);

      await expect(studentService.createStudent(studentData)).rejects.toThrow(ConflictError);
    });
  });

  describe('updateStudent', () => {
    it('should update a student successfully', async () => {
      const mockStudent = {
        id: 'student-123',
        userId: 'user-123',
        rollNumber: '2024-CS-001',
        programId: 'prog-123',
        batch: '2024-Fall',
        admissionDate: '2024-09-01',
        enrollmentStatus: 'active' as const,
        currentSemester: 1,
        createdAt: '2024-09-01T10:00:00Z',
        updatedAt: '2024-09-01T10:00:00Z',
      };

      const updateData = {
        currentSemester: 2,
        enrollmentStatus: 'active' as const,
      };

      const updatedStudent = {
        ...mockStudent,
        ...updateData,
        updatedAt: '2024-12-01T10:00:00Z',
      };

      mockRepository.findById = jest.fn().mockResolvedValue(mockStudent);
      mockRepository.update = jest.fn().mockResolvedValue(updatedStudent);

      const result = await studentService.updateStudent('student-123', updateData);

      expect(result.currentSemester).toBe(2);
      expect(mockRepository.update).toHaveBeenCalledWith('student-123', updateData);
    });

    it('should throw NotFoundError if student does not exist', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        studentService.updateStudent('student-123', { currentSemester: 2 })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getStudentByUserId', () => {
    it('should return student by user ID', async () => {
      const mockStudent = {
        id: 'student-123',
        userId: 'user-123',
        rollNumber: '2024-CS-001',
        programId: 'prog-123',
        batch: '2024-Fall',
        admissionDate: '2024-09-01',
        enrollmentStatus: 'active' as const,
        currentSemester: 1,
        createdAt: '2024-09-01T10:00:00Z',
        updatedAt: '2024-09-01T10:00:00Z',
      };

      mockRepository.findByUserId = jest.fn().mockResolvedValue(mockStudent);

      const result = await studentService.getStudentByUserId('user-123');

      expect(result).toEqual(mockStudent);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundError if student not found', async () => {
      mockRepository.findByUserId = jest.fn().mockResolvedValue(null);

      await expect(studentService.getStudentByUserId('user-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student successfully', async () => {
      const mockStudent = {
        id: 'student-123',
        userId: 'user-123',
        rollNumber: '2024-CS-001',
        programId: 'prog-123',
        batch: '2024-Fall',
        admissionDate: '2024-09-01',
        enrollmentStatus: 'active' as const,
        currentSemester: 1,
        createdAt: '2024-09-01T10:00:00Z',
        updatedAt: '2024-09-01T10:00:00Z',
      };

      mockRepository.findById = jest.fn().mockResolvedValue(mockStudent);
      mockRepository.delete = jest.fn().mockResolvedValue(undefined);

      await studentService.deleteStudent('student-123');

      expect(mockRepository.delete).toHaveBeenCalledWith('student-123');
    });

    it('should throw NotFoundError if student does not exist', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(studentService.deleteStudent('student-123')).rejects.toThrow(NotFoundError);
    });
  });
});

