import { accountRoleEnum, accountStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    ...createBaseColumns('users'),

    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    phone_number: varchar('phone_number', { length: 20 }).unique(),

    role: accountRoleEnum('role').notNull().default('parent'),
    status: accountStatusEnum('status').notNull().default('active'),

    ...timestamps
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
