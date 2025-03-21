import {
  Table,
  Modal,
  Form,
  Button,
  Space,
  Spin,
  Alert,
  Input,
  Tabs,
  Divider,
  Switch,
  Typography,
} from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Embedding } from "../../models/Embedding";
import EmbeddingForm from "../../Components/EmbeddingForm";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import PdfTable from "../../Components/PdfTable";
import TabPane from "antd/es/tabs/TabPane";
import { hasPermission } from "../../Services/PermissionService";
import { Member } from "../../models/Organization";

function Data() {
  const params = useParams<{ topicId: string; organizationId: string }>();
  const topicId = params.topicId || "default_value";
  const organizationId = params.organizationId || "default_value";
  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [memberData, setMemberData] = useState<Member[]>();
  const [isMemberModal, setIsMemberModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [activeKey, setActiveKey] = useState(
    localStorage.getItem("data_page.activeTabKey") || "1"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [organizationVisibility, setOrganizationVisibility] = useState<
    "PUBLIC" | "SELECTED_MEMBERS"
  >("SELECTED_MEMBERS");
  const [topicName, setTopicName] = useState<string>("");

  useEffect(() => {
    (async () => {
      loadEmbeddings(organizationId, topicId);
      loadProject();
    })();
  }, [organizationId, topicId]);

  const loadEmbeddingsHandler = async () => {
    loadEmbeddings(organizationId, topicId);
  };

  const loadProject = async () => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/topics?topicId=${topicId}&organizationId=${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();

    setOrganizationVisibility(content.organizationVisibility);
    setTopicName(content.topicName);

    const userData = content?.members.map(
      (member: { personId: any; email: any; role: any }) => ({
        key: member.personId,
        email: member.email,
        role: member.role,
        personId: member.personId,
      })
    );
    if (userData != null) {
      setMemberData(...[userData]);
    }
  };

  const loadEmbeddings = async (organizationId: string, topicId: string) => {
    setLoading(true);
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/data?organizationId=${organizationId}&topicId=${topicId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();
    const embeds: Embedding[] = content.embeddings;
    setEmbeddings(
      embeds.map((embedding) => ({
        ...embedding,
        key: embedding.identifier, // use the unique identifier as key
      }))
    );
    setLoading(false);
  };

  const handleSearch = () => {
    search(organizationId, topicId, searchQuery);
  };

  const search = async (
    organizationId: string,
    topicId: string,
    search: string
  ) => {
    setLoading(true);
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/data/search?organizationId=${organizationId}&topicId=${topicId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ searchInput: search }),
      }
    );

    const content = await response.json();
    const embeds: Embedding[] = content.embeddings;
    setEmbeddings(
      embeds.map((embedding) => ({
        ...embedding,
        key: embedding.identifier, // use the unique identifier as key
      }))
    );
    setSearchPerformed(true);
    setLoading(false);
  };

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingEmbedding, setEditingEmbedding] = useState<Embedding | null>(
    null
  );
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
            {hasPermission("MANAGE_DATA") && (
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
            )}
          </>
        );
      },
    },
  ];

  const onAddEmbedding = () => {
    form.resetFields();
    setEditingEmbedding(null);
    setIsEditing(true);
  };

  const onDeleteEmbedding = async (record: Embedding) => {
    Modal.confirm({
      title: "Are you sure you want to delete this data point?",
      onOk: async () => {
        const jwt = localStorage.getItem("jwt");
        await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/data/${
            record.identifier
          }?topicId=${topicId}&organizationId=${organizationId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        loadEmbeddings(organizationId, topicId);
      },
    });
  };

  const onEditEmbedding = (record: Embedding) => {
    setEditingEmbedding(record);
    setIsEditing(true);
    form.setFieldsValue({
      identifier: record.identifier,
      rawData: record.rawData,
    });
  };

  const resetEditing = () => {
    setIsEditing(false);
    setEditingEmbedding(null);
  };

  const Loading = () => {
    if (loading) {
      return (
        <Space size="middle">
          {" "}
          <Spin size="large" className="spinner" />{" "}
        </Space>
      );
    }
  };

  // Delete member
  const handleDeleteMember = async (personId: string) => {
    {
      if (topicId) {
        if (memberData?.length == 1) {
          setAlertMessage({
            message: "There must be at least one member in the project",
            type: AlertType.Error,
          });
        } else {
          const jwt = localStorage.getItem("jwt");
          await fetch(
            `${
              import.meta.env.VITE_APP_API_URL
            }/api/topics/person?organizationId=${organizationId}&topicId=${topicId}&personId=${personId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
            }
          ).then((response) => {
            if (response.ok) {
              setMemberData(
                memberData?.filter((member) => member.personId != personId)
              );
            }
          });
        }
      }
    }
  };

  // Add member
  const handleAddMember = async () => {
    {
      if (topicId) {
        const jwt = localStorage.getItem("jwt");
        const response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/api/topics/person?organizationId=${organizationId}&topicId=${topicId}&email=${memberEmail}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        setMemberEmail("");
        const content = await response.json();
        if (content) {
          const member = [
            {
              key: content?.personId,
              email: content?.email,
              personId: content?.personId,
            },
          ];

          setMemberData(memberData ? [...memberData, ...member] : [...member]);
        }
      }
    }
  };

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  const clearSearch = () => {
    setSearchPerformed(false);
    setSearchQuery("");
    loadEmbeddings(organizationId, topicId);
  };

  const changeOrganizationVisibility = async () => {
    const newVisibility =
      organizationVisibility === "PUBLIC" ? "SELECTED_MEMBERS" : "PUBLIC";

    Modal.confirm({
      title: "Are you sure you change the visibility settings of this topic?",
      onOk: async () => {
        const jwt = localStorage.getItem("jwt");
        await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/projects?topicId=${topicId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              projectOrganizationVisibility: newVisibility,
            }),
          }
        );
        setOrganizationVisibility(newVisibility);
      },
    });
  };

  const memberColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      personId: "id",
    },
    {
      title: "Action",
      key: "id",
      personId: "id",
      render: (_: any, record: { personId: any }) => (
        <Button onClick={() => handleDeleteMember(record.personId)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="center-wrapper">
      {alertMessage !== null && alertMessage.message !== "" && (
        <div style={{ margin: "24px" }}>
          <Alert
            message={alertMessage.message}
            onClose={dismissAlert}
            type={alertMessage.type}
            closable={true}
          />
        </div>
      )}
      <div className="page-headers">
        <div>
          <Typography.Title level={2}>{topicName}</Typography.Title>
        </div>
      </div>
      <Loading />
      <Tabs
        defaultActiveKey="1"
        activeKey={activeKey}
        onChange={(newActiveKey) => {
          setActiveKey(newActiveKey);
          localStorage.setItem("data_page.activeTabKey", newActiveKey);
          if (newActiveKey === "1") {
            loadEmbeddingsHandler();
          }
        }}
      >
        <TabPane tab="Data" key="1">
          {hasPermission("MANAGE_DATA") && (
            <>
              <div className="searchContainer" style={{ display: "flex" }}>
                <div>
                  <Button
                    onClick={onAddEmbedding}
                    type="primary"
                    style={{ width: "100px", marginTop: "10px" }}
                  >
                    Add data +
                  </Button>
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={handleSearch}
                      style={{ width: "100px", marginTop: "10px" }}
                    >
                      {" "}
                      Search{" "}
                    </Button>
                  </Form.Item>
                </div>
                <Form.Item
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    marginLeft: "20px",
                  }}
                >
                  <Input.TextArea
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Form.Item>
              </div>

              <Divider />
              {searchPerformed && (
                <div style={{ paddingBottom: "1em" }}>
                  <a onClick={clearSearch}>Reset Search</a>
                </div>
              )}
            </>
          )}
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
        </TabPane>

        {hasPermission("UPLOAD_DATA") && (
          <TabPane tab="Upload" key="2">
            <PdfTable organizationId={organizationId} topicId={topicId} />
          </TabPane>
        )}

        {hasPermission("CREATE_TOPICS") && (
          <TabPane tab="Visibility" key="3">
            <div style={{ borderTop: 0, paddingBottom: "2rem" }}>
              <strong>ALL MEMBERS </strong>
              <Switch
                checked={organizationVisibility === "SELECTED_MEMBERS"}
                onChange={changeOrganizationVisibility}
              />
              <strong> SPECIFIC MEMBERS</strong>
            </div>
            {organizationVisibility === "SELECTED_MEMBERS" && (
              <>
                <div className="settings-form-buttons" style={{ borderTop: 0 }}>
                  <Button type="primary" onClick={() => setIsMemberModal(true)}>
                    + Add
                  </Button>
                </div>
                <Table dataSource={memberData} columns={memberColumns} />
              </>
            )}
          </TabPane>
        )}
      </Tabs>
      <Modal
        open={isMemberModal}
        title="Add Member"
        okText="Save"
        onCancel={() => {
          setIsMemberModal(false);
        }}
        onOk={() => {
          handleAddMember();
          setIsMemberModal(false);
        }}
      >
        <Input
          placeholder="Enter member email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default Data;
