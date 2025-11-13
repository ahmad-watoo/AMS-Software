import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Select,
  Table,
  Tag,
  Empty,
  Timeline,
  Typography,
  Spin,
} from 'antd';
import {
  CalendarOutlined,
  FieldTimeOutlined,
  BookOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import examinationAPI, { Exam } from '@/api/examination.api';
import { academicAPI, Course, CourseSection } from '@/api/academic.api';

const { Option } = Select;
const { Title } = Typography;

const ExamSchedule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [filters, setFilters] = useState({ courseId: undefined as string | undefined, sectionId: undefined as string | undefined, examType: undefined as string | undefined, status: undefined as string | undefined });

  useEffect(() => {
    loadReferenceData();
    fetchExams();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [courseResponse, sectionResponse] = await Promise.all([
        academicAPI.getCourses(1, 500, { isActive: true }),
        academicAPI.getSections(1, 200, {}),
      ]);
      setCourses(courseResponse.courses);
      setSections(sectionResponse.sections);
    } catch (error) {
      console.warn('Failed to load exam references', error);
    }
  };

  const fetchExams = async (currentFilters = filters) => {
    try {
      setLoading(true);
      const response = await examinationAPI.getAllExams({
        courseId: currentFilters.courseId,
        sectionId: currentFilters.sectionId,
        examType: currentFilters.examType,
        status: currentFilters.status,
        page: 1,
        limit: 200,
      });
      setExams(response.exams || []);
    } catch (error) {
      console.error('Failed to load exam schedule', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionLookup = useMemo(() => {
    const map = new Map<string, CourseSection>();
    sections.forEach((section) => map.set(section.id, section));
    return map;
  }, [sections]);

  const courseLookup = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const upcomingExams = useMemo(() => {
    return exams
      .slice()
      .sort((a, b) => dayjs(a.examDate).valueOf() - dayjs(b.examDate).valueOf());
  }, [exams]);

  const columns = [
    {
      title: 'Exam',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Exam) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{title}</span>
          <Tag color="geekblue">{record.examType.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'courseId',
      key: 'courseId',
      render: (courseId: string, record: Exam) => {
        const course = courseLookup.get(courseId);
        const section = sectionLookup.get(record.sectionId);
        return (
          <Space direction="vertical" size={0}>
            <span>{course ? `${course.code} • ${course.title}` : courseId}</span>
            {section && <Tag>{section.sectionCode}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Schedule',
      dataIndex: 'examDate',
      key: 'schedule',
      render: (_: any, record: Exam) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CalendarOutlined />
            {dayjs(record.examDate).format('DD MMM YYYY')}
          </Space>
          <Space>
            <FieldTimeOutlined />
            {`${dayjs(record.startTime, 'HH:mm').format('h:mm A')} - ${dayjs(record.endTime, 'HH:mm').format('h:mm A')}`}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Marks',
      dataIndex: 'totalMarks',
      key: 'marks',
      render: (totalMarks: number, record: Exam) => (
        <Space>
          <BookOutlined />
          {record.passingMarks}/{totalMarks}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Exam['status']) => {
        const colorMap: Record<Exam['status'], string> = {
          scheduled: 'blue',
          ongoing: 'orange',
          completed: 'green',
          cancelled: 'red',
        };
        return <Tag color={colorMap[status] || 'blue'}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const handleFilterChange = (field: keyof typeof filters, value?: string) => {
    const updated = { ...filters, [field]: value || undefined };
    setFilters(updated);
    fetchExams(updated);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <CalendarOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Exam Timetable</span>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Space wrap style={{ width: '100%' }}>
              <Select
                placeholder="Filter by course"
                allowClear
                showSearch
                style={{ minWidth: 220 }}
                value={filters.courseId}
                optionFilterProp="children"
                onChange={(value) => handleFilterChange('courseId', value as string)}
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
                style={{ minWidth: 200 }}
                value={filters.sectionId}
                optionFilterProp="children"
                onChange={(value) => handleFilterChange('sectionId', value as string)}
              >
                {sections.map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.sectionCode}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Exam type"
                allowClear
                style={{ minWidth: 160 }}
                value={filters.examType}
                onChange={(value) => handleFilterChange('examType', value as string)}
              >
                {['midterm', 'final', 'quiz', 'assignment', 'practical'].map((type) => (
                  <Option key={type} value={type}>
                    {type.toUpperCase()}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Status"
                allowClear
                style={{ minWidth: 160 }}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value as string)}
              >
                {['scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
                  <Option key={status} value={status}>
                    {status.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          {loading ? (
            <Spin tip="Loading exam timetable..." />
          ) : exams.length === 0 ? (
            <Empty description="No exam timetable found" />
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Upcoming Exams
                </Title>
                <Timeline
                  items={upcomingExams.slice(0, 6).map((exam) => {
                    const course = courseLookup.get(exam.courseId);
                    const section = sectionLookup.get(exam.sectionId);
                    return {
                      children: (
                        <Card size="small" style={{ borderRadius: 12 }}>
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <Space>
                              <CalendarOutlined />
                              {dayjs(exam.examDate).format('DD MMM YYYY')}
                              <Tag color="geekblue">{exam.examType.toUpperCase()}</Tag>
                              <Tag>{exam.status.toUpperCase()}</Tag>
                            </Space>
                            <Space>
                              <FieldTimeOutlined />
                              {dayjs(exam.startTime, 'HH:mm').format('h:mm A')} - {dayjs(exam.endTime, 'HH:mm').format('h:mm A')}
                            </Space>
                            {course && (
                              <span style={{ fontWeight: 600 }}>
                                {course.code} • {course.title}
                              </span>
                            )}
                            <Space size="small">
                              {section && <Tag>{section.sectionCode}</Tag>}
                              {exam.location && <Tag color="purple">{exam.location}</Tag>}
                            </Space>
                          </Space>
                        </Card>
                      ),
                    };
                  })}
                />
              </Card>

              <Card title="Exam Schedule" bordered={false} style={{ borderRadius: 12 }}>
                <Table
                  rowKey="id"
                  size="small"
                  dataSource={upcomingExams}
                  columns={columns}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ExamSchedule;
