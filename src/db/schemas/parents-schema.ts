import { accountStatusEnum, bloodTypeEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { encryptedText } from '@/db/helpers/encrypted-field'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from '@/db/schemas/users-schema'
import {
    date,
    pgTable,
    text,
    varchar,
    index,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const parents = pgTable(
    'parents',
    {
        ...createBaseColumns('parents'),

        user_id: text('user_id')
            .notNull()
            .unique()
            .references(() => users.id, { onDelete: 'cascade' }),

        identity_number: encryptedText(
            'identity_number',
            'parents.identity_number'
        ).unique(),
        place_of_birth: varchar('place_of_birth', { length: 50 }),
        date_of_birth: date('date_of_birth', { mode: 'date' }),

        blood_type: bloodTypeEnum('blood_type'),
        education: varchar('education', { length: 50 }),
        occupation: varchar('occupation', { length: 50 }),

        address_line: encryptedText('address_line', 'parents.address_line'),
        rt: varchar('rt', { length: 5 }),
        rw: varchar('rw', { length: 5 }),
        village_name: varchar('village_name', { length: 100 }).default(
            'Banjarsari'
        ),

        status: accountStatusEnum('status').notNull().default('active'),

        ...timestamps
    },
    table => [
        index('parents_user_id_idx').on(table.user_id),
        index('parents_is_deleted_idx').on(table.is_deleted),
        uniqueIndex('parents_identity_blind_unique')
            .on(sql`split_part(${table.identity_number}::text, ':', 6)`)
            .where(sql`${table.identity_number} LIKE 'enc:v1:%'`),
        index('parents_address_blind_idx')
            .on(sql`split_part(${table.address_line}::text, ':', 6)`)
            .where(sql`${table.address_line} LIKE 'enc:v1:%'`)
    ]
)

export type Parent = typeof parents.$inferSelect
export type NewParent = typeof parents.$inferInsert
