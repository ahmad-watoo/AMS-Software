import React, { useState } from "react";
import { Table, Input, Select, Button, Modal, Form, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface ClassSchedule {
  key: string;
  className: string;
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room: string;
}

const ClassSchedulePage: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ClassSchedule[]>([
    {
      key: "1",
      className: "Class 10A",
      subject: "Mathematics",
      teacher: "John Doe",
      day: "Monday",
      time: "09:00 - 10:00",
      room: "Room 101",
    },
    {
      key: "2",
      className: "Class 11B",
      subject: "Physics",
      teacher: "Jane Smith",
      day: "Tuesday",
      time: "10:00 - 11:00",
      room: "Room 102",
    },
    {
      key: "3",
      className: "Class 9C",
      subject: "Chemistry",
      teacher: "Alice Johnson",
      day: "Wednesday",
      time: "11:00 - 12:00",
      room: "Room 103",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(
    null
  );
  const [form] = Form.useForm();

  // Columns for the schedule table
  const columns: ColumnsType<ClassSchedule> = [
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Teacher",
      dataIndex: "teacher",
      key: "teacher",
    },
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
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

  // Handle add/edit schedule
  const handleAddSchedule = () => {
    form.resetFields();
    setEditingSchedule(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: ClassSchedule) => {
    form.setFieldsValue(record);
    setEditingSchedule(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setScheduleData(scheduleData.filter((schedule) => schedule.key !== key));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingSchedule) {
          // Update existing schedule
          setScheduleData(
            scheduleData.map((schedule) =>
              schedule.key === editingSchedule.key
                ? { ...schedule, ...values }
                : schedule
            )
          );
        } else {
          // Add new schedule
          const newSchedule = {
            ...values,
            key: (scheduleData.length + 1).toString(),
          };
          setScheduleData([...scheduleData, newSchedule]);
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
      <h1 className="text-2xl font-bold mb-6 text-center">Class Schedule</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by class name or teacher"
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Day"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Monday">Monday</Option>
          <Option value="Tuesday">Tuesday</Option>
          <Option value="Wednesday">Wednesday</Option>
          <Option value="Thursday">Thursday</Option>
          <Option value="Friday">Friday</Option>
        </Select>
        <Select
          placeholder="Filter by Subject"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Mathematics">Mathematics</Option>
          <Option value="Physics">Physics</Option>
          <Option value="Chemistry">Chemistry</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleAddSchedule}
          className="w-full md:w-auto"
        >
          Add Schedule
        </Button>
      </div>

      {/* Schedule Table */}
      <Table
        columns={columns}
        dataSource={scheduleData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={editingSchedule ? "Edit Schedule" : "Add Schedule"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="className"
            label="Class Name"
            rules={[{ required: true, message: "Please enter the class name" }]}
          >
            <Input placeholder="Enter class name" />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter the subject" }]}
          >
            <Input placeholder="Enter subject" />
          </Form.Item>
          <Form.Item
            name="teacher"
            label="Teacher"
            rules={[
              { required: true, message: "Please enter the teacher's name" },
            ]}
          >
            <Input placeholder="Enter teacher's name" />
          </Form.Item>
          <Form.Item
            name="day"
            label="Day"
            rules={[{ required: true, message: "Please select the day" }]}
          >
            <Select placeholder="Select day">
              <Option value="Monday">Monday</Option>
              <Option value="Tuesday">Tuesday</Option>
              <Option value="Wednesday">Wednesday</Option>
              <Option value="Thursday">Thursday</Option>
              <Option value="Friday">Friday</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please enter the time" }]}
          >
            <Input placeholder="Enter time (e.g., 09:00 - 10:00)" />
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

export default ClassSchedulePage;
