import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const vitamins = pgTable('vitamins', {
    ...createBaseColumns('vitamins'),

    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    target_age_months: integer('target_age_months'),

    ...timestamps
})

export type Vitamin = typeof vitamins.$inferSelect
export type NewVitamin = typeof vitamins.$inferInsert
