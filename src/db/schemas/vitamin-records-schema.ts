import { immunizationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { vitamins } from '@/db/schemas/vitamins-schema'
import { date, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const vitaminRecords = pgTable('vitamin_records', {
    ...createBaseColumns('vitamin_records'),

    children_id: integer('children_id')
        .notNull()
        .references(() => childrens.id),
    vitamin_id: integer('vitamin_id')
        .notNull()
        .references(() => vitamins.id),
    cadre_id: integer('cadre_id').references(() => cadres.id),
    midwife_id: integer('midwife_id').references(() => midwifes.id),

    date_given: date('date_given', { mode: 'date' }),
    status: immunizationStatusEnum('status').notNull().default('scheduled'),
    notes: text('notes'),

    ...timestamps
})

export type VitaminRecord = typeof vitaminRecords.$inferSelect
export type NewVitaminRecord = typeof vitaminRecords.$inferInsert
