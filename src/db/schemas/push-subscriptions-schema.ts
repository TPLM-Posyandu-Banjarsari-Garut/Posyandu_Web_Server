import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from '@/db/schemas/users-schema'
import { pgTable, text, index } from 'drizzle-orm/pg-core'

export const pushSubscriptions = pgTable(
    'push_subscriptions',
    {
        ...createBaseColumns('push_sub'),

        user_id: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        endpoint: text('endpoint').notNull().unique(),
        p256dh: text('p256dh').notNull(),
        auth: text('auth').notNull(),

        ...timestamps
    },
    table => [
        index('push_sub_user_id_idx').on(table.user_id),
        index('push_sub_endpoint_idx').on(table.endpoint)
    ]
)

export type PushSubscription = typeof pushSubscriptions.$inferSelect
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert
