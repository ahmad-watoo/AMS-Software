import React from "react";
import StudentTable from "./column";
import { Card } from "antd";

const ApplicationForm = () => {
  return (
    <Card
      style={{
        margin: 20,
        boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
      }}
    >
      <StudentTable />
    </Card>
  );
};

export default ApplicationForm;
