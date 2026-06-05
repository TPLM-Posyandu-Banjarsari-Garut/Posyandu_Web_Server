import { immunizationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { childrens } from '@/db/schemas/childrens-schema'
import { vaccines } from '@/db/schemas/vaccines-schema'
import { cadres } from '@/db/schemas/cadres-schema'
import { date, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const immunizationRecords = pgTable('immunization_records', {
    ...createBaseColumns('immunization_records'),

    children_id: integer('children_id')
        .notNull()
        .references(() => childrens.id),
    vaccine_id: integer('vaccine_id')
        .notNull()
        .references(() => vaccines.id),
    cadre_id: integer('cadre_id').references(() => cadres.id),

    date_given: date('date_given', { mode: 'date' }),
    status: immunizationStatusEnum('status').notNull().default('scheduled'),
    notes: text('notes'),

    ...timestamps
})

export type ImmunizationRecord = typeof immunizationRecords.$inferSelect
export type NewImmunizationRecord = typeof immunizationRecords.$inferInsert
