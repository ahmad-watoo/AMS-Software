import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, DatePicker, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { RangePicker } = DatePicker;
console.log(RangePicker);
interface DigitalCertificate {
  key: string;
  recipientName: string;
  certificateId: string;
  issueDate: string;
  courseName: string;
}

const DigitalCertificationPage: React.FC = () => {
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([
    {
      key: "1",
      recipientName: "John Doe",
      certificateId: "CERT-001",
      issueDate: "2023-10-15",
      courseName: "Mathematics",
    },
    {
      key: "2",
      recipientName: "Jane Smith",
      certificateId: "CERT-002",
      issueDate: "2023-10-16",
      courseName: "Physics",
    },
    {
      key: "3",
      recipientName: "Alice Johnson",
      certificateId: "CERT-003",
      issueDate: "2023-10-17",
      courseName: "Chemistry",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Columns for the certificate table
  const columns: ColumnsType<DigitalCertificate> = [
    {
      title: "Recipient Name",
      dataIndex: "recipientName",
      key: "recipientName",
    },
    {
      title: "Certificate ID",
      dataIndex: "certificateId",
      key: "certificateId",
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDownload(record)}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  // Handle issue certificate
  const handleIssueCertificate = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle download certificate
  const handleDownload = (record: DigitalCertificate) => {
    // Simulate downloading a certificate (e.g., generate a PDF)
    alert(`Downloading certificate: ${record.certificateId}`);
  };

  // Handle modal OK (submit new certificate)
  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newCertificate = {
          ...values,
          key: (certificates.length + 1).toString(),
          certificateId: `CERT-00${certificates.length + 1}`,
        };
        setCertificates([...certificates, newCertificate]);
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Validation Failed:", error);
      });
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Digital Certificates
      </h1>

      {/* Search and Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by recipient name or certificate ID"
          className="w-full md:w-64"
        />
        <Button
          type="primary"
          onClick={handleIssueCertificate}
          className="w-full md:w-auto"
        >
          Issue Certificate
        </Button>
      </div>

      {/* Certificate Table */}
      <Table
        columns={columns}
        dataSource={certificates}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Issue Certificate Modal */}
      <Modal
        title="Issue Certificate"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="recipientName"
            label="Recipient Name"
            rules={[
              { required: true, message: "Please enter the recipient's name" },
            ]}
          >
            <Input placeholder="Enter recipient's name" />
          </Form.Item>
          <Form.Item
            name="courseName"
            label="Course Name"
            rules={[
              { required: true, message: "Please enter the course name" },
            ]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>
          <Form.Item
            name="issueDate"
            label="Issue Date"
            rules={[
              { required: true, message: "Please select the issue date" },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DigitalCertificationPage;
