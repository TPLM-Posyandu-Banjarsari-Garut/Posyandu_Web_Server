import { notificationTypeEnum, notificationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from '@/db/schemas/users-schema'
import { jsonb, pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'

export const notifications = pgTable(
    'notifications',
    {
        ...createBaseColumns('notifications'),

        user_id: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        type: notificationTypeEnum('type').notNull().default('system'),
        status: notificationStatusEnum('status').notNull().default('unread'),

        title: text('title').notNull(),
        body: text('body').notNull(),

        data: jsonb('data').$type<{
            consultation_id?: string
            scheduled_at?: string
            queue_number?: number
            consultation_type?: string
            posyandu_name?: string
        }>(),

        read_at: timestamp('read_at', { withTimezone: true, mode: 'date' }),

        ...timestamps
    },
    table => [
        index('notifications_user_id_idx').on(table.user_id),
        index('notifications_user_status_idx').on(table.user_id, table.status),
        index('notifications_created_at_idx').on(table.created_at)
    ]
)

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
