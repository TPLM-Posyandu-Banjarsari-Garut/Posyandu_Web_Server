import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from './users-schema'

export const sessions = pgTable(
    'sessions',
    {
        id: text('id').primaryKey(),

        token: text('token').notNull().unique(),
        expires_at: timestamp('expires_at').notNull(),
        user_agent: text('user_agent'),
        ip_address: text('ip_address'),

        user_id: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        ...timestamps
    },
    table => [
        index('sessions_user_id_idx').on(table.user_id),
        index('sessions_is_deleted_idx').on(table.is_deleted),
        index('sessions_expires_at_idx').on(table.expires_at)
    ]
)

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
