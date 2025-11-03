import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Card, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import attendanceAPI, { AttendanceRecord } from '@/api/attendance.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    enrollmentId: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  useEffect(() => {
    fetchRecords();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.enrollmentId) {
        params.enrollmentId = filters.enrollmentId;
      }
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await attendanceAPI.getAttendanceRecords(params);

      setRecords(response.records || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    // Modal confirmation would be added here
    attendanceAPI
      .deleteAttendanceRecord(id)
      .then(() => {
        message.success('Attendance record deleted successfully');
        fetchRecords();
      })
      .catch((error: any) => {
        message.error(error.message || 'Failed to delete attendance record');
      });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      present: { color: 'green', text: 'Present' },
      absent: { color: 'red', text: 'Absent' },
      late: { color: 'orange', text: 'Late' },
      excused: { color: 'blue', text: 'Excused' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Enrollment ID',
      dataIndex: 'enrollmentId',
      key: 'enrollmentId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Present', value: 'present' },
        { text: 'Absent', value: 'absent' },
        { text: 'Late', value: 'late' },
        { text: 'Excused', value: 'excused' },
      ],
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: 'Marked By',
      dataIndex: 'markedBy',
      key: 'markedBy',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AttendanceRecord) => (
        <Space size="middle">
          <PermissionGuard permission="attendance" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/attendance/records/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="attendance" action="delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="present">Present</Option>
              <Option value="absent">Absent</Option>
              <Option value="late">Late</Option>
              <Option value="excused">Excused</Option>
            </Select>
            <RangePicker
              onChange={(dates) =>
                setFilters({
                  ...filters,
                  dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
                })
              }
              value={filters.dateRange}
            />
            <Input
              placeholder="Search by Enrollment ID"
              style={{ width: 200 }}
              allowClear
              onChange={(e) =>
                setFilters({ ...filters, enrollmentId: e.target.value || undefined })
              }
            />
          </Space>
          <Space>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate('/attendance/reports')}
            >
              Reports
            </Button>
            <PermissionGuard permission="attendance" action="create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/attendance/records/new')}
              >
                Mark Attendance
              </Button>
            </PermissionGuard>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default AttendanceList;

