// StudentFormModal.js
import React from "react";
import { Modal, Form, Input } from "antd";

const StudentFormModal = ({ isVisible, onClose, onSubmit, initialData }:any) => {
  const [form] = Form.useForm();

  // Set form fields if editing
  React.useEffect(() => {
    form.setFieldsValue(initialData || {});
  }, [initialData, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title={initialData ? "Edit Student" : "New Student"}
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      okText={initialData ? "Update" : "Create"}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="studentName"
          label="Student Name"
          rules={[{ required: true, message: "Please enter student name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="fatherName"
          label="Father Name"
          rules={[{ required: true, message: "Please enter father's name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phoneNo"
          label="Phone No"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="class"
          label="Class"
          rules={[{ required: true, message: "Please enter class" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentFormModal;
