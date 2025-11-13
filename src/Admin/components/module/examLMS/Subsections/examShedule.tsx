import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  message,
  Drawer,
  Form,
  Row,
  Col,
  Statistic,
  Timeline,
  Empty,
  Popconfirm,
  Tooltip,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  FieldTimeOutlined,
  BookOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import examinationAPI, { CreateExamDTO, Exam, ExamsResponse } from '@/api/examination.api';
import { academicAPI, Course, CourseSection } from '@/api/academic.api';
import { timetableAPI, Room } from '@/api/timetable.api';
import PermissionGuard from '../../../../common/PermissionGuard';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

type DayRange = [Dayjs, Dayjs] | null;

interface Filters {
  search: string;
  courseId?: string;
  sectionId?: string;
  examType?: string;
  status?: string;
  dateRange?: DayRange;
}

const StdExamShedule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<Filters>({ search: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [viewExam, setViewExam] = useState<Exam | null>(null);

  useEffect(() => {
    loadReferenceData();
    fetchExams(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [courseResponse, sectionResponse, roomResponse] = await Promise.all([
        academicAPI.getCourses(1, 500, { isActive: true }),
        academicAPI.getSections(1, 500, {}),
        timetableAPI.getRooms(1, 200, { isActive: true }),
      ]);
      setCourses(courseResponse.courses);
      setSections(sectionResponse.sections);
      setRooms(roomResponse.rooms);
    } catch (error) {
      console.warn('Failed to load examination reference data', error);
    }
  };

  const fetchExams = async (page: number = pagination.page, currentFilters: Filters = filters) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pagination.limit,
        courseId: currentFilters.courseId,
        sectionId: currentFilters.sectionId,
        examType: currentFilters.examType,
        status: currentFilters.status,
        search: currentFilters.search || undefined,
      };
      if (
        currentFilters.dateRange &&
        currentFilters.dateRange[0] &&
        currentFilters.dateRange[1]
      ) {
        params.startDate = currentFilters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = currentFilters.dateRange[1].format('YYYY-MM-DD');
      }
      const response: ExamsResponse | any = await examinationAPI.getAllExams(params);
      const data = Array.isArray(response?.exams)
        ? response.exams
        : Array.isArray(response?.data?.exams)
        ? response.data.exams
        : Array.isArray(response)
        ? response
        : [];
      setExams(data);
      const paginationData = response?.pagination || response?.data?.pagination;
      if (paginationData) {
        setPagination({
          page: paginationData.page,
          limit: paginationData.limit,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
        });
      } else {
        setPagination((prev) => ({ ...prev, page, total: data.length }));
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (page: number) => {
    fetchExams(page, filters);
  };

  const handleOpenDrawer = (exam?: Exam) => {
    if (exam) {
      setSelectedExam(exam);
      form.setFieldsValue({
        title: exam.title,
        examType: exam.examType,
        sectionId: exam.sectionId,
        examDate: dayjs(exam.examDate),
        time: [dayjs(exam.startTime, 'HH:mm'), dayjs(exam.endTime, 'HH:mm')],
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        location: exam.location,
        instructions: exam.instructions,
        roomId: exam.roomId,
      });
    } else {
      setSelectedExam(null);
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await examinationAPI.deleteExam(id);
      message.success('Exam deleted');
      fetchExams(pagination.page, filters);
    } catch (error: any) {
      message.error(error.message || 'Failed to delete exam');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateExamDTO = {
        title: values.title,
        examType: values.examType,
        sectionId: values.sectionId,
        courseId: sections.find((section) => section.id === values.sectionId)?.courseId || values.courseId,
        examDate: values.examDate.format('YYYY-MM-DD'),
        startTime: values.time[0].format('HH:mm'),
        endTime: values.time[1].format('HH:mm'),
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
        location: values.location,
        instructions: values.instructions,
        roomId: values.roomId,
      };

      if (selectedExam) {
        await examinationAPI.updateExam(selectedExam.id, payload);
        message.success('Exam updated');
      } else {
        await examinationAPI.createExam(payload);
        message.success('Exam created');
      }
      setDrawerVisible(false);
      fetchExams(pagination.page, filters);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to save exam');
    }
  };

  const filteredExams = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    if (!search) return exams;
    return exams.filter((exam) => {
      const course = courses.find((courseItem) => courseItem.id === exam.courseId);
      return [
        exam.title,
        course?.code,
        course?.title,
      ]
        .filter(Boolean)
        .some((token) => token!.toLowerCase().includes(search));
    });
  }, [exams, filters.search, courses]);

  const upcomingTimeline = useMemo(() => {
    return filteredExams
      .slice()
      .sort((a, b) => dayjs(a.examDate).valueOf() - dayjs(b.examDate).valueOf())
      .slice(0, 6);
  }, [filteredExams]);

  const summary = useMemo(() => {
    const scheduled = exams.filter((exam) => exam.status === 'scheduled').length;
    const completed = exams.filter((exam) => exam.status === 'completed').length;
    const totalMarks = exams.reduce((sum, exam) => sum + exam.totalMarks, 0);
    return { total: exams.length, scheduled, completed, totalMarks };
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
      title: 'Course / Section',
      dataIndex: 'courseId',
      key: 'courseId',
      render: (courseId: string, record: Exam) => {
        const course = courses.find((courseItem) => courseItem.id === courseId);
        const section = sections.find((sectionItem) => sectionItem.id === record.sectionId);
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
      key: 'examDate',
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Exam) => (
        <Space>
          <Tooltip title="View">
            <Button type="link" icon={<EyeOutlined />} onClick={() => setViewExam(record)} />
          </Tooltip>
          <PermissionGuard permission="examination" action="update">
            <Tooltip title="Edit">
              <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenDrawer(record)} />
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission="examination" action="delete">
            <Popconfirm title="Delete exam?" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <CalendarOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Exam Schedule</span>
            <Button icon={<ReloadOutlined />} onClick={() => fetchExams(pagination.page, filters)}>
              Refresh
            </Button>
          </Space>
        }
        extra={
          <PermissionGuard permission="examination" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDrawer()}>
              Schedule Exam
            </Button>
          </PermissionGuard>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                <Statistic title="Total Exams" value={summary.total} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                <Statistic title="Scheduled" value={summary.scheduled} prefix={<FieldTimeOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                <Statistic title="Completed" value={summary.completed} prefix={<BookOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff0f6' }}>
                <Statistic title="Total Marks Allocated" value={summary.totalMarks} suffix="pts" />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Space wrap style={{ width: '100%' }}>
        <Input
                placeholder="Search by title or course"
                style={{ minWidth: 240 }}
                allowClear
                value={filters.search}
                onChange={(e) => {
                  const updated = { ...filters, search: e.target.value };
                  setFilters(updated);
                  fetchExams(1, updated);
                }}
              />
              <Select
                placeholder="Exam type"
                allowClear
                style={{ minWidth: 160 }}
                value={filters.examType}
                onChange={(value) => {
                  const updated = { ...filters, examType: value || undefined };
                  setFilters(updated);
                  fetchExams(1, updated);
                }}
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
                onChange={(value) => {
                  const updated = { ...filters, status: value || undefined };
                  setFilters(updated);
                  fetchExams(1, updated);
                }}
              >
                {['scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
                  <Option key={status} value={status}>
                    {status.toUpperCase()}
                  </Option>
                ))}
              </Select>
        <Select
                placeholder="Course"
          allowClear
                showSearch
                optionFilterProp="children"
                style={{ minWidth: 220 }}
                value={filters.courseId}
                onChange={(value) => {
                  const updated = { ...filters, courseId: value || undefined };
                  setFilters(updated);
                  fetchExams(1, updated);
                }}
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
                onChange={(value) => {
                  const updated = { ...filters, sectionId: value || undefined };
                  setFilters(updated);
                  fetchExams(1, updated);
                }}
              >
                {sections.map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.sectionCode}
                  </Option>
                ))}
              </Select>
              <RangePicker
                allowClear
                value={filters.dateRange}
                onChange={(value) => {
                  const normalized =
                    value && value[0] && value[1] ? ([value[0], value[1]] as [Dayjs, Dayjs]) : null;
                  const updated: Filters = { ...filters, dateRange: normalized ?? undefined };
                  setFilters(updated);
                  fetchExams(1, updated);
                }}
              />
            </Space>
          </Card>

          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              Upcoming Exams
            </Title>
            {upcomingTimeline.length === 0 ? (
              <Empty description="No upcoming exams" />
            ) : (
              <Timeline
                items={upcomingTimeline.map((exam) => {
                  const course = courses.find((courseItem) => courseItem.id === exam.courseId);
                  const section = sections.find((sectionItem) => sectionItem.id === exam.sectionId);
                  return {
                    children: (
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space>
                            <CalendarOutlined />
                            {dayjs(exam.examDate).format('DD MMM YYYY')}
                            <Tag color="geekblue">{exam.examType.toUpperCase()}</Tag>
                          </Space>
                          <Space>
                            <FieldTimeOutlined />
                            {dayjs(exam.startTime, 'HH:mm').format('h:mm A')} - {dayjs(exam.endTime, 'HH:mm').format('h:mm A')}
                          </Space>
                          <span style={{ fontWeight: 600 }}>
                            {course ? `${course.code} • ${course.title}` : exam.title}
                          </span>
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
            )}
          </Card>

      <Table
            rowKey="id"
            loading={loading}
            dataSource={filteredExams}
        columns={columns}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: false,
              onChange: handleTableChange,
            }}
            locale={{ emptyText: loading ? <Empty description="Loading exams..." /> : <Empty description="No exams found" /> }}
          />
        </Space>
      </Card>

      <Drawer
        width={520}
        title={selectedExam ? 'Edit Exam' : 'Schedule Exam'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="title" label="Exam Title" rules={[{ required: true, message: 'Enter exam title' }]}> 
            <Input placeholder="e.g., Midterm Exam - Calculus" />
          </Form.Item>
          <Form.Item name="examType" label="Exam Type" rules={[{ required: true, message: 'Select type' }]}> 
            <Select placeholder="Select type">
              {['midterm', 'final', 'quiz', 'assignment', 'practical'].map((type) => (
                <Option key={type} value={type}>
                  {type.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sectionId" label="Section" rules={[{ required: true, message: 'Select section' }]}> 
            <Select
              placeholder="Select section"
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                const section = sections.find((item) => item.id === value);
                form.setFieldsValue({ courseId: section?.courseId });
              }}
            >
              {sections.map((section) => (
                <Option key={section.id} value={section.id}>
                  {section.sectionCode}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="courseId" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="examDate" label="Exam Date" rules={[{ required: true, message: 'Choose date' }]}> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Select time' }]}> 
                <RangePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalMarks" label="Total Marks" rules={[{ required: true, message: 'Enter total marks' }]}> 
                <Input type="number" min={1} placeholder="100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="passingMarks" label="Passing Marks" rules={[{ required: true, message: 'Enter passing marks' }]}> 
                <Input type="number" min={0} placeholder="50" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="roomId" label="Room">
            <Select placeholder="Select room" allowClear showSearch optionFilterProp="children">
              {rooms.map((room) => (
                <Option key={room.id} value={room.id}>
                  {room.roomNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Location / Hall">
            <Input placeholder="e.g., Main Auditorium" />
          </Form.Item>
          <Form.Item name="instructions" label="Instructions">
            <Input.TextArea rows={3} placeholder="Special instructions, allowed material, etc." />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        width={420}
        title="Exam Details"
        open={!!viewExam}
        onClose={() => setViewExam(null)}
      >
        {viewExam ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6f9ff' }}>
              <Space direction="vertical" size={6}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{viewExam.title}</span>
                <Tag color="geekblue">{viewExam.examType.toUpperCase()}</Tag>
                <Space>
                  <CalendarOutlined />
                  {dayjs(viewExam.examDate).format('dddd, DD MMM YYYY')}
                </Space>
                <Space>
                  <FieldTimeOutlined />
                  {dayjs(viewExam.startTime, 'HH:mm').format('h:mm A')} - {dayjs(viewExam.endTime, 'HH:mm').format('h:mm A')}
                </Space>
              </Space>
            </Card>
            <Space direction="vertical" size={8}>
              <span style={{ fontWeight: 600 }}>Course & Section</span>
              <span>
                {(() => {
                  const course = courses.find((courseItem) => courseItem.id === viewExam.courseId);
                  const section = sections.find((sectionItem) => sectionItem.id === viewExam.sectionId);
                  return course ? `${course.code} • ${course.title}${section ? ` • ${section.sectionCode}` : ''}` : section?.sectionCode || viewExam.courseId;
                })()}
              </span>
            </Space>
            <Space direction="vertical" size={8}>
              <span style={{ fontWeight: 600 }}>Marks</span>
              <span>Passing {viewExam.passingMarks} / Total {viewExam.totalMarks}</span>
            </Space>
            {viewExam.location && (
              <Space direction="vertical" size={8}>
                <span style={{ fontWeight: 600 }}>Location</span>
                <span>{viewExam.location}</span>
              </Space>
            )}
            {viewExam.instructions && (
              <Space direction="vertical" size={8}>
                <span style={{ fontWeight: 600 }}>Instructions</span>
                <span>{viewExam.instructions}</span>
              </Space>
            )}
          </Space>
        ) : (
          <Empty />
        )}
      </Drawer>
    </div>
  );
};

export default StdExamShedule;
