import { accountRoleEnum, accountStatusEnum } from '@/constants/enum'
import { timestamps } from '@/db/helpers/timestamps'
import { encryptedText } from '@/db/helpers/encrypted-field'
import { sql } from 'drizzle-orm'
import {
    boolean,
    pgTable,
    text,
    varchar,
    index,
    uniqueIndex
} from 'drizzle-orm/pg-core'

export const users = pgTable(
    'users',
    {
        id: text('id').primaryKey(),

        name: varchar('name', { length: 100 }).notNull(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        email_verified: boolean('email_verified').notNull().default(false),
        phone_number: encryptedText(
            'phone_number',
            'users.phone_number'
        ).unique(),
        avatar_url: text('avatar_url'),

        role: accountRoleEnum('role').notNull().default('parent'),
        status: accountStatusEnum('status').notNull().default('active'),

        ...timestamps
    },
    table => [
        index('users_is_deleted_idx').on(table.is_deleted),
        index('users_email_status_idx').on(table.email, table.status),
        index('users_role_status_idx').on(table.role, table.status),
        index('users_phone_status_idx').on(table.phone_number, table.status),
        uniqueIndex('users_phone_blind_unique')
            .on(sql`split_part(${table.phone_number}::text, ':', 6)`)
            .where(sql`${table.phone_number} LIKE 'enc:v1:%'`)
    ]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
