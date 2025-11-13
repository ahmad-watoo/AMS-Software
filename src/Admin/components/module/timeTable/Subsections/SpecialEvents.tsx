import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Space,
  Tag,
  Empty,
  Button,
  Timeline,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  BuildOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { timetableAPI, Timetable, Room } from "@/api/timetable.api";
import { academicAPI, CourseSection, Course } from "@/api/academic.api";
import { route } from "../../../../routes/constant";

const { Title, Paragraph } = Typography;

const isSpecialSession = (entry: Timetable) => {
  const weekend = entry.dayOfWeek === 6 || entry.dayOfWeek === 7;
  const startHour = dayjs(entry.startTime, "HH:mm").hour();
  const endHour = dayjs(entry.endTime, "HH:mm").hour();
  const evening = startHour >= 18 || endHour >= 20;
  const intensive = dayjs(entry.endTime, "HH:mm").diff(dayjs(entry.startTime, "HH:mm"), "hour") >= 3;
  return weekend || evening || intensive;
};

const SpecialEvents: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timetableResponse, sectionResponse, courseResponse, roomResponse] = await Promise.all([
        timetableAPI.getTimetables(1, 500, {}),
        academicAPI.getSections(1, 200, {}),
        academicAPI.getCourses(1, 500, { isActive: true }),
        timetableAPI.getRooms(1, 200, {}),
      ]);
      setTimetables(timetableResponse.timetables);
      setSections(sectionResponse.sections);
      setCourses(courseResponse.courses);
      setRooms(roomResponse.rooms);
    } catch (error) {
      console.error("Failed to load special sessions", error);
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

  const specialSessions = useMemo(() => {
    return timetables
      .filter(isSpecialSession)
      .sort((a, b) => dayjs(`${a.dayOfWeek}-${a.startTime}`, "d-HH:mm").valueOf() - dayjs(`${b.dayOfWeek}-${b.startTime}`, "d-HH:mm").valueOf());
  }, [timetables]);

  const upcomingWeekend = specialSessions.filter((session) => session.dayOfWeek >= 6);
  const eveningSessions = specialSessions.filter((session) => {
    const startHour = dayjs(session.startTime, "HH:mm").hour();
    return startHour >= 18;
  });

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        loading={loading}
        title={
          <Space size="large">
            <CalendarOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Special Sessions & Weekend Events</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.TIMETABLE_CREATE)}>
            Schedule Special Session
          </Button>
        }
      >
        {specialSessions.length === 0 ? (
          <Empty description="No special sessions scheduled" />
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card bordered={false} style={{ borderRadius: 12, background: "#fafafa" }}>
              <Title level={4} style={{ marginBottom: 4 }}>
                Weekend Intensives
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Sessions scheduled on Saturdays or Sundays are highlighted here. Ensure resources and faculty are aligned for these weekly special events.
              </Paragraph>
              {upcomingWeekend.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No weekend sessions" />
              ) : (
                <Timeline
                  items={upcomingWeekend.map((session) => {
                    const section = sectionLookup.get(session.sectionId);
                    const course = section ? courseLookup.get(section.courseId) : undefined;
                    const room = session.roomId ? roomLookup.get(session.roomId) : undefined;
                    return {
                      children: (
                        <Card size="small" style={{ borderRadius: 12 }}>
                          <Space direction="vertical" size={4} style={{ width: "100%" }}>
                            <Space>
                              <FieldTimeOutlined />
                              {dayjs(session.startTime, "HH:mm").format("h:mm A")} - {dayjs(session.endTime, "HH:mm").format("h:mm A")}
                              <Tag color="purple">
                                {["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][session.dayOfWeek]}
                              </Tag>
                            </Space>
                            {course && (
                              <Title level={5} style={{ margin: 0 }}>
                                {course.code} • {course.title}
                              </Title>
                            )}
                            <Space size="small">
                              {section && <Tag>{section.sectionCode}</Tag>}
                              {room && <Tag icon={<BuildOutlined />}>{room.roomNumber}</Tag>}
                              <Tag color="geekblue">{session.semester}</Tag>
                            </Space>
                          </Space>
                        </Card>
                      ),
                    };
                  })}
                />
              )}
            </Card>

            <Card bordered={false} style={{ borderRadius: 12, background: "#fff7e6" }}>
              <Title level={4} style={{ marginBottom: 4 }}>
                Evening / Extended Sessions
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Sessions running after 6 PM or extending beyond three hours are flagged to ensure support staff and security are aligned.
              </Paragraph>
              {eveningSessions.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No evening sessions" />
              ) : (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  {eveningSessions.map((session) => {
                    const section = sectionLookup.get(session.sectionId);
                    const course = section ? courseLookup.get(section.courseId) : undefined;
                    const room = session.roomId ? roomLookup.get(session.roomId) : undefined;
                    return (
                      <Card key={session.id} size="small" style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size={4} style={{ width: "100%" }}>
                          <Space style={{ justifyContent: "space-between", width: "100%" }}>
                            <Space>
                              <FieldTimeOutlined />
                              {dayjs(session.startTime, "HH:mm").format("h:mm A")} - {dayjs(session.endTime, "HH:mm").format("h:mm A")}
                            </Space>
                            <Tag color="magenta">Extended</Tag>
                          </Space>
                          {course && (
                            <Title level={5} style={{ margin: 0 }}>
                              {course.code} • {course.title}
                            </Title>
                          )}
                          <Space size="small" style={{ flexWrap: "wrap" }}>
                            {section && <Tag>{section.sectionCode}</Tag>}
                            {room && <Tag icon={<BuildOutlined />}>{room.roomNumber}</Tag>}
                            <Tag color="geekblue">{session.semester}</Tag>
                          </Space>
                        </Space>
                      </Card>
                    );
                  })}
                </Space>
              )}
            </Card>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default SpecialEvents;
