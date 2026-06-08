import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from './users-schema'

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),

    token: text('token').notNull().unique(),
    expires_at: timestamp('expires_at').notNull(),
    user_agent: text('user_agent'),
    ip_address: text('ip_address'),

    user_id: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    ...timestamps
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
