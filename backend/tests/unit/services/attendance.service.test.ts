/**
 * Attendance Service Unit Tests
 * 
 * Comprehensive test suite for AttendanceService covering:
 * - Attendance record creation (individual and bulk)
 * - Attendance record updates
 * - Attendance retrieval and filtering
 * - Attendance summary calculations
 * - Attendance reporting
 * 
 * @module tests/unit/services/attendance.service.test
 */

import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRepository } from '@/repositories/attendance.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';

jest.mock('@/repositories/attendance.repository');

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let mockRepository: jest.Mocked<AttendanceRepository>;

  beforeEach(() => {
    mockRepository = new AttendanceRepository() as jest.Mocked<AttendanceRepository>;
    attendanceService = new AttendanceService();
    (attendanceService as any).attendanceRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAttendanceRecords', () => {
    it('should retrieve all attendance records with pagination', async () => {
      const mockRecords = [
        {
          id: 'att-1',
          enrollmentId: 'enrollment-1',
          sectionId: 'section-1',
          studentId: 'student-1',
          attendanceDate: '2024-10-15',
          status: 'present' as const,
          remarks: 'On time',
          markedBy: 'faculty-1',
          createdAt: '2024-10-15T10:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z',
        },
        {
          id: 'att-2',
          enrollmentId: 'enrollment-2',
          sectionId: 'section-1',
          studentId: 'student-2',
          attendanceDate: '2024-10-15',
          status: 'absent' as const,
          remarks: null,
          markedBy: 'faculty-1',
          createdAt: '2024-10-15T10:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z',
        },
      ];

      mockRepository.findAllAttendanceRecords = jest.fn().mockResolvedValue(mockRecords);

      const result = await attendanceService.getAllAttendanceRecords(10, 0);

      expect(result.records).toEqual(mockRecords);
      expect(result.total).toBe(2);
      expect(mockRepository.findAllAttendanceRecords).toHaveBeenCalledWith(100, 0, undefined);
    });

    it('should apply filters when provided', async () => {
      const filters = {
        sectionId: 'section-1',
        attendanceDate: '2024-10-15',
        status: 'present',
      };

      mockRepository.findAllAttendanceRecords = jest.fn().mockResolvedValue([]);

      await attendanceService.getAllAttendanceRecords(10, 0, filters);

      expect(mockRepository.findAllAttendanceRecords).toHaveBeenCalledWith(100, 0, filters);
    });

    it('should handle errors when repository fails', async () => {
      mockRepository.findAllAttendanceRecords = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(attendanceService.getAllAttendanceRecords()).rejects.toThrow('Failed to fetch attendance records');
    });
  });

  describe('getAttendanceById', () => {
    it('should retrieve attendance record by ID', async () => {
      const mockRecord = {
        id: 'att-1',
        enrollmentId: 'enrollment-1',
        sectionId: 'section-1',
        studentId: 'student-1',
        attendanceDate: '2024-10-15',
        status: 'present' as const,
        remarks: 'On time',
        markedBy: 'faculty-1',
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-10-15T10:00:00Z',
      };

      mockRepository.findAttendanceById = jest.fn().mockResolvedValue(mockRecord);

      const result = await attendanceService.getAttendanceById('att-1');

      expect(result).toEqual(mockRecord);
      expect(mockRepository.findAttendanceById).toHaveBeenCalledWith('att-1');
    });

    it('should throw NotFoundError when record not found', async () => {
      mockRepository.findAttendanceById = jest.fn().mockResolvedValue(null);

      await expect(attendanceService.getAttendanceById('att-999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createAttendance', () => {
    it('should create attendance record successfully', async () => {
      const attendanceData = {
        enrollmentId: 'enrollment-1',
        sectionId: 'section-1',
        studentId: 'student-1',
        attendanceDate: '2024-10-15',
        status: 'present' as const,
        remarks: 'On time',
      };

      const mockRecord = {
        id: 'att-1',
        ...attendanceData,
        markedBy: 'faculty-1',
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-10-15T10:00:00Z',
      };

      mockRepository.createAttendance = jest.fn().mockResolvedValue(mockRecord);

      const result = await attendanceService.createAttendance(attendanceData, 'faculty-1');

      expect(result).toEqual(mockRecord);
      expect(mockRepository.createAttendance).toHaveBeenCalledWith(attendanceData, 'faculty-1');
    });

    it('should throw ValidationError if required fields are missing', async () => {
      const attendanceData = {
        enrollmentId: '',
        sectionId: '',
        studentId: '',
        attendanceDate: '',
        status: 'present' as const,
      };

      await expect(attendanceService.createAttendance(attendanceData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid date format', async () => {
      const attendanceData = {
        enrollmentId: 'enrollment-1',
        sectionId: 'section-1',
        studentId: 'student-1',
        attendanceDate: 'invalid-date',
        status: 'present' as const,
      };

      await expect(attendanceService.createAttendance(attendanceData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status', async () => {
      const attendanceData = {
        enrollmentId: 'enrollment-1',
        sectionId: 'section-1',
        studentId: 'student-1',
        attendanceDate: '2024-10-15',
        status: 'invalid-status' as any,
      };

      await expect(attendanceService.createAttendance(attendanceData)).rejects.toThrow(ValidationError);
    });

    it('should accept valid statuses: present, absent, late, excused', async () => {
      const validStatuses = ['present', 'absent', 'late', 'excused'] as const;

      for (const status of validStatuses) {
        const attendanceData = {
          enrollmentId: 'enrollment-1',
          sectionId: 'section-1',
          studentId: 'student-1',
          attendanceDate: '2024-10-15',
          status,
        };

        mockRepository.createAttendance = jest.fn().mockResolvedValue({
          id: 'att-1',
          ...attendanceData,
          markedBy: 'faculty-1',
          createdAt: '2024-10-15T10:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z',
        });

        await expect(attendanceService.createAttendance(attendanceData)).resolves.toBeDefined();
      }
    });
  });

  describe('bulkCreateAttendance', () => {
    it('should create multiple attendance records successfully', async () => {
      const bulkData = {
        sectionId: 'section-1',
        attendanceDate: '2024-10-15',
        entries: [
          { enrollmentId: 'enrollment-1', status: 'present' as const },
          { enrollmentId: 'enrollment-2', status: 'absent' as const, remarks: 'Sick' },
          { enrollmentId: 'enrollment-3', status: 'late' as const },
        ],
      };

      const mockRecords = bulkData.entries.map((entry, index) => ({
        id: `att-${index + 1}`,
        enrollmentId: entry.enrollmentId,
        sectionId: bulkData.sectionId,
        studentId: `student-${index + 1}`,
        attendanceDate: bulkData.attendanceDate,
        status: entry.status,
        remarks: entry.remarks || null,
        markedBy: 'faculty-1',
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-10-15T10:00:00Z',
      }));

      mockRepository.bulkCreateAttendance = jest.fn().mockResolvedValue(mockRecords);

      const result = await attendanceService.bulkCreateAttendance(bulkData, 'faculty-1');

      expect(result).toEqual(mockRecords);
      expect(mockRepository.bulkCreateAttendance).toHaveBeenCalledWith(bulkData, 'faculty-1');
    });

    it('should throw ValidationError if section ID is missing', async () => {
      const bulkData = {
        sectionId: '',
        attendanceDate: '2024-10-15',
        entries: [{ enrollmentId: 'enrollment-1', status: 'present' as const }],
      };

      await expect(attendanceService.bulkCreateAttendance(bulkData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if entries array is empty', async () => {
      const bulkData = {
        sectionId: 'section-1',
        attendanceDate: '2024-10-15',
        entries: [],
      };

      await expect(attendanceService.bulkCreateAttendance(bulkData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if entry has missing enrollment ID', async () => {
      const bulkData = {
        sectionId: 'section-1',
        attendanceDate: '2024-10-15',
        entries: [
          { enrollmentId: '', status: 'present' as const },
        ],
      };

      await expect(attendanceService.bulkCreateAttendance(bulkData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status in entries', async () => {
      const bulkData = {
        sectionId: 'section-1',
        attendanceDate: '2024-10-15',
        entries: [
          { enrollmentId: 'enrollment-1', status: 'invalid-status' as any },
        ],
      };

      await expect(attendanceService.bulkCreateAttendance(bulkData)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance record successfully', async () => {
      const existingRecord = {
        id: 'att-1',
        enrollmentId: 'enrollment-1',
        sectionId: 'section-1',
        studentId: 'student-1',
        attendanceDate: '2024-10-15',
        status: 'present' as const,
        remarks: 'On time',
        markedBy: 'faculty-1',
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-10-15T10:00:00Z',
      };

      const updatedRecord = {
        ...existingRecord,
        status: 'late' as const,
        remarks: 'Arrived 10 minutes late',
        updatedAt: '2024-10-15T11:00:00Z',
      };

      mockRepository.findAttendanceById = jest.fn().mockResolvedValue(existingRecord);
      mockRepository.updateAttendance = jest.fn().mockResolvedValue(updatedRecord);

      const result = await attendanceService.updateAttendance('att-1', 'late', 'Arrived 10 minutes late');

      expect(result).toEqual(updatedRecord);
      expect(mockRepository.updateAttendance).toHaveBeenCalledWith('att-1', 'late', 'Arrived 10 minutes late');
    });

    it('should throw NotFoundError when record not found', async () => {
      mockRepository.findAttendanceById = jest.fn().mockResolvedValue(null);

      await expect(attendanceService.updateAttendance('att-999', 'present')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid status', async () => {
      const existingRecord = {
        id: 'att-1',
        enrollmentId: 'enrollment-1',
        sectionId: 'section-1',
        studentId: 'student-1',
        attendanceDate: '2024-10-15',
        status: 'present' as const,
        remarks: null,
        markedBy: 'faculty-1',
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-10-15T10:00:00Z',
      };

      mockRepository.findAttendanceById = jest.fn().mockResolvedValue(existingRecord);

      await expect(attendanceService.updateAttendance('att-1', 'invalid-status' as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getAttendanceSummary', () => {
    it('should calculate attendance summary for a student', async () => {
      const mockSummary = {
        totalClasses: 30,
        present: 25,
        absent: 3,
        late: 2,
        excused: 0,
        attendancePercentage: 83.33,
      };

      mockRepository.getAttendanceSummary = jest.fn().mockResolvedValue(mockSummary);

      const result = await attendanceService.getAttendanceSummary('enrollment-1');

      expect(result).toEqual(mockSummary);
      expect(mockRepository.getAttendanceSummary).toHaveBeenCalledWith('enrollment-1');
    });

    it('should handle case when no attendance records exist', async () => {
      const mockSummary = {
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendancePercentage: 0,
      };

      mockRepository.getAttendanceSummary = jest.fn().mockResolvedValue(mockSummary);

      const result = await attendanceService.getAttendanceSummary('enrollment-1');

      expect(result).toEqual(mockSummary);
    });
  });

  describe('getSectionAttendanceReport', () => {
    it('should generate attendance report for a section', async () => {
      const mockReport = {
        sectionId: 'section-1',
        attendanceDate: '2024-10-15',
        totalStudents: 30,
        present: 25,
        absent: 3,
        late: 2,
        excused: 0,
        records: [],
      };

      mockRepository.getSectionAttendanceReport = jest.fn().mockResolvedValue(mockReport);

      const result = await attendanceService.getSectionAttendanceReport('section-1', '2024-10-15');

      expect(result).toEqual(mockReport);
      expect(mockRepository.getSectionAttendanceReport).toHaveBeenCalledWith('section-1', '2024-10-15');
    });
  });

  describe('getStudentAttendanceReport', () => {
    it('should generate attendance report for a student', async () => {
      const mockRecords = [
        {
          id: 'att-1',
          enrollmentId: 'enrollment-1',
          sectionId: 'section-1',
          studentId: 'student-1',
          attendanceDate: '2024-10-15',
          status: 'present' as const,
          remarks: null,
          markedBy: 'faculty-1',
          createdAt: '2024-10-15T10:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z',
        },
      ];

      mockRepository.findAllAttendanceRecords = jest.fn().mockResolvedValue(mockRecords);

      const result = await attendanceService.getStudentAttendanceReport(
        'student-1',
        'section-1',
        '2024-10-01',
        '2024-10-31'
      );

      expect(result.studentId).toBe('student-1');
      expect(result.sectionId).toBe('section-1');
      expect(result.totalClasses).toBeGreaterThanOrEqual(0);
      expect(mockRepository.findAllAttendanceRecords).toHaveBeenCalled();
    });

    it('should throw ValidationError if parameters are missing', async () => {
      await expect(
        attendanceService.getStudentAttendanceReport('', 'section-1', '2024-10-01', '2024-10-31')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getSectionAttendanceReport', () => {
    it('should throw ValidationError if parameters are missing', async () => {
      await expect(attendanceService.getSectionAttendanceReport('', '2024-10-15')).rejects.toThrow(ValidationError);
    });
  });
});

