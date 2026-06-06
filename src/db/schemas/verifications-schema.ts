import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'

export const verifications = pgTable('verifications', {
    ...createBaseColumns('verifications'),

    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expires_at: timestamp('expires_at').notNull(),

    ...timestamps
})

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
