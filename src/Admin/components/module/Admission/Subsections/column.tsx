import React, { useState } from "react";
import { Table, Button, Space, Row, Col } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import StudentFormModal from "./StudentFormModal";

const StudentTable = () => {
  interface StudentRecord {
    key: number;
    srNo: number;
    studentName: string;
    fatherName: string;
    phoneNo: string;
    class: string;
    // Add other fields as necessary
  }
  const [data, setData] = useState<StudentRecord[]>([
    {
      key: 1,
      srNo: 1,
      studentName: "John Doe",
      fatherName: "Richard Doe",
      phoneNo: "123-456-7890",
      class: "10th Grade",
    },
    {
      key: 2,
      srNo: 2,
      studentName: "Jane Smith",
      fatherName: "Michael Smith",
      phoneNo: "987-654-3210",
      class: "9th Grade",
    },
    {
      key: 3,
      srNo: 3,
      studentName: "Ali Ahmad",
      fatherName: "Noor ahmad",
      phoneNo: "987-6544-3210",
      class: "4th Grade",
    },
    {
      key: 4,
      srNo: 4,
      studentName: "Akmal Hussain",
      fatherName: "Abdul Jabar",
      phoneNo: "487-654-3510",
      class: "9th Grade",
    },
    {
      key: 5,
      srNo: 5,
      studentName: "Akmal Hussain",
      fatherName: "Abdul Jabar",
      phoneNo: "487-654-3510",
      class: "9th Grade",
    },
    {
      key: 6,
      srNo: 6,
      studentName: "Muhammad afzal",
      fatherName: "Jameel Ahmad",
      phoneNo: "687-674-5210",
      class: "3th Grade",
    },
    {
      key: 7,
      srNo: 7,
      studentName: "Muhammad afzal",
      fatherName: "Jameel Ahmad",
      phoneNo: "687-674-5210",
      class: "3th Grade",
    },
    {
      key: 8,
      srNo: 8,
      studentName: "Yasir Ali",
      fatherName: "Javed Ahmad",
      phoneNo: "687-674-5210",
      class: "10th Grade",
    },
    {
      key: 9,
      srNo: 9,
      studentName: "Muhammad abdullah",
      fatherName: "Muhammad Nazeer",
      phoneNo: "687-674-5210",
      class: "4th Grade",
    },
    {
      key: 10,
      srNo: 10,
      studentName: "Jameel Ahmad",
      fatherName: "Muhamamad Iqbal",
      phoneNo: "566-677-5218",
      class: "6th Grade",
    },
    {
      key: 11,
      srNo: 11,
      studentName: "Noor Ahmad",
      fatherName: "Mohsin Ali",
      phoneNo: "887-634-4410",
      class: "5th Grade",
    },
    {
      key: 12,
      srNo: 12,
      studentName: "Muhammad Ali",
      fatherName: "Muhammad Iqbal",
      phoneNo: "687-554-5278",
      class: "4th Grade",
    },
    // Add more data as needed
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const showNewModal = () => {
    setEditingRecord(null); // Clear editing data
    setIsModalVisible(true);
  };

  const showEditModal = (record: any) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: any) => {
    setData(data.filter((item) => item.key !== key));
  };
  // const totalRecords = data;

  // const handleFormSubmit = (values: StudentRecord) => {
  //   if (editingRecord) {
  //     // Update the existing record
  //     setData((prevData) =>
  //       prevData.map((item) =>
  //         // item.key === editingRecord.key ? { ...item, ...values } : item
  //         editingRecord && item.key === editingRecord.key
  //           ? { ...item, ...values }
  //           : item
  //       )
  //     );
  //   } else {
  //     // Add a new record
  //     setData([
  //       ...data,
  //       { key: data.length + 1, srNo: data.length + 1, ...values },
  //     ]);
  //   }
  //   setIsModalVisible(false);
  // };

  const handleFormSubmit = (values: Omit<StudentRecord, "key" | "srNo">) => {
    if (editingRecord) {
      // Update the existing record
      setData((prevData) =>
        prevData.map((item) =>
          item.key === editingRecord ? { ...item, ...values } : item
        )
      );
    } else {
      // Add a new record
      const newRecord: StudentRecord = {
        key: data.length + 1,
        srNo: data.length + 1,
        ...values,
      };
      setData([...data, newRecord]);
    }
    setIsModalVisible(false);
  };
  const columns = [
    {
      title: "Sr No",
      dataIndex: "srNo",
      key: "srNo",
      width: 80,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a: any, b: any) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Father Name",
      dataIndex: "fatherName",
      key: "fatherName",
    },
    {
      title: "Phone No",
      dataIndex: "phoneNo",
      key: "phoneNo",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <EditOutlined
            onClick={() => showEditModal(record)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          />
          <DeleteOutlined
            onClick={() => handleDelete(record.key)}
            style={{ cursor: "pointer", color: "#ff4d4f" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* <Button
        type="primary"
        onClick={showNewModal}
        style={{ marginBottom: 16 }}
      >
        New Student
      </Button> */}
      <Row justify={"space-between"} align="middle" style={{ marginBottom: 0 }}>
        <Col style={{ fontSize: 20, fontWeight: "bold" }}>Student Record</Col>
        <Col>
          <Button type="primary" ghost onClick={showNewModal}>
            New
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        footer={() => `Total Records: ${data.length}`}
      />

      {/* Render StudentFormModal */}
      <StudentFormModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
      />
    </div>
  );
};

export default StudentTable;
