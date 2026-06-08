import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'

export const verifications = pgTable('verifications', {
    id: text('id').primaryKey(),

    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expires_at: timestamp('expires_at').notNull(),

    ...timestamps
})

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
