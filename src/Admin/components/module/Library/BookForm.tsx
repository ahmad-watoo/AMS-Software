import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import libraryAPI, { CreateBookDTO, Book } from '@/api/library.api';

const { Option } = Select;
const { TextArea } = Input;

interface BookFormProps {
  isEdit?: boolean;
}

const BookForm: React.FC<BookFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadBook(id);
    }
  }, [id, isEdit]);

  const loadBook = async (bookId: string) => {
    try {
      setLoading(true);
      const book = await libraryAPI.getBookById(bookId);
      form.setFieldsValue({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        publicationYear: book.publicationYear,
        edition: book.edition,
        category: book.category,
        subject: book.subject,
        language: book.language,
        totalCopies: book.totalCopies,
        location: book.location,
        description: book.description,
        isActive: book.isActive,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const bookData: CreateBookDTO = {
        isbn: values.isbn,
        title: values.title,
        author: values.author,
        publisher: values.publisher,
        publicationYear: values.publicationYear,
        edition: values.edition,
        category: values.category,
        subject: values.subject,
        language: values.language,
        totalCopies: values.totalCopies,
        location: values.location,
        description: values.description,
      };

      if (isEdit && id) {
        await libraryAPI.updateBook(id, { ...bookData });
        message.success('Book updated successfully');
      } else {
        await libraryAPI.createBook(bookData);
        message.success('Book added successfully');
      }

      navigate('/library/books');
    } catch (error: any) {
      message.error(error.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          language: 'english',
          category: 'textbook',
          totalCopies: 1,
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter book title' }]}
        >
          <Input placeholder="Enter book title" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Author"
            name="author"
            rules={[{ required: true, message: 'Please enter author name' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter author name" />
          </Form.Item>

          <Form.Item
            label="ISBN"
            name="isbn"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter ISBN (optional)" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Publisher"
            name="publisher"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter publisher name" />
          </Form.Item>

          <Form.Item
            label="Publication Year"
            name="publicationYear"
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Edition"
            name="edition"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter edition (e.g., 1st, 2nd)" />
          </Form.Item>

          <Form.Item
            label="Language"
            name="language"
            rules={[{ required: true, message: 'Please select language' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Language">
              <Option value="english">English</Option>
              <Option value="urdu">Urdu</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Category">
              <Option value="textbook">Textbook</Option>
              <Option value="reference">Reference</Option>
              <Option value="journal">Journal</Option>
              <Option value="novel">Novel</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter subject (optional)" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Total Copies"
            name="totalCopies"
            rules={[
              { required: true, message: 'Please enter total copies' },
              { type: 'number', min: 1, message: 'Copies must be at least 1' },
            ]}
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            label="Location (Shelf)"
            name="location"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter shelf location (optional)" />
          </Form.Item>
        </Space>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter book description (optional)" />
        </Form.Item>

        {isEdit && (
          <Form.Item label="Active Status" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Book' : 'Add Book'}
            </Button>
            <Button onClick={() => navigate('/library/books')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BookForm;

