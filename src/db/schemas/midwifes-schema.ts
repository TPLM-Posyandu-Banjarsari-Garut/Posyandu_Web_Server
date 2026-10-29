import { accountStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { encryptedText } from '@/db/helpers/encrypted-field'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import { boolean, pgTable, text, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const midwifes = pgTable(
    'midwifes',
    {
        ...createBaseColumns('midwives'),

        user_id: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        identity_number: encryptedText(
            'identity_number',
            'midwifes.identity_number'
        ).notNull(),
        employee_number: encryptedText(
            'employee_number',
            'midwifes.employee_number'
        ),
        license_number: encryptedText(
            'license_number',
            'midwifes.license_number'
        ),

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
        uniqueIndex('midwives_str_number_unique').on(table.license_number),
        uniqueIndex('midwives_license_blind_unique')
            .on(sql`split_part(${table.license_number}::text, ':', 6)`)
            .where(sql`${table.license_number} LIKE 'enc:v1:%'`),
        index('midwifes_identity_blind_idx')
            .on(sql`split_part(${table.identity_number}::text, ':', 6)`)
            .where(sql`${table.identity_number} LIKE 'enc:v1:%'`),
        index('midwifes_posyandu_id_idx').on(table.posyandu_id),
        index('midwifes_is_deleted_idx').on(table.is_deleted)
    ]
)

export type Midwife = typeof midwifes.$inferSelect
export type NewMidwife = typeof midwifes.$inferInsert
