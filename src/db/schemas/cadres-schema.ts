import { accountStatusEnum, cadrePositionEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import {
    boolean,
    pgTable,
    text,
    uniqueIndex,
    varchar
} from 'drizzle-orm/pg-core'

export const cadres = pgTable(
    'cadres',
    {
        ...createBaseColumns('cadres'),

        user_id: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        identity_number: varchar('identity_number', { length: 16 }),

        position: cadrePositionEnum('position').notNull().default('member'),

        is_primary_assignment: boolean('is_primary_assignment')
            .notNull()
            .default(true),
        duty_area_notes: text('duty_area_notes'),

        status: accountStatusEnum('status').notNull().default('active'),

        ...timestamps
    },
    table => [
        uniqueIndex('cadres_user_id_posyandu_id_unique').on(
            table.user_id,
            table.posyandu_id
        )
    ]
)

export type Cadre = typeof cadres.$inferSelect
export type NewCadre = typeof cadres.$inferInsert
