import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { academicAPI, Program } from '../../../../api/academic.api';
import { useNavigate, useParams } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const ProgramDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (id) {
      loadProgram();
    }
  }, [id]);

  const loadProgram = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const programData = await academicAPI.getProgram(id);
      setProgram(programData);
    } catch (error: any) {
      message.error(error.message || 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const getDegreeLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      undergraduate: 'blue',
      graduate: 'green',
      doctoral: 'purple',
    };
    return colors[level] || 'default';
  };

  if (!program) {
    return (
      <Card loading={loading} style={{ margin: 20 }}>
        Loading program details...
      </Card>
    );
  }

  return (
    <div style={{ margin: 20 }}>
      <Card
        title="Program Details"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <PermissionGuard permission="academic" action="update">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(route.ACADEMIC_PROGRAM_EDIT.replace(':id', program.id))}
              >
                Edit
              </Button>
            </PermissionGuard>
          </Space>
        }
        style={{ marginBottom: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Program Code" span={2}>
            <strong>{program.code}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Program Name" span={2}>
            {program.name}
          </Descriptions.Item>
          <Descriptions.Item label="Degree Level">
            <Tag color={getDegreeLevelColor(program.degreeLevel)}>
              {program.degreeLevel.charAt(0).toUpperCase() + program.degreeLevel.slice(1)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={program.isActive ? 'success' : 'error'}>
              {program.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {program.duration} years
          </Descriptions.Item>
          <Descriptions.Item label="Total Credit Hours">
            <strong>{program.totalCreditHours} CH</strong>
          </Descriptions.Item>
          {program.description && (
            <Descriptions.Item label="Description" span={2}>
              {program.description}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Created At">
            {new Date(program.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(program.updatedAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ProgramDetail;

