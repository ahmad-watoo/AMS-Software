import React, { useState } from "react";
import { Avatar, Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Import custom CSS for styling

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Specific username and password for validation
  const validCredentials = {
    username: "admin", // Replace with your specific username
    password: "456", // Replace with your specific password
  };

  const onFinish = (values: any) => {
    setLoading(true);
    // Simulate login API call
    setTimeout(() => {
      if (
        values.email === validCredentials.username &&
        values.password === validCredentials.password
      ) {
        // If credentials are correct, store user data and redirect to dashboard
        localStorage.setItem("user", JSON.stringify({ email: values.email }));
        message.success("Login successful!");
        navigate("/");
      } else {
        // If credentials are incorrect, show error message
        message.error("Invalid email or password!");
      }
      setLoading(false);
    }, 1000);
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
