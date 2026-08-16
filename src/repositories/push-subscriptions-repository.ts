import { pushSubscriptions, PushSubscription, NewPushSubscription } from '@/db'
import { eq, and, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class PushSubscriptionsRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async upsert(data: NewPushSubscription): Promise<PushSubscription> {
        const [subscription] = await this.db
            .insert(pushSubscriptions)
            .values(data)
            .onConflictDoUpdate({
                target: pushSubscriptions.endpoint,
                set: {
                    user_id: data.user_id,
                    p256dh: data.p256dh,
                    auth: data.auth,
                    updated_at: new Date()
                }
            })
            .returning()

        return subscription
    }

    async findByUserId(user_id: string): Promise<PushSubscription[]> {
        return this.db
            .select()
            .from(pushSubscriptions)
            .where(
                and(
                    eq(pushSubscriptions.user_id, user_id),
                    sql`${pushSubscriptions.deleted_at} IS NULL`
                )
            )
    }

    async deleteByEndpoint(endpoint: string): Promise<boolean> {
        const result = await this.db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, endpoint))
            .returning()

        return result.length > 0
    }
}
