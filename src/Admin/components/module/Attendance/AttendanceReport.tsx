import React, { useState, useEffect } from 'react';
import { Table, Card, Select, DatePicker, Space, Tag, message, Button } from 'antd';
import { FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import attendanceAPI, { AttendanceReport as Report } from '@/api/attendance.api';
import { academicAPI } from '@/api/academic.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AttendanceReport: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sectionId: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    minPercentage: undefined as number | undefined,
  });

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (filters.sectionId) {
      fetchReport();
    }
  }, [filters]);

  const loadSections = async () => {
    try {
      const response = await academicAPI.getSections(1, 1000);
      setSections(response.sections);
    } catch (error) {
      console.error('Failed to load sections');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.sectionId) params.sectionId = filters.sectionId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minPercentage !== undefined) params.minPercentage = filters.minPercentage;

      const response = await attendanceAPI.getAttendanceReport(params);
      setReports(response);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      satisfactory: { color: 'green', text: 'Satisfactory' },
      warning: { color: 'orange', text: 'Warning' },
      critical: { color: 'red', text: 'Critical' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPercentageTag = (percentage: number) => {
    let color = 'green';
    if (percentage < 75) color = 'red';
    else if (percentage < 85) color = 'orange';

    return <Tag color={color}>{percentage.toFixed(2)}%</Tag>;
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Section',
      dataIndex: 'sectionCode',
      key: 'sectionCode',
    },
    {
      title: 'Attendance %',
      dataIndex: 'attendancePercentage',
      key: 'attendancePercentage',
      render: (percentage: number) => getPercentageTag(percentage),
      sorter: (a: Report, b: Report) => a.attendancePercentage - b.attendancePercentage,
    },
    {
      title: 'Total Classes',
      dataIndex: 'totalClasses',
      key: 'totalClasses',
    },
    {
      title: 'Present',
      dataIndex: 'presentCount',
      key: 'presentCount',
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
    },
    {
      title: 'Late',
      dataIndex: 'lateCount',
      key: 'lateCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space wrap>
          <Select
            placeholder="Select Section"
            style={{ width: 300 }}
            showSearch
            value={filters.sectionId}
            onChange={(value) => setFilters({ ...filters, sectionId: value })}
          >
            {sections.map((section) => (
              <Option key={section.id} value={section.id}>
                {section.sectionCode} - {section.semester}
              </Option>
            ))}
          </Select>

          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD'),
                });
              } else {
                setFilters({
                  ...filters,
                  startDate: undefined,
                  endDate: undefined,
                });
              }
            }}
          />

          <Select
            placeholder="Min Attendance %"
            style={{ width: 150 }}
            allowClear
            value={filters.minPercentage}
            onChange={(value) => setFilters({ ...filters, minPercentage: value })}
          >
            <Option value={75}>≥ 75%</Option>
            <Option value={80}>≥ 80%</Option>
            <Option value={85}>≥ 85%</Option>
            <Option value={90}>≥ 90%</Option>
          </Select>

          <Space>
            <Button icon={<FileExcelOutlined />} onClick={() => message.info('Export feature coming soon')}>
              Export
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => message.info('Print feature coming soon')}>
              Print
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={reports}
          rowKey="studentId"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} students`,
          }}
        />
      </Space>
    </Card>
  );
};

export default AttendanceReport;

