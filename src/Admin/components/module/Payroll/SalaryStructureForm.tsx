import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, DatePicker } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import payrollAPI, { CreateSalaryStructureDTO, SalaryStructure } from '../../../../api/payroll.api';
import dayjs from 'dayjs';

const { Option } = Select;

interface SalaryStructureFormProps {
  isEdit?: boolean;
}

const SalaryStructureForm: React.FC<SalaryStructureFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadSalaryStructure(id);
    }
  }, [id, isEdit]);

  const loadSalaryStructure = async (structureId: string) => {
    try {
      setLoading(true);
      const structure = await payrollAPI.getSalaryStructureById(structureId);
      form.setFieldsValue({
        employeeId: structure.employeeId,
        basicSalary: structure.basicSalary,
        houseRentAllowance: structure.houseRentAllowance,
        medicalAllowance: structure.medicalAllowance,
        transportAllowance: structure.transportAllowance,
        otherAllowances: structure.otherAllowances,
        providentFund: structure.providentFund,
        taxDeduction: structure.taxDeduction,
        otherDeductions: structure.otherDeductions,
        effectiveDate: dayjs(structure.effectiveDate),
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load salary structure');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrossAndNet = () => {
    const basic = form.getFieldValue('basicSalary') || 0;
    const hra = form.getFieldValue('houseRentAllowance') || 0;
    const medical = form.getFieldValue('medicalAllowance') || 0;
    const transport = form.getFieldValue('transportAllowance') || 0;
    const otherAllowances = form.getFieldValue('otherAllowances') || 0;
    const providentFund = form.getFieldValue('providentFund') || 0;
    const tax = form.getFieldValue('taxDeduction') || 0;
    const otherDeductions = form.getFieldValue('otherDeductions') || 0;

    const gross = basic + hra + medical + transport + otherAllowances;
    const totalDeductions = providentFund + tax + otherDeductions;
    const net = gross - totalDeductions;

    form.setFieldsValue({ calculatedGross: gross, calculatedNet: net });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const salaryData: CreateSalaryStructureDTO = {
        employeeId: values.employeeId,
        basicSalary: values.basicSalary,
        houseRentAllowance: values.houseRentAllowance,
        medicalAllowance: values.medicalAllowance,
        transportAllowance: values.transportAllowance,
        otherAllowances: values.otherAllowances,
        providentFund: values.providentFund,
        taxDeduction: values.taxDeduction,
        otherDeductions: values.otherDeductions,
        effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
      };

      if (isEdit && id) {
        await payrollAPI.updateSalaryStructure(id, salaryData);
        message.success('Salary structure updated successfully');
      } else {
        await payrollAPI.createSalaryStructure(salaryData);
        message.success('Salary structure created successfully');
      }

      navigate('/payroll/salary-structures');
    } catch (error: any) {
      message.error(error.message || 'Failed to save salary structure');
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
        onValuesChange={calculateGrossAndNet}
      >
        <Form.Item
          label="Employee ID"
          name="employeeId"
          rules={[{ required: true, message: 'Please enter employee ID' }]}
        >
          <Input placeholder="Enter employee ID" />
        </Form.Item>

        <Form.Item
          label="Effective Date"
          name="effectiveDate"
          rules={[{ required: true, message: 'Please select effective date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Card size="small" title="Basic Salary" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Basic Salary (PKR)"
            name="basicSalary"
            rules={[
              { required: true, message: 'Please enter basic salary' },
              { type: 'number', min: 0, message: 'Salary must be positive' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
            formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
            />
          </Form.Item>
        </Card>

        <Card size="small" title="Allowances" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Form.Item label="House Rent Allowance (PKR)" name="houseRentAllowance">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
            <Form.Item label="Medical Allowance (PKR)" name="medicalAllowance">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
            <Form.Item label="Transport Allowance (PKR)" name="transportAllowance">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
            <Form.Item label="Other Allowances (PKR)" name="otherAllowances">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
          </Space>
        </Card>

        <Card size="small" title="Deductions" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Form.Item label="Provident Fund (PKR)" name="providentFund">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
            <Form.Item label="Tax Deduction (PKR)" name="taxDeduction">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
            <Form.Item label="Other Deductions (PKR)" name="otherDeductions">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              />
            </Form.Item>
          </Space>
        </Card>

        <Card size="small" title="Summary" style={{ background: '#f0f0f0', marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>Gross Salary:</strong> PKR{' '}
              {form.getFieldValue('calculatedGross')?.toLocaleString() || '0'}
            </div>
            <div>
              <strong>Net Salary:</strong> PKR{' '}
              {form.getFieldValue('calculatedNet')?.toLocaleString() || '0'}
            </div>
          </Space>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Salary Structure' : 'Create Salary Structure'}
            </Button>
            <Button onClick={() => navigate('/payroll/salary-structures')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SalaryStructureForm;

