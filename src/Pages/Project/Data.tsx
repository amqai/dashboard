import { Table, Modal, Form, Button } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Embedding } from "../../models/Embedding";
import EmbeddingForm from "../../Components/EmbeddingForm";

function Data() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId || 'default_value';
  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
      (
      async () => {
        if (projectId) {
          loadEmbeddings();
        }
      }
      )();
    }, [projectId]);

  const loadEmbeddings = async () => {
    const jwt = localStorage.getItem('jwt');
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/data`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }
    });

    const content = await response.json();

    setEmbeddings(content.embeddings);
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
        await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/data/${record.identifier}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
        });
        loadEmbeddings();
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
  return (
    <div className="center-wrapper">
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
          projectId={projectId} 
          handleCancel={resetEditing} 
          reloadEmbeddings={loadEmbeddings} 
        />
    </div>
  );
}

export default Data;