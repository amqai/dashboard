export interface GetProjectConversationsApiResponse {
    conversations: ConversationApiDto[]
}

export interface GetConversationApiResponse{
    conversation: ConversationApiDto,
}

export interface ConversationApiDto {
    conversationId: string,
    title: string,
    chat: PromptApiResponse[],
}

export interface PromptApiResponse {
    response: string,
    user: string,
    contextList: PromptContextApiResponse[],
}

export interface PromptContextApiResponse{
    identifier: string,
    data: string,
    score: number,
}

export interface CreateConversationApiRequest {
    title: string,
}
