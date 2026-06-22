import { capsuleColorEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { integer, pgTable, text, varchar, index } from 'drizzle-orm/pg-core'

export const vitamins = pgTable(
    'vitamins',
    {
        ...createBaseColumns('vitamins'),

        name: varchar('name', { length: 100 }).notNull().unique(),
        description: text('description'),
        capsule_color: capsuleColorEnum('capsule_color').notNull(),
        dosage_iu: integer('dosage_iu').notNull(),
        min_age_months: integer('min_age_months'),
        max_age_months: integer('max_age_months'),
        distributions_per_year: integer('distributions_per_year'),
        target_age_months: integer('target_age_months'),

        ...timestamps
    },
    table => [index('vitamins_is_deleted_idx').on(table.is_deleted)]
)

export type Vitamin = typeof vitamins.$inferSelect
export type NewVitamin = typeof vitamins.$inferInsert
