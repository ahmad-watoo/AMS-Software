import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal, DatePicker } from 'antd';
import { CheckOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import libraryAPI, { BookBorrowing } from '@/api/library.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BorrowingList: React.FC = () => {
  const navigate = useNavigate();
  const [borrowings, setBorrowings] = useState<BookBorrowing[]>([]);
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
    fetchBorrowings();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const response = await libraryAPI.getAllBorrowings({
        status: filters.status,
        bookId: filters.bookId,
        userId: filters.userId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setBorrowings(response.borrowings || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (id: string) => {
    Modal.confirm({
      title: 'Return Book',
      content: 'Are you sure you want to mark this book as returned?',
      okText: 'Yes, Return',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await libraryAPI.returnBook(id);
          message.success('Book returned successfully');
          fetchBorrowings();
        } catch (error: any) {
          message.error(error.message || 'Failed to return book');
        }
      },
    });
  };

  const handleRenew = (id: string, currentDueDate: string) => {
    Modal.confirm({
      title: 'Renew Borrowing',
      content: 'This will extend the due date by the default borrowing period.',
      okText: 'Renew',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Calculate new due date (typically 14 days from current due date)
          const newDueDate = dayjs(currentDueDate).add(14, 'day').format('YYYY-MM-DD');
          await libraryAPI.renewBorrowing(id, { newDueDate });
          message.success('Book renewed successfully');
          fetchBorrowings();
        } catch (error: any) {
          message.error(error.message || 'Failed to renew book');
        }
      },
    });
  };

  const isOverdue = (dueDate: string, returnDate?: string) => {
    if (returnDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getStatusTag = (borrowing: BookBorrowing) => {
    if (borrowing.status === 'returned') {
      return <Tag color="green">Returned</Tag>;
    }
    if (isOverdue(borrowing.dueDate, borrowing.returnDate)) {
      return <Tag color="red">Overdue</Tag>;
    }
    if (borrowing.status === 'lost') {
      return <Tag color="orange">Lost</Tag>;
    }
    return <Tag color="blue">Borrowed</Tag>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `PKR ${amount.toLocaleString()}`;
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
      filters: [
        { text: 'Student', value: 'student' },
        { text: 'Faculty', value: 'faculty' },
        { text: 'Staff', value: 'staff' },
      ],
    },
    {
      title: 'Borrowed Date',
      dataIndex: 'borrowedDate',
      key: 'borrowedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record: BookBorrowing) => {
        const overdue = isOverdue(date, record.returnDate);
        return (
          <span style={{ color: overdue ? 'red' : 'inherit' }}>
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: BookBorrowing) => getStatusTag(record),
      filters: [
        { text: 'Borrowed', value: 'borrowed' },
        { text: 'Returned', value: 'returned' },
        { text: 'Overdue', value: 'overdue' },
        { text: 'Lost', value: 'lost' },
      ],
    },
    {
      title: 'Fine',
      key: 'fine',
      render: (_: any, record: BookBorrowing) => {
        if (record.fineAmount && record.fineAmount > 0) {
          return (
            <span style={{ color: record.finePaid ? 'green' : 'red' }}>
              {formatCurrency(record.fineAmount)}
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: 'Renewals',
      dataIndex: 'renewedCount',
      key: 'renewedCount',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BookBorrowing) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/library/borrowings/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'borrowed' && (
            <>
              <PermissionGuard permission="library" action="update">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  onClick={() => handleReturn(record.id)}
                >
                  Return
                </Button>
              </PermissionGuard>
              <Button
                type="link"
                icon={<ReloadOutlined />}
                onClick={() => handleRenew(record.id, record.dueDate)}
              >
                Renew
              </Button>
            </>
          )}
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
              <Option value="borrowed">Borrowed</Option>
              <Option value="returned">Returned</Option>
              <Option value="overdue">Overdue</Option>
              <Option value="lost">Lost</Option>
            </Select>
          </Space>
          <PermissionGuard permission="library" action="create">
            <Button
              type="primary"
              onClick={() => navigate('/library/borrowings/new')}
            >
              New Borrowing
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={borrowings}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} borrowings`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default BorrowingList;

