import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from './users-schema'

export const accounts = pgTable('accounts', {
    id: text('id').primaryKey(),

    account_id: text('account_id').notNull(),
    provider_id: text('provider_id').notNull(),
    access_token: text('access_token'),
    refresh_token: text('refresh_token'),
    id_token: text('id_token'),
    access_token_expires_at: timestamp('access_token_expires_at'),
    refresh_token_expires_at: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),

    user_id: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    ...timestamps
})

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
