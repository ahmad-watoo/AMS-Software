import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Space,
  Select,
  Table,
  Statistic,
  Row,
  Col,
  Tag,
  Empty,
  Progress,
  Tooltip,
} from "antd";
import {
  TeamOutlined,
  FieldTimeOutlined,
  BookOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { timetableAPI, Timetable, Room } from "@/api/timetable.api";
import { academicAPI, CourseSection, Course } from "@/api/academic.api";
import { userAPI, User } from "@/api/user.api";

dayjs.extend(duration);

const { Option } = Select;

interface FacultyLoad {
  facultyId: string;
  name: string;
  totalSessions: number;
  totalHours: number;
  sections: Set<string>;
}

const FacultyAllocation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string | undefined>();

  useEffect(() => {
    loadReferenceData();
    fetchAllocation();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [facultyResponse, roomResponse, sectionResponse, courseResponse] = await Promise.all([
        userAPI.getUsers(1, 200),
        timetableAPI.getRooms(1, 200, { isActive: true }),
        academicAPI.getSections(1, 200, {}),
        academicAPI.getCourses(1, 500, { isActive: true }),
      ]);
      setFaculty(facultyResponse.users);
      setRooms(roomResponse.rooms);
      setSections(sectionResponse.sections);
      setCourses(courseResponse.courses);
    } catch (error) {
      console.warn("Failed to load faculty allocation reference data", error);
    }
  };

  const fetchAllocation = async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetables(1, 500, {});
      setTimetables(response.timetables);
    } catch (error) {
      console.error("Failed to load faculty allocation", error);
    } finally {
      setLoading(false);
    }
  };

  const facultyLookup = useMemo(() => {
    const map = new Map<string, User>();
    faculty.forEach((member) => map.set(member.id, member));
    return map;
  }, [faculty]);

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

  const facultyLoads = useMemo<FacultyLoad[]>(() => {
    const loadMap = new Map<string, FacultyLoad>();
    timetables
      .filter((entry) => entry.facultyId)
      .forEach((entry) => {
        if (!entry.facultyId) return;
        const facultyId = entry.facultyId;
        const member = facultyLookup.get(facultyId);
        const key = facultyId;
        if (!loadMap.has(key)) {
          loadMap.set(key, {
            facultyId,
            name: member ? `${member.firstName} ${member.lastName}` : facultyId,
            totalSessions: 0,
            totalHours: 0,
            sections: new Set<string>(),
          });
        }
        const bucket = loadMap.get(key)!;
        bucket.totalSessions += 1;
        const start = dayjs(entry.startTime, "HH:mm");
        const end = dayjs(entry.endTime, "HH:mm");
        bucket.totalHours += dayjs.duration(end.diff(start)).asHours();
        bucket.sections.add(entry.sectionId);
      });
    return Array.from(loadMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [timetables, facultyLookup]);

  const selectedSchedule = useMemo(() => {
    if (!selectedFaculty) return [];
    return timetables
      .filter((entry) => entry.facultyId === selectedFaculty)
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return dayjs(a.startTime, "HH:mm").isBefore(dayjs(b.startTime, "HH:mm")) ? -1 : 1;
      });
  }, [selectedFaculty, timetables]);

  const columns = [
    {
      title: "Time",
      dataIndex: "startTime",
      key: "time",
      render: (_: any, record: Timetable) => (
        <Space>
          <FieldTimeOutlined />
          {dayjs(record.startTime, "HH:mm").format("h:mm A")} - {dayjs(record.endTime, "HH:mm").format("h:mm A")}
        </Space>
      ),
    },
    {
      title: "Day",
      dataIndex: "dayOfWeek",
      key: "day",
      render: (day: number) => (
        <Tag color="blue">{["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day]}</Tag>
      ),
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
      title: "Room",
      dataIndex: "roomId",
      key: "room",
      render: (roomId?: string) => {
        if (!roomId) return <span style={{ color: "#999" }}>Not assigned</span>;
        const room = roomLookup.get(roomId);
        return <Tag icon={<BuildOutlined />}>{room?.roomNumber || roomId}</Tag>;
      },
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      render: (semester: string) => <Tag color="geekblue">{semester}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <TeamOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Faculty Allocation</span>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: "#f0f5ff" }}>
                <Statistic title="Faculty with schedules" value={facultyLoads.length} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: "#f6ffed" }}>
                <Statistic
                  title="Average sessions per instructor"
                  value={facultyLoads.length ? (facultyLoads.reduce((sum, load) => sum + load.totalSessions, 0) / facultyLoads.length).toFixed(1) : 0}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: "#fff7e6" }}>
                <Statistic
                  title="Total teaching hours"
                  value={facultyLoads.reduce((sum, load) => sum + load.totalHours, 0).toFixed(1)}
                  suffix="hrs"
                  prefix={<FieldTimeOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Select
                placeholder="Select faculty"
                style={{ minWidth: 260 }}
                allowClear
                value={selectedFaculty}
                showSearch
                optionFilterProp="children"
                onChange={(value) => setSelectedFaculty(value || undefined)}
              >
                {facultyLoads.map((load) => (
                  <Option key={load.facultyId} value={load.facultyId}>
                    {load.name}
                  </Option>
                ))}
              </Select>

              {facultyLoads.length === 0 ? (
                <Empty description="No faculty allocation data" />
              ) : (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Load Distribution" size="small" style={{ borderRadius: 12 }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {facultyLoads.slice(0, 6).map((load) => (
                          <div key={load.facultyId}>
                            <Space style={{ justifyContent: "space-between", width: "100%" }}>
                              <span>{load.name}</span>
                              <Tag color="blue">{load.totalHours.toFixed(1)} hrs</Tag>
                            </Space>
                            <Progress
                              percent={Math.min(100, Math.round(((load.totalHours || 0) / 20) * 100))}
                              showInfo={false}
                              strokeColor="#1677ff"
                            />
                          </div>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Teaching Summary" size="small" style={{ borderRadius: 12 }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {facultyLoads.slice(0, 6).map((load) => (
                          <Tooltip
                            key={load.facultyId}
                            title={`Handling ${load.sections.size} sections / ${load.totalSessions} sessions`}
                          >
                            <Tag>
                              {load.name} • {load.totalSessions} sessions
                            </Tag>
                          </Tooltip>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                </Row>
              )}
            </Space>
          </Card>

          <Card title="Selected Faculty Schedule" bordered={false} style={{ borderRadius: 12 }}>
            {selectedFaculty ? (
              <Table
                size="small"
                loading={loading}
                dataSource={selectedSchedule}
                columns={columns}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: <Empty description="No assigned sessions" /> }}
              />
            ) : (
              <Empty description="Select a faculty member to view schedule" />
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default FacultyAllocation;
