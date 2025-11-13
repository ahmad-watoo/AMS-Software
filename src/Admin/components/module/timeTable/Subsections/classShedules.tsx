import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Space,
  Select,
  Spin,
  Empty,
  Tag,
  Timeline,
  Row,
  Col,
  Segmented,
  Typography,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  BuildOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { timetableAPI, Timetable, Room } from "@/api/timetable.api";
import { academicAPI, CourseSection, Course } from "@/api/academic.api";
import { userAPI, User } from "@/api/user.api";

const { Option } = Select;
const { Title } = Typography;

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

interface Filters {
  sectionId?: string;
  semester?: string;
  facultyId?: string;
}

const ClassSchedulePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    loadReferenceData();
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
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
      console.warn("Failed to load class schedule reference data", error);
    }
  };

  const fetchSchedules = async (currentFilters: Filters = filters) => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetables(1, 500, {
        sectionId: currentFilters.sectionId,
        semester: currentFilters.semester,
        facultyId: currentFilters.facultyId,
      });
      setTimetables(response.timetables);
    } catch (error) {
      console.error("Failed to load timetable", error);
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

  const roomLookup = useMemo(() => {
    const map = new Map<string, Room>();
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [rooms]);

  const facultyLookup = useMemo(() => {
    const map = new Map<string, User>();
    faculty.forEach((member) => map.set(member.id, member));
    return map;
  }, [faculty]);

  const groupedByDay = useMemo(() => {
    const grouping: Record<number, Timetable[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouping[day.value] = [];
    });
    timetables.forEach((entry) => {
      grouping[entry.dayOfWeek] = grouping[entry.dayOfWeek] || [];
      grouping[entry.dayOfWeek].push(entry);
    });
    Object.values(grouping).forEach((entries) =>
      entries.sort((a, b) =>
        dayjs(a.startTime, "HH:mm").isBefore(dayjs(b.startTime, "HH:mm")) ? -1 : 1
      )
    );
    return grouping;
  }, [timetables]);

  const today = dayjs().day();
  const todayEntries = useMemo(() => {
    return groupedByDay[today === 0 ? 7 : today] || [];
  }, [groupedByDay, today]);

  const onFilterChange = (field: keyof Filters, value?: string) => {
    const updated = { ...filters, [field]: value || undefined };
    setFilters(updated);
    fetchSchedules(updated);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <CalendarOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Weekly Class Schedule</span>
          </Space>
        }
        extra={
          <Segmented
            options={[{ label: "Week View", value: "week" }, { label: "Today", value: "day" }]}
            value={viewMode}
            onChange={(value) => setViewMode(value as "week" | "day")}
          />
        }
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card bordered={false} style={{ borderRadius: 12, background: "#fafafa" }}>
            <Space wrap style={{ width: "100%" }}>
              <Select
                placeholder="Filter by Section"
                style={{ minWidth: 220 }}
                allowClear
                value={filters.sectionId}
                showSearch
                optionFilterProp="children"
                onChange={(value) => onFilterChange("sectionId", value as string)}
              >
                {sections.map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.sectionCode}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by Semester"
                style={{ minWidth: 200 }}
                allowClear
                value={filters.semester}
                onChange={(value) => onFilterChange("semester", value as string)}
              >
                {Array.from(new Set(timetables.map((entry) => entry.semester))).map((semester) => (
                  <Option key={semester} value={semester}>
                    {semester}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by Faculty"
                style={{ minWidth: 220 }}
                allowClear
                value={filters.facultyId}
                showSearch
                optionFilterProp="children"
                onChange={(value) => onFilterChange("facultyId", value as string)}
              >
                {faculty.map((member) => (
                  <Option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          {loading ? (
            <Spin tip="Loading schedules..." />
          ) : timetables.length === 0 ? (
            <Empty description="No schedules found" />
          ) : viewMode === "week" ? (
            <Row gutter={[16, 16]}>
              {DAYS_OF_WEEK.map((day) => {
                const entries = groupedByDay[day.value] || [];
                return (
                  <Col xs={24} md={12} lg={8} key={day.value}>
                    <Card
                      title={day.label}
                      style={{ borderRadius: 12, minHeight: 280 }}
                      extra={<Tag color="blue">{entries.length} sessions</Tag>}
                    >
                      {entries.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No classes" />
                      ) : (
                        <Timeline
                          items={entries.map((entry) => {
                            const section = sectionLookup.get(entry.sectionId);
                            const course = section ? courseLookup.get(section.courseId) : undefined;
                            const room = entry.roomId ? roomLookup.get(entry.roomId) : undefined;
                            const instructor = entry.facultyId
                              ? facultyLookup.get(entry.facultyId)
                              : undefined;
                            return {
                              children: (
                                <Card bordered={false} style={{ borderRadius: 12, background: '#f9fbff' }}>
                                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <Space>
                                      <FieldTimeOutlined />
                                      <strong>
                                        {`${dayjs(entry.startTime, "HH:mm").format("h:mm A")} - ${dayjs(
                                          entry.endTime,
                                          "HH:mm"
                                        ).format("h:mm A")}`}
                                      </strong>
                                    </Space>
                                    {course && (
                                      <Title level={5} style={{ margin: 0 }}>
                                        {course.code} • {course.title}
                                      </Title>
                                    )}
                                    <Space size="small">
                                      {section && <Tag>{section.sectionCode}</Tag>}
                                      {room && <Tag icon={<BuildOutlined />}>{room.roomNumber}</Tag>}
                                      {instructor && (
                                        <Tooltip
                                          title={`${instructor.firstName} ${instructor.lastName}`}
                                        >
                                          <Tag icon={<TeamOutlined />}>{instructor.firstName}</Tag>
                                        </Tooltip>
                                      )}
                                      <Tag color="geekblue">{entry.semester}</Tag>
                                    </Space>
                                  </Space>
                                </Card>
                              ),
                            };
                          })}
                        />
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Today • {DAYS_OF_WEEK.find((day) => day.value === (today === 0 ? 7 : today))?.label}
              </Title>
              {todayEntries.length === 0 ? (
                <Empty description="No classes today" />
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {todayEntries.map((entry) => {
                    const section = sectionLookup.get(entry.sectionId);
                    const course = section ? courseLookup.get(section.courseId) : undefined;
                    const room = entry.roomId ? roomLookup.get(entry.roomId) : undefined;
                    const instructor = entry.facultyId ? facultyLookup.get(entry.facultyId) : undefined;
                    return (
                      <Card key={entry.id} style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space>
                            <FieldTimeOutlined />
                            <strong>
                              {`${dayjs(entry.startTime, "HH:mm").format("h:mm A")} - ${dayjs(entry.endTime, "HH:mm").format(
                                "h:mm A"
                              )}`}
                            </strong>
                          </Space>
                          {course && (
                            <Title level={5} style={{ margin: 0 }}>
                              {course.code} • {course.title}
                            </Title>
                          )}
                          <Space size="small">
                            {section && <Tag>{section.sectionCode}</Tag>}
                            {room && <Tag icon={<BuildOutlined />}>{room.roomNumber}</Tag>}
                            {instructor && (
                              <Tag icon={<TeamOutlined />}>{`${instructor.firstName} ${instructor.lastName}`}</Tag>
                            )}
                            <Tag color="geekblue">{entry.semester}</Tag>
                          </Space>
                        </Space>
                      </Card>
                    );
                  })}
                </Space>
              )}
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ClassSchedulePage;
