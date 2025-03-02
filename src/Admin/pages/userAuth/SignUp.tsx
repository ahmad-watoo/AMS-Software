import React, { useState } from "react";
import { Avatar, Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Reuse the same CSS file for consistent styling

const SignUp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    setLoading(true);
    // Simulate signup API call
    setTimeout(() => {
      // Store user data in localStorage (for demo purposes)
      localStorage.setItem("user", JSON.stringify({ email: values.email }));
      message.success("Signup successful!");
      navigate("/login"); // Redirect to login page after successful signup
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
        <h1 className="login-title">Sign Up</h1>
        <Form
          name="signup_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          className="login-form"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
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
