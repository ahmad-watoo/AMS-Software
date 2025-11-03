import React, { useState } from "react";
import { Avatar, Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import "./LoginPage.css"; // Import custom CSS for styling

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthContext();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      clearError();
      await login({
        email: values.email,
        password: values.password,
      });
      message.success("Login successful!");
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
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
        <h1 className="login-title">Academy Management System</h1>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          className="login-form"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="user" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          Not a member?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/signup")} // Redirect to the SignUp page
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
