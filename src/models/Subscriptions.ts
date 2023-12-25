export interface SubscriptionsDto {
    subscriptions: SubscriptionDto[],
}

export interface SubscriptionDto {
    id: string,
    stripeSubscriptionId: string,
    promptLimit: number,
    currentPromptCount: number,
    embeddingLimit: number,
    currentEmbeddingCount: number,
    seatLimit: number,
    currentSeatCount: number,
    topicLimit: number,
    currentTopicCount: number,
    subscriptModel: string,
    periodStart: string,
    periodEnd: string,
}
