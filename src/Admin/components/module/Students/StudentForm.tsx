import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Space, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { studentAPI, CreateStudentDTO, UpdateStudentDTO, Student } from '../../../../api/student.api';
import dayjs from 'dayjs';
import { userAPI } from '../../../../api/user.api';
import { academicAPI, Program } from '../../../../api/academic.api';

const { Option } = Select;

interface StudentFormProps {
  isEdit?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (isEdit && id) {
      loadStudent();
    }
    loadUsers();
    loadPrograms();
  }, [isEdit, id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const studentData = await studentAPI.getStudent(id!);
      setStudent(studentData);
      form.setFieldsValue({
        userId: studentData.userId,
        rollNumber: studentData.rollNumber,
        registrationNumber: studentData.registrationNumber,
        programId: studentData.programId,
        batch: studentData.batch,
        admissionDate: studentData.admissionDate ? dayjs(studentData.admissionDate) : undefined,
        currentSemester: studentData.currentSemester,
        enrollmentStatus: studentData.enrollmentStatus,
        bloodGroup: studentData.bloodGroup,
        emergencyContactName: studentData.emergencyContactName,
        emergencyContactPhone: studentData.emergencyContactPhone,
      });
    } catch (error) {
      message.error('Failed to load student');
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Load users without student records (for creating new students)
      const [usersResponse, studentsResponse] = await Promise.all([
        userAPI.getUsers(1, 200),
        studentAPI.getStudents(1, 200),
      ]);
      const studentUserIds = new Set(
        (studentsResponse?.students || []).map((student) => student.userId)
      );
      const availableUsers = usersResponse.users.filter(
        (user) => !studentUserIds.has(user.id)
      );
      setUsers(availableUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      setProgramLoading(true);
      const response = await academicAPI.getPrograms(1, 200, { isActive: true });
      setPrograms(response.programs);
    } catch (error) {
      message.error('Failed to load programs');
      console.error('Error loading programs:', error);
    } finally {
      setProgramLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      if (isEdit && id) {
        const updateData: UpdateStudentDTO = {
          rollNumber: values.rollNumber,
          registrationNumber: values.registrationNumber,
          programId: values.programId,
          batch: values.batch,
          currentSemester: values.currentSemester,
          enrollmentStatus: values.enrollmentStatus,
          bloodGroup: values.bloodGroup,
          emergencyContactName: values.emergencyContactName,
          emergencyContactPhone: values.emergencyContactPhone,
        };
        await studentAPI.updateStudent(id, updateData);
        message.success('Student updated successfully');
      } else {
        const createData: CreateStudentDTO = {
          userId: values.userId,
          rollNumber: values.rollNumber,
          registrationNumber: values.registrationNumber,
          programId: values.programId,
          batch: values.batch,
          admissionDate: values.admissionDate.format('YYYY-MM-DD'),
          currentSemester: values.currentSemester || 1,
          bloodGroup: values.bloodGroup,
          emergencyContactName: values.emergencyContactName,
          emergencyContactPhone: values.emergencyContactPhone,
        };
        await studentAPI.createStudent(createData);
        message.success('Student created successfully');
      }

      navigate('/student-management/profiles');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title={isEdit ? 'Edit Student' : 'Create New Student'}
      style={{ margin: '20px', maxWidth: 800 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {!isEdit && (
          <Form.Item
            name="userId"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              placeholder="Select User"
              showSearch
              filterOption={(input, option) => {
                const label = (option && (option as any).children) ? String((option as any).children) : '';
                return label.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="rollNumber"
          label="Roll Number"
          rules={[
            { required: true, message: 'Please enter roll number' },
            { min: 3, message: 'Roll number must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Roll Number (e.g., 2024-BS-CS-001)" />
        </Form.Item>

        <Form.Item
          name="registrationNumber"
          label="Registration Number"
        >
          <Input placeholder="Registration Number (Optional)" />
        </Form.Item>

        <Form.Item
          name="programId"
          label="Program"
          rules={[{ required: true, message: 'Please select a program' }]}
        >
          <Select
            placeholder="Select Program"
            loading={programLoading}
            showSearch
            optionFilterProp="children"
          >
            {programs.map((program) => (
              <Option key={program.id} value={program.id}>
                {program.name} ({program.code})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="batch"
          label="Batch"
          rules={[
            { required: true, message: 'Please enter batch' },
            {
              pattern: /^\d{4}-(Fall|Spring|Summer)$/i,
              message: 'Batch format: YYYY-Session (e.g., 2024-Fall)',
            },
          ]}
        >
          <Input placeholder="Batch (e.g., 2024-Fall)" />
        </Form.Item>

        <Form.Item
          name="admissionDate"
          label="Admission Date"
          rules={[{ required: !isEdit, message: 'Please select admission date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="currentSemester"
          label="Current Semester"
          rules={[{ required: true, message: 'Please enter current semester' }]}
        >
          <Input type="number" min={1} max={16} placeholder="Current Semester" />
        </Form.Item>

        {isEdit && (
          <Form.Item
            name="enrollmentStatus"
            label="Enrollment Status"
          >
            <Select placeholder="Select Status">
              <Option value="active">Active</Option>
              <Option value="graduated">Graduated</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="withdrawn">Withdrawn</Option>
              <Option value="transfer">Transfer</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="bloodGroup"
          label="Blood Group"
        >
          <Select placeholder="Select Blood Group">
            <Option value="A+">A+</Option>
            <Option value="A-">A-</Option>
            <Option value="B+">B+</Option>
            <Option value="B-">B-</Option>
            <Option value="AB+">AB+</Option>
            <Option value="AB-">AB-</Option>
            <Option value="O+">O+</Option>
            <Option value="O-">O-</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="emergencyContactName"
          label="Emergency Contact Name"
        >
          <Input placeholder="Emergency Contact Name" />
        </Form.Item>

        <Form.Item
          name="emergencyContactPhone"
          label="Emergency Contact Phone"
          rules={[
            { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' },
          ]}
        >
          <Input placeholder="Emergency Contact Phone" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update Student' : 'Create Student'}
            </Button>
            <Button onClick={() => navigate('/student-management/profiles')}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StudentForm;

