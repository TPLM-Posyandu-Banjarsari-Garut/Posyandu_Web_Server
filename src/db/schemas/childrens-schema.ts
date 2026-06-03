import { bloodTypeEnum, genderEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { date, decimal, integer, pgTable, varchar } from 'drizzle-orm/pg-core'

export const childrens = pgTable('childrens', {
    ...createBaseColumns('childrens'),

    posyandu_id: integer('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    name: varchar('name', { length: 100 }).notNull(),
    identitiy_number: varchar('identity_number', { length: 20 })
        .notNull()
        .unique(),

    gender: genderEnum('gender').notNull(),

    birth_date: date('birth_date', { mode: 'date' }),
    birth_order: integer('birth_order'),
    blood_type: bloodTypeEnum('blood_type'),
    birth_weight: decimal('birth_weight', { precision: 5.2 }),
    birth_length: decimal('birth_length', { precision: 5.2 }),
    birth_head_circumference: decimal('birth_head_circumference', {
        precision: 5.2
    }),

    ...timestamps
})

export type Children = typeof childrens.$inferSelect
export type NewChildren = typeof childrens.$inferInsert
