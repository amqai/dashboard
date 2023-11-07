export interface GetProjectConversationsApiResponse {
  conversations: ConversationApiDto[];
}

export interface GetConversationApiResponse {
  conversation: ConversationApiDto;
}

export interface ConversationApiDto {
  conversationId: string;
  title: string;
  chat: PromptApiResponse[];
}

export interface PromptApiResponse {
  promptId: string;
  response: string;
  user: string;
  contextList: PromptContextApiResponse[];
  externalSearch: boolean;
  loading?: boolean;
}

export interface PromptContextApiResponse {
  identifier: string;
  data: string;
  score: number;
  topic: ContextTopic;
}

export interface CreateConversationApiRequest {
  title: string;
}

export interface ContextTopic {
  topicId: string;
  name: String;
}
