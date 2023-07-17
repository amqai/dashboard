import  "../../styles/chat.css";
import { Button, Divider, Form, Input, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ConversationApiDto, GetProjectConversationsApiResponse } from "../../models/Conversation";
import { useParams } from "react-router-dom";
import NewChatForm from "../../Components/NewChatForm";

const { Text, Title } = Typography;

const ConversationItem = ({conversations}: {conversations: ConversationApiDto[] | undefined}) => {
    return (
      <div>
        {conversations && conversations.map((conversation: ConversationApiDto, index: number) => (
          <div key={index}>
            <div>
              <Text strong>{conversation.title}</Text>
              <div>
                <Text>{conversation.model}</Text>
              </div>
            </div>
            <Divider />
          </div>
        ))}
      </div>
    );
};

function Chat() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId || 'default_value';
    const [form] = Form.useForm();
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [conversations, setConversations] = useState<GetProjectConversationsApiResponse>();
    useEffect(() => {
        (
          async () => {
            if (projectId) {
                loadChats();
            }
          }
          )();
      }, [projectId]);

    const closeAdding = () => {
        setIsAdding(false);
    };

    const loadChats = async () => {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/${projectId}/conversation`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        const content = await response.json();
        setConversations(content);
    }

    const onAddChat = () => {
      form.resetFields();
      setIsAdding(true);
    }

  return (
    <div className="chat-container">
      <div className="chat-section">
        <div>
            <Title level={5}>Chats</Title>
        </div>
        <Input
            placeholder="Search chats"
            prefix={<SearchOutlined />}
        />
        <Divider />
        <Button 
          type="primary"
          onClick={onAddChat}
        >+ New chat</Button>
        <Divider />
        {conversations && (
            <div className="chat-list">
                <ConversationItem conversations={conversations.conversations}/>
            </div>
        )}
      </div>
      <div className="prompt-section">
        <NewChatForm
          form={form} 
          visible={isAdding} 
          projectId={projectId} 
          handleCancel={closeAdding} 
          reloadChats={loadChats} 
        />
        <Text>Start meaningful conversations!</Text>
      </div>
    </div>
  );
};

export default Chat;
