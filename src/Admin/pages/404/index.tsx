import React from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "antd";

const NotFoundPage = () => {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/7233356/pexels-photo-7233356.jpeg?auto=compress&cs=tinysrgb&w=600')",
      }}
    >
      <Card className="p-10 text-center shadow-xl rounded-xl bg-white/90 max-w-lg w-full">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-2">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 mt-4">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button type="primary" className="mt-6 px-6 py-3 text-lg">
            Go Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFoundPage;
