import React from "react";
import { Form, Input, Modal } from "antd";
import { Embedding } from "../models/Embedding";

interface EmbeddingFormProps {
  form: any;
  visible: boolean;
  editingEmbedding: Embedding | null;
  topicId: string;
  organizationId: string;
  handleCancel: () => void;
  reloadEmbeddings: () => void;
}

const EmbeddingForm: React.FC<EmbeddingFormProps> = ({
  form,
  visible,
  editingEmbedding,
  topicId,
  organizationId,
  handleCancel,
  reloadEmbeddings,
}) => {
  const isEditing = editingEmbedding !== null;

  const handleSave = async (values: Embedding) => {
    const jwt = localStorage.getItem("jwt");
    let url = new URL(
      `${import.meta.env.VITE_APP_API_URL}/api/data${
        isEditing ? "/" + editingEmbedding!.identifier : ""
      }`
    );

    // Add query parameters
    url.searchParams.append("projectId", topicId);
    url.searchParams.append("organizationId", organizationId);
    const method = isEditing ? "PUT" : "POST";
    const body =
      method === "PUT"
        ? { data: values.rawData }
        : { identifier: values.identifier, rawData: values.rawData };

    const response = await fetch(url.toString(), {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      reloadEmbeddings();
      handleCancel();
    } else {
      // handle error
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Data" : "Add Data"}
      open={visible}
      onCancel={handleCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values: Embedding) => {
            form.resetFields();
            handleSave(values);
          })
          .catch((info: any) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
        <Form.Item
          name="identifier"
          label="Identifier"
          labelCol={{ style: { display: "none" } }}
          rules={[
            {
              required: true,
              max: 255,
            },
          ]}
        >
          <Input placeholder="Please enter unique data identifier" />
        </Form.Item>
        <Form.Item
          name="rawData"
          label="Data"
          labelCol={{ style: { display: "none" } }}
          rules={[
            {
              required: true,
              max: 2000,
            },
          ]}
        >
          <Input.TextArea placeholder="Please enter data" rows={8} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmbeddingForm;
