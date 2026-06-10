import { accountRoleEnum, accountStatusEnum } from '@/constants/enum'
import { timestamps } from '@/db/helpers/timestamps'
import { boolean, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: text('id').primaryKey(),

    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    email_verified: boolean('email_verified').notNull().default(false),
    phone_number: varchar('phone_number', { length: 20 }).unique(),
    avatar_url: text('avatar_url'),

    role: accountRoleEnum('role').notNull().default('parent'),
    status: accountStatusEnum('status').notNull().default('active'),

    ...timestamps
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
