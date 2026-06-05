import { accountStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import {
    boolean,
    integer,
    pgTable,
    text,
    uniqueIndex,
    varchar
} from 'drizzle-orm/pg-core'

export const midwifes = pgTable(
    'midwives',
    {
        ...createBaseColumns('midwives'),

        user_id: integer('user_id')
            .notNull()
            .references(() => users.id),
        posyandu_id: integer('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        identity_number: varchar('identity_number', { length: 16 }).notNull(),
        employee_number: varchar('employee_number', { length: 32 }),
        str_number: varchar('str_number', { length: 50 }),

        is_mtbs_trained: boolean('is_mtbs_trained').notNull().default(false),
        is_kelas_ibu_balita_facilitator: boolean(
            'is_kelas_ibu_balita_facilitator'
        )
            .notNull()
            .default(false),
        is_pkat_member: boolean('is_pkat_member').notNull().default(false),
        is_poned_provider: boolean('is_poned_provider')
            .notNull()
            .default(false),

        is_primary_assignment: boolean('is_primary_assignment')
            .notNull()
            .default(true),
        duty_area_notes: text('duty_area_notes'),

        status: accountStatusEnum('status').notNull().default('active'),

        ...timestamps
    },
    table => [
        uniqueIndex('midwives_user_id_posyandu_id_unique').on(
            table.user_id,
            table.posyandu_id
        ),
        uniqueIndex('midwives_str_number_unique').on(table.str_number)
    ]
)

export type Midwife = typeof midwifes.$inferSelect
export type NewMidwife = typeof midwifes.$inferInsert
