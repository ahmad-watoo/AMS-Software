import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Progress,
  Button,
  Empty,
  message,
} from 'antd';
import {
  BarChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import attendanceAPI, { AttendanceReport } from '@/api/attendance.api';
import { academicAPI, Course, CourseSection } from '@/api/academic.api';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

type DayRange = [Dayjs, Dayjs] | null;

interface Filters {
  search: string;
  courseId?: string;
  sectionId?: string;
  status?: AttendanceReport['status'];
  minPercentage?: number;
  dateRange?: DayRange;
}

const statusColors: Record<AttendanceReport['status'], string> = {
  satisfactory: 'green',
  warning: 'orange',
  critical: 'red',
};

const AttendanceReportPage: React.FC = () => {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [filters, setFilters] = useState<Filters>({ search: '', minPercentage: 75 });

  useEffect(() => {
    loadReferenceData();
    fetchReports(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [courseResponse, sectionResponse] = await Promise.all([
        academicAPI.getCourses(1, 500, { isActive: true }),
        academicAPI.getSections(1, 500, {}),
      ]);
      setCourses(courseResponse.courses);
      setSections(sectionResponse.sections);
    } catch (error) {
      message.warning('Some attendance filters may be limited (failed to load course/section data).');
    }
  };

  const fetchReports = async (currentFilters: Filters) => {
    try {
      setLoading(true);
      const params: any = {
        courseId: currentFilters.courseId,
        sectionId: currentFilters.sectionId,
        minPercentage: currentFilters.minPercentage,
      };
      if (currentFilters.dateRange) {
        params.startDate = currentFilters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = currentFilters.dateRange[1].format('YYYY-MM-DD');
      }
      const response = await attendanceAPI.getAttendanceReport(params);
      const data = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.reports)
        ? (response as any).reports
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : [];
      setReports(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load attendance analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (patch: Partial<Filters>) => {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    fetchReports(updated);
  };

  const filteredReports = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    if (!search && !filters.status) return reports;
    return reports.filter((report) => {
      const matchesStatus = filters.status ? report.status === filters.status : true;
      if (!search) return matchesStatus;
      const tokens = [report.studentName, report.studentId, report.courseName, report.sectionCode]
        .filter(Boolean)
        .map((token) => token!.toLowerCase());
      const matchesSearch = tokens.some((token) => token.includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [filters.search, filters.status, reports]);

  const summary = useMemo(() => {
    if (reports.length === 0) {
      return { total: 0, warning: 0, critical: 0, average: '0.0' };
    }
    const warning = reports.filter((report) => report.status === 'warning').length;
    const critical = reports.filter((report) => report.status === 'critical').length;
    const average = (
      reports.reduce((sum, report) => sum + (report.attendancePercentage || 0), 0) /
      reports.length
    ).toFixed(1);
    return { total: reports.length, warning, critical, average };
  }, [reports]);

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string, record: AttendanceReport) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{name}</span>
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
          <span style={{ color: '#888' }}>Section {record.sectionCode}</span>
        </Space>
      ),
    },
    {
      title: 'Attendance',
      dataIndex: 'attendancePercentage',
      key: 'attendancePercentage',
      render: (value: number) => (
        <Space direction="vertical" size={0} style={{ width: 140 }}>
          <Progress percent={Number(value.toFixed(1))} size="small" status={value >= (filters.minPercentage ?? 0) ? 'normal' : 'exception'} />
          <span style={{ fontSize: 12 }}>{value.toFixed(1)}%</span>
        </Space>
      ),
    },
    {
      title: 'Classes',
      key: 'classes',
      render: (_: any, record: AttendanceReport) => (
        <span>
          {record.presentCount}/{record.totalClasses} present · {record.absentCount} absent
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceReport['status']) => (
        <Tag color={statusColors[status]} icon={status === 'critical' ? <WarningOutlined /> : undefined}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Tracked Students" value={summary.total} prefix={<BarChartOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic title="Warnings" value={summary.warning} prefix={<WarningOutlined />} valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff0f6' }}>
              <Statistic title="Critical" value={summary.critical} prefix={<WarningOutlined />} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
              <Statistic title="Average Attendance" value={`${summary.average}%`} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
          <Space wrap style={{ width: '100%' }}>
            <Input
              placeholder="Search by student, course, section"
              style={{ minWidth: 240 }}
              allowClear
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
            <Select
              placeholder="Course"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ minWidth: 220 }}
              value={filters.courseId}
              onChange={(value) => handleFilterChange({ courseId: value || undefined })}
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Section"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ minWidth: 200 }}
              value={filters.sectionId}
              onChange={(value) => handleFilterChange({ sectionId: value || undefined })}
            >
              {sections.map((section) => (
                <Option key={section.id} value={section.id}>
                  {section.sectionCode}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              allowClear
              style={{ minWidth: 180 }}
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value as AttendanceReport['status'] | undefined })}
            >
              <Option value="satisfactory">SATISFACTORY</Option>
              <Option value="warning">WARNING</Option>
              <Option value="critical">CRITICAL</Option>
            </Select>
            <Select
              placeholder="Minimum %"
              allowClear
              style={{ width: 160 }}
              value={filters.minPercentage}
              onChange={(value) => handleFilterChange({ minPercentage: value as number | undefined })}
            >
              {[95, 90, 85, 80, 75, 70].map((value) => (
                <Option key={value} value={value}>
                  Show below {value}%
                </Option>
              ))}
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(value) => {
                const normalized =
                  value && value[0] && value[1] ? ([value[0], value[1]] as [Dayjs, Dayjs]) : null;
                handleFilterChange({ dateRange: normalized ?? undefined });
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchReports(filters)}>
              Refresh
            </Button>
          </Space>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {loading ? (
            <Table loading columns={columns} dataSource={[]} />
          ) : filteredReports.length === 0 ? (
            <Empty description="No attendance records found" />
          ) : (
            <Table
              rowKey={(record) => `${record.studentId}-${record.courseId}`}
              columns={columns}
              dataSource={filteredReports}
              pagination={{ pageSize: 12 }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default AttendanceReportPage;
