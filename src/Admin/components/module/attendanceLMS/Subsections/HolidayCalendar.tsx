import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, DatePicker, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { RangePicker } = DatePicker;

interface Holiday {
  key: string;
  holidayName: string;
  date: string;
  description: string;
}

const HolidayCalendar: React.FC = () => {
  const [holidayData, setHolidayData] = useState<Holiday[]>([
    {
      key: "1",
      holidayName: "New Year's Day",
      date: "2024-01-01",
      description: "Celebration of the new year.",
    },
    {
      key: "2",
      holidayName: "Independence Day",
      date: "2024-07-04",
      description: "Celebration of national independence.",
    },
    {
      key: "3",
      holidayName: "Christmas Day",
      date: "2024-12-25",
      description: "Celebration of Christmas.",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [form] = Form.useForm();

  // Columns for the holiday table
  const columns: ColumnsType<Holiday> = [
    {
      title: "Holiday Name",
      dataIndex: "holidayName",
      key: "holidayName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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

  // Handle add/edit holiday
  const handleAddHoliday = () => {
    form.resetFields();
    setEditingHoliday(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Holiday) => {
    form.setFieldsValue(record);
    setEditingHoliday(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setHolidayData(holidayData.filter((holiday) => holiday.key !== key));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingHoliday) {
          // Update existing holiday
          setHolidayData(
            holidayData.map((holiday) =>
              holiday.key === editingHoliday.key
                ? { ...holiday, ...values }
                : holiday
            )
          );
        } else {
          // Add new holiday
          const newHoliday = {
            ...values,
            key: (holidayData.length + 1).toString(),
          };
          setHolidayData([...holidayData, newHoliday]);
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
      <h1 className="text-2xl font-bold mb-6 text-center">Holiday Calendar</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by holiday name"
          className="w-full md:w-64"
        />
        <RangePicker className="w-full md:w-48" />
        <Button
          type="primary"
          onClick={handleAddHoliday}
          className="w-full md:w-auto"
        >
          Add Holiday
        </Button>
      </div>

      {/* Holiday Table */}
      <Table
        columns={columns}
        dataSource={holidayData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Add/Edit Holiday Modal */}
      <Modal
        title={editingHoliday ? "Edit Holiday" : "Add Holiday"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="holidayName"
            label="Holiday Name"
            rules={[
              { required: true, message: "Please enter the holiday name" },
            ]}
          >
            <Input placeholder="Enter holiday name" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select the date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the description" },
            ]}
          >
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HolidayCalendar;
