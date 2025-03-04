import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Modal,
  Form,
  Space,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ExamSchedule {
  key: string;
  examName: string;
  subject: string;
  date: string;
  time: string;
  room: string;
}

const StdExamShedule: React.FC = () => {
  const [examData, setExamData] = useState<ExamSchedule[]>([
    {
      key: "1",
      examName: "Midterm Exam",
      subject: "Mathematics",
      date: "2023-11-15",
      time: "09:00 - 12:00",
      room: "Room 101",
    },
    {
      key: "2",
      examName: "Final Exam",
      subject: "Physics",
      date: "2023-12-20",
      time: "10:00 - 13:00",
      room: "Room 102",
    },
    {
      key: "3",
      examName: "Midterm Exam",
      subject: "Chemistry",
      date: "2023-11-17",
      time: "11:00 - 14:00",
      room: "Room 103",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [form] = Form.useForm();

  // Columns for the exam schedule table
  const columns: ColumnsType<ExamSchedule> = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      key: "examName",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.key)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Handle add/edit exam schedule
  const handleAddExam = () => {
    form.resetFields();
    setEditingExam(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: ExamSchedule) => {
    form.setFieldsValue(record);
    setEditingExam(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setExamData(examData.filter((exam) => exam.key !== key));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingExam) {
          // Update existing exam
          setExamData(
            examData.map((exam) =>
              exam.key === editingExam.key ? { ...exam, ...values } : exam
            )
          );
        } else {
          // Add new exam
          const newExam = { ...values, key: (examData.length + 1).toString() };
          setExamData([...examData, newExam]);
        }
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Validation Failed:", error);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Exam Schedule</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by exam name or subject"
          className="w-full md:w-64"
        />
        <RangePicker className="w-full md:w-48" />
        <Select
          placeholder="Filter by Room"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Room 101">Room 101</Option>
          <Option value="Room 102">Room 102</Option>
          <Option value="Room 103">Room 103</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleAddExam}
          className="w-full md:w-auto"
        >
          Add Exam
        </Button>
      </div>

      {/* Exam Schedule Table */}
      <Table
        columns={columns}
        dataSource={examData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Add/Edit Exam Schedule Modal */}
      <Modal
        title={editingExam ? "Edit Exam Schedule" : "Add Exam Schedule"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="examName"
            label="Exam Name"
            rules={[{ required: true, message: "Please enter the exam name" }]}
          >
            <Input placeholder="Enter exam name" />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter the subject" }]}
          >
            <Input placeholder="Enter subject" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select the date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please enter the time" }]}
          >
            <Input placeholder="Enter time (e.g., 09:00 - 12:00)" />
          </Form.Item>
          <Form.Item
            name="room"
            label="Room"
            rules={[
              { required: true, message: "Please enter the room number" },
            ]}
          >
            <Input placeholder="Enter room number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StdExamShedule;
