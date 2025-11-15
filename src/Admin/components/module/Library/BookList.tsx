import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import libraryAPI, { Book } from '@/api/library.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    title: undefined as string | undefined,
    author: undefined as string | undefined,
    category: undefined as string | undefined,
    available: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchBooks();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await libraryAPI.getAllBooks({
        title: filters.title,
        author: filters.author,
        category: filters.category,
        available: filters.available,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setBooks(response.books || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this book?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await libraryAPI.deleteBook(id);
          message.success('Book deleted successfully');
          fetchBooks();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete book');
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, title: value || undefined });
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      sorter: true,
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      render: (isbn: string) => isbn || '-',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Textbook', value: 'textbook' },
        { text: 'Reference', value: 'reference' },
        { text: 'Journal', value: 'journal' },
        { text: 'Novel', value: 'novel' },
      ],
    },
    {
      title: 'Copies',
      key: 'copies',
      render: (_: any, record: Book) => (
        <span>
          <Tag color={record.availableCopies > 0 ? 'green' : 'red'}>
            {record.availableCopies}/{record.totalCopies}
          </Tag>
        </span>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Book) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/library/books/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="library" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/library/books/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="library" action="create">
            <Button
              type="link"
              onClick={() => navigate(`/library/borrowings/new?bookId=${record.id}`)}
            >
              Borrow
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
            <Search
              placeholder="Search by title, author, or ISBN"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch('');
                }
              }}
            />
            <Select
              placeholder="Filter by Category"
              style={{ width: 150 }}
              allowClear
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
            >
              <Option value="textbook">Textbook</Option>
              <Option value="reference">Reference</Option>
              <Option value="journal">Journal</Option>
              <Option value="novel">Novel</Option>
            </Select>
            <Select
              placeholder="Availability"
              style={{ width: 150 }}
              allowClear
              value={filters.available}
              onChange={(value) => setFilters({ ...filters, available: value })}
            >
              <Option value={true}>Available</Option>
              <Option value={false}>Not Available</Option>
            </Select>
          </Space>
          <PermissionGuard permission="library" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/library/books/new')}
            >
              Add Book
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={books}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} books`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default BookList;

