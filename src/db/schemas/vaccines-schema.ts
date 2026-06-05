import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const vaccines = pgTable('vaccines', {
    ...createBaseColumns('vaccines'),

    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    target_age_months: integer('target_age_months'),

    ...timestamps
})

export type Vaccine = typeof vaccines.$inferSelect
export type NewVaccine = typeof vaccines.$inferInsert
