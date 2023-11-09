import React, { useState } from "react";
import { Card, Modal, Typography, theme } from "antd";
import { ConversationApiDto } from "../models/Conversation";
import { Alert as AlertModel, AlertType } from "../models/Alert";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";

interface ConversationItemProps {
  organizationId: string;
  currentConversationId: string | undefined;
  conversations: ConversationApiDto[] | undefined;
  loadChats: any;
  setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>;
  clearMessages: any;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  organizationId,
  currentConversationId,
  conversations,
  loadChats,
  setAlertMessage,
  clearMessages,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { useToken } = theme;
  const { Text } = Typography;
  const { token } = useToken();

  const selectConversation = (conversationId: string) => {
    return () => {
      navigate(`/organization/${organizationId}/chat/${conversationId}`);
      clearMessages();
    };
  };

  const deleteConversation = async (conversationId: string) => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    if (!response.ok) {
      setAlertMessage({
        message: "Unable to delete your conversation",
        type: AlertType.Error,
      });
    } else {
      if (conversationId == currentConversationId) {
        navigate(`/organization/${organizationId}/chat`);
      }
      loadChats();
      setAlertMessage({
        message: "Your conversation was deleted",
        type: AlertType.Success,
      });
    }
  };

  const handleClick =
    (conversationId: string) => (e?: React.MouseEvent<HTMLElement>) => {
      e?.stopPropagation();
      Modal.confirm({
        title: "Are you sure you want to delete this conversation?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => deleteConversation(conversationId),
      });
    };

  return (
    <div>
      {conversations &&
        conversations.map((conversation: ConversationApiDto, index: number) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Card
              hoverable
              style={{
                marginBottom: "16px",
                backgroundColor:
                  conversation.conversationId === currentConversationId
                    ? token.colorPrimary
                    : "",
                textAlign: "center",
              }}
              onClick={selectConversation(conversation.conversationId)}
            >
              <Text strong>{conversation.title}</Text>
              {hoveredIndex === index && (
                <DeleteOutlined
                  style={{ float: "right", marginTop: "5px", color: "red" }}
                  onClick={handleClick(conversation.conversationId)}
                />
              )}
            </Card>
          </div>
        ))}
    </div>
  );
};

export default ConversationItem;
