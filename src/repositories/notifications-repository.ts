import { NewNotification, Notification, notifications } from '@/db'
import { and, eq, lt, sql, SQL, desc } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface NotificationsQueryFilters {
    user_id: string
    status?: 'unread' | 'read'
    page?: number
    limit?: number
}

export class NotificationsRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(data: NewNotification): Promise<Notification> {
        const [notification] = await this.db
            .insert(notifications)
            .values(data)
            .returning()
        return notification
    }

    async findByUserId(filters: NotificationsQueryFilters) {
        const { user_id, status, page = 1, limit = 20 } = filters

        const conditions: (SQL | undefined)[] = [
            eq(notifications.user_id, user_id),
            sql`${notifications.deleted_at} IS NULL`
        ]

        if (status) {
            conditions.push(eq(notifications.status, status))
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(notifications)
                .where(whereClause)
                .orderBy(desc(notifications.created_at))
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(notifications)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async countUnread(user_id: string): Promise<number> {
        const [result] = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(notifications)
            .where(
                and(
                    eq(notifications.user_id, user_id),
                    eq(notifications.status, 'unread'),
                    sql`${notifications.deleted_at} IS NULL`
                )
            )
        return Number(result?.count || 0)
    }

    async markAsRead(
        id: string,
        user_id: string
    ): Promise<Notification | undefined> {
        const [notification] = await this.db
            .update(notifications)
            .set({ status: 'read', read_at: new Date() })
            .where(
                and(
                    eq(notifications.id, id),
                    eq(notifications.user_id, user_id)
                )
            )
            .returning()
        return notification
    }

    async markAllAsRead(user_id: string): Promise<number> {
        const result = await this.db
            .update(notifications)
            .set({ status: 'read', read_at: new Date() })
            .where(
                and(
                    eq(notifications.user_id, user_id),
                    eq(notifications.status, 'unread'),
                    sql`${notifications.deleted_at} IS NULL`
                )
            )
            .returning({ id: notifications.id })
        return result.length
    }

    async deleteOlderThan(days: number): Promise<number> {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        const result = await this.db
            .delete(notifications)
            .where(lt(notifications.created_at, cutoff))
            .returning({ id: notifications.id })
        return result.length
    }
}
