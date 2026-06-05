import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from '@/db/schemas/users-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

export const midwifes = pgTable('midwifes', {
    ...createBaseColumns('midwifes'),

    user_id: integer('user_id')
        .notNull()
        .unique()
        .references(() => users.id),
    posyandu_id: integer('posyandu_id')
        .notNull()
        .references(() => posyandus.id),
    license_number: varchar('license_number', { length: 50 }), // SIPB

    ...timestamps
})

export type Midwife = typeof midwifes.$inferSelect
export type NewMidwife = typeof midwifes.$inferInsert
