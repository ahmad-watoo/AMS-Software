import { AcademicService } from '@/services/academic.service';
import { AcademicRepository } from '@/repositories/academic.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

jest.mock('@/repositories/academic.repository');

describe('AcademicService', () => {
  let academicService: AcademicService;
  let mockRepository: jest.Mocked<AcademicRepository>;

  beforeEach(() => {
    mockRepository = new AcademicRepository() as jest.Mocked<AcademicRepository>;
    academicService = new AcademicService();
    (academicService as any).academicRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProgram', () => {
    it('should create a program successfully', async () => {
      const programData = {
        name: 'BS Computer Science',
        code: 'CS',
        degreeLevel: 'bachelors' as const,
        duration: 4,
        totalCreditHours: 130,
        departmentId: 'dept-123',
      };

      const mockProgram = {
        id: 'prog-123',
        ...programData,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findProgramByCode = jest.fn().mockResolvedValue(null);
      mockRepository.createProgram = jest.fn().mockResolvedValue(mockProgram);

      const result = await academicService.createProgram(programData);

      expect(result).toEqual(mockProgram);
      expect(mockRepository.createProgram).toHaveBeenCalledWith(programData);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const programData = {
        name: '',
        code: '',
        degreeLevel: 'bachelors' as const,
        duration: 0,
        totalCreditHours: 0,
      };

      await expect(academicService.createProgram(programData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if program code already exists', async () => {
      const programData = {
        name: 'BS Computer Science',
        code: 'CS',
        degreeLevel: 'bachelors' as const,
        duration: 4,
        totalCreditHours: 130,
        departmentId: 'dept-123',
      };

      const existingProgram = {
        id: 'prog-456',
        code: 'CS',
        name: 'Existing Program',
        degreeLevel: 'bachelors' as const,
        duration: 4,
        totalCreditHours: 130,
        isActive: true,
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      };

      mockRepository.findProgramByCode = jest.fn().mockResolvedValue(existingProgram);

      await expect(academicService.createProgram(programData)).rejects.toThrow(ConflictError);
    });
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      const courseData = {
        code: 'CS101',
        title: 'Introduction to Programming',
        creditHours: 3,
        departmentId: 'dept-123',
      };

      const mockCourse = {
        id: 'course-123',
        ...courseData,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findCourseByCode = jest.fn().mockResolvedValue(null);
      mockRepository.createCourse = jest.fn().mockResolvedValue(mockCourse);

      const result = await academicService.createCourse(courseData);

      expect(result).toEqual(mockCourse);
      expect(mockRepository.createCourse).toHaveBeenCalledWith(courseData);
    });

    it('should throw ValidationError if credit hours are invalid', async () => {
      const courseData = {
        code: 'CS101',
        title: 'Introduction to Programming',
        creditHours: 0,
        departmentId: 'dept-123',
      };

      await expect(academicService.createCourse(courseData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if course code already exists', async () => {
      const courseData = {
        code: 'CS101',
        title: 'Introduction to Programming',
        creditHours: 3,
        departmentId: 'dept-123',
      };

      const existingCourse = {
        id: 'course-456',
        code: 'CS101',
        title: 'Existing Course',
        creditHours: 3,
        isActive: true,
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      };

      mockRepository.findCourseByCode = jest.fn().mockResolvedValue(existingCourse);

      await expect(academicService.createCourse(courseData)).rejects.toThrow(ConflictError);
    });
  });

  describe('updateProgram', () => {
    it('should update a program successfully', async () => {
      const mockProgram = {
        id: 'prog-123',
        name: 'BS Computer Science',
        code: 'CS',
        degreeLevel: 'bachelors' as const,
        duration: 4,
        totalCreditHours: 130,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const updateData = {
        duration: 5,
        totalCreditHours: 150,
      };

      const updatedProgram = {
        ...mockProgram,
        ...updateData,
        updatedAt: '2024-01-16T10:00:00Z',
      };

      mockRepository.findProgramById = jest.fn().mockResolvedValue(mockProgram);
      mockRepository.updateProgram = jest.fn().mockResolvedValue(updatedProgram);

      const result = await academicService.updateProgram('prog-123', updateData);

      expect(result.duration).toBe(5);
      expect(result.totalCreditHours).toBe(150);
      expect(mockRepository.updateProgram).toHaveBeenCalledWith('prog-123', updateData);
    });

    it('should throw NotFoundError if program does not exist', async () => {
      mockRepository.findProgramById = jest.fn().mockResolvedValue(null);

      await expect(
        academicService.updateProgram('prog-123', { duration: 5 })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course successfully', async () => {
      const mockCourse = {
        id: 'course-123',
        code: 'CS101',
        title: 'Introduction to Programming',
        creditHours: 3,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockRepository.findCourseById = jest.fn().mockResolvedValue(mockCourse);
      mockRepository.deleteCourse = jest.fn().mockResolvedValue(undefined);

      await academicService.deleteCourse('course-123');

      expect(mockRepository.deleteCourse).toHaveBeenCalledWith('course-123');
    });

    it('should throw NotFoundError if course does not exist', async () => {
      mockRepository.findCourseById = jest.fn().mockResolvedValue(null);

      await expect(academicService.deleteCourse('course-123')).rejects.toThrow(NotFoundError);
    });
  });
});
