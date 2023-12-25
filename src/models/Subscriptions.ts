export interface SubscriptionsDto {
    subscriptions: SubscriptionDto[],
}

export interface SubscriptionDto {
    id: string,
    stripeSubscriptionId: string,
    promptLimit: number,
    embeddingLimit: number,
    periodStart: string,
    periodEnd: string,
}
