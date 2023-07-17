export interface GetProjectConversationsApiResponse {
    conversations: ConversationApiDto[]
}

export interface GetConversationApiResponse{
    conversation: ConversationApiDto,
}

export interface ConversationApiDto {
    conversationId: string,
    model: string,
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
    model: string,
    title: string,
}
