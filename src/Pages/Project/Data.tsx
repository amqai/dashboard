import { Table, Modal, Form, Button, Space, Spin } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Embedding } from "../../models/Embedding";
import EmbeddingForm from "../../Components/EmbeddingForm";

function Data() {
  const params = useParams<{ topicId: string, organizationId: string }>();
  const topicId = params.topicId || 'default_value';
  const organizationId = params.organizationId || 'default_value';
  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
      (
      async () => {
        loadEmbeddings(organizationId, topicId);
      }
      )();
    }, [organizationId, topicId]);

  const loadEmbeddingsHandler = async () => {
    loadEmbeddings(organizationId, topicId);
  }
  
  const loadEmbeddings = async (organizationId: string, topicId: string) => {
    setLoading(true);
    const jwt = localStorage.getItem('jwt');
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/data?organizationId=${organizationId}&projectId=${topicId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }
    });

    const content = await response.json();
    setEmbeddings(content.embeddings);
    setLoading(false);
  }

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingEmbedding, setEditingEmbedding] = useState<Embedding | null>(null);
  const columns = [
    {
      key: "1",
      title: "Indentifier",
      dataIndex: "identifier",
    },
    {
      key: "2",
      title: "Data",
      dataIndex: "rawData",
    },
    {
      key: "3",
      title: "Actions",
      render: (record: Embedding) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEditEmbedding(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                onDeleteEmbedding(record);
              }}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];

  const onAddEmbedding = () => {
    form.resetFields();
    setEditingEmbedding(null);
    setIsEditing(true);
  }

  const onDeleteEmbedding = async (record: Embedding) => {
    Modal.confirm({
      title: "Are you sure you want to delete this data point?",
      onOk: async () => {
        const jwt = localStorage.getItem('jwt');      
        await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${topicId}/data/${record.identifier}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
        });
        loadEmbeddings(organizationId, topicId);
      }
    })
  };

  const onEditEmbedding = (record: Embedding) => {
    setEditingEmbedding(record);
    setIsEditing(true);
    form.setFieldsValue({
      identifier: record.identifier,
      rawData: record.rawData
    });
  };

  const resetEditing = () => {
    setIsEditing(false);
    setEditingEmbedding(null);
  };

  const Loading = () => {
    if(loading) {
      return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
    }
  }

  return (
    <div className="center-wrapper">

        <Loading />
        <Button 
          onClick={onAddEmbedding}
          type="primary"
          style={{marginBottom: "16px"}}
        >Add data</Button>
        <Table columns={columns} dataSource={embeddings}></Table>
        <EmbeddingForm
          form={form} 
          visible={isEditing} 
          editingEmbedding={editingEmbedding} 
          topicId={topicId}
          organizationId={organizationId}
          handleCancel={resetEditing} 
          reloadEmbeddings={loadEmbeddingsHandler} 
        />
    </div>
  );
}

export default Data;