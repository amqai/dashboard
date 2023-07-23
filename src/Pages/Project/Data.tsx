import { Table, Modal, Form, Button, Space, Spin, Card, Alert, Input } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Embedding } from "../../models/Embedding";
import EmbeddingForm from "../../Components/EmbeddingForm";
import { Alert as AlertModel, AlertType } from "../../models/Alert";


interface Project {
  projectName: string,
  members: Member[],
}

interface Member {
  key: string
  email: string
  personId: string
}

function Data() {
  const params = useParams<{ topicId: string, organizationId: string }>();
  const topicId = params.topicId || 'default_value';
  const organizationId = params.organizationId || 'default_value';
  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);
  const [memberData, setMemberData] = useState<Member[]>();
  const [isMemberModal, setIsMemberModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [memberEmail, setMemberEmail] = useState("")

  useEffect(() => {
      (
      async () => {
        loadEmbeddings(organizationId, topicId);
        loadProject();
      }
      )();
    }, [organizationId, topicId]);

  const loadEmbeddingsHandler = async () => {
    loadEmbeddings(organizationId, topicId);
  }

  const loadProject = async () => {
    const jwt = localStorage.getItem('jwt');
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects?projectId=${topicId}&organizationId=${organizationId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }
    });

    const content = await response.json();
    setProject(content)

    const userData = content?.members.map((member: { personId: any; email: any; role: any; }) => (
      {
        key: member.personId,
        email: member.email,
        role: member.role,
        personId: member.personId
      }
    ))
    if(userData != null) {
      setMemberData(...[userData])
    }
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
    const embeds: Embedding[] = content.embeddings;
    setEmbeddings(embeds.map(embedding => ({
      ...embedding,
      key: embedding.identifier, // use the unique identifier as key
    })));
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
        await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/data/${record.identifier}?projectId=${topicId}&organizationId=${organizationId}`, {
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

  // Delete member
  const handleDeleteMember = async (personId: string) => {
    {
      if(topicId) {
        if(memberData?.length == 1){
          setAlertMessage({
            message: 'There must be at least one member in the project',
            type: AlertType.Error,
          })
        } else {
          const jwt = localStorage.getItem('jwt');
          await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/person?organizationId=${organizationId}&projectId=${topicId}&personId=${personId}`, {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
          })
          .then((response) => {
            if(response.ok) {
              setMemberData(memberData?.filter((member) => member.personId != personId))
            }
          })
        }
      }
    }
  }

  // Add member
  const handleAddMember = async () => {
    {
      if(topicId) {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/person?organizationId=${organizationId}&projectId=${topicId}&email=${memberEmail}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        setMemberEmail("")
        const content = await response.json();
        if(content) {
          const member = [{
            key: content?.personId,
            email: content?.email,
            personId: content?.personId
          }]

          setMemberData(memberData ? [...memberData, ...member] : [...member]);
        }
      }
    }
  }

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  const memberColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      personId: 'id',
    },
    {
      title: 'Action',
      key: 'id',
      personId: 'id',
      render: (_: any, record: { personId: any; }) => (
        <Button onClick={() => handleDeleteMember(record.personId)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="center-wrapper">
        {alertMessage !== null && alertMessage.message !== "" && (
        <div style={{margin: "24px"}}>
            <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
          </div>
        )}
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
        <Modal
          open={isMemberModal}
          title="Add Member"
          okText="Save"
          onCancel={() => {
            setIsMemberModal(false)
          }}
          onOk={() => {
            handleAddMember()
            setIsMemberModal(false)
          }}
        >
          <Input placeholder="Enter member email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)}/>
        </Modal>
        <Card title={project?.projectName + " members"} bodyStyle={{padding: "0"}} style={{marginTop: "24px"}}>
          <div className="settings-form-buttons" style={{borderTop: 0}}>
            <Button type="primary" onClick={() => setIsMemberModal(true)}>+ Add</Button>
          </div>
          <div className="settings-form-field-100">
            <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={memberData} columns={memberColumns} />
          </div>
        </Card>
    </div>
  );
}

export default Data;