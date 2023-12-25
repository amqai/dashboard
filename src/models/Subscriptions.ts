export interface SubscriptionsDto {
    subscriptions: SubscriptionDto[],
}

export interface SubscriptionDto {
    id: string,
    stripeSubscriptionId: string,
    promptLimit: number,
    embeddingLimit: number,
    seatLimit: number,
    topicLimit: number,
    subscriptModel: string,
    periodStart: string,
    periodEnd: string,
}
