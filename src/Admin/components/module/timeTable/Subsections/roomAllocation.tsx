import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Space,
  Select,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Empty,
  Progress,
  Badge,
} from "antd";
import {
  BuildOutlined,
  FieldTimeOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { timetableAPI, Timetable, Room } from "@/api/timetable.api";
import { academicAPI, CourseSection, Course } from "@/api/academic.api";

const { Option } = Select;

interface RoomAnalytics {
  room: Room;
  sessions: Timetable[];
  totalSessions: number;
  uniqueSections: number;
}

const RoomAllocation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>();
  const [roomType, setRoomType] = useState<string | undefined>();

  useEffect(() => {
    loadRooms();
    loadSchedules();
    loadSections();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await timetableAPI.getRooms(1, 200, {});
      setRooms(response.rooms);
    } catch (error) {
      console.error("Failed to load rooms", error);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetables(1, 500, {});
      setTimetables(response.timetables);
    } catch (error) {
      console.error("Failed to load schedules", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const [sectionResponse, courseResponse] = await Promise.all([
        academicAPI.getSections(1, 200, {}),
        academicAPI.getCourses(1, 500, { isActive: true }),
      ]);
      setSections(sectionResponse.sections);
      setCourses(courseResponse.courses);
    } catch (error) {
      console.warn("Failed to load section/course references", error);
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

  const analytics = useMemo<RoomAnalytics[]>(() => {
    return rooms
      .filter((room) => !roomType || room.roomType === roomType)
      .map((room) => {
        const sessions = timetables.filter((entry) => entry.roomId === room.id);
        return {
          room,
          sessions,
          totalSessions: sessions.length,
          uniqueSections: new Set(sessions.map((entry) => entry.sectionId)).size,
        };
      })
      .sort((a, b) => b.totalSessions - a.totalSessions);
  }, [rooms, timetables, roomType]);

  const selectedAnalytics = selectedRoom
    ? analytics.find((entry) => entry.room.id === selectedRoom)
    : analytics[0];

  const columns = [
    {
      title: "Time",
      dataIndex: "startTime",
      key: "time",
      render: (_: any, record: Timetable) => (
        <Space>
          <FieldTimeOutlined />
          {dayjs(record.startTime, "HH:mm").format("h:mm A")}
          {" - "}
          {dayjs(record.endTime, "HH:mm").format("h:mm A")}
        </Space>
      ),
    },
    {
      title: "Day",
      dataIndex: "dayOfWeek",
      key: "day",
      render: (day: number) => <Tag color="blue">{["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day]}</Tag>,
    },
    {
      title: "Section",
      dataIndex: "sectionId",
      key: "section",
      render: (sectionId: string) => {
        const section = sectionLookup.get(sectionId);
        const course = section ? courseLookup.get(section.courseId) : undefined;
        return (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{section?.sectionCode || sectionId}</span>
            {course && <span style={{ color: "#888" }}>{course.code}</span>}
          </Space>
        );
      },
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      render: (semester: string) => <Tag color="geekblue">{semester}</Tag>,
    },
  ];

  const utilisationPercentage = (sessions: Timetable[]) => {
    const totalHours = sessions.reduce((sum, entry) => {
      const start = dayjs(entry.startTime, "HH:mm");
      const end = dayjs(entry.endTime, "HH:mm");
      return sum + end.diff(start, "minute");
    }, 0);
    // Assume 45 hours of availability per week (9 hours * 5 days)
    return Math.min(100, Math.round((totalHours / (45 * 60)) * 100));
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <BuildOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Room Allocation & Utilisation</span>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: "#f0f5ff" }}>
                <Statistic title="Tracked rooms" value={analytics.length} prefix={<BuildOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: "#f6ffed" }}>
                <Statistic
                  title="Total sessions this week"
                  value={analytics.reduce((sum, room) => sum + room.totalSessions, 0)}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: "#fff7e6" }}>
                <Statistic
                  title="Average utilisation"
                  value={
                    analytics.length
                      ? Math.round(
                          analytics.reduce((sum, room) => sum + utilisationPercentage(room.sessions), 0) /
                            analytics.length
                        )
                      : 0
                  }
                  suffix="%"
                  prefix={<FieldTimeOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Space wrap style={{ width: "100%" }}>
              <Select
                placeholder="Filter by room type"
                allowClear
                style={{ minWidth: 200 }}
                value={roomType}
                onChange={(value) => setRoomType(value || undefined)}
              >
                {["classroom", "lab", "auditorium", "library", "other"].map((type) => (
                  <Option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Focus room"
                allowClear
                style={{ minWidth: 200 }}
                value={selectedRoom}
                onChange={(value) => setSelectedRoom(value || undefined)}
              >
                {analytics.map((entry) => (
                  <Option key={entry.room.id} value={entry.room.id}>
                    {entry.room.roomNumber}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          <Row gutter={[16, 16]}>
            {analytics.slice(0, 6).map((entry) => (
              <Col xs={24} md={8} key={entry.room.id}>
                <Card
                  size="small"
                  style={{ borderRadius: 12 }}
                  title={
                    <Space>
                      <Badge color="#1677ff" />
                      {entry.room.roomNumber}
                    </Space>
                  }
                  extra={<Tag color="geekblue">{entry.room.roomType}</Tag>}
                >
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <span>Weekly utilisation</span>
                      <Tag color={utilisationPercentage(entry.sessions) > 75 ? "red" : "green"}>
                        {utilisationPercentage(entry.sessions)}%
                      </Tag>
                    </Space>
                    <Progress percent={utilisationPercentage(entry.sessions)} showInfo={false} />
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <span>Total sessions</span>
                      <Tag>{entry.totalSessions}</Tag>
                    </Space>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <span>Unique sections</span>
                      <Tag>{entry.uniqueSections}</Tag>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            title="Room Schedule"
            bordered={false}
            style={{ borderRadius: 12 }}
            loading={loading}
          >
            {selectedAnalytics && selectedAnalytics.sessions.length > 0 ? (
              <Table
                size="small"
                dataSource={selectedAnalytics.sessions
                  .slice()
                  .sort((a, b) => {
                    if (a.dayOfWeek !== b.dayOfWeek) {
                      return a.dayOfWeek - b.dayOfWeek;
                    }
                    return dayjs(a.startTime, "HH:mm").isBefore(dayjs(b.startTime, "HH:mm")) ? -1 : 1;
                  })}
                columns={columns}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <Empty description="Select a room to view allocated sessions" />
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default RoomAllocation;
