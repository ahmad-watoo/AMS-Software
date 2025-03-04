import React, { useState } from "react";
import { Table, Input, Select, Button, Modal, Form, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface ExamResult {
  key: string;
  studentName: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

const ResultsPage: React.FC = () => {
  const [resultsData, setResultsData] = useState<ExamResult[]>([
    {
      key: "1",
      studentName: "John Doe",
      examName: "Midterm Exam",
      subject: "Mathematics",
      marksObtained: 85,
      totalMarks: 100,
      grade: "A",
    },
    {
      key: "2",
      studentName: "Jane Smith",
      examName: "Final Exam",
      subject: "Physics",
      marksObtained: 78,
      totalMarks: 100,
      grade: "B",
    },
    {
      key: "3",
      studentName: "Alice Johnson",
      examName: "Midterm Exam",
      subject: "Chemistry",
      marksObtained: 92,
      totalMarks: 100,
      grade: "A+",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);
  const [form] = Form.useForm();

  // Columns for the results table
  const columns: ColumnsType<ExamResult> = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
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
      title: "Marks Obtained",
      dataIndex: "marksObtained",
      key: "marksObtained",
    },
    {
      title: "Total Marks",
      dataIndex: "totalMarks",
      key: "totalMarks",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: string) => (
        <Tag
          color={
            grade === "A+"
              ? "green"
              : grade === "A"
              ? "blue"
              : grade === "B"
              ? "orange"
              : "red"
          }
        >
          {grade}
        </Tag>
      ),
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

  // Handle add/edit result
  const handleAddResult = () => {
    form.resetFields();
    setEditingResult(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: ExamResult) => {
    form.setFieldsValue(record);
    setEditingResult(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setResultsData(resultsData.filter((result) => result.key !== key));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingResult) {
          // Update existing result
          setResultsData(
            resultsData.map((result) =>
              result.key === editingResult.key
                ? { ...result, ...values }
                : result
            )
          );
        } else {
          // Add new result
          const newResult = {
            ...values,
            key: (resultsData.length + 1).toString(),
          };
          setResultsData([...resultsData, newResult]);
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
      <h1 className="text-2xl font-bold mb-6 text-center">Exam Results</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by student name or exam name"
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Subject"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Mathematics">Mathematics</Option>
          <Option value="Physics">Physics</Option>
          <Option value="Chemistry">Chemistry</Option>
        </Select>
        <Select
          placeholder="Filter by Grade"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="A+">A+</Option>
          <Option value="A">A</Option>
          <Option value="B">B</Option>
          <Option value="C">C</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleAddResult}
          className="w-full md:w-auto"
        >
          Add Result
        </Button>
      </div>

      {/* Results Table */}
      <Table
        columns={columns}
        dataSource={resultsData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Add/Edit Result Modal */}
      <Modal
        title={editingResult ? "Edit Exam Result" : "Add Exam Result"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentName"
            label="Student Name"
            rules={[
              { required: true, message: "Please enter the student's name" },
            ]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>
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
            name="marksObtained"
            label="Marks Obtained"
            rules={[
              { required: true, message: "Please enter the marks obtained" },
            ]}
          >
            <Input type="number" placeholder="Enter marks obtained" />
          </Form.Item>
          <Form.Item
            name="totalMarks"
            label="Total Marks"
            rules={[
              { required: true, message: "Please enter the total marks" },
            ]}
          >
            <Input type="number" placeholder="Enter total marks" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="Grade"
            rules={[{ required: true, message: "Please enter the grade" }]}
          >
            <Input placeholder="Enter grade" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResultsPage;
