import { accountStatusEnum, cadrePositionEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { encryptedText } from '@/db/helpers/encrypted-field'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import { sql } from 'drizzle-orm'
import { boolean, pgTable, text, uniqueIndex, index } from 'drizzle-orm/pg-core'

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

        identity_number: encryptedText(
            'identity_number',
            'cadres.identity_number'
        ),

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
        ),
        index('cadres_is_deleted_idx').on(table.is_deleted),
        index('cadres_posyandu_id_idx').on(table.posyandu_id),
        index('cadres_identity_blind_idx')
            .on(sql`split_part(${table.identity_number}::text, ':', 6)`)
            .where(sql`${table.identity_number} LIKE 'enc:v1:%'`)
    ]
)

export type Cadre = typeof cadres.$inferSelect
export type NewCadre = typeof cadres.$inferInsert
