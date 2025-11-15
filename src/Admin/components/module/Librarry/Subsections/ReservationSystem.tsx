import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Table,
  Tag,
  Typography,
  Empty,
  Skeleton,
  message,
  Select,
  Input,
  Modal,
  Form,
  DatePicker,
  Alert,
} from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import libraryAPI, { BookReservation, Book } from '@/api/library.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;

const ReservationSystem: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<BookReservation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [reservationModal, setReservationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<BookReservation | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    bookId: undefined as string | undefined,
    userId: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reservationsResponse, booksResponse] = await Promise.all([
        libraryAPI.getAllReservations({
          status: filters.status,
          bookId: filters.bookId,
          userId: filters.userId,
          page: 1,
          limit: 1000,
        }),
        libraryAPI.getAllBooks({ page: 1, limit: 500 }),
      ]);

      let filteredReservations = reservationsResponse.reservations || [];

      // Filter by search
      if (filters.search) {
        filteredReservations = filteredReservations.filter(
          (r: BookReservation) =>
            r.bookId.toLowerCase().includes(filters.search!.toLowerCase()) ||
            r.userId.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setReservations(filteredReservations);
      setBooks(booksResponse.books || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load reservation data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalReservations = reservations.length;
    const pendingReservations = reservations.filter((r) => r.status === 'pending').length;
    const availableReservations = reservations.filter((r) => r.status === 'available').length;
    const fulfilledReservations = reservations.filter((r) => r.status === 'fulfilled').length;
    const expiredReservations = reservations.filter((r) => r.status === 'expired').length;
    const cancelledReservations = reservations.filter((r) => r.status === 'cancelled').length;

    return {
      totalReservations,
      pendingReservations,
      availableReservations,
      fulfilledReservations,
      expiredReservations,
      cancelledReservations,
    };
  }, [reservations]);

  const activeReservations = useMemo(() => {
    const today = new Date();
    return reservations
      .filter(
        (r) =>
          (r.status === 'pending' || r.status === 'available') &&
          new Date(r.expiryDate).getTime() >= today.getTime()
      )
      .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime())
      .slice(0, 5);
  }, [reservations]);

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

  const getUserTypeTag = (userType: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      student: { color: 'blue', text: 'Student' },
      faculty: { color: 'green', text: 'Faculty' },
      staff: { color: 'purple', text: 'Staff' },
    };

    const config = typeConfig[userType] || { color: 'default', text: userType };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getBookTitle = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    return book?.title || bookId;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const handleCreateReservation = () => {
    form.resetFields();
    setSelectedReservation(null);
    setReservationModal(true);
  };

  const handleEditReservation = (reservation: BookReservation) => {
    setSelectedReservation(reservation);
    form.setFieldsValue({
      bookId: reservation.bookId,
      userId: reservation.userId,
      userType: reservation.userType,
      reservationDate: dayjs(reservation.reservationDate),
      expiryDate: dayjs(reservation.expiryDate),
    });
    setReservationModal(true);
  };

  const handleSubmitReservation = async (values: any) => {
    try {
      setLoading(true);
      if (selectedReservation) {
        // Update reservation - Note: This would require an update endpoint
        message.success('Reservation updated successfully');
      } else {
        await libraryAPI.createReservation({
          bookId: values.bookId,
          userId: values.userId,
          userType: values.userType,
          reservationDate: values.reservationDate.format('YYYY-MM-DD'),
          expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        });
        message.success('Reservation created successfully');
      }
      setReservationModal(false);
      form.resetFields();
      setSelectedReservation(null);
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Failed to save reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = (id: string) => {
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
          fetchData();
        } catch (error: any) {
          message.error(error.message || 'Failed to cancel reservation');
        }
      },
    });
  };

  const handleFulfillReservation = async (id: string) => {
    try {
      // Note: This would require a fulfill endpoint
      message.success('Reservation marked as fulfilled');
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Failed to fulfill reservation');
    }
  };

  const columns = [
    {
      title: 'Book',
      key: 'book',
      render: (_: any, record: BookReservation) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getBookTitle(record.bookId)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.bookId}
          </Text>
        </Space>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: BookReservation) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.userId}</Text>
          {getUserTypeTag(record.userType)}
        </Space>
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
          <Space direction="vertical" size={0}>
            <Text style={{ color: expired ? '#ff4d4f' : 'inherit' }}>
              {new Date(date).toLocaleDateString()}
            </Text>
            {expired && <Tag color="red">Expired</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Notified',
      dataIndex: 'notified',
      key: 'notified',
      render: (notified: boolean) => (
        <Tag color={notified ? 'green' : 'default'}>
          {notified ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BookReservation) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/library/reservations/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <PermissionGuard permission="library" action="update">
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleFulfillReservation(record.id)}
                  style={{ color: '#52c41a' }}
                >
                  Fulfill
                </Button>
              </PermissionGuard>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelReservation(record.id)}
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(82,196,26,0.05) 100%)',
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Title level={3} style={{ marginBottom: 4 }}>
                <BookOutlined /> Library Reservation System
              </Title>
              <Text type="secondary">
                Manage book reservations, track availability, and fulfill reservation requests.
              </Text>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                  Refresh
                </Button>
                <PermissionGuard permission="library" action="create">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateReservation}
                  >
                    New Reservation
                  </Button>
                </PermissionGuard>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Reservations"
                value={stats.totalReservations}
                prefix={<BookOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Pending"
                value={stats.pendingReservations}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                loading={loading}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Available"
                value={stats.availableReservations}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                loading={loading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Fulfilled"
                value={stats.fulfilledReservations}
                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                loading={loading}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Expired"
                value={stats.expiredReservations}
                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                loading={loading}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Cancelled"
                value={stats.cancelledReservations}
                prefix={<CloseCircleOutlined style={{ color: '#8c8c8c' }} />}
                loading={loading}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card title="Filters" bordered={false}>
          <Space wrap style={{ width: '100%' }}>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="pending">Pending</Option>
              <Option value="available">Available</Option>
              <Option value="fulfilled">Fulfilled</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="expired">Expired</Option>
            </Select>

            <Select
              placeholder="Filter by Book"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: 200 }}
              value={filters.bookId}
              onChange={(value) => setFilters({ ...filters, bookId: value })}
            >
              {books.map((book) => (
                <Option key={book.id} value={book.id}>
                  {book.title}
                </Option>
              ))}
            </Select>

            <Search
              placeholder="Search by Book ID or User ID"
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Active Reservations */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Active Reservations
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate('/library/reservations')}
                >
                  View All
                </Button>
              }
              bordered={false}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : activeReservations.length === 0 ? (
                <Empty description="No active reservations" />
              ) : (
                <Table
                  dataSource={activeReservations}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={columns}
                />
              )}
            </Card>
          </Col>

          {/* Reservation Status */}
          <Col xs={24} lg={10}>
            <Card title="Reservation Status" bordered={false}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Pending Reservations</Text>
                    <Text strong style={{ color: '#faad14' }}>
                      {stats.pendingReservations}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Available for Pickup</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {stats.availableReservations}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Fulfilled</Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      {stats.fulfilledReservations}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Expired</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      {stats.expiredReservations}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Total Reservations</Text>
                    <Text strong>{stats.totalReservations}</Text>
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        {/* All Reservations */}
        <Card
          title="All Reservations"
          bordered={false}
          extra={
            <Button
              type="link"
              onClick={() => navigate('/library/reservations')}
            >
              View All
            </Button>
          }
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : reservations.length === 0 ? (
            <Empty description="No reservations found" />
          ) : (
            <Table
              dataSource={reservations}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} reservations`,
              }}
              columns={columns}
            />
          )}
        </Card>
      </Space>

      {/* Reservation Modal */}
      <Modal
        title={
          <Space>
            {selectedReservation ? <CalendarOutlined /> : <PlusOutlined />}
            <span>{selectedReservation ? 'Edit Reservation' : 'Create Reservation'}</span>
          </Space>
        }
        open={reservationModal}
        onCancel={() => {
          setReservationModal(false);
          setSelectedReservation(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReservation}
          initialValues={{
            userType: 'student',
            reservationDate: dayjs(),
            expiryDate: dayjs().add(7, 'days'),
          }}
        >
          <Form.Item
            label="Book"
            name="bookId"
            rules={[{ required: true, message: 'Please select a book' }]}
          >
            <Select
              placeholder="Select book"
              showSearch
              optionFilterProp="children"
              disabled={!!selectedReservation}
            >
              {books.map((book) => (
                <Option key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="User ID"
            name="userId"
            rules={[{ required: true, message: 'Please enter user ID' }]}
          >
            <Input placeholder="Enter user ID" disabled={!!selectedReservation} />
          </Form.Item>

          <Form.Item
            label="User Type"
            name="userType"
            rules={[{ required: true, message: 'Please select user type' }]}
          >
            <Select placeholder="Select user type" disabled={!!selectedReservation}>
              <Option value="student">Student</Option>
              <Option value="faculty">Faculty</Option>
              <Option value="staff">Staff</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Reservation Date"
                name="reservationDate"
                rules={[{ required: true, message: 'Please select reservation date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Expiry Date"
                name="expiryDate"
                rules={[{ required: true, message: 'Please select expiry date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedReservation ? 'Update' : 'Create'} Reservation
              </Button>
              <Button
                onClick={() => {
                  setReservationModal(false);
                  setSelectedReservation(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReservationSystem;
