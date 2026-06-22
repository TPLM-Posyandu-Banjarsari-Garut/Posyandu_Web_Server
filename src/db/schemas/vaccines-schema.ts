import { vaccineRouteEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { integer, pgTable, text, varchar, index } from 'drizzle-orm/pg-core'

export const vaccines = pgTable(
    'vaccines',
    {
        ...createBaseColumns('vaccines'),

        code: varchar('code', { length: 10 }).notNull().unique(),
        name: varchar('name', { length: 100 }).notNull().unique(),
        description: text('description'),
        target_age_months: integer('target_age_months'),
        max_doses: integer('max_doses'),
        min_interval_days: integer('min_interval_days'),
        route: vaccineRouteEnum('route'),

        ...timestamps
    },
    table => [index('vaccines_is_deleted_idx').on(table.is_deleted)]
)

export type Vaccine = typeof vaccines.$inferSelect
export type NewVaccine = typeof vaccines.$inferInsert
