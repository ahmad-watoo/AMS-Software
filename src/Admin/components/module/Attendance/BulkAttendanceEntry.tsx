import React, { useState, useEffect } from 'react';
import { Form, Button, Card, message, Space, Select, Table, Tag, DatePicker, Input } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import attendanceAPI, { BulkAttendanceEntry as BulkEntry } from '@/api/attendance.api';
import { academicAPI } from '@/api/academic.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Option } = Select;

interface Enrollment {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
}

const BulkAttendanceEntry: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, BulkEntry>>({});

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await academicAPI.getSections(1, 1000);
      setSections(response.sections);
    } catch (error) {
      console.error('Failed to load sections');
    }
  };

  const handleSectionChange = async (sectionId: string) => {
    if (!sectionId) {
      setEnrollments([]);
      setAttendanceEntries({});
      return;
    }

    try {
      setLoading(true);
      const enrollmentsData = await academicAPI.getEnrollmentsBySection(sectionId);
      
      // Map the enrollment data to our Enrollment interface
      const mappedEnrollments: Enrollment[] = enrollmentsData.map((enrollment: any) => ({
        id: enrollment.id || enrollment.enrollmentId,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName || enrollment.student?.name || enrollment.student?.fullName,
        rollNumber: enrollment.rollNumber || enrollment.student?.rollNumber,
      }));
      
      setEnrollments(mappedEnrollments);
      
      // Initialize attendance entries with default 'present' status
      const entries: Record<string, BulkEntry> = {};
      mappedEnrollments.forEach((enrollment: Enrollment) => {
        entries[enrollment.id] = {
          enrollmentId: enrollment.id,
          status: 'present',
        };
      });
      setAttendanceEntries(entries);
    } catch (error: any) {
      message.error(error.message || 'Failed to load enrollments');
      setEnrollments([]);
      setAttendanceEntries({});
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (enrollmentId: string, status: BulkEntry['status']) => {
    setAttendanceEntries({
      ...attendanceEntries,
      [enrollmentId]: {
        ...attendanceEntries[enrollmentId],
        enrollmentId,
        status,
      },
    });
  };

  const handleSubmit = async (values: any) => {
    if (!values.sectionId) {
      message.error('Please select a section');
      return;
    }

    if (Object.keys(attendanceEntries).length === 0) {
      message.error('No students found for this section');
      return;
    }

    try {
      setLoading(true);

      const bulkData = {
        sectionId: values.sectionId,
        attendanceDate: values.attendanceDate.format('YYYY-MM-DD'),
        entries: Object.values(attendanceEntries),
      };

      await attendanceAPI.createBulkAttendance(bulkData);
      message.success('Attendance marked successfully');
      navigate('/attendance/records');
    } catch (error: any) {
      message.error(error.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Enrollment) => {
        const entry = attendanceEntries[record.id];
        const status = entry?.status || 'present';

        return (
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 120 }}
          >
            <Option value="present">
              <Tag color="green">Present</Tag>
            </Option>
            <Option value="absent">
              <Tag color="red">Absent</Tag>
            </Option>
            <Option value="late">
              <Tag color="orange">Late</Tag>
            </Option>
            <Option value="excused">
              <Tag color="blue">Excused</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (_: any, record: Enrollment) => {
        const entry = attendanceEntries[record.id];
        return (
          <Input
            placeholder="Remarks (optional)"
            value={entry?.remarks || ''}
            onChange={(e) =>
              setAttendanceEntries({
                ...attendanceEntries,
                [record.id]: {
                  ...attendanceEntries[record.id],
                  enrollmentId: record.id,
                  status: entry?.status || 'present',
                  remarks: e.target.value,
                },
              })
            }
          />
        );
      },
    },
  ];

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Form.Item
              label="Section"
              name="sectionId"
              rules={[{ required: true, message: 'Please select a section' }]}
            >
              <Select
                placeholder="Select Section"
                style={{ width: 300 }}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleSectionChange}
              >
                {sections.map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.sectionCode} - {section.semester}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Date"
              name="attendanceDate"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker format="YYYY-MM-DD" defaultValue={dayjs()} />
            </Form.Item>
          </Space>

          {enrollments.length > 0 && (
            <Table
              columns={columns}
              dataSource={enrollments}
              rowKey="id"
              pagination={false}
              size="small"
            />
          )}

          {enrollments.length === 0 && form.getFieldValue('sectionId') && (
            <Card>
              <p>No enrollments found for this section. Please select a different section.</p>
            </Card>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<CheckOutlined />}
                disabled={enrollments.length === 0}
              >
                Mark Attendance
              </Button>
              <Button onClick={() => navigate('/attendance/records')} icon={<ArrowLeftOutlined />}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
};

export default BulkAttendanceEntry;

