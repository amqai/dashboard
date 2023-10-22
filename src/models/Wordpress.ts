export interface GetWordpressSettingsResponse {
    enabled: boolean,
    apiKey: string,
    model: string,
    conversationLength: number,
    maximumResponses: number,
    maximumIpConversations: number,
    terminationResponse: string,
    topicIds: string[],
}
