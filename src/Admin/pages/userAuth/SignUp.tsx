import React, { useState } from "react";
import { Avatar, Button, Form, Input, message, Select, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import "./LoginPage.css"; // Reuse the same CSS file for consistent styling

const { Option } = Select;

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cnic?: string;
  dateOfBirth?: dayjs.Dayjs;
  gender?: "male" | "female" | "other";
}

const SignUp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, clearError } = useAuthContext();

  const onFinish = async (values: SignUpFormValues) => {
    try {
      setLoading(true);
      clearError();

      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        cnic: values.cnic,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),
        gender: values.gender,
      });

      message.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <Avatar
          src="https://img.freepik.com/premium-photo/blue-purple-wave-that-is-white-background_1309810-40680.jpg?semt=ais_hybrid"
          size="large"
        />
        <h1 className="login-title">Sign Up</h1>
        <Form
          name="signup_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          className="login-form"
        >
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: "Please input your first name!" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: "Please input your last name!" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              { pattern: /^[0-9+\-\s()]+$/, message: "Please enter a valid phone number!" },
            ]}
          >
            <Input placeholder="Phone (Optional)" />
          </Form.Item>
          <Form.Item
            name="cnic"
            rules={[
              {
                pattern: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
                message: "CNIC format: 12345-1234567-1",
              },
            ]}
          >
            <Input placeholder="CNIC (Optional) Format: 12345-1234567-1" />
          </Form.Item>
          <Form.Item name="gender">
            <Select placeholder="Gender (Optional)">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateOfBirth">
            <DatePicker
              placeholder="Date of Birth (Optional)"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              {
                min: 8,
                message: "Password must be at least 8 characters!",
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message:
                  "Password must contain uppercase, lowercase, number, and special character!",
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        Already a member?{" "}
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Login
        </span>
      </div>
    </div>
  );
};

export default SignUp;
