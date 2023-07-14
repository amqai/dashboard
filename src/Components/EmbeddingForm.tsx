import React from 'react';
import { Form, Input, Modal } from "antd";
import { Embedding } from "../models/Embedding";

interface EmbeddingFormProps {
  form: any; 
  visible: boolean; 
  editingEmbedding: Embedding | null; 
  projectId: string;
  handleCancel: () => void;
  reloadEmbeddings: () => void;
}

const EmbeddingForm: React.FC<EmbeddingFormProps> = ({
  form,
  visible,
  editingEmbedding,
  projectId,
  handleCancel,
  reloadEmbeddings,
}) => {
  const isEditing = editingEmbedding !== null;

  const handleSave = async (values: Embedding) => {
    const jwt = localStorage.getItem('jwt');
    const url = `${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/data${isEditing ? '/' + editingEmbedding!.identifier : ''}`;
    const method = isEditing ? "PUT" : "POST";
    const body = method === "PUT" ?
        { data: values.rawData } : { identifier: values.identifier, rawData: values.rawData }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify(body)
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
      title={isEditing ? "Edit Embedding" : "Add Embedding"}
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
          rules={[
            {
              required: true,
              message: "Please enter unique data identifier",
            },
          ]}
        >
          <Input placeholder="Please enter unique data identifier" />
        </Form.Item>
        <Form.Item
          name="rawData"
          rules={[
            {
              required: true,
              message: "Please enter data",
            },
          ]}
        >
          <Input.TextArea placeholder="Please enter data" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmbeddingForm;
