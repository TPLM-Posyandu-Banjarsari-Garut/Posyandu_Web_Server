import { cadrePositionEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from '@/db/schemas/users-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { integer, pgTable } from 'drizzle-orm/pg-core'

export const cadres = pgTable('cadres', {
    ...createBaseColumns('cadres'),

    user_id: integer('user_id')
        .notNull()
        .references(() => users.id),
    posyandu_id: integer('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    position: cadrePositionEnum('position').notNull().default('member'),

    ...timestamps
})

export type Cadre = typeof cadres.$inferSelect
export type NewCadre = typeof cadres.$inferInsert
