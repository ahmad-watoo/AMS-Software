import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Select,
  TimePicker,
  Typography,
  Row,
  Col,
  Alert,
  Skeleton,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { timetableAPI, CreateTimetableDTO, Timetable, Room } from '../../../../api/timetable.api';
import { academicAPI, CourseSection, Course } from '../../../../api/academic.api';
import { userAPI, User } from '../../../../api/user.api';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { RangePicker } = TimePicker;
const { Title, Paragraph } = Typography;

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

interface TimetableFormProps {
  isEdit?: boolean;
}

interface ConflictingEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  reason: string;
}

const TimetableForm: React.FC<TimetableFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [existingTimetable, setExistingTimetable] = useState<Timetable | null>(null);
  const [conflicts, setConflicts] = useState<ConflictingEntry[]>([]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadTimetable(id);
    }
  }, [id, isEdit]);

  const loadReferenceData = async () => {
    try {
      setLoading(true);
      const [sectionResponse, courseResponse, roomResponse, facultyResponse] = await Promise.all([
        academicAPI.getSections(1, 200, {}),
        academicAPI.getCourses(1, 500, { isActive: true }),
        timetableAPI.getRooms(1, 200, { isActive: true }),
        userAPI.getUsers(1, 200),
      ]);
      setSections(sectionResponse.sections);
      setCourses(courseResponse.courses);
      setRooms(roomResponse.rooms);
      setFaculty(facultyResponse.users);
    } catch (error) {
      message.error('Failed to load timetable dependencies');
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async (timetableId: string) => {
    try {
      setLoading(true);
      const timetable = await timetableAPI.getTimetable(timetableId);
      setExistingTimetable(timetable);
      form.setFieldsValue({
        sectionId: timetable.sectionId,
        semester: timetable.semester,
        dayOfWeek: timetable.dayOfWeek,
        timeRange: [dayjs(timetable.startTime, 'HH:mm'), dayjs(timetable.endTime, 'HH:mm')],
        roomId: timetable.roomId,
        facultyId: timetable.facultyId,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load timetable');
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

  const facultyLookup = useMemo(() => {
    const map = new Map<string, User>();
    faculty.forEach((member) => map.set(member.id, member));
    return map;
  }, [faculty]);

  const evaluateConflicts = async () => {
    const values = form.getFieldsValue();
    if (!values.dayOfWeek || !values.timeRange) {
      setConflicts([]);
      return;
    }
    try {
      const response = await timetableAPI.getTimetables(1, 100, {
        dayOfWeek: values.dayOfWeek,
        roomId: values.roomId,
        facultyId: values.facultyId,
        semester: values.semester,
        sectionId: values.sectionId,
      });
      const [start, end]: Dayjs[] = values.timeRange;
      const startTime = start.format('HH:mm');
      const endTime = end.format('HH:mm');
      const overlapEntries: ConflictingEntry[] = response.timetables
        .filter((entry) => (!isEdit || entry.id !== existingTimetable?.id))
        .filter((entry) => {
          const entryStart = dayjs(entry.startTime, 'HH:mm');
          const entryEnd = dayjs(entry.endTime, 'HH:mm');
          return dayjs(startTime, 'HH:mm').isBefore(entryEnd) && entryStart.isBefore(dayjs(endTime, 'HH:mm'));
        })
        .map((entry) => {
          let reason = '';
          if (values.roomId && entry.roomId === values.roomId) {
            const room = rooms.find((roomItem) => roomItem.id === values.roomId);
            reason = `${room?.roomNumber || 'Room'} already booked`;
          }
          if (!reason && values.facultyId && entry.facultyId === values.facultyId) {
            const teacher = facultyLookup.get(values.facultyId);
            reason = `${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Faculty'} already assigned`;
          }
          if (!reason && entry.sectionId === values.sectionId) {
            const section = sectionLookup.get(entry.sectionId);
            reason = `${section?.sectionCode || 'Section'} already scheduled`;
          }
          return {
            id: entry.id,
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
            reason,
          };
        });
      setConflicts(overlapEntries);
    } catch (error) {
      console.warn('Failed to evaluate conflicts', error);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.timeRange) {
      message.warning('Please select a time range');
      return;
    }
    try {
      setSubmitting(true);
      const [start, end]: Dayjs[] = values.timeRange;
      const timetableData: CreateTimetableDTO = {
        sectionId: values.sectionId,
        dayOfWeek: values.dayOfWeek,
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        roomId: values.roomId,
        facultyId: values.facultyId,
        semester: values.semester,
      };

      if (isEdit && id) {
        await timetableAPI.updateTimetable(id, timetableData);
        message.success('Timetable updated successfully');
      } else {
        const result = await timetableAPI.createTimetable(timetableData);
        if (result.conflicts && result.conflicts.length > 0) {
          message.warning(
            `Saved with warnings: ${result.conflicts
              .map((conflict: any) => conflict.message || conflict.reason)
              .join(', ')}`
          );
        } else {
          message.success('Timetable created successfully');
        }
      }

      navigate(route.TIMETABLE_LIST);
    } catch (error: any) {
      message.error(error.message || 'Failed to save timetable');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    const section = sectionLookup.get(sectionId);
    if (section) {
      form.setFieldsValue({ semester: section.semester });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ maxWidth: 960, margin: '0 auto', borderRadius: 16 }} bodyStyle={{ padding: 32 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {isEdit ? 'Edit Class Schedule' : 'Create Class Schedule'}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Assign sections, instructors, and rooms while staying conflict-free.
              </Paragraph>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </Space>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={() => {
                if (!isEdit || (isEdit && existingTimetable)) {
                  evaluateConflicts();
                }
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sectionId"
                    label="Section"
                    rules={[{ required: true, message: 'Please select a section' }]}
                  >
                    <Select
                      placeholder="Select section"
                      showSearch
                      optionFilterProp="children"
                      onChange={handleSectionChange}
                    >
                      {sections.map((section) => {
                        const course = courseLookup.get(section.courseId);
                        return (
                          <Option key={section.id} value={section.id}>
                            {section.sectionCode}
                            {course ? ` • ${course.code}` : ''}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="semester"
                    label="Semester"
                    rules={[{ required: true, message: 'Please provide semester label' }]}
                  >
                    <Input placeholder="e.g., 2024-Fall" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dayOfWeek"
                    label="Day"
                    rules={[{ required: true, message: 'Please select a day' }]}
                  >
                    <Select placeholder="Select day">
                      {DAYS_OF_WEEK.map((day) => (
                        <Option key={day.value} value={day.value}>
                          {day.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="timeRange"
                    label="Time"
                    rules={[{ required: true, message: 'Please select time range' }]}
                  >
                    <RangePicker
                      format="HH:mm"
                      minuteStep={5}
                      style={{ width: '100%' }}
                      allowClear={false}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="roomId" label="Room">
                    <Select
                      placeholder="Select room"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {rooms.map((room) => (
                        <Option key={room.id} value={room.id}>
                          {room.roomNumber} {room.capacity ? `(${room.capacity})` : ''}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="facultyId" label="Faculty">
                    <Select
                      placeholder="Assign instructor"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {faculty.map((member) => (
                        <Option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {conflicts.length > 0 && (
                <Alert
                  type="warning"
                  icon={<WarningOutlined />}
                  message="Potential schedule conflicts detected"
                  description={
                    <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                      {conflicts.map((conflict) => (
                        <li key={conflict.id}>
                          {conflict.reason || 'Overlapping schedule'} • {dayjs(conflict.startTime, 'HH:mm').format('h:mm A')} - {dayjs(conflict.endTime, 'HH:mm').format('h:mm A')}
                        </li>
                      ))}
                    </ul>
                  }
                  closable
                />
              )}

              <Form.Item style={{ marginTop: 24 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                    {isEdit ? 'Update Schedule' : 'Create Schedule'}
                  </Button>
                  <Button onClick={() => navigate(-1)}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default TimetableForm;

