import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Button,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Empty,
  Tooltip,
  Popconfirm,
  Tag,
  Modal,
  Form,
  InputNumber,
  Switch,
  Input,
  Skeleton,
  Divider,
  List,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeploymentUnitOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  academicAPI,
  Course,
  CurriculumCourse,
  Program,
  UpsertCurriculumDTO,
} from '../../../../api/academic.api';
import { PermissionGuard } from '../../../common/PermissionGuard';

const { Option } = Select;

interface SemesterGroup {
  semesterNumber: number;
  courses: CurriculumCourse[];
  totalCredits: number;
  coreCredits: number;
  electiveCredits: number;
}

interface AddCourseFormValues {
  courseId: string;
  semesterNumber: number;
  isCore: boolean;
  notes?: string;
}

const CurriculumPlanner: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>();
  const [curriculum, setCurriculum] = useState<CurriculumCourse[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSemester, setActiveSemester] = useState<number | undefined>();
  const [form] = Form.useForm<AddCourseFormValues>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoadingPrograms(true);
      const [programResponse, courseResponse] = await Promise.all([
        academicAPI.getPrograms(1, 200, { isActive: true }),
        academicAPI.getCourses(1, 500, { isActive: true }),
      ]);
      setPrograms(programResponse.programs);
      setCourses(courseResponse.courses);
      if (programResponse.programs.length > 0) {
        const defaultProgram = programResponse.programs[0].id;
        setSelectedProgram(defaultProgram);
        await loadCurriculum(defaultProgram);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load programs or courses');
    } finally {
      setLoadingPrograms(false);
    }
  };

  const loadCurriculum = useCallback(
    async (programId: string) => {
      try {
        setLoadingCurriculum(true);
        const response = await academicAPI.getProgramCurriculum(programId);
        setCurriculum(response.curriculum || []);
      } catch (error: any) {
        message.error(error.message || 'Failed to load curriculum');
      } finally {
        setLoadingCurriculum(false);
      }
    },
    []
  );

  const handleProgramChange = async (programId: string) => {
    setSelectedProgram(programId);
    await loadCurriculum(programId);
  };

  const openAddCourseModal = (semester?: number) => {
    setActiveSemester(semester);
    form.resetFields();
    form.setFieldsValue({
      semesterNumber: semester || 1,
      isCore: true,
    });
    setIsModalOpen(true);
  };

  const handleAddCourse = async () => {
    if (!selectedProgram) return;
    try {
      const values = await form.validateFields();
      const payload: UpsertCurriculumDTO = {
        courseId: values.courseId,
        semesterNumber: values.semesterNumber,
        isCore: values.isCore,
        notes: values.notes,
      };
      await academicAPI.addCurriculumCourse(selectedProgram, payload);
      message.success('Course added to curriculum');
      setIsModalOpen(false);
      await loadCurriculum(selectedProgram);
    } catch (error: any) {
      if (error?.errorFields) return; // form validation
      message.error(error.message || 'Unable to add course');
    }
  };

  const handleRemoveCourse = async (curriculumId: string) => {
    if (!selectedProgram) return;
    try {
      await academicAPI.deleteCurriculumCourse(curriculumId);
      message.success('Course removed from curriculum');
      await loadCurriculum(selectedProgram);
    } catch (error: any) {
      message.error(error.message || 'Unable to remove course');
    }
  };

  const handleToggleCore = async (item: CurriculumCourse, isCore: boolean) => {
    try {
      await academicAPI.updateCurriculumCourse(item.id, { isCore });
      if (!selectedProgram) return;
      setCurriculum((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                isCore,
              }
            : entry
        )
      );
      message.success('Curriculum updated');
    } catch (error: any) {
      message.error(error.message || 'Failed to update course type');
    }
  };

  const groupedSemesters = useMemo<SemesterGroup[]>(() => {
    if (!curriculum) return [];
    const map = new Map<number, SemesterGroup>();
    curriculum.forEach((entry) => {
      const course = entry.course;
      const creditHours = course?.creditHours ?? 0;
      if (!map.has(entry.semesterNumber)) {
        map.set(entry.semesterNumber, {
          semesterNumber: entry.semesterNumber,
          courses: [],
          totalCredits: 0,
          coreCredits: 0,
          electiveCredits: 0,
        });
      }
      const group = map.get(entry.semesterNumber)!;
      group.courses.push(entry);
      group.totalCredits += creditHours;
      if (entry.isCore) {
        group.coreCredits += creditHours;
      } else {
        group.electiveCredits += creditHours;
      }
    });

    const semesters = Array.from(map.values()).sort(
      (a, b) => a.semesterNumber - b.semesterNumber
    );
    return semesters;
  }, [curriculum]);

  const totalSemesters = groupedSemesters.length;
  const totalCredits = groupedSemesters.reduce((sum, semester) => sum + semester.totalCredits, 0);
  const totalCoreCredits = groupedSemesters.reduce((sum, semester) => sum + semester.coreCredits, 0);

  const availableCourses = useMemo(() => {
    if (!selectedProgram) return courses;
    const assignedCourseIds = new Set(curriculum.map((entry) => entry.courseId));
    return courses.filter((course) => !assignedCourseIds.has(course.id));
  }, [courses, curriculum, selectedProgram]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <span style={{ fontSize: 20, fontWeight: 600 }}>Curriculum Planner</span>
            <Tooltip title="Reload curriculum">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => selectedProgram && loadCurriculum(selectedProgram)}
              >
                Refresh
              </Button>
            </Tooltip>
          </Space>
        }
        extra={
          <Space>
            <Select
              showSearch
              placeholder="Select Program"
              optionFilterProp="children"
              value={selectedProgram}
              loading={loadingPrograms}
              style={{ minWidth: 260 }}
              onChange={handleProgramChange}
            >
              {programs.map((program) => (
                <Option key={program.id} value={program.id}>
                  {program.code} — {program.name}
                </Option>
              ))}
            </Select>
            <PermissionGuard permission="academic" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddCourseModal()}>
                Add Course
              </Button>
            </PermissionGuard>
          </Space>
        }
      >
        {loadingCurriculum ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : selectedProgram ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                  <Statistic
                    title="Total Semesters"
                    value={totalSemesters}
                    prefix={<DeploymentUnitOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                  <Statistic
                    title="Total Credit Hours"
                    value={totalCredits}
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                  <Statistic title="Core Credits" value={totalCoreCredits} prefix={<AppstoreOutlined />} />
                </Card>
              </Col>
            </Row>

            {groupedSemesters.length === 0 ? (
              <Card bordered={false} style={{ borderRadius: 12, minHeight: 220 }}>
                <Empty
                  description="No curriculum defined yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <PermissionGuard permission="academic" action="create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddCourseModal()}>
                      Start Planning
                    </Button>
                  </PermissionGuard>
                </Empty>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {groupedSemesters.map((semester) => (
                  <Col xs={24} md={12} lg={8} key={semester.semesterNumber}>
                    <Card
                      title={`Semester ${semester.semesterNumber}`}
                      style={{ borderRadius: 12, height: '100%' }}
                      extra={
                        <Space size="small">
                          <Tag color="blue">{semester.totalCredits} CH</Tag>
                          <PermissionGuard permission="academic" action="create">
                            <Tooltip title="Add course to this semester">
                              <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => openAddCourseModal(semester.semesterNumber)}
                              />
                            </Tooltip>
                          </PermissionGuard>
                        </Space>
                      }
                    >
                      <List
                        dataSource={semester.courses}
                        renderItem={(item) => {
                          const course = item.course;
                          return (
                            <List.Item
                              key={item.id}
                              actions={[
                                <PermissionGuard key="toggle" permission="academic" action="update">
                                  <Tooltip title={item.isCore ? 'Mark as elective' : 'Mark as core'}>
                                    <Switch
                                      size="small"
                                      checkedChildren="Core"
                                      unCheckedChildren="Elective"
                                      checked={item.isCore}
                                      onChange={(checked) => handleToggleCore(item, checked)}
                                    />
                                  </Tooltip>
                                </PermissionGuard>,
                                <PermissionGuard key="delete" permission="academic" action="delete">
                                  <Popconfirm
                                    title="Remove course"
                                    description="Are you sure you want to remove this course from the curriculum?"
                                    onConfirm={() => handleRemoveCourse(item.id)}
                                  >
                                    <Button danger type="link" icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </PermissionGuard>,
                              ]}
                            >
                              <List.Item.Meta
                                title={
                                  <Space>
                                    <strong>{course?.code || 'Course'}</strong>
                                    <Tag color={item.isCore ? 'blue' : 'orange'}>
                                      {item.isCore ? 'Core' : 'Elective'}
                                    </Tag>
                                  </Space>
                                }
                                description={
                                  <Space direction="vertical" size={0}>
                                    <span>{course?.title || 'Course details unavailable'}</span>
                                    <span style={{ color: '#999' }}>
                                      {course ? `${course.creditHours} Credit Hours` : '—'}
                                      {item.notes ? ` • ${item.notes}` : ''}
                                    </span>
                                  </Space>
                                }
                              />
                            </List.Item>
                          );
                        }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <Divider />
            <Card bordered={false} style={{ borderRadius: 12 }} title="Curriculum Guidelines">
              <List
                size="small"
                dataSource={[
                  'Ensure core requirements meet accreditation standards and minimum credit hours.',
                  'Balance workload across semesters to avoid credit overloads.',
                  'Use electives to provide specialization and OBE alignment opportunities.',
                ]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Space>
        ) : (
          <Empty description="Select a program to view its curriculum" />
        )}
      </Card>

      <Modal
        title="Add Course to Curriculum"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddCourse}
        okText="Add Course"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select
              placeholder="Select course"
              showSearch
              optionFilterProp="children"
              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="All courses assigned" />}
            >
              {availableCourses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="semesterNumber"
            label="Semester"
            rules={[{ required: true, message: 'Please set a semester number' }]}
          >
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isCore" label="Core Course" valuePropName="checked">
            <Switch checkedChildren="Core" unCheckedChildren="Elective" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional guidance or prerequisites" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CurriculumPlanner;
