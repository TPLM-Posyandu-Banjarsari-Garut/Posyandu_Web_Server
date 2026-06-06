import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from './users-schema'

export const sessions = pgTable('sessions', {
    ...createBaseColumns('sessions'),

    token: text('token').notNull().unique(),
    expires_at: timestamp('expires_at').notNull(),
    user_agent: text('user_agent'),
    ip_address: text('ip_address'),

    user_id: uuid('user_id')
        .notNull()
        .references(() => users.public_id, { onDelete: 'cascade' }),

    ...timestamps
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
