import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import libraryAPI, { BookReservation } from '@/api/library.api';

const { Option } = Select;

const ReservationList: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<BookReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    bookId: undefined as string | undefined,
    userId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchReservations();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await libraryAPI.getAllReservations({
        status: filters.status,
        bookId: filters.bookId,
        userId: filters.userId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setReservations(response.reservations || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: 'Cancel Reservation',
      content: 'Are you sure you want to cancel this reservation?',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await libraryAPI.cancelReservation(id);
          message.success('Reservation cancelled successfully');
          fetchReservations();
        } catch (error: any) {
          message.error(error.message || 'Failed to cancel reservation');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      available: { color: 'green', text: 'Available' },
      fulfilled: { color: 'blue', text: 'Fulfilled' },
      cancelled: { color: 'red', text: 'Cancelled' },
      expired: { color: 'default', text: 'Expired' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const columns = [
    {
      title: 'Book ID',
      dataIndex: 'bookId',
      key: 'bookId',
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (type: string) => (
        <Tag color={type === 'student' ? 'blue' : type === 'faculty' ? 'green' : 'purple'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Reservation Date',
      dataIndex: 'reservationDate',
      key: 'reservationDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        const expired = isExpired(date);
        return (
          <span style={{ color: expired ? 'red' : 'inherit' }}>
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Available', value: 'available' },
        { text: 'Fulfilled', value: 'fulfilled' },
        { text: 'Cancelled', value: 'cancelled' },
        { text: 'Expired', value: 'expired' },
      ],
    },
    {
      title: 'Notified',
      dataIndex: 'notified',
      key: 'notified',
      render: (notified: boolean) => (
        <Tag color={notified ? 'green' : 'orange'}>
          {notified ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BookReservation) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/library/reservations/${record.id}`)}
          >
            View
          </Button>
          {(record.status === 'pending' || record.status === 'available') && (
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleCancel(record.id)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Select
            placeholder="Filter by Status"
            style={{ width: 150 }}
            allowClear
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="pending">Pending</Option>
            <Option value="available">Available</Option>
            <Option value="fulfilled">Fulfilled</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="expired">Expired</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={reservations}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} reservations`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default ReservationList;

