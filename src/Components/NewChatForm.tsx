import React, { useEffect } from 'react';
import { Form, Input, Modal } from "antd";
import { CreateConversationApiRequest } from '../models/Conversation';
import { useNavigate } from 'react-router-dom';

interface NewChatFormProps {
  visible: boolean; 
  organizationId: string;
  handleCancel: () => void;
  reloadChats: () => void;
}

const NewChatForm: React.FC<NewChatFormProps> = ({
  visible,
  organizationId,
  handleCancel,
  reloadChats,
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [form]);

  const handleSave = async (values: CreateConversationApiRequest) => {
    const jwt = localStorage.getItem('jwt');
    const url = `${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation?organizationId=${organizationId}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify(values)
    });

    if (response.ok) {
      reloadChats();
      const chat = await response.json();
      navigate(`/organization/${organizationId}/chat/${chat.conversation.conversationId}`);
      handleCancel();
    } else {
      // handle error
    }
  };

  return (
    <Modal
      title="Add Chat"
      open={visible}
      onCancel={handleCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values: CreateConversationApiRequest) => {
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
          name="title"
          rules={[
            {
              required: true,
              message: "Please enter title",
            },
          ]}
        >
          <Input placeholder="Please enter title" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewChatForm;
