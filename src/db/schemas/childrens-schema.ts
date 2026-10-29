import { bloodTypeEnum, childCategoryEnum, genderEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { encryptedText } from '@/db/helpers/encrypted-field'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import {
    date,
    decimal,
    integer,
    pgTable,
    text,
    varchar,
    index,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const childrens = pgTable(
    'childrens',
    {
        ...createBaseColumns('childrens'),

        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        name: varchar('name', { length: 100 }).notNull(),
        identity_number: encryptedText(
            'identity_number',
            'childrens.identity_number'
        )
            .notNull()
            .unique(),

        gender: genderEnum('gender').notNull(),
        child_category: childCategoryEnum('child_category'),

        place_of_birth: varchar('place_of_birth', { length: 100 }),
        birth_date: date('birth_date', { mode: 'date' }),
        birth_order: integer('birth_order'),
        blood_type: bloodTypeEnum('blood_type'),
        birth_weight: decimal('birth_weight', { precision: 5, scale: 2 }),
        birth_length: decimal('birth_length', { precision: 5, scale: 2 }),
        birth_head_circumference: decimal('birth_head_circumference', {
            precision: 5,
            scale: 2
        }),

        ...timestamps
    },
    table => [
        index('childrens_posyandu_id_idx').on(table.posyandu_id),
        index('childrens_is_deleted_idx').on(table.is_deleted),
        index('childrens_posyandu_deleted_idx').on(
            table.posyandu_id,
            table.deleted_at
        ),
        index('childrens_gender_category_idx').on(
            table.gender,
            table.child_category,
            table.deleted_at
        ),
        uniqueIndex('childrens_identity_blind_unique')
            .on(sql`split_part(${table.identity_number}::text, ':', 6)`)
            .where(sql`${table.identity_number} LIKE 'enc:v1:%'`)
    ]
)

export type Children = typeof childrens.$inferSelect
export type NewChildren = typeof childrens.$inferInsert
