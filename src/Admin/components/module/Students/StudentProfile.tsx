import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Button, Space, Spin, message, Tabs, Table } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, Student } from '../../../../api/student.api';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PermissionGuard } from '../../../common/PermissionGuard';

const { TabPane } = Tabs;

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [studentData, enrollmentsData, resultsData, cgpaData] = await Promise.all([
        studentAPI.getStudent(id!),
        studentAPI.getStudentEnrollments(id!),
        studentAPI.getStudentResults(id!),
        studentAPI.getStudentCGPA(id!).catch(() => null),
      ]);

      setStudent(studentData);
      setEnrollments(enrollmentsData);
      setResults(resultsData);
      setCgpa(cgpaData);
    } catch (error) {
      message.error('Failed to load student data');
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!student) {
    return <Card>Student not found</Card>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      graduated: 'blue',
      suspended: 'orange',
      withdrawn: 'red',
      transfer: 'purple',
    };
    return colors[status] || 'default';
  };

  const enrollmentColumns = [
    {
      title: 'Course Code',
      key: 'code',
      render: (record: any) => record.sections?.courses?.code || 'N/A',
    },
    {
      title: 'Course Title',
      key: 'title',
      render: (record: any) => record.sections?.courses?.title || 'N/A',
    },
    {
      title: 'Section',
      key: 'section',
      render: (record: any) => record.sections?.sectionCode || 'N/A',
    },
    {
      title: 'Credit Hours',
      key: 'credits',
      render: (record: any) => record.sections?.courses?.creditHours || 'N/A',
    },
    {
      title: 'Semester',
      key: 'semester',
      render: (record: any) => record.sections?.semester || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'enrollmentStatus',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'registered' ? 'green' : 'default'}>
          {status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'}
        </Tag>
      ),
    },
  ];

  const resultsColumns = [
    {
      title: 'Course',
      key: 'course',
      render: (record: any) => record.enrollments?.sections?.courses?.code || 'N/A',
    },
    {
      title: 'Course Title',
      key: 'title',
      render: (record: any) => record.enrollments?.sections?.courses?.title || 'N/A',
    },
    {
      title: 'Marks Obtained',
      dataIndex: 'obtainedMarks',
      key: 'obtainedMarks',
    },
    {
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: string) => <Tag color="blue">{grade}</Tag>,
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (gpa: number) => gpa?.toFixed(2) || 'N/A',
    },
  ];

  return (
    <Card
      title={`Student Profile - ${student.rollNumber}`}
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/student-management/profiles')}>
            Back
          </Button>
          <PermissionGuard module="student" action="update">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/student-management/profiles/${id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
        </Space>
      }
      style={{ margin: '20px' }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Basic Information" key="1">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Roll Number" span={1}>
              <strong>{student.rollNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Registration Number" span={1}>
              {student.registrationNumber || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Name" span={2}>
              {student.user ? `${student.user.firstName} ${student.user.lastName}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={1}>
              {student.user?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone" span={1}>
              {student.user?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="CNIC" span={1}>
              {student.user?.cnic || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Program" span={1}>
              {student.program?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Batch" span={1}>
              {student.batch}
            </Descriptions.Item>
            <Descriptions.Item label="Current Semester" span={1}>
              Semester {student.currentSemester}
            </Descriptions.Item>
            <Descriptions.Item label="Admission Date" span={1}>
              {new Date(student.admissionDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={1}>
              <Tag color={getStatusColor(student.enrollmentStatus)}>
                {student.enrollmentStatus.charAt(0).toUpperCase() + student.enrollmentStatus.slice(1)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="CGPA" span={1}>
              <Tag color={cgpa && cgpa >= 3.5 ? 'green' : 'default'}>
                {cgpa ? cgpa.toFixed(2) : 'N/A'}
              </Tag>
            </Descriptions.Item>
            {student.bloodGroup && (
              <Descriptions.Item label="Blood Group" span={1}>
                {student.bloodGroup}
              </Descriptions.Item>
            )}
            {student.emergencyContactName && (
              <>
                <Descriptions.Item label="Emergency Contact" span={1}>
                  {student.emergencyContactName}
                </Descriptions.Item>
                <Descriptions.Item label="Emergency Phone" span={1}>
                  {student.emergencyContactPhone || '-'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </TabPane>

        <TabPane tab="Enrollments" key="2">
          <Table
            columns={enrollmentColumns}
            dataSource={enrollments}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'No enrollments found' }}
          />
        </TabPane>

        <TabPane tab="Results" key="3">
          <Table
            columns={resultsColumns}
            dataSource={results}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'No results found' }}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default StudentProfile;

