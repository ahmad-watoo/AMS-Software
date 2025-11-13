import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Drawer,
  Select,
  DatePicker,
  message,
  Empty,
  Skeleton,
  Statistic,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  TeamOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import attendanceAPI, { AttendanceRecord, AttendanceReport } from '@/api/attendance.api';
import { academicAPI, Course, CourseSection } from '@/api/academic.api';
import { studentAPI, Student } from '../../../../../api/student.api';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

type DayRange = [Dayjs, Dayjs] | null;

interface HistoryFilters {
  status?: AttendanceRecord['status'];
  dateRange?: DayRange;
}

const statusColors: Record<AttendanceRecord['status'], string> = {
  present: 'green',
  absent: 'red',
  late: 'orange',
  excused: 'blue',
};

const StudentAttendancePage: React.FC = () => {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedReport, setSelectedReport] = useState<AttendanceReport | null>(null);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({});
  const [filters, setFilters] = useState<{ courseId?: string; sectionId?: string }>(() => ({}));

  useEffect(() => {
    loadReferenceData();
    fetchAttendanceReports({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [courseResponse, sectionResponse, studentResponse] = await Promise.all([
        academicAPI.getCourses(1, 500, { isActive: true }),
        academicAPI.getSections(1, 500, {}),
        studentAPI.getStudents(1, 500, { enrollmentStatus: 'active' }),
      ]);
      setCourses(courseResponse.courses);
      setSections(sectionResponse.sections);
      setStudents(studentResponse.students);
    } catch (error) {
      message.warning('Failed to load some student attendance references. Filters may be limited.');
    }
  };

  const fetchAttendanceReports = async (params: { courseId?: string; sectionId?: string }) => {
    try {
      setReportsLoading(true);
      const response = await attendanceAPI.getAttendanceReport({
        courseId: params.courseId,
        sectionId: params.sectionId,
      });
      const data = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.reports)
        ? (response as any).reports
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : [];
      setReports(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load student attendance summary');
    } finally {
      setReportsLoading(false);
    }
  };

  const openHistory = async (report: AttendanceReport) => {
    setSelectedReport(report);
    await loadHistory(report, historyFilters);
  };

  const loadHistory = async (report: AttendanceReport, currentFilters: HistoryFilters) => {
    try {
      setHistoryLoading(true);
      const params: any = {
        studentId: report.studentId,
        courseId: report.courseId,
        sectionId: report.sectionCode,
        limit: 200,
      };
      if (currentFilters.status) params.status = currentFilters.status;
      if (currentFilters.dateRange) {
        params.startDate = currentFilters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = currentFilters.dateRange[1].format('YYYY-MM-DD');
      }
      const response = await attendanceAPI.getAttendanceRecords(params);
      const data = Array.isArray(response?.records)
        ? response.records
        : Array.isArray(response?.data?.records)
        ? response.data.records
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setHistoryRecords(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load attendance history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryFilterChange = async (patch: HistoryFilters) => {
    if (!selectedReport) return;
    const updated = { ...historyFilters, ...patch };
    setHistoryFilters(updated);
    await loadHistory(selectedReport, updated);
  };

  const handleStatusUpdate = async (record: AttendanceRecord, status: AttendanceRecord['status']) => {
    try {
      await attendanceAPI.updateAttendanceRecord(record.id, { status });
      message.success('Attendance updated');
      if (selectedReport) {
        await loadHistory(selectedReport, historyFilters);
        await fetchAttendanceReports(filters);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to update attendance status');
    }
  };

  const handleDeleteRecord = async (record: AttendanceRecord) => {
    try {
      await attendanceAPI.deleteAttendanceRecord(record.id);
      message.success('Attendance entry removed');
      if (selectedReport) {
        await loadHistory(selectedReport, historyFilters);
        await fetchAttendanceReports(filters);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete attendance record');
    }
  };

  const reportColumns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (studentName: string, record: AttendanceReport) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{studentName}</span>
          <span style={{ color: '#888' }}>{record.studentId}</span>
        </Space>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (courseName: string, record: AttendanceReport) => (
        <Space direction="vertical" size={0}>
          <span>{courseName}</span>
          <span style={{ color: '#888' }}>{record.sectionCode}</span>
        </Space>
      ),
    },
    {
      title: 'Attendance %',
      dataIndex: 'attendancePercentage',
      key: 'attendancePercentage',
      render: (value: number) => (
        <Tag color={value >= 75 ? 'green' : value >= 60 ? 'orange' : 'red'}>{value.toFixed(1)}%</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceReport['status']) => (
        <Tag color={status === 'critical' ? 'red' : status === 'warning' ? 'orange' : 'green'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AttendanceReport) => (
        <Button type="link" onClick={() => openHistory(record)}>
          View History
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      render: (value: string) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceRecord['status'], record: AttendanceRecord) => (
        <Select
          value={status}
          onChange={(value) => handleStatusUpdate(record, value as AttendanceRecord['status'])}
          style={{ width: 140 }}
        >
          {(['present', 'absent', 'late', 'excused'] as AttendanceRecord['status'][]).map((option) => (
            <Option key={option} value={option}>
              <Tag color={statusColors[option]}>{option.toUpperCase()}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
    },
    {
      title: 'Actions',
      key: 'history-actions',
      render: (_: any, record: AttendanceRecord) => (
        <Popconfirm title="Delete this record?" onConfirm={() => handleDeleteRecord(record)}>
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Tracked Students" value={reports.length} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic
                title="Warnings"
                value={reports.filter((report) => report.status === 'warning').length}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff0f6' }}>
              <Statistic
                title="Critical"
                value={reports.filter((report) => report.status === 'critical').length}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
          <Space wrap style={{ width: '100%' }}>
            <Select
              placeholder="Filter by course"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ minWidth: 220 }}
              value={filters.courseId}
              onChange={(value) => {
                const updated = { ...filters, courseId: value || undefined };
                setFilters(updated);
                fetchAttendanceReports(updated);
              }}
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by section"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ minWidth: 200 }}
              value={filters.sectionId}
              onChange={(value) => {
                const updated = { ...filters, sectionId: value || undefined };
                setFilters(updated);
                fetchAttendanceReports(updated);
              }}
            >
              {sections.map((section) => (
                <Option key={section.id} value={section.id}>
                  {section.sectionCode}
                </Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchAttendanceReports(filters)}>
              Refresh
            </Button>
          </Space>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {reportsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : reports.length === 0 ? (
            <Empty description="No attendance tracked" />
          ) : (
            <Table
              rowKey={(record) => `${record.studentId}-${record.courseId}`}
              columns={reportColumns}
              dataSource={reports}
              pagination={{ pageSize: 12 }}
            />
          )}
        </Card>
      </Space>

      <Drawer
        width={520}
        title={selectedReport ? `${selectedReport.studentName} • ${selectedReport.courseName}` : 'Attendance History'}
        open={!!selectedReport}
        onClose={() => {
          setSelectedReport(null);
          setHistoryRecords([]);
        }}
        destroyOnClose
      >
        {!selectedReport ? (
          <Empty />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6f9ff' }}>
              <Space direction="vertical" size={4}>
                <Space>
                  <TeamOutlined />
                  <span>{selectedReport.studentName}</span>
                </Space>
                <Space>
                  <CalendarOutlined />
                  <span>
                    {selectedReport.courseName} • Section {selectedReport.sectionCode}
                  </span>
                </Space>
                <Tag color={selectedReport.status === 'critical' ? 'red' : selectedReport.status === 'warning' ? 'orange' : 'green'}>
                  {selectedReport.status.toUpperCase()} — {selectedReport.attendancePercentage.toFixed(1)}%
                </Tag>
              </Space>
            </Card>

            <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
              <Space wrap style={{ width: '100%' }}>
                <Select
                  placeholder="Status"
                  allowClear
                  style={{ width: 160 }}
                  value={historyFilters.status}
                  onChange={(value) => handleHistoryFilterChange({ status: value as AttendanceRecord['status'] | undefined })}
                >
                  {(['present', 'absent', 'late', 'excused'] as AttendanceRecord['status'][]).map((option) => (
                    <Option key={option} value={option}>
                      {option.toUpperCase()}
                    </Option>
                  ))}
                </Select>
                <RangePicker
                  value={historyFilters.dateRange}
                  onChange={(value) => {
                    const normalized =
                      value && value[0] && value[1]
                        ? ([value[0], value[1]] as [Dayjs, Dayjs])
                        : null;
                    handleHistoryFilterChange({ dateRange: normalized ?? undefined });
                  }}
                />
              </Space>
            </Card>

            {historyLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : historyRecords.length === 0 ? (
              <Empty description="No attendance records" />
            ) : (
              <Table
                rowKey={(record) => record.id}
                columns={historyColumns}
                dataSource={historyRecords}
                pagination={{ pageSize: 8 }}
              />
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default StudentAttendancePage;
